// Authentication configuration
// This will work with Supabase Auth when connected

export type UserRole = "retention_agent" | "sales_manager" | "admin" | "affiliate"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

// Role-based route access
export const roleAccess: Record<UserRole, string[]> = {
  retention_agent: ["/agent", "/agent/calls", "/agent/stats", "/agent/leads"],
  sales_manager: ["/manager", "/manager/leads", "/manager/team", "/manager/reports"],
  admin: ["/admin", "/admin/leads", "/admin/affiliates", "/admin/users", "/admin/reports", "/admin/settings"],
  affiliate: ["/affiliate"],
}

// Get allowed routes for a role
export function getAllowedRoutes(role: UserRole): string[] {
  return roleAccess[role] || []
}

// Check if a user can access a route
export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const allowedRoutes = getAllowedRoutes(role)
  return allowedRoutes.some((route) => pathname.startsWith(route))
}

// Get home route for a role
export function getHomeRoute(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "sales_manager":
      return "/manager"
    case "retention_agent":
      return "/agent"
    case "affiliate":
      return "/affiliate"
    default:
      return "/login"
  }
}
