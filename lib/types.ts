// Types for the Retention Portal

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  policyId: string
  carrier: string
  status: LeadStatus
  fixType: FixType
  assignedAgent?: string
  createdAt: string
  updatedAt: string
}

export type LeadStatus =
  | "new"
  | "in_progress"
  | "issued_not_paid"
  | "pending_lapse"
  | "charged_back"
  | "issued_paid"
  | "dead"

export type FixType = "payment_issue" | "documentation" | "verification" | "policy_change" | "customer_service"

export interface RetentionCase {
  id: string
  clientName: string
  phone: string
  leads: Lead[]
  status: "open" | "in_progress" | "resolved" | "closed"
  assignedAgent?: string
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
}

export interface Agent {
  id: string
  name: string
  email: string
  role: "agent" | "manager" | "admin"
  activeLeads: number
  totalCalls: number
  successRate: number
}

export interface CallRecord {
  id: string
  leadId: string
  agentId: string
  duration: number
  recordingUrl?: string
  outcome: "answered" | "voicemail" | "no_answer" | "busy"
  notes?: string
  createdAt: string
}

export interface DailyStats {
  totalCalls: number
  totalTalkTime: number
  fixAttempts: number
  successfulFixes: number
  pendingLeads: number
}

export interface Affiliate {
  id: string
  name: string
  email: string
  totalLeads: number
  soldPolicies: number
  conversionRate: number
  totalCommission: number
  pendingPayout: number
  status: "active" | "pending" | "inactive"
}

export interface User {
  id: string
  name: string
  email: string
  role: "agent" | "manager" | "admin"
  status: "active" | "inactive"
  lastActive: string
}

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string
    role: "agent" | "manager" | "admin"
  } | null
  isLoading: boolean
}
