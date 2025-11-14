import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Mail, Github, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import type { Project, EmailGithubConfig } from "@shared/schema";

export default function EmailSettings() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EmailGithubConfig | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [inboxId, setInboxId] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: configs = [], isLoading: configsLoading } = useQuery<EmailGithubConfig[]>({
    queryKey: ["/api/email-configs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/email-configs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-configs"] });
      resetForm();
      setShowAddDialog(false);
      toast({
        title: "Configuration created",
        description: "Email configuration has been saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create configuration",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/email-configs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-configs"] });
      resetForm();
      setEditingConfig(null);
      toast({
        title: "Configuration updated",
        description: "Email configuration has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/email-configs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-configs"] });
      setDeleteConfirmId(null);
      toast({
        title: "Configuration deleted",
        description: "Email configuration has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete configuration",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedProjectId("");
    setEmailAddress("");
    setInboxId("");
    setGithubOwner("");
    setGithubRepo("");
    setIsActive(true);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEditDialog = (config: EmailGithubConfig) => {
    setEditingConfig(config);
    setSelectedProjectId(config.projectId);
    setEmailAddress(config.emailAddress);
    setInboxId(config.inboxId || "");
    setGithubOwner(config.githubOwner || "");
    setGithubRepo(config.githubRepo || "");
    setIsActive(config.isActive);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedProjectId || !emailAddress || !inboxId) {
      toast({
        title: "Validation Error",
        description: "Project, email address, and inbox ID are required",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate project configuration (only when creating, not editing)
    if (!editingConfig) {
      const existingConfig = configs.find(c => c.projectId === selectedProjectId);
      if (existingConfig) {
        toast({
          title: "Duplicate Configuration",
          description: `A configuration already exists for ${getProjectName(selectedProjectId)}. Please edit the existing one instead.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate email format
    const emailPattern = /^[a-z0-9.-]+@agentmail\.triadblue\.com$/;
    if (!emailPattern.test(emailAddress)) {
      toast({
        title: "Invalid Email",
        description: "Email must be in format: name@agentmail.triadblue.com",
        variant: "destructive",
      });
      return;
    }

    const data = {
      projectId: selectedProjectId,
      emailAddress,
      inboxId,
      githubOwner: githubOwner || null,
      githubRepo: githubRepo || null,
      isActive,
    };

    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || "Unknown Project";
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Settings</h1>
          <p className="text-muted-foreground">
            Configure email addresses and AgentMail inbox settings for each project to enable AI-powered email communication
          </p>
        </div>

        {configs.length === 0 && !configsLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>No Email Configurations</CardTitle>
              <CardDescription>
                Get started by adding your first email configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 py-8">
                <Mail className="w-16 h-16 text-muted-foreground" />
                <p className="text-center text-muted-foreground max-w-md">
                  Configure your project email addresses and AgentMail inbox IDs to start communicating with Replit AI agents
                </p>
                <Button onClick={handleOpenAddDialog} data-testid="button-add-first-config">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Email Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Configurations</CardTitle>
                  <CardDescription>Manage email settings for your projects</CardDescription>
                </div>
                <Button onClick={handleOpenAddDialog} data-testid="button-add-config">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Configuration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Inbox ID</TableHead>
                    <TableHead>GitHub</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">
                        {getProjectName(config.projectId)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{config.emailAddress}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {config.inboxId || "Not set"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {config.githubOwner && config.githubRepo ? (
                          <div className="flex items-center gap-2">
                            <Github className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {config.githubOwner}/{config.githubRepo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not configured</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {config.isActive ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(config)}
                            data-testid={`button-edit-${config.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmId(config.id)}
                            data-testid={`button-delete-${config.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog || editingConfig !== null} onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingConfig(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? "Edit Email Configuration" : "Add Email Configuration"}
              </DialogTitle>
              <DialogDescription>
                Configure email settings and AgentMail inbox for a project
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <select
                    id="project"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={!!editingConfig}
                    data-testid="select-project"
                  >
                    <option value="">Select a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Agent Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="projectname@agentmail.triadblue.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    data-testid="input-agent-email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: projectname@agentmail.triadblue.com
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inbox">AgentMail Inbox ID *</Label>
                  <Input
                    id="inbox"
                    placeholder="inbox_xxx"
                    value={inboxId}
                    onChange={(e) => setInboxId(e.target.value)}
                    data-testid="input-inbox-id"
                  />
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Find your Inbox ID in the{" "}
                      <a
                        href="https://agentmail.triadblue.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        AgentMail Dashboard
                      </a>
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-4">GitHub Integration (Optional)</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="github-owner">GitHub Owner</Label>
                      <Input
                        id="github-owner"
                        placeholder="username or organization"
                        value={githubOwner}
                        onChange={(e) => setGithubOwner(e.target.value)}
                        data-testid="input-github-owner"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github-repo">GitHub Repository</Label>
                      <Input
                        id="github-repo"
                        placeholder="repository-name"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        data-testid="input-github-repo"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure GitHub to automatically create issues from actionable items detected in conversations
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Active Status</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable or disable this configuration
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    data-testid="switch-config-active"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-config"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Configuration"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Email Configuration?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the email configuration
                and you won't be able to send or receive emails for this project until reconfigured.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
