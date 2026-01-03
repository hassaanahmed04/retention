import { type NextRequest, NextResponse } from "next/server"
import { createAccountLink } from "@/lib/stripe/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, refreshUrl, returnUrl } = body

    if (!accountId || !refreshUrl || !returnUrl) {
      return NextResponse.json({ error: "accountId, refreshUrl, and returnUrl are required" }, { status: 400 })
    }

    const accountLink = await createAccountLink(accountId, refreshUrl, returnUrl)

    return NextResponse.json({
      url: accountLink.url,
      success: true,
    })
  } catch (error) {
    console.error("Stripe Connect onboarding error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create onboarding link" },
      { status: 500 },
    )
  }
}
