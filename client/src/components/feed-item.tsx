import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Calendar, GitCommit, MessageSquare, CheckCircle2, Circle, Clock, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Task, Conversation, GithubActivity } from "@shared/schema";

interface TaskFeedItemProps {
  task: Task & { projectName?: string; projectColor?: string };
}

export function TaskFeedItem({ task }: TaskFeedItemProps) {
  const statusIcons = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle2,
    cancelled: Circle,
  };

  const StatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Circle;

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    high: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    urgent: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  };

  return (
    <Card className="p-4 hover-elevate" data-testid={`task-${task.id}`}>
      <div className="flex items-start gap-3">
        <StatusIcon className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {task.projectColor && (
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: task.projectColor }}
              />
            )}
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1">{task.title}</h3>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {task.projectName && (
              <Badge variant="outline" className="text-xs">
                {task.projectName}
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}
            >
              {task.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {task.source}
            </Badge>
            {task.syncEnabled && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        task.syncStatus === "success" ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" :
                        task.syncStatus === "syncing" ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
                        task.syncStatus === "failed" ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" :
                        ""
                      }`}
                      data-testid="badge-sync-status"
                    >
                      {task.syncStatus === "success" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {task.syncStatus === "syncing" && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                      {task.syncStatus === "failed" && <AlertCircle className="w-3 h-3 mr-1" />}
                      {task.syncStatus || "idle"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div>Sync: {task.syncStatus}</div>
                      {task.syncUrl && <div className="truncate max-w-xs">URL: {task.syncUrl}</div>}
                      {task.lastSyncAt && <div>Last: {formatDistanceToNow(new Date(task.lastSyncAt), { addSuffix: true })}</div>}
                      {task.syncError && <div className="text-red-400">Error: {task.syncError}</div>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ConversationFeedItemProps {
  conversation: Conversation & { projectName?: string; projectColor?: string };
}

export function ConversationFeedItem({ conversation }: ConversationFeedItemProps) {
  return (
    <Card className="p-4 hover-elevate" data-testid={`conversation-${conversation.id}`}>
      <div className="flex items-start gap-3">
        <MessageSquare className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {conversation.projectColor && (
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: conversation.projectColor }}
              />
            )}
            <h3 className="text-sm font-medium">{conversation.title}</h3>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
            {conversation.content.substring(0, 200)}...
          </p>

          {conversation.extractedItems && conversation.extractedItems.length > 0 && (
            <div className="mb-3 p-2 rounded-md bg-accent/50 border border-accent-border">
              <p className="text-xs font-medium mb-1">Extracted Action Items:</p>
              <ul className="space-y-1">
                {conversation.extractedItems.map((item, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {conversation.projectName && (
              <Badge variant="outline" className="text-xs">
                {conversation.projectName}
              </Badge>
            )}
            {conversation.agentName && (
              <Badge variant="outline" className="text-xs">
                Agent: {conversation.agentName}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface GithubFeedItemProps {
  activity: GithubActivity & { projectName?: string; projectColor?: string };
}

export function GithubFeedItem({ activity }: GithubFeedItemProps) {
  return (
    <Card className="p-4 hover-elevate" data-testid={`github-${activity.id}`}>
      <div className="flex items-start gap-3">
        <GitCommit className="w-4 h-4 mt-1 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {activity.projectColor && (
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: activity.projectColor }}
              />
            )}
            <code className="text-xs font-mono text-muted-foreground">
              {activity.commitSha?.substring(0, 7)}
            </code>
            <span className="text-xs text-muted-foreground">•</span>
            <Avatar className="w-4 h-4">
              <AvatarFallback className="text-[8px]">
                {activity.author.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {activity.author}
            </span>
          </div>
          
          <p className="text-sm mb-2">{activity.commitMessage}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {activity.projectName && (
              <Badge variant="outline" className="text-xs">
                {activity.projectName}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs font-mono">
              {activity.repository}
            </Badge>
            {activity.fileChanges && (
              <span className="text-xs text-muted-foreground">
                {activity.fileChanges} file{activity.fileChanges !== 1 ? 's' : ''} changed
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
