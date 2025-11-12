import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import AgentChat from "@/pages/agent-chat";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";
import triadBlueLockup from "@assets/Triad Blue Lockup_1762915681863.png";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/agent-chat" component={AgentChat} />
      <Route path="/conversations">
        <div className="p-8 text-center text-muted-foreground">
          Conversations page - Coming soon
        </div>
      </Route>
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

function AppContent() {
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
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <img 
                src={triadBlueLockup} 
                alt="Triad Blue" 
                className="h-7 hidden sm:block"
              />
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
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
