"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { LeadTable } from "@/components/leads/lead-table"
import { LeadFilters, type LeadFilters as LeadFiltersType } from "@/components/leads/lead-filters"
import { AssignDialog } from "@/components/leads/assign-dialog"
import { UserPlus, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Lead, Agent } from "@/lib/types"

export default function ManagerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<LeadFiltersType>({
    search: "",
    status: "all",
    carrier: "",
    fixType: "all",
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const { toast } = useToast()

  // Initialize Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Fetch Leads and Agents on Load
  const fetchData = async () => {
    setIsLoading(true)
    
    // Fetch Cases (Leads)
    // We join the 'users' table to get the assigned agent's name
    const { data: casesData, error: casesError } = await supabase
      .from("retention_cases")
      .select(`
        *,
        assigned_agent:users!assigned_agent_id(full_name)
      `)
      .order("created_at", { ascending: false })

    // Fetch Agents list for the dropdown
    const { data: agentsData, error: agentsError } = await supabase
      .from("users")
      .select("*")
      .eq("role", "retention_agent")

    if (casesError || agentsError) {
      console.error("Error fetching data:", casesError || agentsError)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load leads or agents.",
      })
    } else {
      // Transform DB "Case" to UI "Lead" type
      const formattedLeads: Lead[] = casesData.map((c: any) => ({
        id: c.id,
        name: c.client_name || "Unknown Client",
        phone: c.client_phone || "",
        email: "client@placeholder.com", // Add email to DB schema if needed
        policyId: c.policy_ids?.[0] || "N/A",
        carrier: "Unknown", // Needs carrier column in DB
        status: c.status === 'open' ? 'new' : c.status, 
        fixType: "payment_issue", // Needs fix_type column in DB
        assignedAgent: c.assigned_agent?.full_name || null,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }))

      setLeads(formattedLeads)
      
      // Transform DB "User" to UI "Agent" type
      const formattedAgents: Agent[] = agentsData.map((a: any) => ({
        id: a.id,
        name: a.full_name,
        email: a.email,
        role: "agent",
        activeLeads: 0, // Calculate this if needed
        totalCalls: 0,
        successRate: 0
      }))
      setAgents(formattedAgents)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. Client-Side Filtering
  const filteredLeads = leads.filter((lead) => {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      if (
        !lead.name.toLowerCase().includes(search) &&
        !lead.phone.includes(search) &&
        !lead.policyId.toLowerCase().includes(search)
      ) {
        return false
      }
    }
    if (filters.status !== "all" && lead.status !== filters.status) return false
    // Note: Carrier/FixType filtering requires those columns in DB
    return true
  })

  // 3. Handle Assignment Logic
  const handleAssign = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("retention_cases")
        .update({ assigned_agent_id: agentId })
        .in("id", selectedIds)

      if (error) throw error

      toast({
        title: "Success",
        description: `Assigned ${selectedIds.length} leads to agent.`,
      })

      // Refresh data and clear selection
      fetchData()
      setSelectedIds([])
      setAssignDialogOpen(false)

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: error.message,
      })
    }
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Assignment</h1>
          <p className="text-muted-foreground">Filter and assign leads to retention agents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" disabled={selectedIds.length === 0} onClick={() => setAssignDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Selected ({selectedIds.length})
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <LeadFilters filters={filters} onFilterChange={setFilters} />
      </div>

      <LeadTable
        leads={filteredLeads}
        selectable
        onSelect={setSelectedIds}
        onViewDetails={(id) => console.log("View details:", id)}
        onCall={(id) => console.log("Call:", id)}
        onAssign={(id) => {
          setSelectedIds([id])
          setAssignDialogOpen(true)
        }}
      />

      <AssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        selectedCount={selectedIds.length}
        agents={agents}
        onAssign={handleAssign}
      />
    </div>
  )
}