import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { FileCode, Folder, File } from "lucide-react";

export default function SiteMap() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Placeholder for auto-generated sitemap
  // In the future, this could scan files/routes from the actual project
  const samplePages = [
    { name: "Dashboard", path: "/", type: "route" },
    { name: "Projects", path: "/projects", type: "route" },
    { name: "Tasks", path: "/tasks", type: "route" },
    { name: "Conversations", path: "/conversations", type: "route" },
    { name: "Email Chat", path: "/email-chat", type: "route" },
    { name: "Agent Chat", path: "/agent-chat", type: "route" },
    { name: "Site Planner", path: "/site-planner", type: "route" },
    { name: "Site Map", path: "/site-map", type: "route" },
  ];

  return (
    <PageShell>
      <div className="p-6 border-b">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Site Map</h1>
          <p className="text-sm text-muted-foreground">
            Auto-generated view of actual routes and pages in the project
          </p>
        </div>

        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="max-w-xs" data-testid="select-project">
            <SelectValue placeholder="Select project" />
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

      <div className="p-6">
        {selectedProjectId ? (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Folder className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Routes & Pages</h3>
              </div>
              
              <div className="space-y-2">
                {samplePages.map((page) => (
                  <div
                    key={page.path}
                    className="flex items-center gap-3 p-3 rounded-md hover-elevate border"
                    data-testid={`page-item-${page.path}`}
                  >
                    <FileCode className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{page.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {page.path}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {page.type}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <File className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Note</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                This is currently showing ConsoleBlue's routes as a sample. In the future,
                this could connect to external projects via API and scan their actual
                file structure to generate a live sitemap.
              </p>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select a project to view its sitemap
          </div>
        )}
      </div>
    </PageShell>
  );
}
