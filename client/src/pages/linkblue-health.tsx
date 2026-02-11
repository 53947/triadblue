import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, AlertTriangle, XCircle, Server, Clock, Zap, Globe, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PlatformWithHealth {
  id: string;
  name: string;
  shortName: string;
  color: string;
  isActive: boolean;
  health?: {
    status: string;
    apiResponseTime: number | null;
    successRate: number | null;
    activeClients: number;
    errorCount: number;
    lastSyncAt: string;
  };
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "online":
    case "operational":
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "degraded":
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "offline":
    case "down":
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Activity className="w-5 h-5 text-slate-500" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    online: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    operational: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    degraded: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    offline: "bg-red-500/10 text-red-500 border-red-500/20",
    down: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge variant="outline" className={variants[status] || ""}>
      {label}
    </Badge>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function LinkBlueHealth() {
  const { data: platforms = [], isLoading } = useQuery<PlatformWithHealth[]>({
    queryKey: ["/api/linkblue/platforms"],
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activePlatforms = platforms.filter(p => p.isActive);
  const onlineCount = activePlatforms.filter(p => p.health?.status === "online").length;
  const allOnline = onlineCount === activePlatforms.length && activePlatforms.length > 0;

  // Compute aggregate metrics from real data
  const avgResponseTime = activePlatforms.length > 0
    ? Math.round(
        activePlatforms.reduce((sum, p) => sum + (p.health?.apiResponseTime || 0), 0) / activePlatforms.length
      )
    : 0;

  const avgSuccessRate = activePlatforms.length > 0
    ? (
        activePlatforms.reduce((sum, p) => sum + (p.health?.successRate || 0), 0) / activePlatforms.length
      ).toFixed(1)
    : "0";

  const totalErrors = activePlatforms.reduce((sum, p) => sum + (p.health?.errorCount || 0), 0);

  const metrics = [
    { label: "Avg Success Rate", value: `${avgSuccessRate}%`, icon: Activity, detail: "Across all platforms" },
    { label: "Avg Response Time", value: `${avgResponseTime}ms`, icon: Zap, detail: "API latency" },
    { label: "Active Services", value: `${onlineCount}/${activePlatforms.length}`, icon: Server, detail: allOnline ? "All Online" : "Some issues" },
    { label: "Total Errors", value: `${totalErrors}`, icon: Clock, detail: "Current period" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-health-title">Platform Health</h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring of TriadBlue ecosystem services</p>
        </div>
        {allOnline ? (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <Globe className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Some Issues Detected
          </Badge>
        )}
      </div>

      {activePlatforms.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Server className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No platforms configured</p>
              <p className="text-sm mt-1">Seed LINKBlue data from the dashboard to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.label} data-testid={`card-metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <metric.icon className="w-8 h-8 text-blue-500" />
                    <span className="text-xs text-muted-foreground">{metric.detail}</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Live health status for all TriadBlue platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activePlatforms.map((platform) => {
                  const status = platform.health?.status || "offline";
                  const successRate = platform.health?.successRate ?? 0;
                  const responseTime = platform.health?.apiResponseTime ?? 0;
                  const lastSync = platform.health?.lastSyncAt
                    ? formatTimeAgo(platform.health.lastSyncAt)
                    : "Never";

                  return (
                    <div
                      key={platform.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                      data-testid={`row-platform-${platform.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center gap-4">
                        <StatusIcon status={status} />
                        <div>
                          <p className="font-medium">{platform.name}</p>
                          <p className="text-sm text-muted-foreground">Last checked: {lastSync}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium">{successRate}%</p>
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                        </div>

                        <div className="w-24 hidden md:block">
                          <Progress value={successRate} className="h-2" />
                        </div>

                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium">{responseTime}ms</p>
                          <p className="text-xs text-muted-foreground">Response</p>
                        </div>

                        <StatusBadge status={status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Clients by Platform</CardTitle>
                <CardDescription>Current active client count per service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activePlatforms.map((platform) => {
                    const clients = platform.health?.activeClients ?? 0;
                    const maxClients = Math.max(...activePlatforms.map(p => p.health?.activeClients || 1), 1);
                    return (
                      <div key={platform.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{platform.name}</span>
                          <span>{clients} clients</span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute h-full rounded-full"
                            style={{
                              width: `${(clients / maxClients) * 100}%`,
                              backgroundColor: platform.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Summary</CardTitle>
                <CardDescription>Current error counts by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activePlatforms.map((platform) => {
                    const errors = platform.health?.errorCount ?? 0;
                    const status = platform.health?.status || "offline";
                    return (
                      <div key={platform.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <StatusIcon status={status} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{platform.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {errors === 0 ? "No errors" : `${errors} error${errors === 1 ? "" : "s"} detected`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
