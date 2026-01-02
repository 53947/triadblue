import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Users, 
  Building2, 
  CreditCard, 
  Server,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Activity,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { 
  LinkblueClient, 
  LinkblueClientAccount,
  LinkbluePlatform,
  LinkblueActivityFeed,
  LinkblueAlert
} from "@shared/schema";

type ClientWithDetails = LinkblueClient & {
  accounts: (LinkblueClientAccount & { platform?: LinkbluePlatform })[];
  activity: LinkblueActivityFeed[];
  alerts: LinkblueAlert[];
};

const platformIcons: Record<string, any> = {
  Building2: Building2,
  CreditCard: CreditCard,
  Server: Server,
};

function getRiskBadge(level: string | null) {
  switch (level) {
    case "critical":
      return <Badge variant="destructive">Critical Risk</Badge>;
    case "high":
      return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">High Risk</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Medium Risk</Badge>;
    default:
      return <Badge variant="secondary">Low Risk</Badge>;
  }
}

function ClientCard({ client }: { client: LinkblueClient }) {
  const [, setLocation] = useLocation();
  
  return (
    <Card 
      className="hover-elevate cursor-pointer" 
      onClick={() => setLocation(`/linkblue/clients/${client.id}`)}
      data-testid={`client-card-${client.id}`}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{client.companyName}</h3>
            <p className="text-sm text-muted-foreground truncate">{client.email}</p>
          </div>
          {getRiskBadge(client.riskLevel)}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Platforms</p>
            <p className="font-medium">{client.platformCount || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Revenue</p>
            <p className="font-medium">${((client.totalRevenue || 0) / 100).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Engagement</p>
            <p className="font-medium">{client.engagementScore || 0}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClientList() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clients = [], isLoading } = useQuery<LinkblueClient[]>({
    queryKey: ["/api/linkblue/clients", { search: searchQuery }],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/linkblue/clients?search=${encodeURIComponent(searchQuery)}`
        : "/api/linkblue/clients";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by company, email, domain, or client ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-client-search"
        />
      </div>
      
      {clients.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Clients Found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? "No clients match your search criteria" 
              : "Clients will appear here once they're added to the system"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientDetail({ id }: { id: string }) {
  const { data: client, isLoading } = useQuery<ClientWithDetails>({
    queryKey: ["/api/linkblue/clients", id],
    queryFn: async () => {
      const res = await fetch(`/api/linkblue/clients/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch client");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!client) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Client Not Found</h3>
        <Link href="/linkblue/clients">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/linkblue/clients">
          <Button variant="ghost" size="icon" data-testid="button-back-to-clients">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-client-name">{client.companyName}</h1>
          <p className="text-sm text-muted-foreground">Universal Client ID: {client.universalClientId}</p>
        </div>
        {getRiskBadge(client.riskLevel)}
      </div>

      {/* Client Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{client.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{client.phone || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Domain</p>
                <p className="text-sm font-medium truncate">{client.domain || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Lifetime Value</p>
                <p className="text-sm font-medium">${((client.lifetimeValue || 0) / 100).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="platforms">
        <TabsList>
          <TabsTrigger value="platforms" data-testid="tab-platforms">
            Platform Accounts ({client.accounts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            Activity ({client.activity?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            Alerts ({client.alerts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="mt-4">
          {client.accounts?.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No platform accounts linked</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {client.accounts?.map((account) => {
                const Icon = platformIcons[account.platform?.icon || "Building2"] || Building2;
                return (
                  <Card key={account.id} data-testid={`account-${account.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: `${account.platform?.color || '#3B82F6'}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: account.platform?.color || '#3B82F6' }} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{account.platform?.name || "Unknown Platform"}</CardTitle>
                          <CardDescription>{account.subscriptionTier || "No tier"}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge variant={account.status === "active" ? "secondary" : "outline"}>
                            {account.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">MRR</p>
                          <p className="font-medium">${((account.monthlyRevenue || 0) / 100).toLocaleString()}</p>
                        </div>
                      </div>
                      {account.lastActivityAt && (
                        <p className="text-xs text-muted-foreground mt-4">
                          Last activity: {formatDistanceToNow(new Date(account.lastActivityAt), { addSuffix: true })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <ScrollArea className="h-[400px]">
                {client.activity?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {client.activity?.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <Activity className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              {client.alerts?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active alerts</p>
              ) : (
                <div className="space-y-2">
                  {client.alerts?.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                        alert.severity === "critical" ? "text-red-500" : 
                        alert.severity === "warning" ? "text-yellow-500" : "text-muted-foreground"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                      <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LinkBlueClients() {
  const params = useParams();
  const clientId = params.id;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {!clientId && (
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-page-title">
            <Users className="w-6 h-6 text-primary" />
            Client 360° View
          </h1>
          <p className="text-sm text-muted-foreground">
            Unified view of all clients across the TriadBlue ecosystem
          </p>
        </div>
      )}
      
      {clientId ? <ClientDetail id={clientId} /> : <ClientList />}
    </div>
  );
}
