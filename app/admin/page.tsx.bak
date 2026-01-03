"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, TrendingUp, ClipboardList, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import type { LeadStatus } from "@/lib/types"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  
  // State for high-level metrics
  const [stats, setStats] = useState({
    totalLeads: 0,
    soldLeads: 0,
    activeAgents: 0,
    pendingPayouts: 0
  })

  // State for Status Overview Chart
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    pending_lapse: 0,
    charged_back: 0,
    issued_not_paid: 0,
    in_progress: 0,
    issued_paid: 0
  })

  // State for Affiliate List
  const [affiliates, setAffiliates] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      try {
        // 1. Fetch Retention Cases (Leads)
        const { data: leadsData, error: leadsError } = await supabase
          .from('retention_cases')
          .select('status')
        
        if (leadsError) throw leadsError

        // 2. Fetch Agents & Affiliates
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status')
        
        if (usersError) throw usersError

        // 3. Fetch Pending Commissions
        const { data: commsData, error: commsError } = await supabase
          .from('commissions')
          .select('amount')
          .eq('status', 'pending')

        if (commsError) throw commsError

        // --- Process Data ---

        // Calculate Status Counts
        const counts: Record<string, number> = {
          pending_lapse: 0, charged_back: 0, issued_not_paid: 0, in_progress: 0, issued_paid: 0
        }
        
        leadsData?.forEach((lead) => {
          const s = lead.status as string
          if (counts[s] !== undefined) counts[s]++
          // Map 'resolved' from DB to 'issued_paid' for UI if needed
          if (s === 'resolved') counts.issued_paid++
          if (s === 'open') counts.pending_lapse++ // Default mapping
        })
        setStatusCounts(counts)

        // Calculate High Level Stats
        const totalLeads = leadsData?.length || 0
        const soldLeads = counts.issued_paid || 0
        const activeAgents = usersData?.filter(u => u.role === 'retention_agent' && u.status === 'active').length || 0
        const pendingPayouts = commsData?.reduce((acc, curr) => acc + curr.amount, 0) || 0

        setStats({ totalLeads, soldLeads, activeAgents, pendingPayouts })

        // Process Affiliates (Filter users by role)
        const affs = usersData?.filter(u => u.role === 'affiliate') || []
        setAffiliates(affs)

      } catch (error) {
        console.error("Dashboard Data Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">System-wide metrics and management</p>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={ClipboardList}
          description="all time"
        />
        <StatsCard
          title="Sold Policies"
          value={stats.soldLeads}
          icon={CheckCircle}
          description="resolved cases"
        />
        <StatsCard 
          title="Active Agents" 
          value={stats.activeAgents} 
          icon={Users} 
          description="online now" 
        />
        <StatsCard
          title="Pending Payouts"
          value={`$${stats.pendingPayouts.toLocaleString()}`}
          icon={DollarSign}
          description="to affiliates"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Status Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lead Status Overview</CardTitle>
              <CardDescription>Current distribution of leads</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/leads">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Pending Lapse", count: statusCounts.pending_lapse, color: "bg-red-500" },
              { label: "Charged Back", count: statusCounts.charged_back, color: "bg-orange-500" },
              { label: "Issued Not Paid", count: statusCounts.issued_not_paid, color: "bg-yellow-500" },
              { label: "In Progress", count: statusCounts.in_progress, color: "bg-blue-500" },
              { label: "Issued Paid", count: statusCounts.issued_paid, color: "bg-green-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Affiliate List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Affiliates</CardTitle>
              <CardDescription>Registered partners</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/affiliates">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {affiliates.length === 0 ? (
                 <p className="text-sm text-muted-foreground text-center py-4">No affiliates found.</p>
              ) : (
                affiliates.slice(0, 5).map((affiliate, index) => (
                  <div key={affiliate.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {affiliate.full_name?.charAt(0) || "A"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{affiliate.full_name}</p>
                        <p className="text-xs text-muted-foreground">{affiliate.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <Badge variant="outline">{affiliate.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <Link href="/admin/leads">
                <ClipboardList className="mr-2 h-4 w-4" />
                Manage Leads
              </Link>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <Link href="/admin/affiliates">
                <DollarSign className="mr-2 h-4 w-4" />
                Process Payouts
              </Link>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" className="justify-start bg-transparent" asChild>
              <Link href="/admin/reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}