import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Loader2, Link2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type IntegrationStatus = "healthy" | "degraded" | "error" | "inactive";

interface PlatformIntegration {
  id: string;
  name: string;
  description: string | null;
  status: IntegrationStatus;
  syncFrequency: string;
  errorCount: number;
  lastError: string | null;
  lastSyncAt: string | null;
  isActive: boolean;
  sourcePlatformId: string;
  targetPlatformId: string;
}

interface Platform {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

function StatusIcon({ status }: { status: IntegrationStatus }) {
  switch (status) {
    case "healthy":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "degraded":
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case "inactive":
      return <div className="w-4 h-4 rounded-full border-2 border-slate-400" />;
    default:
      return null;
  }
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const variants: Record<IntegrationStatus, string> = {
    healthy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    inactive: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    degraded: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  const labels: Record<IntegrationStatus, string> = {
    healthy: "Healthy",
    inactive: "Inactive",
    error: "Error",
    degraded: "Degraded",
  };

  return (
    <Badge variant="outline" className={variants[status] || ""}>
      {labels[status] || status}
    </Badge>
  );
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function LinkBlueIntegrations() {
  const { data: integrations = [], isLoading: integrationsLoading } = useQuery<PlatformIntegration[]>({
    queryKey: ["/api/linkblue/integrations"],
  });

  const { data: platforms = [], isLoading: platformsLoading } = useQuery<Platform[]>({
    queryKey: ["/api/linkblue/platforms"],
  });

  const isLoading = integrationsLoading || platformsLoading;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const platformMap = new Map(platforms.map(p => [p.id, p]));
  const activeIntegrations = integrations.filter(i => i.isActive);
  const healthyCount = activeIntegrations.filter(i => i.status === "healthy").length;
  const errorCount = activeIntegrations.filter(i => i.status === "error").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-integrations-title">Integration Status</h1>
          <p className="text-muted-foreground mt-1">Cross-platform integration health</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
            {healthyCount} Healthy
          </Badge>
          {errorCount > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              {errorCount} Errors
            </Badge>
          )}
        </div>
      </div>

      {integrations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No integrations configured</p>
              <p className="text-sm mt-1">Seed LINKBlue data from the dashboard to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Integration Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Matrix</CardTitle>
              <CardDescription>Status of each integration between platforms</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Integration</th>
                    <th className="text-center py-3 px-2 font-medium">Source</th>
                    <th className="text-center py-3 px-2 font-medium">Target</th>
                    <th className="text-center py-3 px-2 font-medium">Sync</th>
                    <th className="text-center py-3 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {integrations.map((integration) => {
                    const source = platformMap.get(integration.sourcePlatformId);
                    const target = platformMap.get(integration.targetPlatformId);
                    return (
                      <tr key={integration.id} className="border-b" data-testid={`row-integration-${integration.id}`}>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{integration.name}</span>
                            {integration.description && (
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                ({integration.description})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-sm">
                          {source?.shortName || "—"}
                        </td>
                        <td className="py-3 px-2 text-center text-sm">
                          {target?.shortName || "—"}
                        </td>
                        <td className="py-3 px-2 text-center text-xs text-muted-foreground">
                          {integration.syncFrequency}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex justify-center">
                            <StatusIcon status={integration.status} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Degraded</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  <span>Error</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border-2 border-slate-400" />
                  <span>Inactive</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => {
              const source = platformMap.get(integration.sourcePlatformId);
              const target = platformMap.get(integration.targetPlatformId);
              return (
                <Card key={integration.id} data-testid={`card-integration-${integration.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-lg font-bold">{integration.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {source?.shortName || "?"} → {target?.shortName || "?"}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={integration.status} />
                    </div>

                    <div className="mt-4 text-sm">
                      <p className="text-muted-foreground">Last sync: {formatTimeAgo(integration.lastSyncAt)}</p>
                      <p className="text-muted-foreground">Frequency: {integration.syncFrequency}</p>
                      {integration.errorCount > 0 && (
                        <p className="text-red-500 text-xs mt-1">
                          {integration.errorCount} error{integration.errorCount === 1 ? "" : "s"}
                          {integration.lastError ? `: ${integration.lastError}` : ""}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
