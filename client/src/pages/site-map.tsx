import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Project, ProjectRoute } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { FileCode, Folder, File, RefreshCw, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tree node type for hierarchical route display
interface RouteTreeNode {
  segment: string;
  fullPath: string;
  routes: ProjectRoute[];
  children: Map<string, RouteTreeNode>;
  isExpanded: boolean;
}

// Build tree structure from routes
function buildRouteTree(routes: ProjectRoute[]): RouteTreeNode {
  const root: RouteTreeNode = {
    segment: "",
    fullPath: "",
    routes: [],
    children: new Map(),
    isExpanded: true,
  };

  for (const route of routes) {
    const segments = route.path.split("/").filter(Boolean);
    let currentNode = root;
    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      if (!currentNode.children.has(segment)) {
        currentNode.children.set(segment, {
          segment,
          fullPath: currentPath,
          routes: [],
          children: new Map(),
          isExpanded: false,
        });
      }

      currentNode = currentNode.children.get(segment)!;
    }

    // Add route to the leaf node
    currentNode.routes.push(route);
  }

  return root;
}

// Recursive tree node component
function TreeNode({ 
  node, 
  depth = 0, 
  onToggle 
}: { 
  node: RouteTreeNode; 
  depth?: number; 
  onToggle: (path: string) => void;
}) {
  const hasChildren = node.children.size > 0;
  const hasRoutes = node.routes.length > 0;
  const paddingLeft = depth * 20;

  return (
    <div className="select-none">
      {node.segment && (
        <div
          className={`flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer ${
            hasChildren ? "" : "cursor-default"
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => hasChildren && onToggle(node.fullPath)}
          data-testid={`tree-node-${node.fullPath}`}
        >
          {hasChildren ? (
            node.isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
          
          {hasChildren ? (
            <Folder className="w-4 h-4 text-primary" />
          ) : (
            <FileCode className="w-4 h-4 text-muted-foreground" />
          )}
          
          <span className="font-medium">{node.segment}</span>
          <span className="text-xs text-muted-foreground">
            {node.fullPath}
          </span>
        </div>
      )}

      {hasRoutes && node.segment && (
        <div style={{ paddingLeft: `${paddingLeft + 24}px` }} className="space-y-1 mt-1">
          {node.routes.map((route) => (
            <div
              key={route.id}
              className="flex items-start gap-2 p-2 rounded-md border text-sm"
              data-testid={`route-detail-${route.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{route.name}</div>
                {route.filePath && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {route.filePath}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
                <span className="capitalize">{route.routeType}</span>
                <span>{route.framework}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {node.isExpanded && hasChildren && (
        <div className="mt-1">
          {Array.from(node.children.values()).map((child) => (
            <TreeNode
              key={child.fullPath}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteMap() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch routes for selected project
  const { data: routes = [], isLoading: routesLoading } = useQuery<ProjectRoute[]>({
    queryKey: ["/api/projects", selectedProjectId, "routes"],
    enabled: !!selectedProjectId,
  });

  // Scan routes mutation (for ConsoleBlue only)
  const scanRoutesMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return apiRequest("POST", `/api/projects/${projectId}/routes/scan`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "routes"] });
      toast({
        title: "Routes scanned successfully",
        description: "Site map has been updated with latest routes",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Scan failed",
        description: error.message || "Failed to scan routes",
        variant: "destructive",
      });
    },
  });

  // Get selected project details
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const isConsoleBlue = selectedProject?.name === "ConsoleBlue";

  // Group routes by source
  const scannedRoutes = routes.filter(r => r.source === "scan");
  const externalRoutes = routes.filter(r => r.source === "external");

  // Build tree structures
  const scannedTree = buildRouteTree(scannedRoutes);
  const externalTree = buildRouteTree(externalRoutes);

  // Apply expanded state to trees
  const applyExpandedState = (node: RouteTreeNode) => {
    node.isExpanded = expandedPaths.has(node.fullPath) || node.fullPath === "";
    node.children.forEach((child) => applyExpandedState(child));
  };

  applyExpandedState(scannedTree);
  applyExpandedState(externalTree);

  // Toggle expand/collapse
  const togglePath = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <PageShell>
      <div className="p-6 border-b">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Site Map</h1>
          <p className="text-sm text-muted-foreground">
            Auto-generated view of actual routes and pages in the project
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          {isConsoleBlue && selectedProjectId && (
            <Button
              onClick={() => scanRoutesMutation.mutate(selectedProjectId)}
              disabled={scanRoutesMutation.isPending}
              data-testid="button-scan-routes"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${scanRoutesMutation.isPending ? "animate-spin" : ""}`} />
              {scanRoutesMutation.isPending ? "Scanning..." : "Scan Routes"}
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {selectedProjectId ? (
          routesLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Loading routes...
            </div>
          ) : routes.length === 0 ? (
            <Card className="p-6 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <File className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">No routes found</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {isConsoleBlue 
                  ? "Click 'Scan Routes' to detect routes from ConsoleBlue's codebase."
                  : "This project hasn't submitted its routes yet. External projects can POST routes to ConsoleBlue's API with a valid API key."}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {scannedRoutes.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Folder className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Scanned Routes ({scannedRoutes.length})</h3>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Source: Local codebase scan
                    </span>
                  </div>
                  
                  <div className="border rounded-md p-3" data-testid="tree-scanned-routes">
                    {/* Render root-level routes (homepage, etc.) */}
                    {scannedTree.routes.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {scannedTree.routes.map((route) => (
                          <div
                            key={route.id}
                            className="flex items-start gap-2 p-2 rounded-md border text-sm"
                            data-testid={`route-detail-${route.id}`}
                          >
                            <FileCode className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{route.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {route.path}
                              </div>
                              {route.filePath && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {route.filePath}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
                              <span className="capitalize">{route.routeType}</span>
                              <span>{route.framework}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Render tree hierarchy */}
                    {Array.from(scannedTree.children.values()).map((child) => (
                      <TreeNode
                        key={child.fullPath}
                        node={child}
                        depth={0}
                        onToggle={togglePath}
                      />
                    ))}
                  </div>
                </Card>
              )}

              {externalRoutes.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Folder className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">External Routes ({externalRoutes.length})</h3>
                    <span className="text-xs text-muted-foreground ml-auto">
                      Source: API submission
                    </span>
                  </div>
                  
                  <div className="border rounded-md p-3" data-testid="tree-external-routes">
                    {/* Render root-level routes (homepage, etc.) */}
                    {externalTree.routes.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {externalTree.routes.map((route) => (
                          <div
                            key={route.id}
                            className="flex items-start gap-2 p-2 rounded-md border text-sm"
                            data-testid={`route-detail-${route.id}`}
                          >
                            <FileCode className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{route.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {route.path}
                              </div>
                              {route.filePath && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {route.filePath}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
                              <span className="capitalize">{route.routeType}</span>
                              <span>{route.framework}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Render tree hierarchy */}
                    {Array.from(externalTree.children.values()).map((child) => (
                      <TreeNode
                        key={child.fullPath}
                        node={child}
                        depth={0}
                        onToggle={togglePath}
                      />
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-6 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <File className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">About Site Map</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isConsoleBlue 
                    ? "ConsoleBlue's routes are scanned directly from the codebase (App.tsx and pages directory). Click 'Scan Routes' to update with the latest changes."
                    : "External projects can submit their routes to ConsoleBlue via API with a valid API key that has 'write_routes' permission."}
                </p>
              </Card>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select a project to view its sitemap
          </div>
        )}
      </div>
    </PageShell>
  );
}
