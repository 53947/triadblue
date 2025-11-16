import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, CheckCircle2, Download, FileArchive, Github, RefreshCw } from "lucide-react";

interface DocumentationTemplate {
  id: string;
  key: string;
  label: string;
  description: string;
  category: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  features?: string[];
  techStack?: string[];
  metadataApiUrl?: string;
}

interface ProjectDocumentationConfig {
  id: string;
  projectId: string;
  selectedTemplates: string[];
  metadata: Record<string, any>;
}

export default function DocumentationGenerator() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [metadataDisplay, setMetadataDisplay] = useState<Record<string, string>>({});
  const [metadataErrors, setMetadataErrors] = useState<Record<string, string>>({});
  const [previewTemplateId, setPreviewTemplateId] = useState<string>("");

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: templates } = useQuery<DocumentationTemplate[]>({
    queryKey: ["/api/documentation/templates"],
  });

  const { data: config, status: configStatus } = useQuery<ProjectDocumentationConfig | null>({
    queryKey: ["/api/projects", selectedProjectId, "documentation/config"],
    enabled: !!selectedProjectId,
    retry: false,
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (data: { selectedTemplates: string[]; metadata: Record<string, any> }) => {
      return apiRequest("POST", `/api/projects/${selectedProjectId}/documentation/config`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "documentation/config"] });
      toast({
        title: "Configuration saved",
        description: "Your documentation settings have been saved.",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { metadata: Record<string, any> }) => {
      return apiRequest("POST", `/api/projects/${selectedProjectId}/documentation/generate`, data);
    },
    onSuccess: () => {
      toast({
        title: "Documentation generated",
        description: "Your project documentation has been created successfully.",
      });
    },
  });

  const { data: previewData, isLoading: isPreviewLoading, error: previewError } = useQuery<{
    success: boolean;
    output: string;
    missingVariables: string[];
    extractedVariables: string[];
  } | null>({
    queryKey: ["/api/documentation/preview", previewTemplateId, metadata],
    queryFn: async () => {
      if (!previewTemplateId) return null;
      const response = await apiRequest("POST", "/api/documentation/preview", {
        templateId: previewTemplateId,
        metadata,
      });
      return await response.json();
    },
    enabled: !!previewTemplateId,
    retry: false,
  });

  useEffect(() => {
    setSelectedTemplates([]);
    setPreviewTemplateId("");
    
    // Auto-fill features and tech stack from project profile
    const selectedProject = projects?.find(p => p.id === selectedProjectId);
    if (selectedProject) {
      const projectMetadata: Record<string, any> = {};
      const projectMetadataDisplay: Record<string, string> = {};
      
      if (selectedProject.features) {
        projectMetadata.FEATURES = selectedProject.features;
        projectMetadataDisplay.FEATURES = JSON.stringify(selectedProject.features, null, 2);
      }
      
      if (selectedProject.techStack) {
        projectMetadata.TECH_STACK = selectedProject.techStack;
        projectMetadataDisplay.TECH_STACK = JSON.stringify(selectedProject.techStack, null, 2);
      }
      
      setMetadata(projectMetadata);
      setMetadataDisplay(projectMetadataDisplay);
      setMetadataErrors({});
    } else {
      setMetadata({});
      setMetadataDisplay({});
      setMetadataErrors({});
    }
  }, [selectedProjectId, projects]);

  useEffect(() => {
    if (previewTemplateId && !selectedTemplates.includes(previewTemplateId)) {
      setPreviewTemplateId("");
    }
  }, [selectedTemplates, previewTemplateId]);

  useEffect(() => {
    if (configStatus === "success" && config && selectedProjectId) {
      setSelectedTemplates(config.selectedTemplates);
      setMetadata(config.metadata);
      
      const displayValues: Record<string, string> = {};
      for (const [key, value] of Object.entries(config.metadata)) {
        displayValues[key] = typeof value === 'string' 
          ? value 
          : JSON.stringify(value, null, 2);
      }
      setMetadataDisplay(displayValues);
      setMetadataErrors({});
    }
  }, [config, configStatus, selectedProjectId]);

  const templatesByCategory = templates?.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, DocumentationTemplate[]>);

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleMetadataDisplayChange = (key: string, displayValue: string) => {
    setMetadataDisplay({ ...metadataDisplay, [key]: displayValue });
    setMetadataErrors({ ...metadataErrors, [key]: "" });
  };

  const handleMetadataBlur = (key: string) => {
    const displayValue = metadataDisplay[key] || "";
    const trimmed = displayValue.trim();
    
    if (!trimmed) {
      setMetadata({ ...metadata, [key]: "" });
      setMetadataErrors({ ...metadataErrors, [key]: "" });
      return;
    }
    
    const looksLikeJSON = trimmed.startsWith('[') || trimmed.startsWith('{');
    
    if (looksLikeJSON) {
      try {
        const parsed = JSON.parse(trimmed);
        
        if (Array.isArray(parsed)) {
          setMetadata({ ...metadata, [key]: parsed });
          setMetadataErrors({ ...metadataErrors, [key]: "" });
        } else if (typeof parsed === 'object' && parsed !== null) {
          setMetadata({ ...metadata, [key]: parsed });
          setMetadataErrors({ ...metadataErrors, [key]: "" });
        } else {
          setMetadata({ ...metadata, [key]: trimmed });
          setMetadataErrors({ ...metadataErrors, [key]: "" });
        }
      } catch (e) {
        setMetadataErrors({ 
          ...metadataErrors, 
          [key]: `Invalid JSON format. Please check syntax: ${(e as Error).message}` 
        });
      }
    } else {
      setMetadata({ ...metadata, [key]: trimmed });
      setMetadataErrors({ ...metadataErrors, [key]: "" });
    }
  };

  const hasMetadataErrors = Object.values(metadataErrors).some(error => error !== "");

  const handleSaveConfig = () => {
    if (!selectedProjectId) return;
    if (hasMetadataErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix invalid metadata fields before saving.",
        variant: "destructive",
      });
      return;
    }
    saveConfigMutation.mutate({ selectedTemplates, metadata });
  };

  const handleGenerate = () => {
    if (!selectedProjectId) return;
    if (hasMetadataErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix invalid metadata fields before generating.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate({ metadata });
  };

  const handleExportZip = async () => {
    if (!selectedProjectId) return;
    
    try {
      const exportUrl = `/api/projects/${selectedProjectId}/documentation/export`;
      const response = await fetch(exportUrl, { credentials: "include" });
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorData = errorText ? JSON.parse(errorText) : {};
        toast({
          title: "Export failed",
          description: errorData.error || "Failed to export documentation. Please generate documentation first.",
          variant: "destructive",
        });
        return;
      }
      
      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `documentation-${new Date().toISOString().split('T')[0]}.zip`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Documentation exported",
        description: `Downloaded ${filename}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting documentation.",
        variant: "destructive",
      });
    }
  };

  const pushToGithubMutation = useMutation({
    mutationFn: async ({ targetPath }: { targetPath?: string }) => {
      const response = await apiRequest("POST", `/api/projects/${selectedProjectId}/documentation/push-to-github`, {
        targetPath: targetPath || "docs/",
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Documentation pushed to GitHub",
        description: `Pushed ${data.filesCount} file${data.filesCount !== 1 ? "s" : ""} to ${data.repository}:${data.branch}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "GitHub push failed",
        description: error.message || "Failed to push documentation to GitHub",
        variant: "destructive",
      });
    },
  });

  const handlePushToGithub = () => {
    if (!selectedProjectId) return;
    pushToGithubMutation.mutate({ targetPath: "docs/" });
  };

  const refreshMetadataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${selectedProjectId}/refresh-metadata`, {});
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Metadata refreshed",
        description: "Features and tech stack have been updated from external project API.",
      });
      
      // Auto-fill the refreshed metadata
      if (data && data.project) {
        const projectMetadata: Record<string, any> = {};
        const projectMetadataDisplay: Record<string, string> = {};
        
        if (data.project.features) {
          projectMetadata.FEATURES = data.project.features;
          projectMetadataDisplay.FEATURES = JSON.stringify(data.project.features, null, 2);
        }
        
        if (data.project.techStack) {
          projectMetadata.TECH_STACK = data.project.techStack;
          projectMetadataDisplay.TECH_STACK = JSON.stringify(data.project.techStack, null, 2);
        }
        
        setMetadata({ ...metadata, ...projectMetadata });
        setMetadataDisplay({ ...metadataDisplay, ...projectMetadataDisplay });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Refresh failed",
        description: error.message || "Failed to refresh metadata from external project",
        variant: "destructive",
      });
    },
  });

  const handleRefreshMetadata = () => {
    if (!selectedProjectId) return;
    refreshMetadataMutation.mutate();
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b p-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">Documentation Generator</h1>
            <p className="text-sm text-muted-foreground">Create standardized project documentation</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Project</CardTitle>
              <CardDescription>Choose the project to generate documentation for</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger data-testid="select-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedProjectId && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Select Templates</CardTitle>
                  <CardDescription>Choose which documentation files to generate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(templatesByCategory || {}).map(([category, categoryTemplates]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="font-medium capitalize">{category.replace('_', ' ')}</h3>
                      <div className="space-y-2">
                        {categoryTemplates.map(template => (
                          <div key={template.id} className="flex items-start gap-3">
                            <Checkbox
                              id={template.id}
                              checked={selectedTemplates.includes(template.id)}
                              onCheckedChange={() => handleTemplateToggle(template.id)}
                              data-testid={`checkbox-template-${template.key}`}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={template.id}
                                className="font-medium cursor-pointer"
                              >
                                {template.label}
                              </Label>
                              {template.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {template.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <div>
                    <CardTitle>Project Metadata</CardTitle>
                    <CardDescription>Fill in the project information</CardDescription>
                  </div>
                  {selectedProjectId && projects?.find(p => p.id === selectedProjectId)?.metadataApiUrl && (
                    <Button
                      onClick={handleRefreshMetadata}
                      disabled={refreshMetadataMutation.isPending}
                      size="sm"
                      variant="outline"
                      data-testid="button-refresh-metadata"
                    >
                      {refreshMetadataMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh from API
                        </>
                      )}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="PROJECT_NAME">Project Name</Label>
                      <Input
                        id="PROJECT_NAME"
                        value={metadataDisplay.PROJECT_NAME || ""}
                        onChange={e => handleMetadataDisplayChange("PROJECT_NAME", e.target.value)}
                        onBlur={() => handleMetadataBlur("PROJECT_NAME")}
                        placeholder="My Awesome App"
                        data-testid="input-project-name"
                      />
                      {metadataErrors.PROJECT_NAME && (
                        <p className="text-sm text-destructive">{metadataErrors.PROJECT_NAME}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="PROJECT_DESCRIPTION">Project Description</Label>
                      <Textarea
                        id="PROJECT_DESCRIPTION"
                        value={metadataDisplay.PROJECT_DESCRIPTION || ""}
                        onChange={e => handleMetadataDisplayChange("PROJECT_DESCRIPTION", e.target.value)}
                        onBlur={() => handleMetadataBlur("PROJECT_DESCRIPTION")}
                        placeholder="A brief description of what your project does"
                        data-testid="input-project-description"
                      />
                      {metadataErrors.PROJECT_DESCRIPTION && (
                        <p className="text-sm text-destructive">{metadataErrors.PROJECT_DESCRIPTION}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="FEATURES">
                        Features
                        <span className="text-xs text-muted-foreground ml-2">(JSON array format)</span>
                      </Label>
                      <Textarea
                        id="FEATURES"
                        value={metadataDisplay.FEATURES || ""}
                        onChange={e => handleMetadataDisplayChange("FEATURES", e.target.value)}
                        onBlur={() => handleMetadataBlur("FEATURES")}
                        placeholder='["User authentication", "Data visualization", "Real-time updates"]'
                        data-testid="input-features"
                      />
                      {metadataErrors.FEATURES && (
                        <p className="text-sm text-destructive">{metadataErrors.FEATURES}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="TECH_STACK">
                        Tech Stack
                        <span className="text-xs text-muted-foreground ml-2">(JSON array format)</span>
                      </Label>
                      <Textarea
                        id="TECH_STACK"
                        value={metadataDisplay.TECH_STACK || ""}
                        onChange={e => handleMetadataDisplayChange("TECH_STACK", e.target.value)}
                        onBlur={() => handleMetadataBlur("TECH_STACK")}
                        placeholder='["Node.js", "Vue", "MongoDB", "Redis"]'
                        data-testid="input-tech-stack"
                      />
                      {metadataErrors.TECH_STACK && (
                        <p className="text-sm text-destructive">{metadataErrors.TECH_STACK}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedTemplates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>Select a template to preview the generated output</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={previewTemplateId} onValueChange={setPreviewTemplateId}>
                      <SelectTrigger data-testid="select-preview-template">
                        <SelectValue placeholder="Select a template to preview" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates
                          ?.filter(t => selectedTemplates.includes(t.id))
                          .map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {previewTemplateId && (
                      <div className="space-y-3">
                        {isPreviewLoading && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          </div>
                        )}

                        {previewError && (
                          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                            <p className="text-sm font-medium text-destructive">
                              Failed to load preview: {(previewError as Error).message}
                            </p>
                          </div>
                        )}

                        {!isPreviewLoading && !previewError && previewData && previewData.success && (
                          <>
                            {previewData.missingVariables && previewData.missingVariables.length > 0 && (
                              <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
                                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                                  Missing Variables: {previewData.missingVariables.join(", ")}
                                </p>
                              </div>
                            )}

                            <div className="rounded-md border bg-muted/50">
                              <pre className="p-4 text-sm overflow-x-auto" data-testid="preview-output">
                                <code>{previewData.output}</code>
                              </pre>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveConfig}
                  variant="outline"
                  disabled={saveConfigMutation.isPending || selectedTemplates.length === 0}
                  data-testid="button-save-config"
                >
                  {saveConfigMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || selectedTemplates.length === 0}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Documentation
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleExportZip}
                  variant="secondary"
                  disabled={!selectedProjectId}
                  data-testid="button-export-zip"
                >
                  <FileArchive className="w-4 h-4 mr-2" />
                  Export to ZIP
                </Button>
                <Button
                  onClick={handlePushToGithub}
                  variant="outline"
                  disabled={pushToGithubMutation.isPending || !selectedProjectId}
                  data-testid="button-push-github"
                >
                  {pushToGithubMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Pushing...
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 mr-2" />
                      Push to GitHub
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
