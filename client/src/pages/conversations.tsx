import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, Conversation } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageSquare, Calendar, Sparkles } from "lucide-react";
import { VoiceInput, VoiceInputButton } from "@/components/voice-input";
import { format } from "date-fns";

export default function Conversations() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [agentName, setAgentName] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: { projectId?: string; title: string; content: string; agentName?: string }) => {
      return await apiRequest("POST", "/api/conversations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setShowAddDialog(false);
      setTitle("");
      setContent("");
      setAgentName("");
      setSelectedProjectId("");
      toast({
        title: "Conversation saved",
        description: "Your conversation has been logged successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const extractActionsMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest("POST", `/api/conversations/${conversationId}/extract-actions`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Actions extracted",
        description: "AI has extracted action items from the conversation.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to extract actions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createConversationMutation.mutate({
      projectId: selectedProjectId || undefined,
      title,
      content,
      agentName: agentName || undefined,
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Conversations</h1>
          <p className="text-muted-foreground">
            Log conversations and extract action items with AI
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-conversation">
              <Plus className="w-4 h-4 mr-2" />
              Log Conversation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" data-testid="modal-create-conversation">
            <DialogHeader>
              <DialogTitle>Log Conversation</DialogTitle>
              <DialogDescription>
                Record a conversation with voice input or text. AI can extract action items automatically.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="conv-project">Project (Optional)</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger id="conv-project" data-testid="select-conversation-project">
                    <SelectValue placeholder="No project (global)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project (global)</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="conv-title">Title</Label>
                <div className="flex gap-2">
                  <Input
                    id="conv-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Meeting with stakeholders or speak..."
                    required
                    data-testid="input-conversation-title"
                  />
                  <VoiceInput
                    onTranscript={(text) => setTitle(prev => prev ? `${prev} ${text}` : text)}
                    variant="outline"
                    size="icon"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="conv-content" className="flex items-center justify-between mb-2">
                  <span>Conversation Content</span>
                  <VoiceInputButton
                    onTranscript={(text) => setContent(prev => prev ? `${prev} ${text}` : text)}
                    onInterimTranscript={setInterimTranscript}
                    continuous={true}
                    buttonText="Record Conversation"
                    showIcon={true}
                  />
                </Label>
                <Textarea
                  id="conv-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type or record the conversation details..."
                  rows={8}
                  required
                  data-testid="input-conversation-content"
                />
                {interimTranscript && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Listening: {interimTranscript}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="conv-agent">Agent Name (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="conv-agent"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Which agent or person was involved..."
                    data-testid="input-conversation-agent"
                  />
                  <VoiceInput
                    onTranscript={(text) => setAgentName(prev => prev ? `${prev} ${text}` : text)}
                    variant="outline"
                    size="icon"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  disabled={createConversationMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createConversationMutation.isPending || !title.trim() || !content.trim()}
                  data-testid="button-submit-conversation"
                >
                  {createConversationMutation.isPending ? "Saving..." : "Save Conversation"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No conversations logged yet</h3>
            <p className="text-muted-foreground mb-4">
              Start logging conversations with voice or text to track important discussions
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => {
            const project = projects.find(p => p.id === conversation.projectId);
            return (
              <Card key={conversation.id} data-testid={`conversation-${conversation.id}`} className="hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        {conversation.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(conversation.createdAt), "PPp")}
                        </span>
                        {project && (
                          <span className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => extractActionsMutation.mutate(conversation.id)}
                      disabled={extractActionsMutation.isPending}
                      data-testid={`button-extract-actions-${conversation.id}`}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract Actions
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <p className="text-sm whitespace-pre-wrap">{conversation.content}</p>
                  </ScrollArea>
                  {conversation.agentName && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      Agent: {conversation.agentName}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
