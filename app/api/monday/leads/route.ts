import { type NextRequest, NextResponse } from "next/server"
import { getBoardItems, getLeadsByStatus } from "@/lib/monday/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get("boardId")
    const status = searchParams.get("status")

    if (!boardId) {
      return NextResponse.json({ error: "boardId is required" }, { status: 400 })
    }

    const result = status ? await getLeadsByStatus(boardId, status) : await getBoardItems(boardId)

    if (result.errors) {
      return NextResponse.json({ error: result.errors[0].message }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Monday.com API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch leads" },
      { status: 500 },
    )
  }
}
