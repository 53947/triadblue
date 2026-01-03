import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Settings, ExternalLink } from "lucide-react";

type IntegrationStatus = "connected" | "disconnected" | "error" | "pending";

interface Integration {
  id: string;
  name: string;
  category: string;
  status: IntegrationStatus;
  lastSync: string;
  details: string;
}

const integrations: Integration[] = [
  { id: "github", name: "GitHub", category: "Version Control", status: "connected", lastSync: "2 min ago", details: "5 repos synced" },
  { id: "stripe", name: "Stripe", category: "Payments", status: "connected", lastSync: "5 min ago", details: "All webhooks active" },
  { id: "openai", name: "OpenAI", category: "AI Services", status: "connected", lastSync: "1 min ago", details: "GPT-4 enabled" },
  { id: "neon", name: "Neon Database", category: "Database", status: "connected", lastSync: "Just now", details: "3 databases" },
  { id: "agentmail", name: "AgentMail", category: "Email", status: "connected", lastSync: "3 min ago", details: "7 mailboxes" },
  { id: "twilio", name: "Twilio", category: "Communications", status: "pending", lastSync: "Never", details: "Setup required" },
  { id: "sendgrid", name: "SendGrid", category: "Email Marketing", status: "disconnected", lastSync: "30 days ago", details: "Token expired" },
  { id: "analytics", name: "Google Analytics", category: "Analytics", status: "error", lastSync: "1 day ago", details: "Auth failed" },
];

const platforms = ["BusinessBlueprint.io", "SwipesBlue.com", "HostsBlue.com", "List It", "ConsoleBlue"];

const matrixData: Record<string, Record<string, IntegrationStatus>> = {
  "github": { "BusinessBlueprint.io": "connected", "SwipesBlue.com": "connected", "HostsBlue.com": "connected", "List It": "connected", "ConsoleBlue": "connected" },
  "stripe": { "BusinessBlueprint.io": "connected", "SwipesBlue.com": "connected", "HostsBlue.com": "pending", "List It": "disconnected", "ConsoleBlue": "connected" },
  "openai": { "BusinessBlueprint.io": "connected", "SwipesBlue.com": "connected", "HostsBlue.com": "connected", "List It": "connected", "ConsoleBlue": "connected" },
  "neon": { "BusinessBlueprint.io": "connected", "SwipesBlue.com": "connected", "HostsBlue.com": "connected", "List It": "connected", "ConsoleBlue": "connected" },
  "agentmail": { "BusinessBlueprint.io": "connected", "SwipesBlue.com": "connected", "HostsBlue.com": "pending", "List It": "disconnected", "ConsoleBlue": "connected" },
  "twilio": { "BusinessBlueprint.io": "pending", "SwipesBlue.com": "pending", "HostsBlue.com": "pending", "List It": "pending", "ConsoleBlue": "pending" },
  "sendgrid": { "BusinessBlueprint.io": "disconnected", "SwipesBlue.com": "error", "HostsBlue.com": "disconnected", "List It": "disconnected", "ConsoleBlue": "disconnected" },
  "analytics": { "BusinessBlueprint.io": "connected", "SwipesBlue.com": "error", "HostsBlue.com": "connected", "List It": "disconnected", "ConsoleBlue": "connected" },
};

function StatusIcon({ status }: { status: IntegrationStatus }) {
  switch (status) {
    case "connected":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "pending":
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case "disconnected":
      return <div className="w-4 h-4 rounded-full border-2 border-slate-400" />;
    default:
      return null;
  }
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const variants: Record<IntegrationStatus, string> = {
    connected: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    disconnected: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };
  
  const labels: Record<IntegrationStatus, string> = {
    connected: "Connected",
    disconnected: "Disconnected",
    error: "Error",
    pending: "Pending",
  };
  
  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
}

export default function LinkBlueIntegrations() {
  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const errorCount = integrations.filter(i => i.status === "error").length;
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-integrations-title">Integration Status</h1>
          <p className="text-muted-foreground mt-1">Cross-platform integration health matrix</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
            {connectedCount} Connected
          </Badge>
          {errorCount > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              {errorCount} Errors
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Matrix</CardTitle>
          <CardDescription>Status of each integration across all TriadBlue platforms</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Integration</th>
                {platforms.map((platform) => (
                  <th key={platform} className="text-center py-3 px-2 font-medium whitespace-nowrap">
                    {platform.replace('.io', '').replace('.com', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {integrations.map((integration) => (
                <tr key={integration.id} className="border-b" data-testid={`row-integration-${integration.id}`}>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{integration.name}</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">({integration.category})</span>
                    </div>
                  </td>
                  {platforms.map((platform) => (
                    <td key={platform} className="py-3 px-2 text-center">
                      <div className="flex justify-center">
                        <StatusIcon status={matrixData[integration.id]?.[platform] || "disconnected"} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>Connected</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <span>Error</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-slate-400" />
              <span>Disconnected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} data-testid={`card-integration-${integration.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-lg font-bold">{integration.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-muted-foreground">{integration.category}</p>
                  </div>
                </div>
                <StatusBadge status={integration.status} />
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Last sync: {integration.lastSync}</p>
                  <p className="text-muted-foreground">{integration.details}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" data-testid={`button-refresh-${integration.id}`}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" data-testid={`button-settings-${integration.id}`}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
