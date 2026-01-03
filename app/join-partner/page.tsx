"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr" // Import your client creator
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AffiliateSignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ fullName: "", email: "", password: "" })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Call your API to create the account
      const res = await fetch('/api/auth/signup-affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      // 2. Log them in immediately on the client side
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })

      if (loginError) throw loginError

      toast({ title: "Welcome!", description: "Account created successfully." })
      
      // 3. Redirect to their new dashboard
      router.push('/affiliate')

    } catch (error: any) {
      toast({ variant: "destructive", title: "Signup Failed", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Become a Partner</CardTitle>
          <CardDescription>Join our affiliate program and start earning commissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                required 
                placeholder="Business Name or Full Name" 
                value={form.fullName} 
                onChange={e => setForm({...form, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                required 
                placeholder="you@company.com" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password" 
                required 
                placeholder="••••••••" 
                minLength={6}
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              Create Partner Account
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-2">
                Already have an account? <a href="/login" className="underline text-primary">Log in</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}