import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Project, ProjectRoute } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { TreeVisualization, TreeNode } from "@/components/tree-visualization";
import { RefreshCw, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Build tree structure from routes with proper segment-based hierarchy
function buildRouteTree(routes: ProjectRoute[]): TreeNode[] {
  const tree: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  // Sort routes by depth (shallower first) and then lexicographically
  const sortedRoutes = [...routes].sort((a, b) => {
    const aDepth = a.path.split("/").filter(Boolean).length;
    const bDepth = b.path.split("/").filter(Boolean).length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.path.localeCompare(b.path);
  });

  // Helper to ensure a path segment exists in the tree
  const ensureNode = (fullPath: string, segments: string[], depth: number): TreeNode => {
    // Check if this path already has a node
    if (nodeMap.has(fullPath)) {
      return nodeMap.get(fullPath)!;
    }

    // Create a new node (segment placeholder)
    const segment = segments[depth];
    const node: TreeNode = {
      id: `segment-${fullPath}`,
      label: segment,
      description: fullPath,
      children: [],
    };

    nodeMap.set(fullPath, node);

    // Attach to parent or root
    if (depth === 0) {
      tree.push(node);
    } else {
      const parentPath = "/" + segments.slice(0, depth).join("/");
      const parentNode = ensureNode(parentPath, segments, depth - 1);
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push(node);
    }

    return node;
  };

  // Process each route in sorted order
  for (const route of sortedRoutes) {
    const segments = route.path.split("/").filter(Boolean);
    const fullPath = route.path;

    if (segments.length === 0) {
      // Root route
      const existing = nodeMap.get(fullPath);
      if (existing) {
        // Update existing placeholder
        existing.id = route.id;
        existing.label = route.name;
        existing.description = fullPath;
        existing.status = "completed";
      } else {
        const node: TreeNode = {
          id: route.id,
          label: route.name,
          description: fullPath,
          status: "completed",
        };
        tree.push(node);
        nodeMap.set(fullPath, node);
      }
    } else {
      // Ensure all parent segments exist
      for (let i = 0; i < segments.length - 1; i++) {
        const segmentPath = "/" + segments.slice(0, i + 1).join("/");
        ensureNode(segmentPath, segments, i);
      }

      // Check if this path already has a placeholder node
      const existing = nodeMap.get(fullPath);
      if (existing) {
        // Merge route metadata into existing node
        existing.id = route.id;
        existing.label = route.name;
        existing.description = fullPath;
        existing.status = "completed";
      } else {
        // Create new route node
        const routeNode: TreeNode = {
          id: route.id,
          label: route.name,
          description: fullPath,
          status: "completed",
        };

        // Attach to parent
        if (segments.length === 1) {
          tree.push(routeNode);
        } else {
          const parentPath = "/" + segments.slice(0, -1).join("/");
          const parentNode = nodeMap.get(parentPath);
          if (parentNode) {
            if (!parentNode.children) {
              parentNode.children = [];
            }
            parentNode.children.push(routeNode);
          } else {
            tree.push(routeNode);
          }
        }

        nodeMap.set(fullPath, routeNode);
      }
    }
  }

  return tree;
}

export default function SiteMap() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
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

  // Build tree from routes
  useEffect(() => {
    if (routes.length > 0) {
      const tree = buildRouteTree(routes);
      setTreeData(tree);
    } else {
      setTreeData([]);
    }
  }, [routes]);

  return (
    <PageShell>
      <div className="p-6 border-b">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Site Map</h1>
          <p className="text-sm text-muted-foreground">
            Auto-generated tree view of actual routes and pages in the project
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

      <div className="flex-1 overflow-hidden">
        {selectedProjectId ? (
          routesLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading routes...
            </div>
          ) : treeData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <Card className="p-6 bg-muted/30 max-w-md">
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
            </div>
          ) : (
            <TreeVisualization data={treeData} />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a project to view its sitemap
          </div>
        )}
      </div>
    </PageShell>
  );
}
