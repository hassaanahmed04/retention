"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"

// Define a flexible type that handles both DB (snake_case) and Mock (camelCase)
type FlexibleLead = {
  id: string
  // Handle DB 'client_name' OR Mock 'name'
  name?: string
  client_name?: string
  // Handle DB 'client_phone' OR Mock 'phone'
  phone?: string
  client_phone?: string
  
  status?: string
  priority?: string
  
  // Handle DB 'policy_id' vs Mock 'policyId'
  policyId?: string
  policy_ids?: string[] | null // DB often returns an array or string
  
  carrier?: string
  
  // Handle DB 'fix_type' vs Mock 'fixType'
  fixType?: string
  fix_type?: string
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  issued_not_paid: "bg-orange-100 text-orange-800",
  pending_lapse: "bg-red-100 text-red-800",
  charged_back: "bg-red-100 text-red-800",
  issued_paid: "bg-green-100 text-green-800",
  dead: "bg-gray-100 text-gray-800",
  open: "bg-blue-100 text-blue-800", // Added for DB default
  urgent: "bg-red-100 text-red-800"  // Added for DB default
}

export function LeadCard({ lead }: { lead: FlexibleLead }) {
  // 1. SAFE DATA MAPPING (The Fix)
  // We prefer the DB column name, fall back to Mock name, fall back to "Unknown"
  const name = lead.client_name || lead.name || "Unknown Client"
  const phone = lead.client_phone || lead.phone || "No Phone"
  const status = lead.status || "open"
  const fixTypeRaw = lead.fix_type || lead.fixType || "general_inquiry"
  
  // Handle Policy ID (DB might return array or null)
  let policyIdDisplay = "N/A"
  if (lead.policy_ids && Array.isArray(lead.policy_ids) && lead.policy_ids.length > 0) {
     policyIdDisplay = lead.policy_ids[0]
  } else if (lead.policyId) {
     policyIdDisplay = lead.policyId
  }

  // 2. SAFE STRING MANIPULATION
  // We use optional chaining (?) or default values before calling .replace
  const fixTypeDisplay = fixTypeRaw.replace(/_/g, " ")
  const statusDisplay = status.replace(/_/g, " ")

  const isUrgent = status === "pending_lapse" || status === "charged_back" || lead.priority === "urgent"

  return (
    <Card className={isUrgent ? "border-red-200 bg-red-50/50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">{phone}</p>
          </div>
          <Badge variant="secondary" className={statusColors[status] || "bg-gray-100"}>
            {statusDisplay}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Policy ID</p>
            <p className="font-mono">{policyIdDisplay}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Carrier</p>
            <p>{lead.carrier || "Unknown"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Issue Type</p>
            <p className="capitalize">{fixTypeDisplay}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="flex-1" asChild>
            <Link href={`/agent/calls?lead=${lead.id}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/agent/leads/${lead.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              Details
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/agent/leads/${lead.id}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}