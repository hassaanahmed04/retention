import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { mapSupabaseToMonday, MONDAY_COLUMN_IDS } from "@/lib/monday/status-mapping"

export async function POST(req: NextRequest) {
  const logs: string[] = []

  try {
    const { leadId, newStatus } = await req.json()
    logs.push(`1. Received: Lead=${leadId}, Status=${newStatus}`)

    // 1. Initialize Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 2. Fetch the Lead to get Monday IDs
    const { data: lead, error: fetchError } = await supabase
      .from("retention_cases")
      .select("*")
      .eq("id", leadId)
      .single()

    if (fetchError || !lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 })
    }

    // 3. Map the Status
    const mondayLabel = mapSupabaseToMonday(newStatus)
    
    // 4. Update Monday (Only if mapping exists)
    if (mondayLabel && lead.monday_item_ids?.length) {
      logs.push(`2. Updating Monday items to '${mondayLabel}'...`)

      const updates = lead.monday_item_ids.map(async (pulseId: string) => {
        const query = `
          mutation {
            change_column_value (
              board_id: ${process.env.MONDAY_BOARD_ID}, 
              item_id: ${pulseId}, 
              column_id: "${MONDAY_COLUMN_IDS.STATUS}", 
              value: "{\\"label\\": \\"${mondayLabel}\\"}"
            ) {
              id
            }
          }
        `
        
        const res = await fetch("https://api.monday.com/v2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.MONDAY_API_KEY!,
          },
          body: JSON.stringify({ query }),
        })
        
        return res.json()
      })

      await Promise.all(updates)
      logs.push("3. Monday Update Sent")
    } else {
      logs.push("3. Skipped Monday (No mapping or no linked items)")
    }

    // 5. Update Supabase
    const { error: updateError } = await supabase
      .from("retention_cases")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", leadId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, logs })

  } catch (error: any) {
    return NextResponse.json({ error: error.message, logs }, { status: 500 })
  }
}