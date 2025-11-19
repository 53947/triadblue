import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, SitePlannerNode as DBNode, SitePlannerEdge as DBEdge } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
} from "lucide-react";

import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom node component for site pages
function PageNode({ data }: { data: any }) {
  const getStatusIcon = () => {
    switch (data.status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case "completed":
        return "border-green-500 bg-green-50 dark:bg-green-950/20";
      case "in_progress":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[160px] ${getStatusColor()}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {getStatusIcon()}
        <div className="font-medium">{data.label}</div>
      </div>
      {data.description && (
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {data.description}
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  page: PageNode,
};

export default function SitePlanner() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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

  // Convert DB nodes/edges to React Flow format
  useEffect(() => {
    if (!selectedProjectId) return;

    const flowNodes: Node[] = dbNodes.map((dbNode) => ({
      id: dbNode.nodeId,
      type: "page",
      position: { x: dbNode.positionX, y: dbNode.positionY },
      data: {
        label: dbNode.label,
        description: dbNode.description,
        status: dbNode.status,
        dbId: dbNode.id,
      },
    }));

    const flowEdges: Edge[] = dbEdges.map((dbEdge) => ({
      id: dbEdge.edgeId,
      source: dbEdge.sourceNodeId,
      target: dbEdge.targetNodeId,
      label: dbEdge.label || undefined,
      animated: true,
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [dbNodes, dbEdges, selectedProjectId, setNodes, setEdges]);

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [setEdges]
  );

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) throw new Error("No project selected");

      // Convert React Flow nodes/edges back to DB format
      const nodesToSave = nodes.map((node) => ({
        projectId: selectedProjectId,
        nodeId: node.id,
        label: node.data.label,
        description: node.data.description || null,
        status: node.data.status,
        positionX: Math.round(node.position.x),
        positionY: Math.round(node.position.y),
      }));

      const edgesToSave = edges.map((edge) => ({
        projectId: selectedProjectId,
        edgeId: edge.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        label: edge.label as string || null,
      }));

      return apiRequest("POST", `/api/projects/${selectedProjectId}/site-planner/save`, {
        nodes: nodesToSave,
        edges: edgesToSave,
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

    const nodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: "page",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: newNodeLabel,
        description: newNodeDescription,
        status: newNodeStatus,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setShowAddDialog(false);
    setNewNodeLabel("");
    setNewNodeDescription("");
    setNewNodeStatus("planned");
  };

  const handleEditNode = () => {
    if (!selectedNode || !newNodeLabel.trim()) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                label: newNodeLabel,
                description: newNodeDescription,
                status: newNodeStatus,
              },
            }
          : node
      )
    );

    setShowEditDialog(false);
    setSelectedNode(null);
    setNewNodeLabel("");
    setNewNodeDescription("");
    setNewNodeStatus("planned");
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  const handleNodeClick = (_event: any, node: Node) => {
    setSelectedNode(node);
    setNewNodeLabel(node.data.label);
    setNewNodeDescription(node.data.description || "");
    setNewNodeStatus(node.data.status);
    setShowEditDialog(true);
  };

  return (
    <PageShell>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Site Planner</h1>
            <p className="text-sm text-muted-foreground">
              Visual planner for mapping out pages and navigation flow
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

      <div className="flex-1 w-full">
        {selectedProjectId ? (
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              data-testid="react-flow-canvas"
            >
              <Background variant={BackgroundVariant.Dots} />
              <Controls />
            </ReactFlow>
          </div>
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
