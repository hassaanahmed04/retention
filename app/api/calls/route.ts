import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET - Fetch call records
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")
    const leadId = searchParams.get("leadId")

    let query = supabase.from("call_records").select("*")

    if (agentId) {
      query = query.eq("agent_id", agentId)
    }

    if (leadId) {
      query = query.eq("lead_id", leadId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Call records fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch call records" },
      { status: 500 },
    )
  }
}

// POST - Create a new call record (typically from Wavv webhook)
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { lead_id, agent_id, call_duration, call_status, recording_url, notes } = body

    if (!lead_id || !agent_id) {
      return NextResponse.json({ error: "lead_id and agent_id are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("call_records")
      .insert({
        lead_id,
        agent_id,
        call_duration,
        call_status,
        recording_url,
        notes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Call record creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create call record" },
      { status: 500 },
    )
  }
}
