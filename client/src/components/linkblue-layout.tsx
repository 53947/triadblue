import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LinkBlueSidebar } from "@/components/linkblue-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlatformSwitcher } from "@/components/platform-switcher";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import linkblueLogo from "@assets/LINKBlue_Logo_1767377727413.png";

interface LinkBlueLayoutProps {
  children: React.ReactNode;
}

export function LinkBlueLayout({ children }: LinkBlueLayoutProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [userInfo, setUserInfo] = useState<{ 
    email?: string; 
    consoleblueAccess?: boolean 
  }>({});

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserInfo({
            email: data.user.username,
            consoleblueAccess: data.user.consoleblueAccess
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      queryClient.clear();
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSwitchPlatform = () => {
    setLocation("/consoleblue/login");
  };

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

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full min-h-screen overflow-x-hidden">
        <LinkBlueSidebar 
          userEmail={userInfo.email}
          hasConsoleBlueAccess={userInfo.consoleblueAccess}
          onLogout={handleLogout}
          onSwitchPlatform={handleSwitchPlatform}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 px-2 sm:px-4 py-2 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-linkblue-sidebar-toggle" className="h-10 min-h-10" />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => window.location.reload()}
                title="Reload page"
                data-testid="button-linkblue-reload"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleHardReset}
                title="Hard reset (clears cache)"
                data-testid="button-linkblue-hard-reset"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-sm sm:text-base lg:hidden text-blue-400">LINKBlue</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <PlatformSwitcher currentPlatform="linkblue" />
              <ThemeToggle />
              <img 
                src={linkblueLogo} 
                alt="LINKBlue" 
                className="h-8 sm:h-10 w-auto object-contain"
                data-testid="header-linkblue-logo"
              />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
