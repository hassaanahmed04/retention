"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import type { LeadStatus, FixType } from "@/lib/types"

interface LeadFiltersProps {
  onFilterChange: (filters: LeadFilters) => void
  filters: LeadFilters
}

export interface LeadFilters {
  search: string
  status: LeadStatus | "all"
  carrier: string
  fixType: FixType | "all"
}

const carriers = ["All Carriers", "Blue Cross", "Aetna", "United Health", "Cigna", "Humana"]

export function LeadFilters({ onFilterChange, filters }: LeadFiltersProps) {
  const updateFilter = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: "",
      status: "all",
      carrier: "",
      fixType: "all",
    })
  }

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.carrier || filters.fixType !== "all"

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or policy..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.status} onValueChange={(v) => updateFilter("status", v as LeadStatus | "all")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="issued_not_paid">Issued Not Paid</SelectItem>
          <SelectItem value="pending_lapse">Pending Lapse</SelectItem>
          <SelectItem value="charged_back">Charged Back</SelectItem>
          <SelectItem value="issued_paid">Issued Paid</SelectItem>
          <SelectItem value="dead">Dead</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.carrier || "all"} onValueChange={(v) => updateFilter("carrier", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Carrier" />
        </SelectTrigger>
        <SelectContent>
          {carriers.map((carrier) => (
            <SelectItem key={carrier} value={carrier === "All Carriers" ? "all" : carrier}>
              {carrier}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.fixType} onValueChange={(v) => updateFilter("fixType", v as FixType | "all")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Fix Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Fix Types</SelectItem>
          <SelectItem value="payment_issue">Payment Issue</SelectItem>
          <SelectItem value="documentation">Documentation</SelectItem>
          <SelectItem value="verification">Verification</SelectItem>
          <SelectItem value="policy_change">Policy Change</SelectItem>
          <SelectItem value="customer_service">Customer Service</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
