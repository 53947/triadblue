import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { Project } from "@shared/schema";
import { VoiceInput } from "@/components/voice-input";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    projectId: string; 
    title: string; 
    description: string; 
    priority: string;
    status: string;
  }) => void;
  projects: Project[];
  isLoading?: boolean;
  defaultProjectId?: string;
}

export function CreateTaskModal({ 
  open, 
  onClose, 
  onSubmit, 
  projects, 
  isLoading,
  defaultProjectId 
}: CreateTaskModalProps) {
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("pending");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ projectId, title, description, priority, status });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("pending");
    if (!defaultProjectId) setProjectId("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl" data-testid="modal-create-task">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to track work across your projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId} required>
              <SelectTrigger id="task-project" data-testid="select-task-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
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
            <Label htmlFor="task-title">Task Title</Label>
            <div className="flex gap-2">
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Fix login bug or speak..."
                required
                className="text-lg"
                data-testid="input-task-title"
              />
              <VoiceInput
                onTranscript={(text) => setTitle(prev => prev ? `${prev} ${text}` : text)}
                variant="outline"
                size="icon"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="task-description" className="flex items-center justify-between">
              <span>Description</span>
              <VoiceInput
                onTranscript={(text) => setDescription(prev => prev ? `${prev} ${text}` : text)}
                variant="ghost"
                size="sm"
              />
            </Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task in detail or use voice..."
              rows={4}
              data-testid="input-task-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="task-priority" data-testid="select-task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="task-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="task-status" data-testid="select-task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !projectId} data-testid="button-submit-task">
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
