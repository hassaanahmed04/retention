import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase (Service Role to bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { client_name, client_phone, notes, affiliate_id } = body

    // 1. Save to Supabase (Your Database)
    const { data: lead, error: dbError } = await supabase
      .from('retention_cases')
      .insert({
        client_name,
        client_phone,
        affiliate_id,
        status: 'open', // Internal Supabase status
        priority: 'medium',
        fix_type: 'new_lead',
        linked_items: []
      })
      .select()
      .single()

    if (dbError) throw new Error(dbError.message)

    // 2. Prepare Data for Monday.com
    // We strictly use the IDs found in your JSON: phone_mkys20n9, color_mkyqy4tv
    const mondayColumnValues = JSON.stringify({
      phone_mkys20n9: { phone: client_phone, countryShortName: "US" },
      color_mkyqy4tv: { label: "Pending Lapse" } // Default status on your board
    })

    // 3. Push to Monday.com
    // Note: escape double quotes for GraphQL
    const escapedValues = mondayColumnValues.replace(/"/g, '\\"')

    const mondayMutation = `mutation {
      create_item (
        board_id: ${process.env.MONDAY_BOARD_ID}, 
        item_name: "${client_name}", 
        column_values: "${escapedValues}"
      ) {
        id
      }
    }`

    const mondayRes = await fetch("https://api.monday.com/v2", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.MONDAY_API_KEY!
      },
      body: JSON.stringify({ query: mondayMutation })
    })

    const mondayData = await mondayRes.json()

    if (mondayData.errors) {
      console.error("Monday API Error:", mondayData.errors)
      // We don't fail the request here because the lead IS saved in Supabase
    }

    const mondayId = mondayData.data?.create_item?.id

    // 4. Update Supabase with Monday ID (Critical for syncing back later)
    if (mondayId) {
        // Post the notes as an 'Update' (Comment) on the item since there is no text column for it
        if (notes) {
            const updateMutation = `mutation {
                create_update (item_id: ${mondayId}, body: "Affiliate Note: ${notes}") { id }
            }`
            await fetch("https://api.monday.com/v2", {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': process.env.MONDAY_API_KEY!
                },
                body: JSON.stringify({ query: updateMutation })
            })
        }

        // Save the link
        await supabase
          .from('retention_cases')
          .update({ monday_user_id: mondayId })
          .eq('id', lead.id)
    }

    return NextResponse.json({ success: true, leadId: lead.id })

  } catch (error: any) {
    console.error("Submission Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}