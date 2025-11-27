import { DemoLayout } from "./demo-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Image, Map, Layout, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DemoHome() {
  const features = [
    {
      title: "Email Chat",
      description: "Manage project communications across all TriadBlue platforms with AI-powered email management.",
      icon: Mail,
      path: "/demo/email-chat",
      color: "text-blue-500"
    },
    {
      title: "Asset Management",
      description: "Upload and manage favicons, logos, and other visual assets for your projects.",
      icon: Image,
      path: "/demo/assets",
      color: "text-purple-500"
    },
    {
      title: "Site Map",
      description: "Visualize all routes across your applications with hierarchical tree navigation.",
      icon: Map,
      path: "/demo/site-map",
      color: "text-green-500"
    },
    {
      title: "Site Planner",
      description: "Plan application structure with interactive flowcharts before implementation.",
      icon: Layout,
      path: "/demo/site-planner",
      color: "text-orange-500"
    }
  ];

  return (
    <DemoLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to BlueLink Demo</h1>
          <p className="text-muted-foreground">
            Explore key features of the TriadBlue command center. Click any card below to see it in action.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.path} className="hover-elevate cursor-pointer transition-all" data-testid={`card-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <Link href={feature.path}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="gap-2 px-0" data-testid={`button-explore-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      Explore {feature.title}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 border-primary/20 bg-primary/5" data-testid="card-login-cta">
          <CardHeader>
            <CardTitle>Ready to explore the full platform?</CardTitle>
            <CardDescription>
              This demo showcases just a few of BlueLink's capabilities. Login to access the complete dashboard with real data, task management, GitHub integration, AI conversations, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="default" className="gap-2" data-testid="button-login-from-demo-home">
                Login to Full Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
}
