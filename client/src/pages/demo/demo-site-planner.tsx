import { DemoLayout } from "./demo-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactFlow, { Node, Edge, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

export default function DemoSitePlanner() {
  // Sample flowchart nodes
  const sampleNodes: Node[] = [
    {
      id: '1',
      type: 'default',
      data: { label: 'Landing Page' },
      position: { x: 250, y: 0 },
      style: { background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: '500' }
    },
    {
      id: '2',
      type: 'default',
      data: { label: 'Dashboard' },
      position: { x: 100, y: 100 },
      style: { background: '#8b5cf6', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: '500' }
    },
    {
      id: '3',
      type: 'default',
      data: { label: 'Tasks List' },
      position: { x: 0, y: 200 },
      style: { background: '#10b981', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: '500' }
    },
    {
      id: '4',
      type: 'default',
      data: { label: 'Project Board' },
      position: { x: 200, y: 200 },
      style: { background: '#10b981', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: '500' }
    },
    {
      id: '5',
      type: 'default',
      data: { label: 'Email Chat' },
      position: { x: 400, y: 100 },
      style: { background: '#8b5cf6', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: '500' }
    },
    {
      id: '6',
      type: 'default',
      data: { label: 'Thread View' },
      position: { x: 400, y: 200 },
      style: { background: '#10b981', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: '500' }
    },
    {
      id: '7',
      type: 'default',
      data: { label: 'Settings' },
      position: { x: 250, y: 300 },
      style: { background: '#f59e0b', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: '500' }
    }
  ];

  // Sample edges connecting nodes
  const sampleEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e1-5', source: '1', target: '5', animated: true },
    { id: 'e5-6', source: '5', target: '6' },
    { id: 'e2-7', source: '2', target: '7' },
    { id: 'e5-7', source: '5', target: '7' }
  ];

  return (
    <DemoLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Site Planner</h1>
          <p className="text-muted-foreground">
            Visual flowchart tool for planning application structure and user flows
          </p>
        </div>

        <div className="grid gap-6">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Node Types</CardTitle>
              <CardDescription>Visual indicators for different page types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge style={{ background: '#3b82f6', color: 'white' }}>
                  Entry Point
                </Badge>
                <Badge style={{ background: '#8b5cf6', color: 'white' }}>
                  Main Page
                </Badge>
                <Badge style={{ background: '#10b981', color: 'white' }}>
                  Detail Page
                </Badge>
                <Badge style={{ background: '#f59e0b', color: 'white' }}>
                  Utility Page
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Flowchart */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>Sample Application Flow</CardTitle>
              <CardDescription>
                Example site structure for a task management dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)]">
              <ReactFlow
                nodes={sampleNodes}
                edges={sampleEdges}
                fitView
                attributionPosition="bottom-left"
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="text-base">How Site Planner Works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Create nodes for pages, components, decisions, and data flows</p>
              <p>• Connect nodes to visualize user navigation paths</p>
              <p>• Auto-save functionality keeps your diagrams updated</p>
              <p>• Plan application structure before implementation</p>
              <p>• In the full version, you can drag, create, and edit nodes interactively</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DemoLayout>
  );
}
