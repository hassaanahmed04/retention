"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, DollarSign, Eye, Send, Plus, Loader2 } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { useToast } from "@/hooks/use-toast"

export default function AdminAffiliatesPage() {
  const { toast } = useToast()
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // State for Payout Dialog
  const [payoutDialog, setPayoutDialog] = useState<{ open: boolean; commission: any | null }>({
    open: false,
    commission: null,
  })

  // 1. Fetch Real Data from Supabase
  const fetchData = async () => {
    setLoading(true)
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get Users (Affiliates)
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'affiliate')

    if (usersError) {
        console.error(usersError)
        setLoading(false)
        return
    }

    // Get Commissions
    const { data: commissions, error: commsError } = await supabase
        .from('commissions')
        .select('*')

    if (commsError) console.error(commsError)

    // Merge Data for UI
    const mergedData = users.map(user => {
        const userComms = commissions?.filter(c => c.affiliate_id === user.id) || []
        const totalCommission = userComms.reduce((sum: number, c: any) => sum + Number(c.amount), 0)
        const pendingPayout = userComms
            .filter((c: any) => c.status === 'pending')
            .reduce((sum: number, c: any) => sum + Number(c.amount), 0)
        
        // Find a specific pending commission ID to pay out (simplification for "Pay Next")
        const nextPendingCommission = userComms.find((c: any) => c.status === 'pending')

        return {
            ...user,
            totalLeads: 0, // You'd join with leads table for this
            soldPolicies: 0, 
            conversionRate: 0, 
            totalCommission,
            pendingPayout,
            nextPendingCommission // Attach the specific commission object for the API
        }
    })

    setAffiliates(mergedData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. Handle Stripe Payout
  const handlePayout = async () => {
    if (!payoutDialog.commission) return

    setIsProcessing(true)
    try {
        const response = await fetch('/api/stripe/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commissionId: payoutDialog.commission.id
            })
        })

        const result = await response.json()

        if (!response.ok) throw new Error(result.error)

        toast({
            title: "Payout Successful",
            description: `Transfer ID: ${result.transferId}`,
            variant: "default", // Success style usually default or distinct green
        })
        
        setPayoutDialog({ open: false, commission: null })
        fetchData() // Refresh list
    } catch (error: any) {
        toast({
            title: "Payout Failed",
            description: error.message,
            variant: "destructive",
        })
    } finally {
        setIsProcessing(false)
    }
  }

  // 3. Calculate Totals
  const totalAffiliates = affiliates.length
  const globalPending = affiliates.reduce((acc, a) => acc + a.pendingPayout, 0)
  const globalPaid = affiliates.reduce((acc, a) => acc + (a.totalCommission - a.pendingPayout), 0)

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /> Loading affiliates...</div>

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Affiliate Management</h1>
          <p className="text-muted-foreground">Track affiliate performance and manage payouts</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Affiliate
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Affiliates" value={totalAffiliates} icon={DollarSign} description="active" />
        <StatsCard
          title="Pending Payouts"
          value={`$${globalPending.toLocaleString()}`}
          icon={DollarSign}
          description="to process"
        />
        <StatsCard
          title="Total Paid"
          value={`$${globalPaid.toLocaleString()}`}
          icon={DollarSign}
          description="lifetime"
        />
        <StatsCard title="Avg Conversion" value="0%" icon={DollarSign} description="needs lead tracking" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Affiliates</CardTitle>
          <CardDescription>Manage affiliate accounts and commissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Total Commission</TableHead>
                <TableHead>Pending Payout</TableHead>
                <TableHead>Stripe Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{affiliate.full_name}</p>
                      <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>${affiliate.totalCommission.toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-orange-600">${affiliate.pendingPayout.toLocaleString()}</TableCell>
                  <TableCell>
                    {affiliate.stripe_account_id ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setPayoutDialog({ 
                              open: true, 
                              commission: affiliate.nextPendingCommission 
                          })}
                          disabled={affiliate.pendingPayout === 0 || !affiliate.stripe_account_id}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Process Payout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {affiliates.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No affiliates found.</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payout Dialog */}
      <Dialog open={payoutDialog.open} onOpenChange={(open) => setPayoutDialog({ open, commission: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
                Sending funds via Stripe Connect.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payout Amount</Label>
              <Input type="text" value={`$${payoutDialog.commission?.amount || 0}`} disabled />
            </div>
            <div className="space-y-2">
              <Label>Commission ID</Label>
              <Input type="text" value={payoutDialog.commission?.id || ""} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialog({ open: false, commission: null })}>
              Cancel
            </Button>
            <Button onClick={handlePayout} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Confirm Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}