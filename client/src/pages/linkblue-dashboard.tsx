import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Link2, 
  Building2, 
  CreditCard, 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Users,
  DollarSign,
  Bell,
  ExternalLink,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { 
  LinkbluePlatform, 
  LinkbluePlatformHealth,
  LinkbluePlatformIntegration,
  LinkblueActivityFeed,
  LinkblueAlert
} from "@shared/schema";

type PlatformWithHealth = LinkbluePlatform & { health?: LinkbluePlatformHealth };

interface DashboardData {
  stats: {
    totalClients: number;
    totalRevenue: number;
    activeAlerts: number;
    platformHealth: Array<{ platformId: string; status: string; activeClients: number }>;
  };
  platforms: PlatformWithHealth[];
  integrations: LinkbluePlatformIntegration[];
  recentActivity: LinkblueActivityFeed[];
  activeAlerts: LinkblueAlert[];
}

const platformIcons: Record<string, any> = {
  Building2: Building2,
  CreditCard: CreditCard,
  Server: Server,
};

function getStatusColor(status: string) {
  switch (status) {
    case "online":
    case "healthy":
      return "bg-green-500";
    case "degraded":
      return "bg-yellow-500";
    case "offline":
    case "error":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "online":
    case "healthy":
      return <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Online</Badge>;
    case "degraded":
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" /> Degraded</Badge>;
    case "offline":
    case "error":
      return <Badge variant="secondary" className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Offline</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "text-red-500";
    case "warning":
      return "text-yellow-500";
    case "success":
      return "text-green-500";
    default:
      return "text-muted-foreground";
  }
}

function PlatformCard({ platform }: { platform: PlatformWithHealth }) {
  const Icon = platformIcons[platform.icon || "Building2"] || Building2;
  
  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${platform.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: platform.color }} />
            </div>
            <div>
              <CardTitle className="text-base">{platform.shortName}</CardTitle>
              <CardDescription className="text-xs">{platform.name}</CardDescription>
            </div>
          </div>
          {getStatusBadge(platform.health?.status || "unknown")}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Active Clients</p>
            <p className="font-medium">{platform.health?.activeClients || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Response Time</p>
            <p className="font-medium">{platform.health?.apiResponseTime || 0}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground">Success Rate</p>
            <p className="font-medium">{platform.health?.successRate || 0}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Errors (24h)</p>
            <p className="font-medium">{platform.health?.errorCount || 0}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Last sync: {platform.health?.lastSyncAt 
              ? formatDistanceToNow(new Date(platform.health.lastSyncAt), { addSuffix: true })
              : "Never"}
          </span>
          <Button size="sm" variant="ghost" asChild>
            <a href={platform.adminUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-platform-admin-${platform.shortName}`}>
              Open Admin <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationMatrix({ integrations, platforms }: { integrations: LinkbluePlatformIntegration[]; platforms: PlatformWithHealth[] }) {
  const getPlatform = (id: string) => platforms.find(p => p.id === id);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Integration Status
        </CardTitle>
        <CardDescription>Platform connections and health</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {integrations.map((integration) => {
            const source = getPlatform(integration.sourcePlatformId);
            const target = getPlatform(integration.targetPlatformId);
            const SourceIcon = platformIcons[source?.icon || "Building2"] || Building2;
            const TargetIcon = platformIcons[target?.icon || "Building2"] || Building2;
            
            return (
              <div 
                key={integration.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
                data-testid={`integration-${integration.id}`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <SourceIcon className="w-4 h-4" style={{ color: source?.color }} />
                    <span className="text-sm font-medium">{source?.shortName}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <TargetIcon className="w-4 h-4" style={{ color: target?.color }} />
                    <span className="text-sm font-medium">{target?.shortName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{integration.name}</span>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                </div>
              </div>
            );
          })}
          {integrations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No integrations configured</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeed({ activities }: { activities: LinkblueActivityFeed[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Activity Feed
        </CardTitle>
        <CardDescription>Real-time cross-platform events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50"
                data-testid={`activity-${activity.id}`}
              >
                <div className={`mt-1 w-2 h-2 rounded-full ${getStatusColor(activity.severity || 'info')}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AlertsPanel({ alerts }: { alerts: LinkblueAlert[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Active Alerts
          </CardTitle>
          <Link href="/linkblue/alerts">
            <Button size="sm" variant="ghost" data-testid="link-view-all-alerts">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.slice(0, 5).map((alert) => (
            <div 
              key={alert.id} 
              className="flex items-start gap-3 p-2 rounded-lg border"
              data-testid={`alert-${alert.id}`}
            >
              <AlertTriangle className={`w-4 h-4 mt-0.5 ${getSeverityColor(alert.severity)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
              </div>
              <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                {alert.severity}
              </Badge>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm">No active alerts</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LinkBlueDashboard() {
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/linkblue/dashboard"],
  });

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/linkblue/seed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/linkblue/dashboard"] });
      toast({ title: "Platforms seeded", description: "LINKBlue has been initialized with TriadBlue platforms" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to seed platforms", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const platforms = data?.platforms || [];
  const needsSetup = platforms.length === 0;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-page-title">
            <Link2 className="w-6 h-6 text-primary" />
            LINKBlue Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            TriadBlue Integration Panel - Monitor and manage your ecosystem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => refetch()} 
            data-testid="button-refresh-dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          {needsSetup && (
            <Button 
              onClick={() => seedMutation.mutate()} 
              disabled={seedMutation.isPending}
              data-testid="button-seed-platforms"
            >
              Initialize LINKBlue
            </Button>
          )}
        </div>
      </div>

      {needsSetup ? (
        <Card className="p-8 text-center">
          <Link2 className="w-12 h-12 mx-auto text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Welcome to LINKBlue</h2>
          <p className="text-muted-foreground mb-4">
            LINKBlue is the operational nerve center for the TriadBlue ecosystem.
            Click the button above to initialize the three platforms: BusinessBlueprint.io, SwipesBlue.com, and HostsBlue.com.
          </p>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-clients">{data?.stats.totalClients || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-total-revenue">
                      ${((data?.stats.totalRevenue || 0) / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-platforms">{platforms.length}</p>
                    <p className="text-xs text-muted-foreground">Platforms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    (data?.stats.activeAlerts || 0) > 0 ? 'bg-red-500/10' : 'bg-green-500/10'
                  }`}>
                    <Bell className={`w-5 h-5 ${
                      (data?.stats.activeAlerts || 0) > 0 ? 'text-red-500' : 'text-green-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="stat-active-alerts">{data?.stats.activeAlerts || 0}</p>
                    <p className="text-xs text-muted-foreground">Active Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Health Cards */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Platform Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          </div>

          {/* Integration Matrix and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <IntegrationMatrix 
              integrations={data?.integrations || []} 
              platforms={platforms} 
            />
            <ActivityFeed activities={data?.recentActivity || []} />
          </div>

          {/* Alerts */}
          <AlertsPanel alerts={data?.activeAlerts || []} />

          {/* Quick Navigation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Access</CardTitle>
              <CardDescription>Navigate to platform admin panels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <Button 
                    key={platform.id} 
                    variant="outline" 
                    asChild
                    data-testid={`button-quick-access-${platform.shortName}`}
                  >
                    <a href={platform.adminUrl} target="_blank" rel="noopener noreferrer">
                      Open {platform.shortName} Admin
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                ))}
                <Link href="/linkblue/clients">
                  <Button variant="outline" data-testid="button-view-clients">
                    View All Clients
                    <Users className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
