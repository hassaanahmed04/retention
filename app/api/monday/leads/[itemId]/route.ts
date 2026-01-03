import { type NextRequest, NextResponse } from "next/server"
import { updateLeadStatus, assignLeadToAgent } from "@/lib/monday/client"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await params
    const body = await request.json()
    const { boardId, columnId, status, agentId, agentColumnId } = body

    if (!boardId) {
      return NextResponse.json({ error: "boardId is required" }, { status: 400 })
    }

    // Update status if provided
    if (status && columnId) {
      const statusResult = await updateLeadStatus(itemId, boardId, columnId, status)
      if (statusResult.errors) {
        return NextResponse.json({ error: statusResult.errors[0].message }, { status: 500 })
      }
    }

    // Assign agent if provided
    if (agentId && agentColumnId) {
      const assignResult = await assignLeadToAgent(itemId, boardId, agentColumnId, agentId)
      if (assignResult.errors) {
        return NextResponse.json({ error: assignResult.errors[0].message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Monday.com API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update lead" },
      { status: 500 },
    )
  }
}
