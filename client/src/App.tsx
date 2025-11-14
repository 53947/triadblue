import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import AgentChat from "@/pages/agent-chat";
import ActivityTimeline from "@/pages/activity-timeline";
import Analytics from "@/pages/analytics";
import DocumentationGenerator from "@/pages/documentation-generator";
import AssetManagement from "@/pages/asset-management";
import Conversations from "@/pages/conversations";
import ProjectEmbeds from "@/pages/project-embeds";
import AgentConnectionSetup from "@/pages/agent-connection-setup";
import { ProtectedRoute } from "@/components/protected-route";
import { DynamicFavicon } from "@/components/dynamic-favicon";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";
import triadBlueLockup from "@assets/Triad Blue Lockup_1762915681863.png";

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/projects" component={Projects} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/agent-chat" component={AgentChat} />
      <Route path="/timeline" component={ActivityTimeline} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/documentation" component={DocumentationGenerator} />
      <Route path="/assets" component={AssetManagement} />
      <Route path="/conversations" component={Conversations} />
      <Route path="/embeds" component={ProjectEmbeds} />
      <Route path="/agent-setup" component={AgentConnectionSetup} />
      <Route path="/github">
        <div className="p-8 text-center text-muted-foreground">
          GitHub Activity page - Coming soon
        </div>
      </Route>
      <Route path="/settings">
        <div className="p-8 text-center text-muted-foreground">
          Settings page - Coming soon
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ProtectedApp() {
  const { toast } = useToast();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const handleCreateProject = async (data: any) => {
    try {
      await apiRequest("POST", "/api/projects", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowCreateProjectModal(false);
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar 
          projects={projects} 
          onNewProject={() => setShowCreateProjectModal(true)}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 px-4 py-2 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-3">
              <NotificationBell />
              <ThemeToggle />
              <img 
                src={triadBlueLockup} 
                alt="TriadBlue" 
                className="h-11 w-auto object-contain"
              />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <ProtectedRouter />
          </main>
        </div>
      </div>
      
      <CreateProjectModal
        open={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        onSubmit={handleCreateProject}
      />
    </SidebarProvider>
  );
}

function AppContent() {
  return (
    <>
      <DynamicFavicon />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route>
          <ProtectedRoute>
            <ProtectedApp />
          </ProtectedRoute>
        </Route>
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
