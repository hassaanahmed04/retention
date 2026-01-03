import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Users, TrendingUp, AlertCircle, ClipboardList, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">Retention Portal</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Policy Retention & Fix Management
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Reduce Churn & Chargebacks with Proactive Policy Management
          </h1>
          <p className="mb-8 text-lg text-muted-foreground text-pretty">
            A specialized operational layer designed to optimize post-sale policy retention by addressing policies in
            failure states like Pending Lapse and Charged Back.
          </p>
          
        </div>
      </section>

     
    
    </div>
  )
}
