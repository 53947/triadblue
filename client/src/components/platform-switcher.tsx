import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Monitor, Layout, ExternalLink } from "lucide-react";

interface UserAccess {
  linkblueAccess: boolean;
  consoleblueAccess: boolean;
  email?: string;
}

interface PlatformSwitcherProps {
  currentPlatform: "linkblue" | "consoleblue";
}

// B4: Detect if running on a subdomain
function isSubdomain(): boolean {
  const hostname = window.location.hostname;
  return hostname.startsWith("consoleblue.") || hostname.startsWith("linkblue.");
}

export function PlatformSwitcher({ currentPlatform }: PlatformSwitcherProps) {
  const [, setLocation] = useLocation();
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);

  useEffect(() => {
    const fetchUserAccess = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserAccess({
              linkblueAccess: data.user.linkblueAccess,
              consoleblueAccess: data.user.consoleblueAccess,
              email: data.user.email,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user access:", error);
      }
    };
    fetchUserAccess();
  }, []);

  const hasDualAccess = userAccess?.linkblueAccess && userAccess?.consoleblueAccess;

  if (!hasDualAccess) {
    return null;
  }

  const platforms = [
    {
      id: "linkblue" as const,
      name: "LINKBlue Dashboard",
      description: "Platform health & monitoring",
      icon: Monitor,
      path: "/linkblue",
      color: "#3b82f6",
      subdomain: "linkblue",
    },
    {
      id: "consoleblue" as const,
      name: "ConsoleBlue Panel",
      description: "Task management & docs",
      icon: Layout,
      path: "/dashboard",
      color: "#10b981",
      subdomain: "consoleblue",
    },
  ];

  const currentPlatformInfo = platforms.find(p => p.id === currentPlatform);
  const otherPlatform = platforms.find(p => p.id !== currentPlatform);

  const handleSwitch = (platform: typeof platforms[0]) => {
    if (platform.id === currentPlatform) return;

    // B4: On subdomains, navigate to the other subdomain via full URL
    if (isSubdomain()) {
      const baseDomain = window.location.hostname.replace(/^(consoleblue|linkblue)\./, "");
      const protocol = window.location.protocol;
      window.location.href = `${protocol}//${platform.subdomain}.${baseDomain}${platform.path}`;
    } else {
      // Dev / root domain: use client-side routing
      setLocation(platform.path);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          data-testid="button-platform-switcher"
        >
          {currentPlatformInfo && (
            <currentPlatformInfo.icon
              className="w-4 h-4"
              style={{ color: currentPlatformInfo.color }}
            />
          )}
          <span className="hidden sm:inline">{currentPlatformInfo?.name}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch Platform
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {platforms.map((platform) => {
          const isCurrentPlatform = platform.id === currentPlatform;
          return (
            <DropdownMenuItem
              key={platform.id}
              onClick={() => handleSwitch(platform)}
              className={`flex items-start gap-3 py-3 ${isCurrentPlatform ? 'bg-muted/50' : 'cursor-pointer'}`}
              data-testid={`menu-platform-${platform.id}`}
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${platform.color}20` }}
              >
                <platform.icon className="w-4 h-4" style={{ color: platform.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{platform.name}</span>
                  {isCurrentPlatform && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{platform.description}</p>
              </div>
              {!isCurrentPlatform && (
                <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-1" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
