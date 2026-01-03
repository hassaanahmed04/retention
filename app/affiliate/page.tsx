"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, DollarSign, Users, RefreshCw, CheckCircle2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AffiliateDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({ name: "", phone: "", notes: "" })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Load Data
  const loadData = async () => {
    setLoading(true)
    
    // A. Get Current Auth User
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
        router.push('/login')
        return
    }

    // B. Get User Profile (Need this for Stripe ID)
    const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
    setUser(userProfile)

    // C. FETCH LEADS (Standard Select, NO JOIN to prevent errors)
    const { data: rawLeads, error: leadError } = await supabase
      .from('retention_cases')
      .select('*')
      .eq('affiliate_id', authUser.id)
      .order('created_at', { ascending: false })

    if (leadError) {
        console.error("Lead Fetch Error:", leadError)
    }

    // D. FETCH COMMISSIONS (Separate Query)
    const { data: userCommissions } = await supabase
      .from('commissions')
      .select('*')
      .eq('affiliate_id', authUser.id)

    // E. MANUAL MERGE (The "Javascript Join")
    // This attaches commissions to leads without relying on DB relationships
    const mergedLeads = rawLeads?.map(lead => {
        const relatedComm = userCommissions?.filter(c => c.lead_id === lead.id) || []
        return {
            ...lead,
            commissions: relatedComm
        }
    }) || []

    setLeads(mergedLeads)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // 2. Handle Stripe Connect
  const handleConnectStripe = async () => {
    setStripeLoading(true)
    try {
        const res = await fetch('/api/stripe/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, email: user.email })
        })
        const data = await res.json()
        if (data.url) window.location.href = data.url
    } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "Could not connect to Stripe." })
        setStripeLoading(false)
    }
  }

  // 3. Handle Submit Lead
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !user.id) {
        toast({ variant: "destructive", title: "Error", description: "User profile not loaded. Please refresh." })
        return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: formData.name,
          client_phone: formData.phone,
          notes: formData.notes,
          affiliate_id: user.id
        })
      })

      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      toast({ title: "Success", description: "Lead sent to sales team!" })
      setOpenDialog(false)
      setFormData({ name: "", phone: "", notes: "" })
      loadData() 
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit lead." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
      await supabase.auth.signOut()
      router.push('/login')
  }

  // Calculate Stats
  const totalLeads = leads.length
  // Count anything paid/resolved/sold as a "Sale"
  const totalSold = leads.filter(l => 
    ['issued_paid', 'resolved', 'sold'].includes(l.status?.toLowerCase())
  ).length
  
  const potentialComm = leads.reduce((sum, l) => {
     // Check if commission exists in array, otherwise estimate if status is good
     const comm = l.commissions?.[0]?.amount || (['issued_paid', 'resolved', 'sold'].includes(l.status?.toLowerCase()) ? 50 : 0)
     return sum + Number(comm)
  }, 0)

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Partner Portal</h1>
                <p className="text-muted-foreground">Welcome back, {user?.full_name}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="gap-2">
                            <Plus className="h-4 w-4" /> Submit New Lead
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit a New Lead</DialogTitle>
                            <DialogDescription>
                                We will assign this to a sales agent immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Client Name</Label>
                                <Input 
                                    required 
                                    placeholder="John Doe" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input 
                                    required 
                                    placeholder="555-0123" 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea 
                                    placeholder="Any details..." 
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Submit Lead"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

        {/* Payout / Stripe Section */}
        <Card className={`border-l-4 ${user?.stripe_account_id ? "border-l-green-500" : "border-l-orange-500"}`}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payout Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div>
                    {user?.stripe_account_id ? (
                        <div className="flex items-center text-green-700 font-medium">
                            <CheckCircle2 className="w-5 h-5 mr-2" /> 
                            Bank Account Connected
                        </div>
                    ) : (
                        <div className="text-orange-700 font-medium">
                            Action Required: Connect bank account to receive payments.
                        </div>
                    )}
                </div>
                {!user?.stripe_account_id && (
                    <Button onClick={handleConnectStripe} disabled={stripeLoading} variant="secondary">
                        {stripeLoading ? <Loader2 className="animate-spin mr-2" /> : <DollarSign className="mr-2 h-4 w-4" />}
                        Connect Payouts
                    </Button>
                )}
            </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalLeads}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Policies Sold</CardTitle>
                    <RefreshCw className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSold}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${potentialComm.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Includes pending & paid</p>
                </CardContent>
            </Card>
        </div>

        {/* Leads Table */}
        <Card>
            <CardHeader>
                <CardTitle>Submission History</CardTitle>
                <CardDescription>Real-time status updates from our sales team.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date Submitted</TableHead>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Carrier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Commission</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No leads submitted yet. Click the button above to start!
                                </TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-medium">{lead.client_name}</TableCell>
                                    <TableCell>{lead.carrier === "Unknown" ? "--" : lead.carrier}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={lead.status} />
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        {lead.commissions?.[0] ? (
                                            <span className="text-green-600 font-bold">
                                                +${lead.commissions[0].amount}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">--</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        open: "bg-blue-100 text-blue-800",
        issued_paid: "bg-green-100 text-green-800 border-green-200",
        dead: "bg-gray-100 text-gray-500",
        resolved: "bg-green-100 text-green-800",
        pending_lapse: "bg-orange-100 text-orange-800",
        sold: "bg-green-100 text-green-800 border-green-200"
    }
    // Normalize status to handle spaces or underscores
    const key = status?.toLowerCase().replace(/ /g, '_') || "open"
    
    return (
        <Badge variant="outline" className={`capitalize ${styles[key] || "bg-gray-50"}`}>
            {status || "Open"}
        </Badge>
    )
}