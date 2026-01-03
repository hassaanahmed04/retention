"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Phone,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/components/auth/auth-provider"

interface SidebarProps {
  userRole: "agent" | "manager" | "admin"
  userName: string
}

const navigation = {
  agent: [
    { name: "My Leads", href: "/agent", icon: ClipboardList },
    { name: "Call Center", href: "/agent/calls", icon: Phone },
    { name: "My Stats", href: "/agent/stats", icon: BarChart3 },
  ],
  manager: [
    { name: "Dashboard", href: "/manager", icon: LayoutDashboard },
    { name: "Lead Assignment", href: "/manager/leads", icon: ClipboardList },
    { name: "Team Performance", href: "/manager/team", icon: Users },
    { name: "Reports", href: "/manager/reports", icon: BarChart3 },
  ],
  admin: [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Lead Manager", href: "/admin/leads", icon: ClipboardList },
    { name: "Affiliates", href: "/admin/affiliates", icon: Building2 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
}

export function DashboardSidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuthContext()
  const navItems = navigation[userRole]

  // Use actual user data if available
  const displayName = user?.name || userName
  const displayRole = user?.role || userRole

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="font-semibold">Retention Portal</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs capitalize text-muted-foreground">{displayRole}</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
