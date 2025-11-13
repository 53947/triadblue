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
import { FileText, Loader2, CheckCircle2, Download } from "lucide-react";

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

  useEffect(() => {
    setSelectedTemplates([]);
    setMetadata({});
  }, [selectedProjectId]);

  useEffect(() => {
    if (configStatus === "success" && config && selectedProjectId) {
      setSelectedTemplates(config.selectedTemplates);
      setMetadata(config.metadata);
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

  const handleSaveConfig = () => {
    saveConfigMutation.mutate({ selectedTemplates, metadata });
  };

  const handleGenerate = () => {
    generateMutation.mutate({ metadata });
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
                <CardHeader>
                  <CardTitle>Project Metadata</CardTitle>
                  <CardDescription>Fill in the project information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="PROJECT_NAME">Project Name</Label>
                      <Input
                        id="PROJECT_NAME"
                        value={metadata.PROJECT_NAME || ""}
                        onChange={e => setMetadata({ ...metadata, PROJECT_NAME: e.target.value })}
                        placeholder="ConsoleBlue"
                        data-testid="input-project-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="PROJECT_DESCRIPTION">Project Description</Label>
                      <Textarea
                        id="PROJECT_DESCRIPTION"
                        value={metadata.PROJECT_DESCRIPTION || ""}
                        onChange={e => setMetadata({ ...metadata, PROJECT_DESCRIPTION: e.target.value })}
                        placeholder="A unified task management and documentation hub"
                        data-testid="input-project-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="FEATURES">Features (comma-separated)</Label>
                      <Textarea
                        id="FEATURES"
                        value={metadata.FEATURES || ""}
                        onChange={e => setMetadata({ ...metadata, FEATURES: e.target.value })}
                        placeholder="Task tracking, GitHub integration, Documentation generator"
                        data-testid="input-features"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="TECH_STACK">Tech Stack (comma-separated)</Label>
                      <Textarea
                        id="TECH_STACK"
                        value={metadata.TECH_STACK || ""}
                        onChange={e => setMetadata({ ...metadata, TECH_STACK: e.target.value })}
                        placeholder="React, TypeScript, Express, PostgreSQL"
                        data-testid="input-tech-stack"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                      <Download className="w-4 h-4 mr-2" />
                      Generate Documentation
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
