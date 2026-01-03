import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Home, FolderKanban, MessageSquare, Settings, Plus, Github, MessagesSquare, Clock, BarChart3, ListTodo, LogOut, ImageIcon, FileText, Mail, Settings2, Headphones, Map, Network, Microscope, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Project } from "@shared/schema";
import consoleBlueLogo from "@assets/ConsoleBlue-logo_1763756605648.png";
import { logout } from "@/lib/auth";
import { useLocation as useWouterLocation } from "wouter";
import { useActiveLogo } from "@/hooks/use-active-logo";

const navigation = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Conversations", url: "/conversations", icon: MessageSquare },
  { title: "Email Chat", url: "/email-chat", icon: Mail },
  { title: "Email Settings", url: "/email-settings", icon: Settings2 },
  { title: "Assistant Workspace", url: "/assistant-workspace", icon: Headphones },
  { title: "Agent Chat", url: "/agent-chat", icon: MessagesSquare },
  { title: "Activity Timeline", url: "/timeline", icon: Clock },
  { title: "GitHub Activity", url: "/github", icon: Github },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Documentation", url: "/documentation", icon: FileText },
  { title: "Assets", url: "/assets", icon: ImageIcon },
  { title: "Site Inspector", url: "/site-inspector", icon: Microscope },
  { title: "Site Planner", url: "/site-planner", icon: Network },
  { title: "Site Map", url: "/site-map", icon: Map },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  projects?: Project[];
  onNewProject?: () => void;
}

export function AppSidebar({ projects = [], onNewProject }: AppSidebarProps) {
  const [location] = useLocation();
  const [, setWouterLocation] = useWouterLocation();
  const { logoUrl } = useActiveLogo();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLogout = async () => {
    await logout();
    setWouterLocation("/");
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex flex-col gap-2 items-center">
          <img 
            src={logoUrl || consoleBlueLogo} 
            alt="ConsoleBlue" 
            className="h-10 w-auto object-contain"
          />
          <p className="text-xs text-muted-foreground">App Building Console</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.url} onClick={handleNavClick}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            {onNewProject && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={onNewProject}
                data-testid="button-new-project"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 ? (
                <div className="px-2 py-4 text-xs text-muted-foreground text-center">
                  No projects yet
                </div>
              ) : (
                projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild data-testid={`project-${project.id}`}>
                      <Link href={`/project/${project.id}`} onClick={handleNavClick}>
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
        <div className="flex items-center gap-2 hover-elevate rounded-md p-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs">ME</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">My Account</p>
            <p className="text-xs text-muted-foreground truncate">Owner</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
