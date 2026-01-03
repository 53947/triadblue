import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Eye, MousePointer, Clock } from "lucide-react";

const kpiData = [
  { label: "Total Revenue", value: "$47,892", change: "+12.5%", trend: "up", icon: DollarSign },
  { label: "Active Users", value: "2,847", change: "+8.2%", trend: "up", icon: Users },
  { label: "Page Views", value: "156K", change: "+23.1%", trend: "up", icon: Eye },
  { label: "Avg Session", value: "4m 32s", change: "-2.1%", trend: "down", icon: Clock },
];

const platformMetrics = [
  { 
    name: "BusinessBlueprint.io",
    color: "#3b82f6",
    revenue: 18420,
    users: 892,
    sessions: 4521,
    bounceRate: 32,
    conversionRate: 3.8,
  },
  { 
    name: "SwipesBlue.com",
    color: "#8b5cf6",
    revenue: 12350,
    users: 1205,
    sessions: 8932,
    bounceRate: 28,
    conversionRate: 2.1,
  },
  { 
    name: "HostsBlue.com",
    color: "#f59e0b",
    revenue: 8920,
    users: 456,
    sessions: 2341,
    bounceRate: 45,
    conversionRate: 4.2,
  },
  { 
    name: "List It",
    color: "#10b981",
    revenue: 8202,
    users: 294,
    sessions: 1893,
    bounceRate: 38,
    conversionRate: 5.1,
  },
];

const trafficSources = [
  { source: "Organic Search", percentage: 42, color: "bg-blue-500" },
  { source: "Direct", percentage: 28, color: "bg-purple-500" },
  { source: "Social Media", percentage: 18, color: "bg-pink-500" },
  { source: "Referral", percentage: 8, color: "bg-amber-500" },
  { source: "Email", percentage: 4, color: "bg-emerald-500" },
];

const topPages = [
  { page: "/pricing", views: 12450, platform: "BusinessBlueprint.io" },
  { page: "/templates", views: 9832, platform: "SwipesBlue.com" },
  { page: "/signup", views: 8721, platform: "BusinessBlueprint.io" },
  { page: "/listings", views: 6543, platform: "HostsBlue.com" },
  { page: "/demo", views: 5432, platform: "ConsoleBlue" },
];

export default function LinkBlueAnalytics() {
  const totalRevenue = platformMetrics.reduce((sum, p) => sum + p.revenue, 0);
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-analytics-title">Consolidated Analytics</h1>
          <p className="text-muted-foreground mt-1">Cross-platform performance metrics and insights</p>
        </div>
        <Badge variant="outline">Last 30 days</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.label} data-testid={`card-kpi-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <kpi.icon className="w-8 h-8 text-blue-500" />
                <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {kpi.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Platform</CardTitle>
                <CardDescription>Monthly revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformMetrics.map((platform) => (
                    <div key={platform.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{platform.name}</span>
                        <span>${platform.revenue.toLocaleString()}</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full rounded-full"
                          style={{ 
                            width: `${(platform.revenue / totalRevenue) * 100}%`,
                            backgroundColor: platform.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
                <CardDescription>Visitor to customer conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformMetrics.map((platform) => (
                    <div key={platform.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: platform.color }}
                        />
                        <span className="font-medium">{platform.name.replace('.io', '').replace('.com', '')}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{platform.conversionRate}%</span>
                        <Progress value={platform.conversionRate * 10} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trafficSources.map((source) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{source.source}</span>
                        <span>{source.percentage}%</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`absolute h-full rounded-full ${source.color}`}
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPages.map((page, i) => (
                    <div key={page.page} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium">{page.page}</p>
                          <p className="text-xs text-muted-foreground">{page.platform}</p>
                        </div>
                      </div>
                      <span className="text-sm">{page.views.toLocaleString()} views</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Users by Platform</CardTitle>
                <CardDescription>Monthly active user distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformMetrics.map((platform) => (
                    <div key={platform.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: platform.color }}
                        />
                        <span className="font-medium">{platform.name.replace('.io', '').replace('.com', '')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{platform.users.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bounce Rates</CardTitle>
                <CardDescription>Single-page session percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformMetrics.map((platform) => (
                    <div key={platform.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{platform.name.replace('.io', '').replace('.com', '')}</span>
                        <span className={platform.bounceRate > 40 ? 'text-red-500' : 'text-emerald-500'}>
                          {platform.bounceRate}%
                        </span>
                      </div>
                      <Progress 
                        value={platform.bounceRate} 
                        className={`h-2 ${platform.bounceRate > 40 ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
