import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Activity, BarChart3, Loader2, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardData {
  stats: {
    totalPlatforms: number;
    healthyPlatforms: number;
    totalClients: number;
    activeAlerts: number;
    totalRevenue: number;
  };
  platforms: Array<{
    id: string;
    name: string;
    shortName: string;
    color: string;
    health?: {
      status: string;
      activeClients: number;
      successRate: number | null;
      apiResponseTime: number | null;
      errorCount: number;
    };
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    description: string | null;
    severity: string;
    createdAt: string;
  }>;
}

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 text-muted-foreground">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-sm">Coming Soon — This metric requires additional backend integration.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LinkBlueAnalytics() {
  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/linkblue/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = dashboard?.stats;
  const platforms = dashboard?.platforms || [];

  const kpiData = [
    { label: "Total Platforms", value: stats?.totalPlatforms?.toString() || "0", icon: Activity, detail: `${stats?.healthyPlatforms || 0} healthy` },
    { label: "Total Clients", value: stats?.totalClients?.toString() || "0", icon: Users, detail: "Across all platforms" },
    { label: "Active Alerts", value: stats?.activeAlerts?.toString() || "0", icon: BarChart3, detail: "Unresolved" },
    { label: "Total Revenue", value: stats?.totalRevenue ? `$${(stats.totalRevenue / 100).toLocaleString()}` : "$0", icon: Activity, detail: "Lifetime (cents → $)" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-analytics-title">Consolidated Analytics</h1>
          <p className="text-muted-foreground mt-1">Cross-platform performance metrics and insights</p>
        </div>
        <Badge variant="outline">Live Data</Badge>
      </div>

      {!dashboard ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No analytics data available</p>
              <p className="text-sm mt-1">Seed LINKBlue data from the dashboard to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi) => (
              <Card key={kpi.label} data-testid={`card-kpi-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <kpi.icon className="w-8 h-8 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{kpi.detail}</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="platforms" className="space-y-4">
            <TabsList>
              <TabsTrigger value="platforms">Platform Health</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="traffic">Traffic</TabsTrigger>
            </TabsList>

            <TabsContent value="platforms" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Success Rates by Platform</CardTitle>
                    <CardDescription>API success rates from health data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {platforms.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">No platform data available.</p>
                    ) : (
                      <div className="space-y-4">
                        {platforms.map((platform) => {
                          const rate = platform.health?.successRate ?? 0;
                          return (
                            <div key={platform.id} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{platform.name}</span>
                                <span>{rate}%</span>
                              </div>
                              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="absolute h-full rounded-full"
                                  style={{
                                    width: `${rate}%`,
                                    backgroundColor: platform.color
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Clients by Platform</CardTitle>
                    <CardDescription>Current active client counts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {platforms.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">No platform data available.</p>
                    ) : (
                      <div className="space-y-4">
                        {platforms.map((platform) => (
                          <div key={platform.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: platform.color }}
                              />
                              <span className="font-medium">{platform.shortName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{platform.health?.activeClients ?? 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComingSoonCard
                  title="Revenue by Platform"
                  description="Monthly revenue distribution per platform"
                />
                <ComingSoonCard
                  title="Conversion Rates"
                  description="Visitor to customer conversion rates"
                />
              </div>
            </TabsContent>

            <TabsContent value="traffic" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComingSoonCard
                  title="Traffic Sources"
                  description="Where your visitors come from"
                />
                <ComingSoonCard
                  title="Top Pages"
                  description="Most visited pages across platforms"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Response Time Comparison - real data */}
          <Card>
            <CardHeader>
              <CardTitle>API Response Times</CardTitle>
              <CardDescription>Current API latency by platform</CardDescription>
            </CardHeader>
            <CardContent>
              {platforms.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No platform data available.</p>
              ) : (
                <div className="space-y-4">
                  {platforms.map((platform) => {
                    const responseTime = platform.health?.apiResponseTime ?? 0;
                    const maxTime = Math.max(...platforms.map(p => p.health?.apiResponseTime || 1), 1);
                    return (
                      <div key={platform.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{platform.name}</span>
                          <span className={responseTime > 500 ? 'text-red-500' : 'text-emerald-500'}>
                            {responseTime}ms
                          </span>
                        </div>
                        <Progress
                          value={(responseTime / maxTime) * 100}
                          className={`h-2 ${responseTime > 500 ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
