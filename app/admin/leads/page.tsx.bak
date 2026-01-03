"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RefreshCw, MoreHorizontal, Eye, UserPlus, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Helper for status colors
const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  issued_not_paid: "bg-orange-100 text-orange-800",
  pending_lapse: "bg-red-100 text-red-800",
  charged_back: "bg-red-100 text-red-800",
  resolved: "bg-green-100 text-green-800",
  issued_paid: "bg-green-100 text-green-800",
  dead: "bg-gray-100 text-gray-800",
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()

  // 1. Fetch Real Data
  const fetchLeads = async () => {
    setLoading(true)
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Select cases and join with users to get agent name
    const { data, error } = await supabase
        .from('retention_cases')
        .select(`
            *,
            assigned_agent:users!assigned_agent_id(full_name)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching leads:", error)
        toast({ variant: "destructive", title: "Error", description: "Failed to load leads" })
    } else {
        setLeads(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  // 2. Filter Logic
  const filteredLeads = statusFilter === "all" 
    ? leads 
    : leads.filter((l) => l.status === statusFilter)

  // 3. Sync Handler (Just refreshes for now, webhook handles real sync)
  const handleSync = () => {
      toast({ title: "Syncing...", description: "Refreshing lead list from database." })
      fetchLeads()
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Manager</h1>
          <p className="text-muted-foreground">View and manage all incoming leads</p>
        </div>
        <Button variant="outline" onClick={handleSync} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                {filteredLeads.length} leads{" "}
                {statusFilter !== "all" && `with status: ${statusFilter.replace("_", " ")}`}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="issued_not_paid">Issued Not Paid</SelectItem>
                <SelectItem value="pending_lapse">Pending Lapse</SelectItem>
                <SelectItem value="charged_back">Charged Back</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Policy ID</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No leads found.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                        <TableCell>
                        <div>
                            <p className="font-medium">{lead.client_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{lead.client_phone}</p>
                        </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                            {/* Display Policy ID or Monday ID as fallback */}
                            {lead.policy_ids?.[0] || lead.monday_item_ids?.[0] || "N/A"}
                        </TableCell>
                        <TableCell>{lead.carrier || "Unknown"}</TableCell>
                        <TableCell>
                        <Badge variant="secondary" className={statusColors[lead.status] || "bg-gray-100"}>
                            {lead.status?.replace("_", " ")}
                        </Badge>
                        </TableCell>
                        <TableCell>
                            {lead.assigned_agent?.full_name ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                        {lead.assigned_agent.full_name.charAt(0)}
                                    </div>
                                    <span className="text-sm">{lead.assigned_agent.full_name}</span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground text-sm italic">Unassigned</span>
                            )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                        {new Date(lead.updated_at || lead.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Re-Assign Agent
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Update Status
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}