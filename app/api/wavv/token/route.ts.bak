// app/api/wavv/token/route.ts
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // In a real app, fetch the authenticated user's ID from session
    // const { data: { user } } = await supabase.auth.getUser()
    const userId = "agent-123" 

    const body = {
      userId: userId,
      accountId: process.env.NEXT_PUBLIC_WAVV_ISSUER_ID,
    }

    // Request a session token from Wavv's API
    const response = await fetch("https://api.wavv.com/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.WAVV_API_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Wavv Token Error:", errorText)
      throw new Error(`Failed to fetch Wavv token: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json({ token: data.token })
    
  } catch (error) {
    console.error("Wavv API Route Error:", error)
    return NextResponse.json(
      { error: "Failed to generate dialer token" },
      { status: 500 }
    )
  }
}