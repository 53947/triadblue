import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react";

export default function ProjectEmbeds() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [customUrl, setCustomUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Example URLs for demonstration
  const getProjectUrl = (project: Project | undefined, type: 'dev' | 'deployed') => {
    if (!project) return "";
    
    // These are example URLs - replace with your actual project URLs
    const projectSlug = project.name.toLowerCase().replace(/\s+/g, '-');
    
    if (type === 'dev') {
      return `https://replit.com/@YourUsername/${projectSlug}?embed=true&theme=dark`;
    } else {
      return `https://${projectSlug}.replit.app`;
    }
  };

  const activeUrl = customUrl || (selectedProject ? getProjectUrl(selectedProject, 'deployed') : "");

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-semibold mb-2">Project Embeds</h1>
        <p className="text-sm text-muted-foreground">
          Embed your Replit projects directly in ConsoleBlue
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Configuration</CardTitle>
              <CardDescription>
                Select a project or enter a custom URL to embed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="project" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="project">Select Project</TabsTrigger>
                  <TabsTrigger value="custom">Custom URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="project" className="space-y-4 mt-4">
                  <div>
                    <Label>Choose a Project</Label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                      <SelectTrigger data-testid="select-project-embed">
                        <SelectValue placeholder="Select a project to embed" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProject && (
                    <div className="space-y-2 p-4 bg-muted rounded-md">
                      <p className="text-sm font-medium">Project URLs:</p>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Dev (temporary):</span>
                          <a 
                            href={getProjectUrl(selectedProject, 'dev')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <code className="block truncate text-muted-foreground">
                          {getProjectUrl(selectedProject, 'dev')}
                        </code>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-muted-foreground">Deployed (permanent):</span>
                          <a 
                            href={getProjectUrl(selectedProject, 'deployed')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <code className="block truncate text-muted-foreground">
                          {getProjectUrl(selectedProject, 'deployed')}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: These are example URLs. Replace with your actual project URLs.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="custom" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="custom-url">Custom Embed URL</Label>
                    <Input
                      id="custom-url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://your-project.replit.app"
                      data-testid="input-custom-url"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter any Replit project URL (.replit.app or .replit.dev)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  data-testid="button-toggle-fullscreen"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4 mr-2" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Fullscreen
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Embed Preview */}
          {activeUrl ? (
            <Card className={isFullscreen ? "fixed inset-4 z-50" : ""}>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription className="font-mono text-xs truncate max-w-lg">
                      {activeUrl}
                    </CardDescription>
                  </div>
                  {isFullscreen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(false)}
                      data-testid="button-close-fullscreen"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  src={activeUrl}
                  className={`w-full border-0 ${isFullscreen ? 'h-[calc(100vh-12rem)]' : 'h-[600px]'}`}
                  title="Project Embed"
                  allowFullScreen
                  data-testid="iframe-project-embed"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <ExternalLink className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select a project or enter a custom URL to see the embed preview
                </p>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Get Your Project URLs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Development URL (.replit.dev)</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Open your project in Replit</li>
                  <li>Click the "Webview" or preview button</li>
                  <li>Copy the URL from the preview window (ends in .replit.dev)</li>
                  <li>Add <code className="bg-muted px-1 rounded">?embed=true</code> to the end</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Dev URLs stop working when you close the project
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Deployed URL (.replit.app)</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Open your project in Replit</li>
                  <li>Click the "Deploy" button</li>
                  <li>Choose "Autoscale" deployment</li>
                  <li>Copy the deployment URL (ends in .replit.app)</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  ✅ Deployed URLs are permanent and always accessible
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
