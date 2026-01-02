import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Eye,
  Check,
  X
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { LinkblueAlert } from "@shared/schema";

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    default:
      return <Bell className="w-4 h-4 text-blue-500" />;
  }
}

function AlertCard({ alert, onAcknowledge, onResolve }: { 
  alert: LinkblueAlert; 
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  return (
    <Card className={`${alert.severity === 'critical' ? 'border-red-500/50' : ''}`} data-testid={`alert-card-${alert.id}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            alert.severity === 'critical' ? 'bg-red-500/10' :
            alert.severity === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
          }`}>
            {getSeverityIcon(alert.severity)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{alert.title}</h3>
              <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                {alert.severity}
              </Badge>
              {alert.isAcknowledged && !alert.isResolved && (
                <Badge variant="outline" className="bg-blue-500/10">
                  <Eye className="w-3 h-3 mr-1" /> Acknowledged
                </Badge>
              )}
              {alert.isResolved && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Created {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
              </span>
              {alert.type && (
                <Badge variant="outline" className="text-xs">{alert.type}</Badge>
              )}
            </div>
          </div>
          {!alert.isResolved && (
            <div className="flex items-center gap-2">
              {!alert.isAcknowledged && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onAcknowledge(alert.id)}
                  data-testid={`button-acknowledge-${alert.id}`}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Acknowledge
                </Button>
              )}
              <Button 
                size="sm" 
                variant="default" 
                onClick={() => onResolve(alert.id)}
                data-testid={`button-resolve-${alert.id}`}
              >
                <Check className="w-3 h-3 mr-1" />
                Resolve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LinkBlueAlerts() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");

  const { data: alerts = [], isLoading } = useQuery<LinkblueAlert[]>({
    queryKey: ["/api/linkblue/alerts"],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/linkblue/alerts/${id}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/linkblue/alerts"] });
      toast({ title: "Alert acknowledged" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to acknowledge alert", variant: "destructive" });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/linkblue/alerts/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/linkblue/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/linkblue/dashboard"] });
      toast({ title: "Alert resolved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to resolve alert", variant: "destructive" });
    },
  });

  const activeAlerts = alerts.filter(a => !a.isResolved);
  const resolvedAlerts = alerts.filter(a => a.isResolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
  const warningAlerts = activeAlerts.filter(a => a.severity === "warning");

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-page-title">
          <Bell className="w-6 h-6 text-primary" />
          Alerts & Notifications
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage system alerts across the TriadBlue ecosystem
        </p>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-critical">{criticalAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-warning">{warningAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-active">{activeAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="stat-resolved">{resolvedAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active">
            Active ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved">
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          {activeAlerts.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Clear</h3>
              <p className="text-muted-foreground">No active alerts at this time</p>
            </Card>
          ) : (
            <>
              {criticalAlerts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-red-500 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Alerts
                  </h3>
                  {criticalAlerts.map((alert) => (
                    <AlertCard 
                      key={alert.id} 
                      alert={alert} 
                      onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
                      onResolve={(id) => resolveMutation.mutate(id)}
                    />
                  ))}
                </div>
              )}
              {warningAlerts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings
                  </h3>
                  {warningAlerts.map((alert) => (
                    <AlertCard 
                      key={alert.id} 
                      alert={alert} 
                      onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
                      onResolve={(id) => resolveMutation.mutate(id)}
                    />
                  ))}
                </div>
              )}
              {activeAlerts.filter(a => a.severity === "info").length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-blue-500 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Info
                  </h3>
                  {activeAlerts.filter(a => a.severity === "info").map((alert) => (
                    <AlertCard 
                      key={alert.id} 
                      alert={alert} 
                      onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
                      onResolve={(id) => resolveMutation.mutate(id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 space-y-4">
          {resolvedAlerts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No resolved alerts</p>
            </Card>
          ) : (
            resolvedAlerts.map((alert) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
                onResolve={(id) => resolveMutation.mutate(id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
