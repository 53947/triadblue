import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, SitePlannerNode as DBNode, SitePlannerEdge as DBEdge } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageShell } from "@/components/layout/page-shell";
import { TreeVisualization, TreeNode } from "@/components/tree-visualization";
import {
  Save,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";

export default function SitePlanner() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [parentNodeId, setParentNodeId] = useState<string>("");

  // Form state
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeDescription, setNewNodeDescription] = useState("");
  const [newNodeStatus, setNewNodeStatus] = useState<"planned" | "in_progress" | "completed">("planned");

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Load nodes for selected project
  const { data: dbNodes = [], refetch: refetchNodes } = useQuery<DBNode[]>({
    queryKey: [`/api/projects/${selectedProjectId}/site-planner/nodes`],
    enabled: !!selectedProjectId,
  });

  // Load edges for selected project
  const { data: dbEdges = [], refetch: refetchEdges } = useQuery<DBEdge[]>({
    queryKey: [`/api/projects/${selectedProjectId}/site-planner/edges`],
    enabled: !!selectedProjectId,
  });

  // Convert DB nodes/edges to tree structure
  useEffect(() => {
    if (!selectedProjectId || dbNodes.length === 0) {
      setTreeData([]);
      return;
    }

    // Build adjacency map from edges
    const childrenMap = new Map<string, string[]>();
    dbEdges.forEach(edge => {
      const children = childrenMap.get(edge.sourceNodeId) || [];
      children.push(edge.targetNodeId);
      childrenMap.set(edge.sourceNodeId, children);
    });

    // Find root nodes (nodes that are not targets of any edge)
    const targetNodeIds = new Set(dbEdges.map(edge => edge.targetNodeId));
    const rootNodes = dbNodes.filter(node => !targetNodeIds.has(node.nodeId));

    // Recursively build tree
    function buildTree(nodeId: string): TreeNode | null {
      const dbNode = dbNodes.find(n => n.nodeId === nodeId);
      if (!dbNode) return null;

      const childIds = childrenMap.get(nodeId) || [];
      const children = childIds.map(buildTree).filter(Boolean) as TreeNode[];

      return {
        id: dbNode.nodeId,
        label: dbNode.label,
        description: dbNode.description || undefined,
        status: dbNode.status as any,
        children: children.length > 0 ? children : undefined,
      };
    }

    const tree = rootNodes.map(node => buildTree(node.nodeId)).filter(Boolean) as TreeNode[];
    setTreeData(tree);
  }, [dbNodes, dbEdges, selectedProjectId]);

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Flatten tree to get all nodes for saving
  function flattenTree(nodes: TreeNode[], parentId: string | null = null): { nodes: any[], edges: any[] } {
    const flatNodes: any[] = [];
    const flatEdges: any[] = [];

    nodes.forEach((node, index) => {
      flatNodes.push({
        projectId: selectedProjectId,
        nodeId: node.id,
        label: node.label,
        description: node.description || null,
        status: node.status || "planned",
        positionX: index * 100,
        positionY: parentId ? 100 : 0,
      });

      if (parentId) {
        flatEdges.push({
          projectId: selectedProjectId,
          edgeId: `edge-${parentId}-${node.id}`,
          sourceNodeId: parentId,
          targetNodeId: node.id,
          label: null,
        });
      }

      if (node.children) {
        const childResult = flattenTree(node.children, node.id);
        flatNodes.push(...childResult.nodes);
        flatEdges.push(...childResult.edges);
      }
    });

    return { nodes: flatNodes, edges: flatEdges };
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) throw new Error("No project selected");

      const { nodes, edges } = flattenTree(treeData);

      return apiRequest("POST", `/api/projects/${selectedProjectId}/site-planner/save`, {
        nodes,
        edges,
      });
    },
    onSuccess: () => {
      toast({ title: "Saved!", description: "Site planner saved successfully" });
      refetchNodes();
      refetchEdges();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save planner",
        variant: "destructive",
      });
    },
  });

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) {
      toast({ title: "Error", description: "Page name is required", variant: "destructive" });
      return;
    }

    const newNode: TreeNode = {
      id: `node-${Date.now()}`,
      label: newNodeLabel,
      description: newNodeDescription || undefined,
      status: newNodeStatus,
    };

    if (!parentNodeId) {
      // Add as root node
      setTreeData([...treeData, newNode]);
    } else {
      // Add as child to parent
      const addChild = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
          if (node.id === parentNodeId) {
            return {
              ...node,
              children: [...(node.children || []), newNode],
            };
          }
          if (node.children) {
            return {
              ...node,
              children: addChild(node.children),
            };
          }
          return node;
        });
      };
      setTreeData(addChild(treeData));
    }

    setShowAddDialog(false);
    setNewNodeLabel("");
    setNewNodeDescription("");
    setNewNodeStatus("planned");
    setParentNodeId("");
  };

  const handleEditNode = () => {
    if (!selectedNode || !newNodeLabel.trim()) return;

    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === selectedNode!.id) {
          return {
            ...node,
            label: newNodeLabel,
            description: newNodeDescription || undefined,
            status: newNodeStatus,
          };
        }
        if (node.children) {
          return {
            ...node,
            children: updateNode(node.children),
          };
        }
        return node;
      });
    };

    setTreeData(updateNode(treeData));
    setShowEditDialog(false);
    setSelectedNode(null);
    setNewNodeLabel("");
    setNewNodeDescription("");
    setNewNodeStatus("planned");
  };

  const handleDeleteNode = (nodeId: string) => {
    const removeNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.filter(node => {
        if (node.id === nodeId) return false;
        if (node.children) {
          node.children = removeNode(node.children);
        }
        return true;
      });
    };

    setTreeData(removeNode(treeData));
  };

  const handleNodeClick = (node: TreeNode) => {
    setSelectedNode(node);
    setNewNodeLabel(node.label);
    setNewNodeDescription(node.description || "");
    setNewNodeStatus(node.status || "planned");
    setShowEditDialog(true);
  };

  // Get all nodes for parent selection (flattened)
  const getAllNodes = (nodes: TreeNode[]): TreeNode[] => {
    const all: TreeNode[] = [];
    nodes.forEach(node => {
      all.push(node);
      if (node.children) {
        all.push(...getAllNodes(node.children));
      }
    });
    return all;
  };

  const allNodes = getAllNodes(treeData);

  return (
    <PageShell>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Site Planner</h1>
            <p className="text-sm text-muted-foreground">
              Visual tree planner for mapping out pages and navigation flow
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddDialog(true)}
              data-testid="button-add-page"
              disabled={!selectedProjectId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Page
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!selectedProjectId || saveMutation.isPending}
              data-testid="button-save-planner"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </div>
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

      <div className="flex-1 overflow-hidden">
        {selectedProjectId ? (
          treeData.length > 0 ? (
            <TreeVisualization data={treeData} onNodeClick={handleNodeClick} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No pages yet. Click "Add Page" to get started.
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a project to begin planning
          </div>
        )}
      </div>

      {/* Add Page Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Page Name</label>
              <Input
                placeholder="e.g., Home, About, Contact"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                data-testid="input-page-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                placeholder="Brief description of the page"
                value={newNodeDescription}
                onChange={(e) => setNewNodeDescription(e.target.value)}
                data-testid="input-page-description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={newNodeStatus} onValueChange={(value: any) => setNewNodeStatus(value)}>
                <SelectTrigger data-testid="select-page-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Parent Page (optional)</label>
              <Select value={parentNodeId} onValueChange={setParentNodeId}>
                <SelectTrigger data-testid="select-parent-node">
                  <SelectValue placeholder="None (root level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (root level)</SelectItem>
                  {allNodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
              <Button onClick={handleAddNode} data-testid="button-confirm-add">
                Add Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Page Name</label>
              <Input
                placeholder="e.g., Home, About, Contact"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                data-testid="input-edit-page-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                placeholder="Brief description of the page"
                value={newNodeDescription}
                onChange={(e) => setNewNodeDescription(e.target.value)}
                data-testid="input-edit-page-description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={newNodeStatus} onValueChange={(value: any) => setNewNodeStatus(value)}>
                <SelectTrigger data-testid="select-edit-page-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedNode) handleDeleteNode(selectedNode.id);
                  setShowEditDialog(false);
                }}
                data-testid="button-delete-page"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button onClick={handleEditNode} data-testid="button-confirm-edit">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
