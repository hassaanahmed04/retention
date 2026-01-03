"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Phone, Loader2, CheckCircle2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// Status Color Mapping
const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  escalated: "bg-purple-100 text-purple-800 border-purple-200",
  pending_lapse: "bg-gray-200 text-gray-800 border-gray-300",
  charged_back: "bg-red-100 text-red-800 border-red-200",
  issued_not_paid: "bg-orange-100 text-orange-800 border-orange-200",
  issued_paid: "bg-green-100 text-green-800 border-green-200",
  dead: "bg-gray-100 text-gray-500 border-gray-200"
}

// Guides
const policyFixGuides: Record<string, { title: string; steps: string[] }> = {
  pending_lapse: {
    title: "Lapse Prevention Protocol",
    steps: ["Verify payment method", "Check declined transactions", "Reschedule payment", "Update card details"],
  },
  charged_back: {
    title: "Chargeback Recovery",
    steps: ["Contact client (Urgent)", "Explain cancellation risk", "Secure new payment", "Document dispute reason"],
  },
  issued_not_paid: {
    title: "First Payment Collection",
    steps: ["Confirm policy details", "Resend payment link", "Verify email", "Guide through payment"],
  },
  general: {
    title: "General Inquiry",
    steps: ["Verify identity", "Listen to concern", "Document issue", "Resolve or Escalate"]
  }
}

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  
  // State
  const [lead, setLead] = useState<any>(null)
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Form State
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<string>("")

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Fetch Lead
      const { data: leadData, error: leadError } = await supabase
        .from('retention_cases')
        .select('*')
        .eq('id', id)
        .single()

      if (leadError) {
        console.error("Error fetching lead:", leadError)
        toast({ variant: "destructive", title: "Error", description: "Could not load lead." })
      } else {
        // --- DATA NORMALIZATION FIX ---
        // The DB returns linked_items as a stringified JSON string. We must parse it.
        let parsedLinkedItems = []
        
        if (leadData.linked_items) {
          if (typeof leadData.linked_items === 'string') {
            try {
              parsedLinkedItems = JSON.parse(leadData.linked_items)
            } catch (e) {
              console.error("Failed to parse linked_items JSON:", e)
              parsedLinkedItems = []
            }
          } else if (Array.isArray(leadData.linked_items)) {
            parsedLinkedItems = leadData.linked_items
          }
        }
        
        // Update the lead object with the clean Array
        setLead({ ...leadData, linked_items: parsedLinkedItems })
        setStatus(leadData.status || "open")
      }

      // Fetch Calls
      const { data: callData } = await supabase
        .from('call_records')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false })

      if (callData) setCalls(callData)
      setLoading(false)
    }
    fetchData()
  }, [id, toast, refreshKey])

  // Global Update
  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
        if (notes.trim()) {
            await supabase.from('lead_notes').insert({
                lead_id: id,
                agent_id: lead.assigned_agent_id, 
                content: notes,
                note_type: 'general'
            })
        }

        const res = await fetch('/api/leads/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadId: id, newStatus: status })
        })
        
        if (!res.ok) throw new Error("Failed to sync status")

        toast({ title: "Saved", description: "Case updated successfully." })
        setNotes("") 
        setRefreshKey(prev => prev + 1)
    } catch (error) {
        toast({ variant: "destructive", title: "Update Failed", description: "Check console." })
    } finally {
        setIsSaving(false)
    }
  }

  // Individual Update (Optimistic)
  const handleSaveSpecificItem = async (newStatus: string, pulseId: string) => {
    // 1. Optimistic UI Update: Update local state immediately
    setLead((prev: any) => {
        if (!prev.linked_items) return prev
        return {
            ...prev,
            linked_items: prev.linked_items.map((item: any) => 
                item.id === pulseId ? { ...item, status: newStatus, monday_label: "Syncing..." } : item
            )
        }
    })

    try {
        const res = await fetch('/api/leads/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                leadId: id,
                newStatus: newStatus,
                targetPulseId: pulseId
            })
        })
        
        if (!res.ok) throw new Error("Failed")
        
        toast({ title: "Policy Updated", description: "Individual policy status synced." })
        // Trigger refresh to get the clean "monday_label" from server if needed
        setTimeout(() => setRefreshKey(prev => prev + 1), 1000)
    } catch (error) {
        toast({ title: "Error", variant: "destructive", description: "Failed to update specific policy." })
        setRefreshKey(prev => prev + 1) // Revert on fail
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (!lead) return <div className="p-8 text-center text-muted-foreground">Lead not found or access denied.</div>

  const guideKey = (lead.fix_type || lead.status || 'general').toLowerCase().replace(" ", "_")
  const fixGuide = policyFixGuides[guideKey] || policyFixGuides['general']

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{lead.client_name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Phone className="h-3 w-3" />
              <span>{lead.client_phone}</span>
              <span className="text-gray-300">|</span>
              <span>{lead.carrier || "Unknown Carrier"}</span>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className={`px-3 py-1 text-sm font-medium uppercase border ${statusColors[lead.status] || "bg-gray-100"}`}>
          {lead.status?.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Case Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                 <div>
                    <p className="text-muted-foreground">Priority</p>
                    <p className="font-medium capitalize">{lead.priority || "Normal"}</p>
                 </div>
                 <div>
                    <p className="text-muted-foreground">Issue Type</p>
                    <p className="font-medium capitalize">{lead.fix_type?.replace(/_/g, " ") || "General"}</p>
                 </div>
              </div>

              {/* UNIFIED POLICIES SECTION */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                   Linked Policies 
                   <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                     {lead.linked_items?.length || lead.monday_item_ids?.length || 0}
                   </Badge>
                </p>
                
                {(!lead.linked_items || lead.linked_items.length === 0) ? (
                    <div className="text-sm text-muted-foreground italic bg-muted/20 p-3 rounded">
                        No policies found. (Legacy View: {lead.monday_item_ids?.length || 0} IDs)
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lead.linked_items.map((item: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-3 rounded-lg border shadow-sm gap-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                                            #{item.id}
                                        </Badge>
                                        <span className="font-semibold text-sm">
                                            {item.policy && item.policy !== "Unknown" ? item.policy : "Policy ID Pending"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {item.carrier !== "Unknown" ? item.carrier : lead.carrier}
                                        </span>
                                        {/* Status Badge from item data */}
                                        <Badge className={`text-[10px] h-5 px-1.5 ${statusColors[item.status] || "bg-gray-100"}`}>
                                            {item.monday_label || item.status?.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                </div>

                                {/* INDIVIDUAL STATUS DROPDOWN */}
                                <div className="sm:w-[160px]">
                                  <Select 
                                    value={item.status} 
                                    onValueChange={(val) => handleSaveSpecificItem(val, item.id)}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="open">Open</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="escalated">Escalated</SelectItem>
                                      <SelectItem value="pending_lapse">Pending Lapse</SelectItem>
                                      <SelectItem value="charged_back">Charged Back</SelectItem>
                                      <SelectItem value="issued_not_paid">Issued Not Paid</SelectItem>
                                      <SelectItem value="issued_paid">Issued Paid</SelectItem>
                                      <SelectItem value="dead">Dead</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="status">Global Update</TabsTrigger>
              <TabsTrigger value="calls">Call Logs ({calls.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="mt-4">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Update Case Status
                  </CardTitle>
                  <CardDescription>
                    Update <strong>Overall Case</strong> and sync to <strong>ALL</strong> linked Monday items.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter call notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Case Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="escalated">Escalated</SelectItem>
                          <SelectItem value="pending_lapse">Pending Lapse</SelectItem>
                          <SelectItem value="charged_back">Charged Back</SelectItem>
                          <SelectItem value="issued_not_paid">Issued Not Paid</SelectItem>
                          <SelectItem value="issued_paid">Issued Paid</SelectItem>
                          <SelectItem value="dead">Dead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving || !status} className="sm:w-40">
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSaving ? "Syncing..." : "Update All"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calls" className="mt-4">
              <Card>
                <CardHeader><CardTitle>Call History</CardTitle></CardHeader>
                <CardContent>
                  {calls.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No calls recorded yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {calls.map((call) => (
                        <div key={call.id} className="flex gap-4 p-4 border rounded-lg bg-card shadow-sm">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Phone className="h-4 w-4" />
                          </div>
                          <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {call.outcome?.replace(/_/g, " ").toUpperCase() || "CALL COMPLETED"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {new Date(call.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{call.notes}</p>
                            <Badge variant="outline" className="w-fit mt-1 text-[10px]">
                                {Math.floor(call.call_duration / 60)}m {call.call_duration % 60}s
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <Button className="w-full gap-2" size="lg" asChild>
                <Link href={`/agent/calls?lead=${lead.id}`}><Phone className="h-4 w-4" /> Launch Dialer</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base">{fixGuide.title}</CardTitle>
              </div>
              <CardDescription>Follow these steps to resolve the issue.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ol className="relative space-y-4 border-l border-muted-foreground/20 ml-3">
                {fixGuide.steps.map((step, index) => (
                  <li key={index} className="ml-6">
                    <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-1 ring-muted-foreground/30 text-xs font-mono text-muted-foreground">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-normal">{step}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}