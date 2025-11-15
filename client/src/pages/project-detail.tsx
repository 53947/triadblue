import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Key, Copy, RefreshCw, Eye, EyeOff, AlertCircle, Github, Upload, Image as ImageIcon, Trash2, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, ApiKey, Asset } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProjectTemplates } from "@/components/project-templates";

export default function ProjectDetail() {
  const { toast } = useToast();
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id || "";
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "read_tasks",
    "write_tasks",
  ]);
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [isSyncing, setIsSyncing] = useState(false);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/projects", projectId, "api-keys"],
  });

  const { data: allAssets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  const projectAssets = allAssets.filter(a => a.projectId === projectId);

  // Initialize local state with project data on first load only
  useEffect(() => {
    if (project && !githubRepo && project.githubRepo) {
      setGithubRepo(project.githubRepo);
    }
  }, [project?.id]); // Only run when project ID changes (initial load)

  useEffect(() => {
    if (project && project.githubBranch && (!githubBranch || githubBranch === "main")) {
      setGithubBranch(project.githubBranch);
    }
  }, [project?.id]); // Only run when project ID changes (initial load)

  const isLoading = projectLoading || keysLoading;

  const handleGenerateApiKey = async () => {
    if (!keyName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for the API key.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newKey = await apiRequest("POST", `/api/projects/${projectId}/api-keys`, {
        name: keyName,
        permissions: selectedPermissions,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "api-keys"] });
      setKeyName("");
      toast({
        title: "API Key Generated",
        description: "Your new API key has been created. Copy it now - it won't be shown again.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard.",
    });
  };

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleUpdateGitHub = async () => {
    if (!githubRepo.trim() || !githubRepo.includes("/")) {
      toast({
        title: "Error",
        description: "Please provide a valid repository in the format 'owner/repo'.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("PUT", `/api/projects/${projectId}`, {
        githubRepo: githubRepo.trim(),
        githubBranch: githubBranch.trim() || "main",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: "GitHub Integration Updated",
        description: "Repository configuration has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update GitHub integration.",
        variant: "destructive",
      });
    }
  };

  const handleSyncGitHub = async () => {
    const repoToSync = project?.githubRepo || githubRepo;
    if (!repoToSync) {
      toast({
        title: "Error",
        description: "Please configure a GitHub repository first.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await apiRequest("POST", `/api/projects/${projectId}/sync-github`, {});
      await queryClient.invalidateQueries({ queryKey: ["/api/github-activity"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: "GitHub Sync Complete",
        description: `Synced ${result.synced} new commits from ${repoToSync}.`,
      });
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync GitHub activity.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const availablePermissions = [
    { value: "read_tasks", label: "Read Tasks" },
    { value: "write_tasks", label: "Write Tasks" },
    { value: "view_conversations", label: "View Conversations" },
    { value: "log_conversations", label: "Log Conversations" },
    { value: "report_github_activity", label: "Report GitHub Activity" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>Project not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: project.color }}
        >
          <Key className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            <CardTitle>GitHub Integration</CardTitle>
          </div>
          <CardDescription>
            Connect your GitHub repository to automatically sync commits and activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="github-repo">Repository (owner/repo)</Label>
              <Input
                id="github-repo"
                value={githubRepo || project.githubRepo || ""}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="username/repository"
                data-testid="input-github-repo"
              />
            </div>
            <div>
              <Label htmlFor="github-branch">Branch</Label>
              <Input
                id="github-branch"
                value={githubBranch || project.githubBranch || "main"}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder="main"
                data-testid="input-github-branch"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdateGitHub} variant="outline" data-testid="button-save-github">
              Save Configuration
            </Button>
            <Button
              onClick={handleSyncGitHub}
              disabled={(!project.githubRepo && !githubRepo) || isSyncing}
              data-testid="button-sync-github"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          {project.lastGithubSync && (
            <p className="text-xs text-muted-foreground">
              Last synced: {new Date(project.lastGithubSync).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate API Key</CardTitle>
          <CardDescription>
            Create API keys to allow this project to send data to the hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="key-name">Key Name</Label>
            <Input
              id="key-name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Production Server"
              data-testid="input-key-name"
            />
          </div>

          <div>
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {availablePermissions.map((perm) => (
                <div key={perm.value} className="flex items-center gap-2">
                  <Checkbox
                    id={perm.value}
                    checked={selectedPermissions.includes(perm.value)}
                    onCheckedChange={() => handleTogglePermission(perm.value)}
                    data-testid={`checkbox-permission-${perm.value}`}
                  />
                  <label htmlFor={perm.value} className="text-sm cursor-pointer">
                    {perm.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerateApiKey} data-testid="button-generate-key">
            <Key className="w-4 h-4 mr-2" />
            Generate API Key
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing API Keys</CardTitle>
          <CardDescription>
            Manage your project's API keys and their permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No API keys generated yet.
            </p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <Card key={key.id} data-testid={`api-key-${key.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium">{key.name}</h4>
                          <Badge variant={key.isActive ? "default" : "secondary"} className="text-xs">
                            {key.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                            {showApiKey ? key.key : "••••••••••••••••"}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="flex-shrink-0 h-7 w-7"
                            onClick={() => setShowApiKey(!showApiKey)}
                            data-testid="button-toggle-key-visibility"
                          >
                            {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="flex-shrink-0 h-7 w-7"
                            onClick={() => handleCopyKey(key.key)}
                            data-testid="button-copy-key"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {key.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Assets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Project Assets
          </CardTitle>
          <CardDescription>
            Upload favicons and logos specific to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Favicon Upload */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Favicon</h4>
              <Input
                type="file"
                accept=".png,.svg,.ico,.webp"
                onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                data-testid="input-project-favicon"
              />
              <Button
                size="sm"
                onClick={async () => {
                  if (!faviconFile) return;
                  const formData = new FormData();
                  formData.append("file", faviconFile);
                  formData.append("type", "favicon");
                  formData.append("projectId", projectId);
                  const response = await fetch("/api/assets", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                  });
                  if (response.ok) {
                    await queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
                    setFaviconFile(null);
                    toast({ title: "Favicon uploaded" });
                  }
                }}
                disabled={!faviconFile}
                data-testid="button-upload-project-favicon"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Favicon
              </Button>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Logo</h4>
              <Input
                type="file"
                accept=".png,.svg,.webp"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                data-testid="input-project-logo"
              />
              <Button
                size="sm"
                onClick={async () => {
                  if (!logoFile) return;
                  const formData = new FormData();
                  formData.append("file", logoFile);
                  formData.append("type", "logo");
                  formData.append("projectId", projectId);
                  const response = await fetch("/api/assets", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                  });
                  if (response.ok) {
                    await queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
                    setLogoFile(null);
                    toast({ title: "Logo uploaded" });
                  }
                }}
                disabled={!logoFile}
                data-testid="button-upload-project-logo"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>

          {/* Uploaded Assets List */}
          {projectAssets.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium">Uploaded Assets</h4>
              {projectAssets.map((asset) => (
                <div key={asset.id} className="flex items-center gap-3 p-3 border rounded-md">
                  <img
                    src={`/uploads/${asset.filename}`}
                    alt={asset.originalFilename}
                    className={asset.type === "favicon" ? "w-6 h-6" : "h-8 w-auto"}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{asset.originalFilename}</p>
                    <p className="text-xs text-muted-foreground">{asset.type}</p>
                  </div>
                  {asset.isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                  {!asset.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await apiRequest("PATCH", `/api/assets/${asset.id}/activate`, {});
                        await queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
                        toast({ title: "Asset activated" });
                      }}
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await apiRequest("DELETE", `/api/assets/${asset.id}`, {});
                      await queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
                      toast({ title: "Asset deleted" });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Use these endpoints to integrate your project with the hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Submit a Task</h4>
            <code className="text-xs font-mono bg-muted p-3 rounded block overflow-x-auto">
              POST /api/external/tasks
              <br />
              Authorization: Bearer YOUR_API_KEY
              <br />
              <br />
              {`{
  "title": "Fix login bug",
  "description": "Users cannot log in",
  "priority": "high",
  "status": "pending"
}`}
            </code>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Log a Conversation</h4>
            <code className="text-xs font-mono bg-muted p-3 rounded block overflow-x-auto">
              POST /api/external/conversations
              <br />
              Authorization: Bearer YOUR_API_KEY
              <br />
              <br />
              {`{
  "title": "Discussion about auth",
  "content": "Full conversation text...",
  "agentName": "Replit Agent"
}`}
            </code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ProjectTemplates projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}
