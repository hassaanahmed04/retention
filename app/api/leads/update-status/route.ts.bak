import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { mapSupabaseToMonday, MONDAY_COLUMN_IDS } from "@/lib/monday/status-mapping"

export async function POST(req: NextRequest) {
  try {
    // We now accept an optional `targetPulseId`
    const { leadId, newStatus, targetPulseId } = await req.json()
    
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Fetch Lead
    const { data: lead } = await supabase.from("retention_cases").select("*").eq("id", leadId).single()
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

    const mondayLabel = mapSupabaseToMonday(newStatus)
    let currentItems = (lead.linked_items as any[]) || []

    // 2. Determine Targets (Specific Item vs All Items)
    let targetIds: string[] = []
    
    if (targetPulseId) {
      // User clicked "Update" on a specific policy row
      targetIds = [String(targetPulseId)]
    } else {
      // User used the main dropdown (Global Update) -> Update ALL linked items
      targetIds = currentItems.map(i => i.id)
    }

    // 3. Update Monday.com
    if (mondayLabel && targetIds.length > 0) {
      const updates = targetIds.map(async (pulseId) => {
        const query = `mutation { change_column_value (board_id: ${process.env.MONDAY_BOARD_ID}, item_id: ${pulseId}, column_id: "${MONDAY_COLUMN_IDS.STATUS}", value: "{\\"label\\": \\"${mondayLabel}\\"}") { id } }`
        return fetch("https://api.monday.com/v2", {
            method: "POST", 
            headers: { "Content-Type": "application/json", Authorization: process.env.MONDAY_API_KEY! },
            body: JSON.stringify({ query })
        })
      })
      await Promise.all(updates)
    }

    // 4. Update Local `linked_items` JSONB
    // We need to update the status inside our JSON array for the targeted items
    const updatedItems = currentItems.map((item) => {
      if (targetIds.includes(item.id)) {
        return { ...item, status: newStatus, monday_label: mondayLabel || item.monday_label }
      }
      return item
    })

    // 5. Update Supabase
    // We also update the main `status` column to reflect the latest action, 
    // or you could calculate an "overall" status logic here.
    await supabase
      .from("retention_cases")
      .update({
        linked_items: updatedItems,
        status: newStatus, // Update main status to match latest interaction
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}