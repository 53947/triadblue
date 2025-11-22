import { Link, useLocation } from "wouter";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AlertCircle, ExternalLink, Home, Mail, Image, Map, Layout, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import consoleBlueLogo from "@assets/ConsoleBlue-logo_1763756605648.png";

interface DemoLayoutProps {
  children: React.ReactNode;
}

const DEMO_PAGES = [
  { path: "/demo", label: "Demo Home" },
  { path: "/demo/email-chat", label: "Email Chat" },
  { path: "/demo/assets", label: "Asset Management" },
  { path: "/demo/site-map", label: "Site Map" },
  { path: "/demo/site-planner", label: "Site Planner" },
];

export function DemoLayout({ children }: DemoLayoutProps) {
  const [location, setLocation] = useLocation();
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const currentIndex = DEMO_PAGES.findIndex(page => page.path === location);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < DEMO_PAGES.length - 1;

  const goToPrev = () => {
    if (hasPrev) {
      setLocation(DEMO_PAGES[currentIndex - 1].path);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setLocation(DEMO_PAGES[currentIndex + 1].path);
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <DemoSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-2 border-b shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" className="h-10 min-h-10" />
              <span className="font-semibold text-sm sm:text-base lg:hidden">ConsoleBlue Demo</span>
              
              {/* Navigation Arrows */}
              <div className="hidden sm:flex items-center gap-1 ml-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={goToPrev}
                  disabled={!hasPrev}
                  data-testid="button-nav-prev"
                  aria-label="Go to previous demo page"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={goToNext}
                  disabled={!hasNext}
                  data-testid="button-nav-next"
                  aria-label="Go to next demo page"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <img 
                src={consoleBlueLogo} 
                alt="ConsoleBlue" 
                className="h-8 sm:h-11 w-auto object-contain"
                data-testid="header-demo-logo"
              />
            </div>
          </header>

          {/* Demo Mode Banner */}
          <Alert className="m-4 mb-0 border-yellow-500 bg-yellow-500/10" data-testid="alert-demo-mode">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-sm" data-testid="text-demo-mode-message">
                <strong>Demo Mode:</strong> You're exploring sample data. Login to access the full dashboard.
              </span>
              <Link href="/login">
                <Button size="sm" variant="outline" className="gap-2" data-testid="button-login-from-demo">
                  Login to Full Dashboard
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </AlertDescription>
          </Alert>

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

// Demo sidebar with limited navigation
function DemoSidebar() {
  const [location] = useLocation();

  const demoLinks = [
    { path: "/demo", label: "Demo Home", icon: Home },
    { path: "/demo/email-chat", label: "Email Chat", icon: Mail },
    { path: "/demo/assets", label: "Asset Management", icon: Image },
    { path: "/demo/site-map", label: "Site Map", icon: Map },
    { path: "/demo/site-planner", label: "Site Planner", icon: Layout },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 space-y-2">
          <div className="mb-4 pb-4 border-b">
            <div className="flex items-center gap-2 mb-2">
              <img src={consoleBlueLogo} alt="ConsoleBlue" className="h-8 w-auto" />
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-1">Demo Navigation</h3>
            <p className="text-xs text-muted-foreground">Explore key features</p>
          </div>

          {demoLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} href={link.path}>
                <Button
                  variant={location === link.path ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Button>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t">
            <Link href="/">
              <Button variant="outline" className="w-full gap-2" data-testid="button-back-to-landing">
                <ExternalLink className="h-4 w-4" />
                Back to Landing Page
              </Button>
            </Link>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
