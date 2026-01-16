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
import { 
  Link2, 
  Activity, 
  Grid3X3, 
  Users, 
  PieChart, 
  Bell, 
  LogOut,
  ExternalLink,
  ArrowLeftRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import linkblueLogo from "@assets/LINKBlue_Logo_1767377727413.png";
import linkblueIcon from "@assets/LinkBlue_Icon_1767377569222.png";
import settingsIcon from "@assets/Settings_1768562053879.png";
import businessBlueprintIcon from "@assets/1-Master_business_blueprint_icon_1768562166809.png";
import swipesBlueIcon from "@assets/Swipes_Blue_Logo_1768565417072.png";
import hostsBlueIcon from "@assets/HostsBlue_Icon_1768566057049.png";
import mealPrepProIcon from "@assets/MealPrepProIcon_1768562003431.png";
import scansBlueIcon from "@assets/scansblue_icon_1768561547970.png";

const linkblueNavigation = [
  { title: "Overview", url: "/linkblue", icon: Link2, imageIcon: null },
  { title: "Platform Health", url: "/linkblue/health", icon: Activity, imageIcon: null },
  { title: "Clients 360°", url: "/linkblue/clients", icon: Users, imageIcon: null },
  { title: "Analytics", url: "/linkblue/analytics", icon: PieChart, imageIcon: null },
  { title: "Integrations", url: "/linkblue/integrations", icon: Grid3X3, imageIcon: null },
  { title: "Alerts", url: "/linkblue/alerts", icon: Bell, imageIcon: null },
  { title: "Settings", url: "/linkblue/settings", icon: null, imageIcon: settingsIcon },
];

const platformQuickLinks = [
  { title: "BusinessBlueprint", url: "https://businessblueprint.io/admin", imageIcon: businessBlueprintIcon },
  { title: "SwipesBlue", url: "https://swipesblue.com/admin", imageIcon: swipesBlueIcon },
  { title: "HostsBlue", url: "https://hostsblue.com/admin", imageIcon: hostsBlueIcon },
  { title: "MealPrepPro", url: "https://mealpreppro.com/admin", imageIcon: mealPrepProIcon },
  { title: "ScansBlue", url: "https://scansblue.com/admin", imageIcon: scansBlueIcon },
];

interface LinkBlueSidebarProps {
  userEmail?: string;
  hasConsoleBlueAccess?: boolean;
  onLogout: () => void;
  onSwitchPlatform?: () => void;
}

export function LinkBlueSidebar({ 
  userEmail, 
  hasConsoleBlueAccess = false,
  onLogout,
  onSwitchPlatform
}: LinkBlueSidebarProps) {
  const [location] = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar data-testid="linkblue-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex flex-col gap-2 items-center">
          <img 
            src={linkblueIcon} 
            alt="LINKBlue" 
            className="h-12 w-12 rounded-lg"
            style={{ boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)" }}
          />
          <img 
            src={linkblueLogo} 
            alt="LINKBlue Logo" 
            className="h-8 w-auto object-contain"
          />
          <p className="text-xs text-muted-foreground">TriadBlue Operations Center</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-400">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {linkblueNavigation.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url || (item.url !== "/linkblue" && location.startsWith(item.url))} 
                    data-testid={`nav-linkblue-${item.title.toLowerCase().replace(/\s+/g, '-').replace('°', '')}`}
                  >
                    <Link href={item.url} onClick={handleNavClick}>
                      {item.imageIcon ? (
                        <img src={item.imageIcon} alt={item.title} className="w-4 h-4 object-contain rounded-sm" />
                      ) : item.icon ? (
                        <item.icon className="w-4 h-4" />
                      ) : null}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Platform Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformQuickLinks.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild 
                    data-testid={`nav-quick-${item.title.toLowerCase()}`}
                  >
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={handleNavClick}
                    >
                      <img src={item.imageIcon} alt={item.title} className="w-5 h-5 object-contain rounded-sm" />
                      <span>{item.title}</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasConsoleBlueAccess && (
          <SidebarGroup>
            <SidebarGroupLabel>Switch Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={onSwitchPlatform}
                    data-testid="nav-switch-to-consoleblue"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>Switch to ConsoleBlue</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={onLogout}
          data-testid="button-linkblue-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
        <div className="flex items-center gap-2 hover-elevate rounded-md p-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-blue-500/20 text-blue-400">
              {userEmail?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userEmail || "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">LINKBlue Dashboard</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
