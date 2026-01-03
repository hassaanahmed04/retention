import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Calendar } from "lucide-react"
import { mockAgents, mockAffiliates, mockDailyStats } from "@/lib/mock-data"

export default function AdminReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive system analytics and reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="retention" className="space-y-6">
        <TabsList>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliate Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="retention" className="space-y-6">
          {/* Retention Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockDailyStats.totalCalls}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fix Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockDailyStats.fixAttempts}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Successful Fixes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockDailyStats.successfulFixes}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((mockDailyStats.successfulFixes / mockDailyStats.fixAttempts) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fix Success by Carrier</CardTitle>
              <CardDescription>Retention success rates broken down by insurance carrier</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Total Cases</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { carrier: "Blue Cross", total: 45, resolved: 38, rate: 84 },
                    { carrier: "Aetna", total: 32, resolved: 25, rate: 78 },
                    { carrier: "United Health", total: 28, resolved: 20, rate: 71 },
                    { carrier: "Cigna", total: 22, resolved: 18, rate: 82 },
                    { carrier: "Humana", total: 18, resolved: 12, rate: 67 },
                  ].map((row) => (
                    <TableRow key={row.carrier}>
                      <TableCell className="font-medium">{row.carrier}</TableCell>
                      <TableCell>{row.total}</TableCell>
                      <TableCell>{row.resolved}</TableCell>
                      <TableCell>{row.rate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Summary</CardTitle>
              <CardDescription>Individual agent metrics for the current period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Active Leads</TableHead>
                    <TableHead>Total Calls</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Avg Call Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            {agent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          {agent.name}
                        </div>
                      </TableCell>
                      <TableCell>{agent.activeLeads}</TableCell>
                      <TableCell>{agent.totalCalls}</TableCell>
                      <TableCell>{agent.successRate}%</TableCell>
                      <TableCell>3:42</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Performance</CardTitle>
              <CardDescription>Lead generation and conversion by affiliate</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Total Leads</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAffiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell className="font-medium">{affiliate.name}</TableCell>
                      <TableCell>{affiliate.totalLeads}</TableCell>
                      <TableCell>{affiliate.soldPolicies}</TableCell>
                      <TableCell>{affiliate.conversionRate}%</TableCell>
                      <TableCell>${affiliate.totalCommission.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
