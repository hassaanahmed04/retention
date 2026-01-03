"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { bulkAssignLeads } from "@/app/actions/manager-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Filter, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CallHistoryList } from "@/components/dashboard/call-history-list"

export default function ManagerDashboard() {
  const [leads, setLeads] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [guides, setGuides] = useState<any[]>([])
  
  // Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState("")

  const { toast } = useToast()

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Fetch Leads
      const { data: leadsData } = await supabase
        .from('retention_cases')
        .select('*, users(full_name)')
        .order('created_at', { ascending: false })
      
      // Fetch Agents
      const { data: agentsData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'retention_agent')

      // Fetch Guides
      const { data: guidesData } = await supabase.from('policy_fix_guides').select('*')

      if (leadsData) setLeads(leadsData)
      if (agentsData) setAgents(agentsData)
      if (guidesData) setGuides(guidesData)
    }
    fetchData()
  }, [])

  // 2. Filter Logic
  const filteredLeads = leads.filter(lead => {
    if (filterStatus === "all") return true
    return lead.status === filterStatus
  })

  // 3. Selection Logic
  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([])
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // 4. Bulk Assign Handler
  const handleBulkAssign = async () => {
    if (!selectedAgentForAssign || selectedLeadIds.length === 0) return
    
    const result = await bulkAssignLeads(selectedLeadIds, selectedAgentForAssign)
    
    if (result.success) {
      toast({ title: "Success", description: `Assigned ${selectedLeadIds.length} leads` })
      setSelectedLeadIds([]) // Reset selection
      // Optimistic update could go here, or simple refresh:
      window.location.reload() 
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error })
    }
  }

  // 5. Get Guide for Selected Lead (Dynamic Helper)
  // We use the LAST selected lead to show the guide preview
  const activeLeadId = selectedLeadIds[selectedLeadIds.length - 1]
  const activeLead = leads.find(l => l.id === activeLeadId)
  
  // Find matching guide based on Status (and Carrier if we had it)
  const activeGuide = activeLead 
    ? guides.find(g => activeLead.status?.toLowerCase().includes(g.issue_type.toLowerCase())) 
    : null

  return (
    <div className="p-8 space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Manager Console</h1>
          <p className="text-muted-foreground">Lead Assignment & Oversight</p>
        </div>
        
        {/* Bulk Action Bar */}
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border">
            <span className="text-sm font-medium px-2">{selectedLeadIds.length} selected</span>
            <Select value={selectedAgentForAssign} onValueChange={setSelectedAgentForAssign}>
                <SelectTrigger className="w-[200px] bg-background">
                    <SelectValue placeholder="Assign to Agent..." />
                </SelectTrigger>
                <SelectContent>
                    {agents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>{agent.full_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleBulkAssign} disabled={selectedLeadIds.length === 0}>
                Assign
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main List (Left Side - 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
            {/* Filter Tabs */}
            <Tabs defaultValue="all" onValueChange={setFilterStatus}>
                <TabsList>
                    <TabsTrigger value="all">All Leads</TabsTrigger>
                    <TabsTrigger value="open">Open</TabsTrigger>
                    <TabsTrigger value="urgent">Urgent</TabsTrigger>
                </TabsList>
            </Tabs>
<CallHistoryList />
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex justify-between items-center">
                        Lead Queue
                        <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                           {selectedLeadIds.length === filteredLeads.length ? "Deselect All" : "Select All"}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {filteredLeads.map((lead) => (
                            <div key={lead.id} className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition ${selectedLeadIds.includes(lead.id) ? "bg-muted/30" : ""}`}>
                                <Checkbox 
                                    checked={selectedLeadIds.includes(lead.id)}
                                    onCheckedChange={() => toggleSelectOne(lead.id)}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <p className="font-semibold">{lead.client_name}</p>
                                        <Badge variant={lead.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                            {lead.status}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                        <span>{lead.client_phone}</span>
                                        <span>{lead.users?.full_name || "Unassigned"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredLeads.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">No leads found for this filter.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Policy Fix Guide (Right Side - 1 Col) */}
        <div className="lg:col-span-1">
            <Card className="sticky top-8 border-l-4 border-l-blue-500 shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2 text-blue-600">
                        <BookOpen className="h-5 w-5" />
                        <span className="font-semibold uppercase text-xs tracking-wider">Policy Fix Guide</span>
                    </div>
                    <CardTitle>
                        {activeLead ? activeLead.client_name : "Select a Lead"}
                    </CardTitle>
                    <CardDescription>
                        {activeGuide ? activeGuide.title : "Select a lead to view resolution steps"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeGuide ? (
                        <div className="space-y-4">
                            {/* Steps List */}
                            <div className="space-y-3">
                                {(activeGuide.steps as string[]).map((step, idx) => (
                                    <div key={idx} className="flex gap-3 text-sm">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
                                            {idx + 1}
                                        </div>
                                        <p className="leading-6">{step}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Recommended Script</p>
                                <div className="bg-muted p-3 rounded text-sm italic">
                                    "Hi {activeLead.client_name}, I'm calling regarding an update to your policy status..."
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                            <p>Select a lead from the list to see the dynamic Policy Fix Guide for that specific issue.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}