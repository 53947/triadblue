import { DemoLayout } from "./demo-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, FileCode, Folder, Globe } from "lucide-react";
import { useState } from "react";

interface RouteNode {
  path: string;
  name: string;
  children?: RouteNode[];
  type?: string;
  framework?: string;
}

export default function DemoSiteMap() {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["/"]));

  const sampleRoutes: Record<string, RouteNode[]> = {
    ConsoleBlue: [
      {
        path: "/",
        name: "Dashboard",
        children: [
          { path: "/tasks", name: "Tasks" },
          { path: "/projects", name: "Projects" },
          { path: "/conversations", name: "Conversations" },
          {
            path: "/email",
            name: "Email Chat",
            children: [
              { path: "/email/:threadId", name: "Thread Detail" }
            ]
          },
          { path: "/site-map", name: "Site Map" },
          { path: "/site-planner", name: "Site Planner" },
          { path: "/assets", name: "Asset Management" }
        ]
      },
      {
        path: "/demo",
        name: "Demo Dashboard",
        children: [
          { path: "/demo/email-chat", name: "Demo Email" },
          { path: "/demo/assets", name: "Demo Assets" },
          { path: "/demo/site-map", name: "Demo Site Map" },
          { path: "/demo/site-planner", name: "Demo Planner" }
        ]
      }
    ],
    BusinessBlueprint: [
      { path: "/", name: "Home" },
      { path: "/assessment", name: "Digital IQ Assessment" },
      { path: "/blueprint", name: "My Blueprint" },
      { path: "/seo", name: "SEO Tools" },
      { path: "/reviews", name: "Review Management" }
    ],
    HostsBlue: [
      { path: "/", name: "Dashboard" },
      { path: "/domains", name: "Domains" },
      { path: "/hosting", name: "Hosting" },
      { path: "/email", name: "Email" },
      { path: "/ssl", name: "SSL Certificates" }
    ],
    SwipesBlue: [
      { path: "/", name: "Dashboard" },
      { path: "/payments", name: "Payments" },
      { path: "/invoices", name: "Invoices" },
      { path: "/subscriptions", name: "Subscriptions" },
      { path: "/reports", name: "Reports" }
    ]
  };

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderRouteNode = (node: RouteNode, projectColor: string, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedPaths.has(node.path);

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-md hover-elevate cursor-pointer ${
            level > 0 ? 'ml-6' : ''
          }`}
          onClick={() => hasChildren && togglePath(node.path)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )
            ) : (
              <FileCode className="h-4 w-4 text-muted-foreground ml-5 shrink-0" />
            )}
            <span className="font-medium text-sm">{node.name}</span>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded break-all">
              {node.path}
            </code>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderRouteNode(child, projectColor, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const projectColors = {
    ConsoleBlue: "bg-orange-500",
    BusinessBlueprint: "bg-blue-500",
    HostsBlue: "bg-purple-500",
    SwipesBlue: "bg-green-500"
  };

  return (
    <DemoLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Site Map</h1>
          <p className="text-muted-foreground">
            Hierarchical view of all routes across TriadBlue projects
          </p>
        </div>

        <div className="grid gap-6">
          {Object.entries(sampleRoutes).map(([project, routes]) => (
            <Card key={project}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${projectColors[project as keyof typeof projectColors]}`} />
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {project}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {routes.reduce((count, route) => {
                        const childCount = route.children?.length || 0;
                        return count + 1 + childCount;
                      }, 0)} routes
                    </CardDescription>
                  </div>
                  <Badge variant="outline">React + Wouter</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {routes.map((route) => renderRouteNode(route, projectColors[project as keyof typeof projectColors]))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-6 border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-base">How Site Map Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• ConsoleBlue routes are auto-scanned from the codebase</p>
            <p>• External projects can POST routes via API with "write_routes" permission</p>
            <p>• Routes are displayed in hierarchical tree structure</p>
            <p>• Click parent routes to expand/collapse child routes</p>
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
}
