import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Calendar } from "lucide-react"

export default function ManagerReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analytics and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList>
          <TabsTrigger value="daily">Daily Activity</TabsTrigger>
          <TabsTrigger value="success">Success Analytics</TabsTrigger>
          <TabsTrigger value="carrier">By Carrier</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">47</div>
                <p className="text-sm text-muted-foreground">+12% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Talk Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2h 22m</div>
                <p className="text-sm text-muted-foreground">Average: 3m per call</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fix Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">32</div>
                <p className="text-sm text-muted-foreground">18 successful (56%)</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity</CardTitle>
              <CardDescription>Call volume throughout the day</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Connect to real data
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Success Rate by Agent</CardTitle>
              <CardDescription>Percentage of leads moved from failure to success state</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Connect to real data
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carrier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Carrier</CardTitle>
              <CardDescription>Success rates and volume by insurance carrier</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Connect to real data
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
