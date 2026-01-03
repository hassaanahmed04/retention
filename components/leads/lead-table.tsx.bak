"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Phone, FileText, UserPlus } from "lucide-react"
import type { Lead, LeadStatus } from "@/lib/types"

interface LeadTableProps {
  leads: Lead[]
  selectable?: boolean
  onSelect?: (selectedIds: string[]) => void
  onAssign?: (leadId: string) => void
  onCall?: (leadId: string) => void
  onViewDetails?: (leadId: string) => void
}

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  issued_not_paid: "bg-orange-100 text-orange-800",
  pending_lapse: "bg-red-100 text-red-800",
  charged_back: "bg-red-100 text-red-800",
  issued_paid: "bg-green-100 text-green-800",
  dead: "bg-gray-100 text-gray-800",
}

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  issued_not_paid: "Issued Not Paid",
  pending_lapse: "Pending Lapse",
  charged_back: "Charged Back",
  issued_paid: "Issued Paid",
  dead: "Dead",
}

export function LeadTable({ leads, selectable = false, onSelect, onAssign, onCall, onViewDetails }: LeadTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? leads.map((l) => l.id) : []
    setSelectedIds(newSelection)
    onSelect?.(newSelection)
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelection = checked ? [...selectedIds, id] : selectedIds.filter((i) => i !== id)
    setSelectedIds(newSelection)
    onSelect?.(newSelection)
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === leads.length && leads.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Client</TableHead>
            <TableHead>Policy ID</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fix Type</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={selectable ? 8 : 7} className="h-24 text-center text-muted-foreground">
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(lead.id)}
                      onCheckedChange={(checked) => handleSelectOne(lead.id, !!checked)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{lead.policyId}</TableCell>
                <TableCell>{lead.carrier}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[lead.status]}>
                    {statusLabels[lead.status]}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{lead.fixType.replace("_", " ")}</TableCell>
                <TableCell>{lead.assignedAgent || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails?.(lead.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCall?.(lead.id)}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssign?.(lead.id)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
