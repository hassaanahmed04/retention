"use client"
import { useEffect } from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, UserPlus, Edit, Trash2 } from "lucide-react"
import { mockUsers } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@supabase/ssr"
export default function AdminUsersPage() {
  const [addUserOpen, setAddUserOpen] = useState(false)
const { toast } = useToast()
const [formData, setFormData] = useState({ name: "", email: "", role: "agent", password: "" })
const [loading, setLoading] = useState(false)
const [users, setUsers] = useState<any[]>([]) // Use this instead of mockUsers
const handleCreateUser = async () => {
    console.log("Attempting to create user with data:", formData); // Debug log

    // Basic validation
    if (!formData.email || !formData.name) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all fields." });
      return;
    }

    setLoading(true); // START LOADING

    try {
        const res = await fetch('/api/admin/users/create', {
            method: 'POST',
            body: JSON.stringify({
                email: formData.email,
                password: "12341234", // Ideally, add a password input field later
                fullName: formData.name,
                role: formData.role
            })
        })
        
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        toast({ title: "User Created", description: "User can now log in." })
        setAddUserOpen(false)
        setFormData({ name: "", email: "", role: "agent", password: "" }) // Reset form
        fetchUsers() 
    } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
        setLoading(false); // STOP LOADING
    }
}
const fetchUsers = async () => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
}

// Add useEffect to load data
useEffect(() => {
    fetchUsers()
}, [])
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Button onClick={() => setAddUserOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{mockUsers.length} users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                 <TableCell>
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
      {/* CHANGE: Use user.full_name and add a fallback */}
      {(user.full_name || "U") 
        .split(" ")
        .map((n: string) => n[0])
        .join("")}
    </div>
    <div>
      {/* CHANGE: Use user.full_name */}
      <p className="font-medium">{user.full_name || "Unknown User"}</p>
      <p className="text-sm text-muted-foreground">{user.email}</p>
    </div>
  </div>
</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "manager"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.lastActive).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
            <div className="space-y-4 py-4">
  <div className="space-y-2">
    <Label>Full Name</Label>
    <Input 
      placeholder="John Doe" 
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    />
  </div>
  <div className="space-y-2">
    <Label>Email</Label>
    <Input 
      type="email" 
      placeholder="john@company.com" 
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    />
  </div>
  <div className="space-y-2">
    <Label>Role</Label>
    <Select 
      value={formData.role} 
      onValueChange={(value) => setFormData({ ...formData, role: value })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="retention_agent">Agent</SelectItem>

      {/* 2. Change "manager" to "sales_manager" */}
      <SelectItem value="sales_manager">Manager</SelectItem>
      
      {/* 3. This one is fine */}
      <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
          <DialogFooter>
  <Button variant="outline" onClick={() => setAddUserOpen(false)}>
    Cancel
  </Button>
  <Button onClick={handleCreateUser} disabled={loading}>
    {loading ? "Creating..." : "Create User"}
  </Button>
</DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
