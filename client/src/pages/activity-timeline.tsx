import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Calendar, MessageSquare, GitCommit, Bot, CheckCircle2, Circle, Clock, RefreshCw } from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from "date-fns";
import type { Project } from "@shared/schema";

interface ActivityItem {
  id: string;
  type: 'task' | 'conversation' | 'github' | 'agent_message';
  projectId: string | null;
  projectName?: string;
  projectColor?: string;
  title: string;
  description?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface ActivityResponse {
  activities: ActivityItem[];
  total: number;
}

export default function ActivityTimeline() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // Fetch projects for filter dropdown
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Build query string for activities
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.append("type", typeFilter);
    if (projectFilter !== "all") params.append("projectId", projectFilter);
    if (search) params.append("search", search);
    params.append("limit", "100");
    const queryString = params.toString();
    return queryString ? `/api/activities?${queryString}` : "/api/activities";
  };

  // Fetch activities
  const { data: activityData, isLoading } = useQuery<ActivityResponse>({
    queryKey: [buildQueryString()],
  });

  const activities = activityData?.activities || [];

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.createdAt);
    let groupKey: string;

    if (isToday(date)) {
      groupKey = "Today";
    } else if (isYesterday(date)) {
      groupKey = "Yesterday";
    } else if (isThisWeek(date)) {
      groupKey = format(date, "EEEE");
    } else {
      groupKey = format(date, "MMMM d, yyyy");
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return Circle;
      case 'conversation': return MessageSquare;
      case 'github': return GitCommit;
      case 'agent_message': return Bot;
      default: return Circle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task': return "text-primary";
      case 'conversation': return "text-purple-600 dark:text-purple-400";
      case 'github': return "text-green-600 dark:text-green-400";
      case 'agent_message': return "text-blue-600 dark:text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  const renderActivityMetadata = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'task':
        return (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge variant="outline" className="text-xs">
              {activity.metadata.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {activity.metadata.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {activity.metadata.source}
            </Badge>
            {activity.metadata.syncStatus && activity.metadata.syncStatus !== 'idle' && (
              <Badge variant="outline" className="text-xs">
                sync: {activity.metadata.syncStatus}
              </Badge>
            )}
          </div>
        );
      case 'conversation':
        return activity.metadata.agentName ? (
          <Badge variant="outline" className="text-xs mt-2">
            Agent: {activity.metadata.agentName}
          </Badge>
        ) : null;
      case 'github':
        return (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
              {activity.metadata.commitSha?.substring(0, 7)}
            </code>
            {activity.metadata.fileChanges && (
              <span className="text-xs text-muted-foreground">
                {activity.metadata.fileChanges} file{activity.metadata.fileChanges !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        );
      case 'agent_message':
        return (
          <Badge variant="outline" className="text-xs mt-2">
            {activity.metadata.role === 'user' ? 'You' : activity.metadata.connectionName}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-timeline-title">Activity Timeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              All activity across your projects
            </p>
          </div>
          {activityData && (
            <div className="text-sm text-muted-foreground">
              {activityData.total} activities
            </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-activities"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-type-filter">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="conversation">Conversations</SelectItem>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="agent_message">Agent Messages</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-project-filter">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : Object.keys(groupedActivities).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activities found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-muted-foreground">{date}</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-3">
                  {dateActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const iconColor = getActivityColor(activity.type);

                    return (
                      <Card 
                        key={activity.id} 
                        className="hover-elevate"
                        data-testid={`activity-${activity.type}-${activity.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon className={`w-4 h-4 mt-1 flex-shrink-0 ${iconColor}`} />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1">
                                {activity.projectColor && (
                                  <div
                                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                    style={{ backgroundColor: activity.projectColor }}
                                  />
                                )}
                                <div className="flex-1">
                                  <h3 className="text-sm font-medium">{activity.title}</h3>
                                  {activity.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                      {activity.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {activity.projectName && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.projectName}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </span>
                              </div>

                              {renderActivityMetadata(activity)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
