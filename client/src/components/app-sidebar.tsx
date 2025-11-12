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
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Home, FolderKanban, MessageSquare, Settings, Plus, Github, MessagesSquare, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Project } from "@shared/schema";
import triadBlueLogo from "@assets/Triad Blue Icon_1762915681862.png";

const navigation = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Agent Chat", url: "/agent-chat", icon: MessagesSquare },
  { title: "Activity Timeline", url: "/timeline", icon: Clock },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Conversations", url: "/conversations", icon: MessageSquare },
  { title: "GitHub Activity", url: "/github", icon: Github },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  projects?: Project[];
  onNewProject?: () => void;
}

export function AppSidebar({ projects = [], onNewProject }: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src={triadBlueLogo} 
            alt="Triad Blue" 
            className="w-8 h-8"
          />
          <div>
            <h2 className="text-base font-semibold">Triad Blue Hub</h2>
            <p className="text-xs text-muted-foreground">Project Management</p>
          </div>
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
                    <Link href={item.url}>
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
                      <Link href={`/project/${project.id}`}>
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

      <SidebarFooter className="p-4">
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
