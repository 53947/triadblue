import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, AlertTriangle, XCircle, Server, Clock, Zap, Globe } from "lucide-react";

const platformData = [
  { 
    name: "BusinessBlueprint.io",
    status: "operational",
    uptime: 99.98,
    responseTime: 145,
    lastCheck: "2 min ago",
    color: "#3b82f6"
  },
  { 
    name: "SwipesBlue.com",
    status: "operational",
    uptime: 99.95,
    responseTime: 178,
    lastCheck: "1 min ago",
    color: "#8b5cf6"
  },
  { 
    name: "HostsBlue.com",
    status: "degraded",
    uptime: 99.12,
    responseTime: 320,
    lastCheck: "3 min ago",
    color: "#f59e0b"
  },
  { 
    name: "List It",
    status: "operational",
    uptime: 99.99,
    responseTime: 98,
    lastCheck: "1 min ago",
    color: "#10b981"
  },
  { 
    name: "ConsoleBlue",
    status: "operational",
    uptime: 100,
    responseTime: 52,
    lastCheck: "Just now",
    color: "#06b6d4"
  },
];

const metrics = [
  { label: "Overall Uptime", value: "99.81%", icon: Activity, trend: "+0.02%" },
  { label: "Avg Response Time", value: "158ms", icon: Zap, trend: "-12ms" },
  { label: "Active Services", value: "5/5", icon: Server, trend: "All Online" },
  { label: "Last Incident", value: "4 days ago", icon: Clock, trend: "Resolved" },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "operational":
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "degraded":
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "down":
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Activity className="w-5 h-5 text-slate-500" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    operational: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    degraded: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    down: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  
  return (
    <Badge variant="outline" className={variants[status] || ""}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function LinkBlueHealth() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-health-title">Platform Health</h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring of TriadBlue ecosystem services</p>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <Globe className="w-3 h-3 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} data-testid={`card-metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <metric.icon className="w-8 h-8 text-blue-500" />
                <span className="text-xs text-emerald-500">{metric.trend}</span>
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
            {platformData.map((platform) => (
              <div 
                key={platform.name} 
                className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                data-testid={`row-platform-${platform.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center gap-4">
                  <StatusIcon status={platform.status} />
                  <div>
                    <p className="font-medium">{platform.name}</p>
                    <p className="text-sm text-muted-foreground">Last checked: {platform.lastCheck}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{platform.uptime}%</p>
                    <p className="text-xs text-muted-foreground">Uptime (30d)</p>
                  </div>
                  
                  <div className="w-24 hidden md:block">
                    <Progress value={platform.uptime} className="h-2" />
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{platform.responseTime}ms</p>
                    <p className="text-xs text-muted-foreground">Response</p>
                  </div>
                  
                  <StatusBadge status={platform.status} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Uptime History (7 days)</CardTitle>
            <CardDescription>Daily uptime percentage for all services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {[99.9, 100, 99.8, 100, 99.95, 99.7, 99.98].map((uptime, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-blue-500/80 rounded-t"
                    style={{ height: `${(uptime - 99) * 48}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Issues and resolutions from the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">HostsBlue.com - Elevated Response Times</p>
                  <p className="text-xs text-muted-foreground">Started 2 hours ago - Investigating</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">SwipesBlue.com - API Latency Spike</p>
                  <p className="text-xs text-muted-foreground">Resolved 4 days ago - Duration: 23 min</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">BusinessBlueprint.io - Database Maintenance</p>
                  <p className="text-xs text-muted-foreground">Completed 6 days ago - Planned downtime</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
