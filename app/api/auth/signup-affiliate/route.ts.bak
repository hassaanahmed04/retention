import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase Admin Client (Service Role)
// We need this to create users with specific metadata/roles securely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json()

    // 1. Create User in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for smoother onboarding (or false if you want verification)
      user_metadata: { full_name: fullName }
    })

    if (authError) throw new Error(authError.message)
    if (!authUser.user) throw new Error("Failed to create user")

    // 2. Insert into your public 'users' table with the CORRECT ROLE
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id, // Link to Auth ID
        email: email,
        full_name: fullName,
        role: 'affiliate', // <--- This forces them to be an affiliate
        status: 'active'
      })

    if (profileError) {
      // Rollback: If profile creation fails, delete the auth user so they aren't stuck
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw new Error("Failed to create profile: " + profileError.message)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Signup Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}