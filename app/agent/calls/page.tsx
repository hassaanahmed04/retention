"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, PhoneOff, User, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

function CallCenterContent() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get("lead")
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isOnCall, setIsOnCall] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [callNotes, setCallNotes] = useState("")
  const [callOutcome, setCallOutcome] = useState("")

  // Fetch Lead Data
  useEffect(() => {
    const fetchLead = async () => {
        if (!leadId) return
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase.from('retention_cases').select('*').eq('id', leadId).single()
        if (data) {
            setSelectedLead(data)
            setPhoneNumber(data.client_phone || "")
        }
    }
    fetchLead()
    // Simulating Dialer "Ready" state
    setTimeout(() => setIsReady(true), 1000)
  }, [leadId])

  // Call Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isOnCall) {
        interval = setInterval(() => setCallDuration(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isOnCall])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartCall = async () => {
    if (!phoneNumber) return
    setIsOnCall(true)
    setCallDuration(0)
  }

  const handleEndCall = () => {
    setIsOnCall(false)
    toast({ title: "Call Ended", description: `Duration: ${formatTime(callDuration)}` })
  }

  const handleSaveDisposition = async () => {
    console.log("--- 💾 STARTING SAVE ---")
    
    // 1. Debug: Check User & Lead
    console.log("User:", user)
    console.log("Selected Lead:", selectedLead)

    if (!user) {
      console.error("❌ Save Failed: No User logged in")
      toast({ variant: "destructive", title: "Auth Error", description: "You are not logged in." })
      return
    }
    
    if (!selectedLead) {
      console.error("❌ Save Failed: No Lead selected")
      toast({ variant: "destructive", title: "Selection Error", description: "No lead selected." })
      return
    }

    // 2. Debug: check values
    console.log("Duration:", callDuration)
    console.log("Outcome Selected:", callOutcome)
    console.log("Notes:", callNotes)

    // Map UI Outcome to SQL Constraint
    let dbCallStatus = 'completed'
    switch (callOutcome) {
      case 'voicemail': dbCallStatus = 'voicemail'; break;
      case 'no_answer': dbCallStatus = 'no_answer'; break;
      case 'busy': dbCallStatus = 'busy'; break;
      case 'wrong_number': dbCallStatus = 'failed'; break;
      default: dbCallStatus = 'completed'; break;
    }

    const payload = {
        lead_id: selectedLead.id,   // Ensure this is a string/UUID
        agent_id: user.id,          // Ensure this matches auth.uid()
        call_duration: callDuration,
        call_status: dbCallStatus,
        outcome: callOutcome,       // Make sure you added this column!
        notes: callNotes,
        created_at: new Date().toISOString()
    }

    console.log("🚀 Sending Payload to DB:", payload)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
        .from('call_records')
        .insert(payload)
        .select() // Return the inserted row to verify

    if (error) {
        console.error("❌ SUPABASE INSERT ERROR:", error)
        toast({ 
            variant: "destructive", 
            title: "Database Error", 
            description: error.message || "Check console for details" 
        })
    } else {
        console.log("✅ SUCCESS! Record inserted:", data)
        toast({ title: "Call Saved", description: `Record ID: ${data[0]?.id}` })
        
        // Cleanup
        setCallNotes("")
        setCallOutcome("")
        setCallDuration(0)
        setIsOnCall(false)
    }
  }
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Call Center (Simulation Mode)</h1>
        <p className="text-muted-foreground">Integrated dialer for retention calls</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dialer Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Dialer
              {isReady ? (
                <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-green-100" />
              ) : (
                <span className="flex h-2.5 w-2.5 rounded-full bg-yellow-500 ring-2 ring-yellow-100" />
              )}
            </CardTitle>
            <CardDescription>
              {selectedLead ? `Calling ${selectedLead.client_name}` : "Enter a number to dial"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  {selectedLead ? (
                    <>
                      <p className="font-semibold">{selectedLead.client_name}</p>
                      <p className="text-sm text-muted-foreground">Case ID: {selectedLead.id.slice(0, 8)}</p>
                    </>
                  ) : (
                    <Input 
                      placeholder="Enter Name" 
                      className="border-none shadow-none p-0 h-auto font-semibold focus-visible:ring-0" 
                    />
                  )}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                 {isOnCall && <div className="text-4xl font-mono mb-4 text-green-600">{formatTime(callDuration)}</div>}
                <Input 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-2xl font-mono h-14 text-center"
                  placeholder="(555) 000-0000"
                  disabled={isOnCall}
                />
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex justify-center gap-4">
              {!isReady ? (
                <Button disabled size="lg" className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </Button>
              ) : !isOnCall ? (
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={handleStartCall}>
                  <Phone className="mr-2 h-5 w-5" />
                  Start Call
                </Button>
              ) : (
                <Button size="lg" variant="destructive" className="w-full" onClick={handleEndCall}>
                  <PhoneOff className="mr-2 h-5 w-5" />
                  End Call
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call Notes Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Call Disposition</CardTitle>
            <CardDescription>Log the result of your conversation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Outcome</p>
              <Select value={callOutcome} onValueChange={setCallOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="voicemail">Voicemail</SelectItem>
                  <SelectItem value="no_answer">No Answer</SelectItem>
                  <SelectItem value="busy">Busy Signal</SelectItem>
                  <SelectItem value="wrong_number">Wrong Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Notes</p>
              <Textarea
                placeholder="Enter call notes here..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={6}
              />
            </div>

            <Button className="w-full" disabled={!callOutcome} onClick={handleSaveDisposition}>
              Save Call Record
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CallCenterPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading Dialer...</div>}>
      <CallCenterContent />
    </Suspense>
  )
}