"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { AuthUser } from "@/lib/auth/config"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const getUserProfile = async (userId: string) => {
    console.log("Fetching profile for:", userId) // Debug Log
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()
    
    if (error) console.error("Supabase DB Error:", error) // Debug Log
    if (data) console.log("Profile found:", data) // Debug Log
    
    return { data, error }
  }

  // Check Session on Mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await getUserProfile(session.user.id)
          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.full_name,
              role: profile.role,
            })
          }
        }
      } catch (err) {
        console.error("Session check failed", err)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await getUserProfile(session.user.id)
        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile.full_name,
            role: profile.role,
          })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true)
    setError(null)
    console.log("Attempting login for:", email)

    // 1. Perform Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    })

    if (authError) {
      console.error("Auth Error:", authError.message)
      setError(authError.message)
      setIsLoading(false)
      return { success: false, error: authError.message }
    }

    console.log("Auth successful, fetching profile...")

    // 2. Fetch Profile
    if (data.session?.user) {
      const { data: profile, error: profileError } = await getUserProfile(data.session.user.id)
      
      if (profileError || !profile) {
        // This is usually where it fails if RLS is wrong
        const msg = "Login succeeded, but could not load User Profile. Check RLS policies."
        console.error(msg)
        setError(msg)
        setIsLoading(false)
        return { success: false, error: msg }
      }

      // 3. Success
      const authUser: AuthUser = {
        id: data.session.user.id,
        email: data.session.user.email!,
        name: profile.full_name,
        role: profile.role,
      }

      setUser(authUser)
      setIsLoading(false)
      return { success: true, user: authUser }
    }

    setIsLoading(false)
    return { success: false, error: "Session creation failed" }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, isLoading, error, signIn, signOut }
}