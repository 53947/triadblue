import { useState, useEffect, useRef } from "react";

export interface TreeNode {
  id: string;
  label: string;
  description?: string;
  status?: "planned" | "in_progress" | "completed";
  children?: TreeNode[];
  onClick?: () => void;
}

interface TreeVisualizationProps {
  data: TreeNode[];
  onNodeClick?: (node: TreeNode) => void;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 80;

interface PositionedNode extends TreeNode {
  x: number;
  y: number;
  width: number;
  depth: number;
}

function calculateLayout(
  nodes: TreeNode[],
  startX = 0,
  startY = 0,
  depth = 0,
  parentChildMap = new Map<string, string[]>()
): { positioned: PositionedNode[]; connections: Map<string, string[]> } {
  const positioned: PositionedNode[] = [];
  let currentY = startY;

  for (const node of nodes) {
    const childNodes = node.children || [];
    const hasChildren = childNodes.length > 0;

    if (hasChildren) {
      // Store parent-child relationship
      parentChildMap.set(node.id, childNodes.map(child => child.id));

      // Calculate child positions first
      const childResult = calculateLayout(childNodes, startX + NODE_WIDTH + HORIZONTAL_SPACING, currentY, depth + 1, parentChildMap);
      positioned.push(...childResult.positioned);

      // Position this node centered vertically relative to its children
      const firstChild = childResult.positioned[0];
      const lastChild = childResult.positioned[childResult.positioned.length - 1];
      const centerY = (firstChild.y + lastChild.y + NODE_HEIGHT) / 2 - NODE_HEIGHT / 2;

      positioned.push({
        ...node,
        x: startX,
        y: centerY,
        width: NODE_WIDTH,
        depth,
      });

      // Update currentY for next sibling
      currentY = lastChild.y + NODE_HEIGHT + VERTICAL_SPACING;
    } else {
      // Leaf node
      positioned.push({
        ...node,
        x: startX,
        y: currentY,
        width: NODE_WIDTH,
        depth,
      });
      currentY += NODE_HEIGHT + VERTICAL_SPACING;
    }
  }

  return { positioned, connections: parentChildMap };
}

function getStatusColor(status?: string) {
  switch (status) {
    case "completed":
      return "stroke-green-500";
    case "in_progress":
      return "stroke-blue-500";
    default:
      return "stroke-primary";
  }
}

function getStatusFill(status?: string) {
  switch (status) {
    case "completed":
      return "fill-green-50 dark:fill-green-950/20";
    case "in_progress":
      return "fill-blue-50 dark:fill-blue-950/20";
    default:
      return "fill-card";
  }
}

export function TreeVisualization({ data, onNodeClick }: TreeVisualizationProps) {
  const [positionedNodes, setPositionedNodes] = useState<PositionedNode[]>([]);
  const [parentChildMap, setParentChildMap] = useState<Map<string, string[]>>(new Map());
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const result = calculateLayout(data);
    setPositionedNodes(result.positioned);
    setParentChildMap(result.connections);
  }, [data]);

  // Calculate SVG dimensions
  const maxX = Math.max(...positionedNodes.map(n => n.x + n.width), 0);
  const maxY = Math.max(...positionedNodes.map(n => n.y + NODE_HEIGHT), 0);
  const svgWidth = maxX + 40;
  const svgHeight = maxY + 40;

  // Build parent-child connections from the map
  const connections: Array<{ from: PositionedNode; to: PositionedNode }> = [];
  parentChildMap.forEach((childIds, parentId) => {
    const parent = positionedNodes.find(n => n.id === parentId);
    if (parent) {
      childIds.forEach(childId => {
        const child = positionedNodes.find(n => n.id === childId);
        if (child) {
          connections.push({ from: parent, to: child });
        }
      });
    }
  });

  return (
    <div className="w-full h-full overflow-auto bg-background p-4">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className="min-w-full min-h-full"
      >
        {/* Draw connections first (so they appear behind nodes) */}
        {connections.map((conn, idx) => {
          const fromCenterY = conn.from.y + NODE_HEIGHT / 2;
          const toCenterY = conn.to.y + NODE_HEIGHT / 2;
          const fromRightX = conn.from.x + conn.from.width;
          const toLeftX = conn.to.x;
          const midX = fromRightX + HORIZONTAL_SPACING / 2;

          return (
            <path
              key={`conn-${idx}`}
              d={`M ${fromRightX} ${fromCenterY} L ${midX} ${fromCenterY} L ${midX} ${toCenterY} L ${toLeftX} ${toCenterY}`}
              className="stroke-primary/30"
              strokeWidth="2"
              fill="none"
            />
          );
        })}

        {/* Draw nodes */}
        {positionedNodes.map((node) => (
          <g
            key={node.id}
            className={onNodeClick ? "cursor-pointer" : ""}
            onClick={() => onNodeClick?.(node)}
          >
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={NODE_HEIGHT}
              rx="12"
              className={`${getStatusFill(node.status)} ${getStatusColor(node.status)} hover-elevate transition-all`}
              strokeWidth="2"
            />
            <foreignObject
              x={node.x}
              y={node.y}
              width={node.width}
              height={NODE_HEIGHT}
              className="pointer-events-none"
            >
              <div className="flex flex-col items-center justify-center h-full px-3 text-center">
                <div className="font-medium text-sm text-foreground truncate w-full">
                  {node.label}
                </div>
                {node.description && (
                  <div className="text-xs text-muted-foreground truncate w-full mt-0.5">
                    {node.description}
                  </div>
                )}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
    </div>
  );
}
