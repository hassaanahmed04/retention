"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Clock, User, Calendar, Loader2 } from "lucide-react"

export function CallHistoryList({ agentId }: { agentId?: string }) {
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Query Construction
      let query = supabase
        .from('call_records')
        .select(`
          id,
          created_at,
          call_duration,
          outcome,
          notes,
          retention_cases (client_name), 
          users (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20) // Increased limit for managers

      // Filter if agentId is present (Agent Dashboard)
      if (agentId) {
        query = query.eq('agent_id', agentId)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching calls:", error)
      } else {
        setCalls(data || [])
      }
      setLoading(false)
    }

    fetchHistory()
  }, [agentId])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
            {agentId ? "My Recent Calls" : "Team Call Log"}
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!loading && calls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No calls recorded yet.</p>
          ) : (
            calls.map((call) => (
              <div key={call.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {call.retention_cases?.client_name || "Unknown Lead"}
                    </p>
                    <Badge variant="outline" className="capitalize text-xs">
                      {call.outcome?.replace('_', ' ') || "Completed"}
                    </Badge>
                  </div>
                  
                  {/* Always show agent name if looking at Manager View */}
                  {!agentId && call.users && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <User className="h-3 w-3" />
                      {call.users.full_name}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                    {call.notes || "No notes entered."}
                  </p>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs font-mono">
                    <Clock className="h-3 w-3" />
                    {formatDuration(call.call_duration)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}