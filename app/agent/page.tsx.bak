"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, Clock, CheckCircle, AlertTriangle, Loader2, History } from "lucide-react"
import { LeadCard } from "@/components/agent/lead-card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { useAuth } from "@/hooks/use-auth"
import { CallHistoryList } from "@/components/dashboard/call-history-list"

export default function AgentDashboard() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [todayCallCount, setTodayCallCount] = useState(0) // State for the counter
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // 1. Fetch Leads (Assigned or Open)
      const { data: leadsData, error: leadsError } = await supabase
        .from('retention_cases')
        .select('*')
        .or(`assigned_agent_id.eq.${user.id},assigned_agent_id.is.null`)
        .order('created_at', { ascending: false })

      if (leadsData) setLeads(leadsData)
      if (leadsError) console.error("Error fetching leads:", leadsError)

      // 2. Fetch "Today's Calls" Count
      // We calculate the timestamp for "Midnight Today"
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { count, error: countError } = await supabase
        .from('call_records')
        .select('*', { count: 'exact', head: true }) // 'head: true' means don't return data, just count
        .eq('agent_id', user.id)
        .gte('created_at', startOfDay.toISOString())

      if (count !== null) setTodayCallCount(count)
      if (countError) console.error("Error fetching count:", countError)

      setLoading(false)
    }

    fetchData()
  }, [user])

  // Filter Logic
  const urgentLeads = leads.filter((l) => l.priority === "urgent" || l.priority === "high")
  const inProgressLeads = leads.filter((l) => l.status === "in_progress")

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, here is your daily overview.</p>
      </div>

      {/* Quick Stats - NOW DYNAMIC */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Leads" 
          value={leads.length} 
          icon={Clock} 
          description="assigned to you" 
        />
        <StatsCard 
          title="Urgent Actions" 
          value={urgentLeads.length} 
          icon={AlertTriangle} 
          description="requires immediate attention" 
        />
        <StatsCard 
          title="In Progress" 
          value={inProgressLeads.length} 
          icon={Phone} 
          description="currently working" 
        />
        <StatsCard 
          title="Calls Today" 
          value={todayCallCount} // <--- Connected to Real DB Count
          icon={CheckCircle} 
          description="completed sessions" 
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="all">All Leads ({leads.length})</TabsTrigger>
                <TabsTrigger value="urgent">Urgent ({urgentLeads.length})</TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" />
                    Call History
                </TabsTrigger>
            </TabsList>
        </div>

        {/* Tab: All Leads */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
            {leads.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No leads assigned.</p>}
          </div>
        </TabsContent>

        {/* Tab: Urgent */}
        <TabsContent value="urgent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {urgentLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
            {urgentLeads.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No urgent leads.</p>}
          </div>
        </TabsContent>

        {/* Tab: Call History (New clean home for the list) */}
        <TabsContent value="history">
            <CallHistoryList agentId={user?.id} />
        </TabsContent>

      </Tabs>
    </div>
  )
}