import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Github, ArrowRight } from "lucide-react";

interface ProjectEmailConfig {
  projectName: string;
  emailAddress: string;
  githubOwner: string;
  githubRepo: string;
}

const DEFAULT_CONFIGS: ProjectEmailConfig[] = [
  {
    projectName: "List It",
    emailAddress: "listit@agentmail.triadblue.com",
    githubOwner: "",
    githubRepo: "",
  },
  {
    projectName: "BusinessBlueprint",
    emailAddress: "businessblueprint@agentmail.triadblue.com",
    githubOwner: "",
    githubRepo: "",
  },
  {
    projectName: "HostsBlue",
    emailAddress: "hostsblue@agentmail.triadblue.com",
    githubOwner: "",
    githubRepo: "",
  },
  {
    projectName: "SwipesBlue",
    emailAddress: "swipesblue@agentmail.triadblue.com",
    githubOwner: "",
    githubRepo: "",
  },
];

export default function EmailGitHubConfig() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ProjectEmailConfig[]>(DEFAULT_CONFIGS);

  const handleUpdate = (index: number, field: 'githubOwner' | 'githubRepo', value: string) => {
    const newConfigs = [...configs];
    newConfigs[index][field] = value;
    setConfigs(newConfigs);
  };

  const handleSave = () => {
    // TODO: Save to backend
    toast({
      title: "Configuration saved",
      description: "Email-to-GitHub mappings have been updated",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Email & GitHub Integration</h1>
            <p className="text-sm text-muted-foreground">
              Configure agent email addresses and GitHub issue tracking
            </p>
          </div>
          <Button onClick={handleSave} data-testid="button-save-config">
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Each project agent has a dedicated email address. When you send emails to these addresses,
                the conversations are automatically documented as GitHub issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span>Agent Processes</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <span>GitHub Issue Created</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {configs.map((config, index) => (
            <Card key={config.projectName}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{config.projectName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3" />
                      {config.emailAddress}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`owner-${index}`}>GitHub Owner</Label>
                    <Input
                      id={`owner-${index}`}
                      value={config.githubOwner}
                      onChange={(e) => handleUpdate(index, 'githubOwner', e.target.value)}
                      placeholder="username or organization"
                      data-testid={`input-github-owner-${config.projectName.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`repo-${index}`}>Repository Name</Label>
                    <Input
                      id={`repo-${index}`}
                      value={config.githubRepo}
                      onChange={(e) => handleUpdate(index, 'githubRepo', e.target.value)}
                      placeholder="repository-name"
                      data-testid={`input-github-repo-${config.projectName.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                  </div>
                </div>
                {config.githubOwner && config.githubRepo && (
                  <div className="text-sm text-muted-foreground">
                    Issues will be created in: <code className="bg-muted px-1 rounded">{config.githubOwner}/{config.githubRepo}</code>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
