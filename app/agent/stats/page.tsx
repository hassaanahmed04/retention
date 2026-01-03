import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Progress } from "@/components/ui/progress"
import { Phone, Clock, CheckCircle, TrendingUp, Target } from "lucide-react"

export default function AgentStatsPage() {
  const stats = {
    totalCalls: 145,
    todayCalls: 12,
    avgCallDuration: "3:42",
    successRate: 78,
    leadsResolved: 42,
    pendingLeads: 8,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Stats</h1>
        <p className="text-muted-foreground">Your performance metrics and achievements</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Calls"
          value={stats.totalCalls}
          icon={Phone}
          trend={{ value: 8, isPositive: true }}
          description="this month"
        />
        <StatsCard title="Today's Calls" value={stats.todayCalls} icon={Clock} description="completed" />
        <StatsCard title="Success Rate" value={`${stats.successRate}%`} icon={TrendingUp} description="fix rate" />
        <StatsCard title="Leads Resolved" value={stats.leadsResolved} icon={CheckCircle} description="this month" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your current month statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-sm text-muted-foreground">{stats.successRate}%</span>
              </div>
              <Progress value={stats.successRate} className="h-2" />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Monthly Target</span>
                <span className="text-sm text-muted-foreground">{stats.leadsResolved}/50 leads</span>
              </div>
              <Progress value={(stats.leadsResolved / 50) * 100} className="h-2" />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Daily Call Target</span>
                <span className="text-sm text-muted-foreground">{stats.todayCalls}/15 calls</span>
              </div>
              <Progress value={(stats.todayCalls / 15) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Activity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Breakdown</CardTitle>
            <CardDescription>Call outcomes this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Answered", count: 87, percentage: 60, color: "bg-green-500" },
                { label: "Voicemail", count: 35, percentage: 24, color: "bg-yellow-500" },
                { label: "No Answer", count: 18, percentage: 12, color: "bg-orange-500" },
                { label: "Other", count: 5, percentage: 4, color: "bg-gray-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{item.count} calls</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Goals</CardTitle>
            <CardDescription>Track your progress towards this month's targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <Target className="mx-auto mb-2 h-8 w-8 text-primary" />
                <p className="text-2xl font-bold">{stats.leadsResolved}/50</p>
                <p className="text-sm text-muted-foreground">Leads Resolved</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <Phone className="mx-auto mb-2 h-8 w-8 text-primary" />
                <p className="text-2xl font-bold">{stats.totalCalls}/200</p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-primary" />
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                <p className="text-sm text-muted-foreground">Target: 75%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
