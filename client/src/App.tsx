import { Switch, Route, useLocation } from "wouter";
import { queryClient, setSessionExpiredCallback } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { LinkBlueLayout } from "@/components/linkblue-layout";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw } from "lucide-react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Products from "@/pages/products";
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
import EmailChat from "@/pages/email-chat";
import EmailSettings from "@/pages/email-settings";
import AssistantWorkspace from "@/pages/assistant-workspace";
import SitePlanner from "@/pages/site-planner";
import SiteMap from "@/pages/site-map";
import SiteInspector from "@/pages/site-inspector";
import DemoHome from "@/pages/demo";
import DemoEmailChat from "@/pages/demo/demo-email-chat";
import DemoAssets from "@/pages/demo/demo-assets";
import DemoSiteMap from "@/pages/demo/demo-site-map";
import DemoSitePlanner from "@/pages/demo/demo-site-planner";
import LinkBlueDashboard from "@/pages/linkblue-dashboard";
import LinkBlueHealth from "@/pages/linkblue-health";
import LinkBlueIntegrations from "@/pages/linkblue-integrations";
import LinkBlueClients from "@/pages/linkblue-clients";
import LinkBlueAnalytics from "@/pages/linkblue-analytics";
import LinkBlueAlerts from "@/pages/linkblue-alerts";
import LinkBlueSettings from "@/pages/linkblue-settings";
import LinkBlueLogin from "@/pages/linkblue-login";
import ConsoleBlueLogin from "@/pages/consoleblue-login";
import LinkBlueForgotPassword from "@/pages/linkblue-forgot-password";
import ConsoleBlueForgotPassword from "@/pages/consoleblue-forgot-password";
import { ProtectedRoute, LinkBlueProtectedRoute } from "@/components/protected-route";
import { PlatformSwitcher } from "@/components/platform-switcher";
import { DynamicFavicon } from "@/components/dynamic-favicon";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";
import { useContextLogo } from "@/hooks/use-context-logo";

function ConsoleBlueRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
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
      <Route path="/email-chat" component={EmailChat} />
      <Route path="/email-settings" component={EmailSettings} />
      <Route path="/assistant-workspace" component={AssistantWorkspace} />
      <Route path="/site-planner" component={SitePlanner} />
      <Route path="/site-map" component={SiteMap} />
      <Route path="/site-inspector" component={SiteInspector} />
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

function LinkBlueRouter() {
  return (
    <Switch>
      <Route path="/linkblue" component={LinkBlueDashboard} />
      <Route path="/linkblue/health" component={LinkBlueHealth} />
      <Route path="/linkblue/integrations" component={LinkBlueIntegrations} />
      <Route path="/linkblue/clients" component={LinkBlueClients} />
      <Route path="/linkblue/clients/:id" component={LinkBlueClients} />
      <Route path="/linkblue/analytics" component={LinkBlueAnalytics} />
      <Route path="/linkblue/alerts" component={LinkBlueAlerts} />
      <Route path="/linkblue/settings" component={LinkBlueSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ConsoleBlueApp() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const hasShownNotificationRef = useRef(false);
  const redirectTimeoutRef = useRef<number | null>(null);
  const { logo: contextLogo, alt: contextLogoAlt } = useContextLogo();

  const handleHardReset = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      queryClient.clear();
      
      window.location.reload();
    } catch (error) {
      console.error('Hard reset error:', error);
      window.location.reload();
    }
  };
  
  useEffect(() => {
    const handleSessionExpired = () => {
      if (hasShownNotificationRef.current) return;
      
      hasShownNotificationRef.current = true;
      
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
        duration: 5000,
      });
      
      redirectTimeoutRef.current = window.setTimeout(() => {
        setLocation("/consoleblue/login");
      }, 1500);
    };
    
    setSessionExpiredCallback(handleSessionExpired);
    
    return () => {
      setSessionExpiredCallback(null);
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [toast, setLocation]);
  
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
      <div className="flex h-screen w-full min-h-screen overflow-x-hidden">
        <AppSidebar 
          projects={projects} 
          onNewProject={() => setShowCreateProjectModal(true)}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 px-2 sm:px-4 py-2 border-b shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="h-10 min-h-10" />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => window.location.reload()}
                title="Reload page"
                data-testid="button-reload"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleHardReset}
                title="Hard reset (clears cache)"
                data-testid="button-hard-reset"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-sm sm:text-base lg:hidden">ConsoleBlue</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <PlatformSwitcher currentPlatform="consoleblue" />
              <NotificationBell />
              <ThemeToggle />
              <img 
                src={contextLogo} 
                alt={contextLogoAlt} 
                className="h-8 sm:h-11 w-auto object-contain"
                data-testid="header-context-logo"
              />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <ConsoleBlueRouter />
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

function LinkBlueApp() {
  return (
    <LinkBlueLayout>
      <LinkBlueRouter />
    </LinkBlueLayout>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isConsoleBlue = window.location.hostname.includes('console');
  const isLinkBlueRoute = location.startsWith('/linkblue');
  
  return (
    <>
      <DynamicFavicon />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/linkblue/login" component={LinkBlueLogin} />
        <Route path="/linkblue/forgot-password" component={LinkBlueForgotPassword} />
        <Route path="/consoleblue/login" component={ConsoleBlueLogin} />
        <Route path="/consoleblue/forgot-password" component={ConsoleBlueForgotPassword} />
        {!isConsoleBlue && <Route path="/" component={Landing} />}
        <Route path="/apps" component={Products} />
        <Route path="/demo" component={DemoHome} />
        <Route path="/demo/email-chat" component={DemoEmailChat} />
        <Route path="/demo/assets" component={DemoAssets} />
        <Route path="/demo/site-map" component={DemoSiteMap} />
        <Route path="/demo/site-planner" component={DemoSitePlanner} />
        <Route path="/linkblue">
          <LinkBlueProtectedRoute>
            <LinkBlueApp />
          </LinkBlueProtectedRoute>
        </Route>
        <Route path="/linkblue/:rest*">
          <LinkBlueProtectedRoute>
            <LinkBlueApp />
          </LinkBlueProtectedRoute>
        </Route>
        <Route>
          <ProtectedRoute>
            <ConsoleBlueApp />
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
