import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface QuickSetupConfig {
  name: string;
  suggestedEndpoint: string;
  description: string;
}

const QUICK_SETUPS: QuickSetupConfig[] = [
  {
    name: "List It",
    suggestedEndpoint: "https://listit.replit.app/api/agent/chat",
    description: "Task and list management agent",
  },
  {
    name: "BusinessBlueprint",
    suggestedEndpoint: "https://businessblueprint.replit.app/api/agent/chat",
    description: "Business planning and strategy agent",
  },
  {
    name: "HostsBlue",
    suggestedEndpoint: "https://hostsblue.replit.app/api/agent/chat",
    description: "Hosting and infrastructure agent",
  },
  {
    name: "SwipesBlue",
    suggestedEndpoint: "https://swipesblue.replit.app/api/agent/chat",
    description: "Swipe interaction agent",
  },
];

export default function AgentConnectionSetup() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [customConfigs, setCustomConfigs] = useState<Record<string, { endpoint: string; apiKey: string }>>(
    Object.fromEntries(
      QUICK_SETUPS.map(setup => [
        setup.name,
        { endpoint: setup.suggestedEndpoint, apiKey: "" }
      ])
    )
  );

  const createConnectionMutation = useMutation({
    mutationFn: async (data: { name: string; endpoint: string; apiKey: string }) => {
      // Create a default project first (we'll just use the first one or create one)
      let projectId = "default";
      
      return await apiRequest("POST", `/api/projects/${projectId}/agent-connections`, {
        name: data.name,
        agentEndpointUrl: data.endpoint,
        agentApiKey: data.apiKey,
        isActive: true,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/all-agent-connections"] });
      toast({
        title: "Connection created",
        description: `${variables.name} is now connected`,
      });
    },
    onError: (error: any, variables) => {
      toast({
        title: "Failed to create connection",
        description: error.message || `Could not connect to ${variables.name}`,
        variant: "destructive",
      });
    },
  });

  const handleUpdateConfig = (name: string, field: 'endpoint' | 'apiKey', value: string) => {
    setCustomConfigs(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value,
      },
    }));
  };

  const handleQuickSetup = async (config: QuickSetupConfig) => {
    const customConfig = customConfigs[config.name];
    await createConnectionMutation.mutateAsync({
      name: config.name,
      endpoint: customConfig.endpoint,
      apiKey: customConfig.apiKey,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Quick Agent Setup</h1>
            <p className="text-sm text-muted-foreground">
              Connect your TriadBlue ecosystem projects
            </p>
          </div>
          <Button onClick={() => navigate("/agent-chat")} data-testid="button-go-to-chat">
            Go to Chat
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>
                For each project, you need to:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Make sure the project has an endpoint at <code className="bg-muted px-1 rounded">/api/agent/chat</code></li>
                <li>Get your deployed URL (e.g., <code className="bg-muted px-1 rounded">https://listit.username.repl.co</code>)</li>
                <li>Update the endpoint URL below if needed</li>
                <li>Add your API key (if required)</li>
                <li>Click "Connect" to add it to your Agent Chat</li>
              </ol>
            </CardContent>
          </Card>

          {QUICK_SETUPS.map((config) => {
            const customConfig = customConfigs[config.name];
            const isPending = createConnectionMutation.isPending;
            
            return (
              <Card key={config.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{config.name}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                    <Button
                      onClick={() => handleQuickSetup(config)}
                      disabled={isPending || !customConfig.endpoint}
                      data-testid={`button-connect-${config.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`endpoint-${config.name}`}>Endpoint URL</Label>
                    <Input
                      id={`endpoint-${config.name}`}
                      value={customConfig.endpoint}
                      onChange={(e) => handleUpdateConfig(config.name, 'endpoint', e.target.value)}
                      placeholder="https://your-project.replit.app/api/agent/chat"
                      data-testid={`input-endpoint-${config.name.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Update this with your actual deployed URL
                    </p>
                  </div>

                  <div>
                    <Label htmlFor={`apikey-${config.name}`}>API Key (Optional)</Label>
                    <Input
                      id={`apikey-${config.name}`}
                      type="password"
                      value={customConfig.apiKey}
                      onChange={(e) => handleUpdateConfig(config.name, 'apiKey', e.target.value)}
                      placeholder="Enter API key if required"
                      data-testid={`input-apikey-${config.name.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty if your endpoint doesn't require authentication
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader>
              <CardTitle>Endpoint Requirements</CardTitle>
              <CardDescription>
                Each project needs this endpoint format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Request Format:</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
{`POST /api/agent/chat
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Response Format:</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
{`{
  "reply": "Hi there! How can I help you?"
}

// OR

{
  "response": "Hi there! How can I help you?"
}`}
                  </pre>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  <p className="text-sm">
                    <strong>Note:</strong> The endpoint path can be anything you want (not just <code className="bg-muted px-1 rounded">/api/agent/chat</code>). 
                    Just make sure to update the full URL above to match what your project uses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
