import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("1. Received API call with:", body) // LOG INPUT

    const { email, password, fullName, role } = body

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) {
      console.error("2. Auth Creation Failed:", authError.message) // LOG AUTH ERROR
      return NextResponse.json({ error: "Auth Error: " + authError.message }, { status: 400 })
    }

    console.log("3. Auth User Created:", authData.user.id)

    // 2. Create Public Profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role,
      })

    if (profileError) {
      console.error("4. Database Insert Failed:", profileError.message) // LOG DB ERROR
      // Cleanup auth user if DB fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "DB Error: " + profileError.message }, { status: 400 })
    }

    console.log("5. Success!")
    return NextResponse.json({ success: true, user: authData.user })

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}