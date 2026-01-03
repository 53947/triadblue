import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Key, 
  Globe,
  Save,
  RefreshCw,
  UserPlus,
  Trash2,
  Clock,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  linkblueAccess: boolean;
  consoleblueAccess: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

function PlatformSettings() {
  const [settings, setSettings] = useState({
    systemName: "LINKBlue Dashboard",
    refreshInterval: 30,
    enableRealTimeUpdates: true,
    enableEmailNotifications: true,
    enableSlackNotifications: false,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure LINKBlue platform behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Display Name</Label>
              <Input 
                id="systemName"
                value={settings.systemName}
                onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                data-testid="input-system-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refreshInterval">Data Refresh Interval (seconds)</Label>
              <Input 
                id="refreshInterval"
                type="number"
                value={settings.refreshInterval}
                onChange={(e) => setSettings({...settings, refreshInterval: parseInt(e.target.value)})}
                data-testid="input-refresh-interval"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Real-Time Updates</Label>
                <p className="text-sm text-muted-foreground">Enable WebSocket connections for live data</p>
              </div>
              <Switch 
                checked={settings.enableRealTimeUpdates}
                onCheckedChange={(checked) => setSettings({...settings, enableRealTimeUpdates: checked})}
                data-testid="switch-realtime-updates"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure alert and notification delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send critical alerts via email</p>
            </div>
            <Switch 
              checked={settings.enableEmailNotifications}
              onCheckedChange={(checked) => setSettings({...settings, enableEmailNotifications: checked})}
              data-testid="switch-email-notifications"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Slack Notifications</Label>
              <p className="text-sm text-muted-foreground">Post alerts to Slack channel</p>
            </div>
            <Switch 
              checked={settings.enableSlackNotifications}
              onCheckedChange={(checked) => setSettings({...settings, enableSlackNotifications: checked})}
              data-testid="switch-slack-notifications"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button data-testid="button-save-settings">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function UserManagement() {
  const { toast } = useToast();
  const [showAddUser, setShowAddUser] = useState(false);
  
  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: false,
  });

  const mockUsers: AdminUser[] = [
    {
      id: "1",
      email: "53947@triadblue.com",
      displayName: "Super Admin",
      role: "super_admin",
      linkblueAccess: true,
      consoleblueAccess: true,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  ];

  const displayUsers = users.length > 0 ? users : mockUsers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Admin Users</h3>
          <p className="text-sm text-muted-foreground">Manage access to LINKBlue and ConsoleBlue</p>
        </div>
        <Button onClick={() => setShowAddUser(true)} data-testid="button-add-user">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <table className="w-full">
              <thead className="border-b bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Access</th>
                  <th className="text-left p-4 font-medium">Last Login</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.map((user) => (
                  <tr key={user.id} className="border-b" data-testid={`row-user-${user.id}`}>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{user.displayName || user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                        {user.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {user.linkblueAccess && <Badge variant="outline" className="text-blue-500 border-blue-500">LINKBlue</Badge>}
                        {user.consoleblueAccess && <Badge variant="outline" className="text-green-500 border-green-500">ConsoleBlue</Badge>}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.lastLoginAt 
                        ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                        : "Never"
                      }
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="ghost" className="text-destructive" data-testid={`button-delete-user-${user.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const [settings, setSettings] = useState({
    sessionTimeout: 24,
    maxFailedAttempts: 5,
    lockoutDuration: 15,
    requireMfa: false,
    ipWhitelist: "",
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Authentication Settings
          </CardTitle>
          <CardDescription>Configure security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input 
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                data-testid="input-session-timeout"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxFailedAttempts">Max Failed Attempts</Label>
              <Input 
                id="maxFailedAttempts"
                type="number"
                value={settings.maxFailedAttempts}
                onChange={(e) => setSettings({...settings, maxFailedAttempts: parseInt(e.target.value)})}
                data-testid="input-max-attempts"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
              <Input 
                id="lockoutDuration"
                type="number"
                value={settings.lockoutDuration}
                onChange={(e) => setSettings({...settings, lockoutDuration: parseInt(e.target.value)})}
                data-testid="input-lockout-duration"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Multi-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Enforce MFA for all admin users</p>
            </div>
            <Switch 
              checked={settings.requireMfa}
              onCheckedChange={(checked) => setSettings({...settings, requireMfa: checked})}
              data-testid="switch-require-mfa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipWhitelist">IP Whitelist (comma-separated)</Label>
            <Input 
              id="ipWhitelist"
              placeholder="e.g., 192.168.1.1, 10.0.0.0/8"
              value={settings.ipWhitelist}
              onChange={(e) => setSettings({...settings, ipWhitelist: e.target.value})}
              data-testid="input-ip-whitelist"
            />
            <p className="text-xs text-muted-foreground">Leave empty to allow all IPs</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
          <CardDescription>Manage platform API keys for integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No API keys configured</p>
            <Button variant="outline" className="mt-4" data-testid="button-create-api-key">
              Create API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button data-testid="button-save-security">
          <Save className="w-4 h-4 mr-2" />
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}

function AuditLog() {
  const mockLogs: AuditLogEntry[] = [
    {
      id: "1",
      action: "user_login",
      userId: "1",
      userEmail: "53947@triadblue.com",
      details: "Successful login to LINKBlue Dashboard",
      ipAddress: "127.0.0.1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      action: "settings_update",
      userId: "1",
      userEmail: "53947@triadblue.com",
      details: "Updated notification settings",
      ipAddress: "127.0.0.1",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Audit Log</h3>
          <p className="text-sm text-muted-foreground">Track all administrative actions</p>
        </div>
        <Button variant="outline" data-testid="button-export-audit-log">
          Export Log
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {mockLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start gap-4" data-testid={`audit-log-${log.id}`}>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{log.action.replace("_", " ")}</Badge>
                      <span className="text-sm text-muted-foreground">{log.userEmail}</span>
                    </div>
                    {log.details && <p className="text-sm mt-1">{log.details}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LinkBlueSettings() {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-page-title">
          <Settings className="w-6 h-6 text-primary" />
          LINKBlue Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure platform settings, users, and security
        </p>
      </div>

      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platform" data-testid="tab-platform">Platform</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <PlatformSettings />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}
