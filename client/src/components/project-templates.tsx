import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, PlayCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TaskTemplate } from "@shared/schema";

interface ProjectTemplatesProps {
  projectId: string;
}

export function ProjectTemplates({ projectId }: ProjectTemplatesProps) {
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultPriority: "medium",
    defaultSource: "manual",
  });

  const { data: templates = [], isLoading } = useQuery<TaskTemplate[]>({
    queryKey: ["/api/projects", projectId, "templates"],
  });

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      description: "",
      defaultPriority: "medium",
      defaultSource: "manual",
    });
    setEditingTemplate(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (template: TaskTemplate) => {
    setFormData({
      name: template.name,
      description: template.description || "",
      defaultPriority: template.defaultPriority,
      defaultSource: template.defaultSource,
    });
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTemplate) {
        await apiRequest("PUT", `/api/templates/${editingTemplate.id}`, formData);
        toast({ title: "Template updated successfully" });
      } else {
        await apiRequest("POST", `/api/projects/${projectId}/templates`, formData);
        toast({ title: "Template created successfully" });
      }
      
      await queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "templates"] });
      setShowCreateModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await apiRequest("DELETE", `/api/templates/${id}`);
      await queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "templates"] });
      toast({ title: "Template deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = async (id: string) => {
    try {
      await apiRequest("POST", `/api/templates/${id}/instantiate`, {});
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task created from template" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task from template",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Task Templates</h3>
          <p className="text-sm text-muted-foreground">Reusable task templates for this project</p>
        </div>
        <Button onClick={handleOpenCreate} size="sm" data-testid="button-create-template">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No templates yet. Create your first template to streamline task creation.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} data-testid={`template-${template.id}`}>
              <CardHeader>
                <CardTitle className="text-base">{template.name}</CardTitle>
                {template.description && (
                  <CardDescription>{template.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span className="capitalize">{template.defaultPriority}</span>
                  <span>•</span>
                  <span className="capitalize">{template.defaultSource}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUseTemplate(template.id)}
                    data-testid={`button-use-template-${template.id}`}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenEdit(template)}
                    data-testid={`button-edit-template-${template.id}`}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(template.id)}
                    data-testid={`button-delete-template-${template.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent data-testid="dialog-template-form">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              Define a reusable template for creating tasks in this project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bug Report, Feature Request"
                data-testid="input-template-name"
              />
            </div>

            <div>
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Textarea
                id="template-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe when to use this template..."
                data-testid="input-template-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-priority">Default Priority</Label>
                <Select 
                  value={formData.defaultPriority} 
                  onValueChange={(value) => setFormData({ ...formData, defaultPriority: value })}
                >
                  <SelectTrigger id="template-priority" data-testid="select-template-priority">
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
                <Label htmlFor="template-source">Default Source</Label>
                <Select 
                  value={formData.defaultSource} 
                  onValueChange={(value) => setFormData({ ...formData, defaultSource: value })}
                >
                  <SelectTrigger id="template-source" data-testid="select-template-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="conversation">Conversation</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} data-testid="button-cancel-template">
              Cancel
            </Button>
            <Button onClick={handleSubmit} data-testid="button-save-template">
              {editingTemplate ? "Update" : "Create"} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
