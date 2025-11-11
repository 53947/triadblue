import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { Project } from "@shared/schema";

interface LogConversationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    projectId: string | null; 
    title: string; 
    content: string; 
    agentName: string;
  }) => void;
  projects: Project[];
  isLoading?: boolean;
}

export function LogConversationModal({ 
  open, 
  onClose, 
  onSubmit, 
  projects, 
  isLoading 
}: LogConversationModalProps) {
  const [projectId, setProjectId] = useState<string>("none");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [agentName, setAgentName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      projectId: projectId === "none" ? null : projectId, 
      title, 
      content, 
      agentName 
    });
    setProjectId("none");
    setTitle("");
    setContent("");
    setAgentName("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="modal-log-conversation">
        <DialogHeader>
          <DialogTitle>Log Agent Conversation</DialogTitle>
          <DialogDescription>
            Document agent conversations for AI-powered action item extraction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="conv-project">Project (Optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="conv-project" data-testid="select-conversation-project">
                  <SelectValue placeholder="None - General conversation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
              <Label htmlFor="conv-agent">Agent Name (Optional)</Label>
              <Input
                id="conv-agent"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Replit Agent"
                data-testid="input-agent-name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="conv-title">Conversation Title</Label>
            <Input
              id="conv-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Discussion about authentication system"
              required
              data-testid="input-conversation-title"
            />
          </div>

          <div>
            <Label htmlFor="conv-content">Conversation Content</Label>
            <Textarea
              id="conv-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the full conversation here..."
              rows={12}
              required
              className="font-mono text-xs"
              data-testid="input-conversation-content"
            />
            <p className="text-xs text-muted-foreground mt-1">
              AI will analyze this conversation to extract undocumented action items
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !content.trim()} data-testid="button-submit-conversation">
              {isLoading ? "Logging..." : "Log Conversation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
