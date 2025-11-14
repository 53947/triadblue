import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, AgentConnection, AgentChatMessage } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAgentConnectionSchema } from "@shared/schema";
import { Plus, Send, Bot, User, MessagesSquare } from "lucide-react";
import { z } from "zod";
import { VoiceInput } from "@/components/voice-input";

const formSchema = insertAgentConnectionSchema.extend({
  projectId: z.string(),
});

export default function AgentChat() {
  const { toast } = useToast();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch all agent connections across all projects
  const { data: allConnections = [] } = useQuery<AgentConnection[]>({
    queryKey: ["/api/all-agent-connections"],
    queryFn: async () => {
      const connections: AgentConnection[] = [];
      for (const project of projects) {
        const projectConnections = await fetch(`/api/projects/${project.id}/agent-connections`).then(r => r.json());
        connections.push(...projectConnections);
      }
      return connections;
    },
    enabled: projects.length > 0,
  });

  // Fetch messages for selected connection
  const { data: messages = [], isLoading: messagesLoading } = useQuery<AgentChatMessage[]>({
    queryKey: [`/api/agent-connections/${selectedConnectionId}/messages`],
    enabled: !!selectedConnectionId,
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/agent-connections/${selectedConnectionId}/messages`, {
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/agent-connections/${selectedConnectionId}/messages`] });
      setMessageInput("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Add connection form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      agentEndpointUrl: "",
      agentApiKey: "",
      projectId: projects[0]?.id || "",
      isActive: true,
    },
  });

  const createConnectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", `/api/projects/${data.projectId}/agent-connections`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/all-agent-connections"] });
      setShowAddDialog(false);
      form.reset();
      toast({
        title: "Success",
        description: "Agent connection created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create agent connection",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConnectionId) return;
    sendMessageMutation.mutate(messageInput);
  };

  const selectedConnection = allConnections.find(c => c.id === selectedConnectionId);
  const selectedProject = projects.find(p => p.id === selectedConnection?.projectId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Agent Chat</h1>
            <p className="text-sm text-muted-foreground">
              Chat with agents running in your other Replit projects
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-agent-connection">
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Agent Connection</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createConnectionMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-project">
                              <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connection Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="My Project Agent" data-testid="input-connection-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agentEndpointUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Endpoint URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://myproject.replit.app/api/agent" data-testid="input-endpoint-url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agentApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Optional authentication key" data-testid="input-api-key" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createConnectionMutation.isPending} data-testid="button-create-connection">
                    {createConnectionMutation.isPending ? "Creating..." : "Create Connection"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <Select value={selectedConnectionId || ""} onValueChange={setSelectedConnectionId}>
            <SelectTrigger className="w-64" data-testid="select-agent-connection">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {allConnections.map((connection) => {
                const project = projects.find(p => p.id === connection.projectId);
                return (
                  <SelectItem key={connection.id} value={connection.id}>
                    {connection.name} ({project?.name || "Unknown"})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedConnection && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Project: {selectedProject?.name}</span>
              <span>•</span>
              <span className="truncate max-w-xs">{selectedConnection.agentEndpointUrl}</span>
            </div>
          )}
        </div>
      </div>

      {!selectedConnectionId ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessagesSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium mb-2">No agent selected</h2>
            <p className="text-muted-foreground mb-4">
              Select an agent connection to start chatting
            </p>
            {allConnections.length === 0 && (
              <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-first-agent">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Agent
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-6" data-testid="chat-messages-area">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messagesLoading ? (
                <div className="text-center text-muted-foreground">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${message.id}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <Card className={`p-3 max-w-xl ${message.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </Card>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message or use voice..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-message"
                />
                <VoiceInput
                  onTranscript={(text) => setMessageInput(prev => prev ? `${prev} ${text}` : text)}
                  variant="outline"
                  size="icon"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
