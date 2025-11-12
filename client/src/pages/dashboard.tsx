import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/filter-bar";
import { TaskFeedItem, ConversationFeedItem, GithubFeedItem } from "@/components/feed-item";
import { EmptyState } from "@/components/empty-state";
import { FeedItemSkeleton } from "@/components/loading-skeleton";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { LogConversationModal } from "@/components/modals/log-conversation-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task, Conversation, GithubActivity, Project } from "@shared/schema";
import { Inbox } from "lucide-react";
import triadBlueLogo from "@assets/Triad Blue Lockup_1762915681863.png";

type FeedItem = 
  | { type: 'task'; data: Task & { projectName?: string; projectColor?: string } }
  | { type: 'conversation'; data: Conversation & { projectName?: string; projectColor?: string } }
  | { type: 'github'; data: GithubActivity & { projectName?: string; projectColor?: string } };

export default function Dashboard() {
  const { toast } = useToast();
  const [sourceFilter, setSourceFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: githubActivity = [], isLoading: githubLoading } = useQuery<GithubActivity[]>({
    queryKey: ["/api/github-activity"],
  });

  const isLoading = projectsLoading || tasksLoading || conversationsLoading || githubLoading;

  // Create feed items with project information
  const feedItems: FeedItem[] = [
    ...tasks.map(task => {
      const project = projects.find(p => p.id === task.projectId);
      return {
        type: 'task' as const,
        data: { ...task, projectName: project?.name, projectColor: project?.color }
      };
    }),
    ...conversations.map(conversation => {
      const project = conversation.projectId ? projects.find(p => p.id === conversation.projectId) : undefined;
      return {
        type: 'conversation' as const,
        data: { ...conversation, projectName: project?.name, projectColor: project?.color }
      };
    }),
    ...githubActivity.map(activity => {
      const project = projects.find(p => p.id === activity.projectId);
      return {
        type: 'github' as const,
        data: { ...activity, projectName: project?.name, projectColor: project?.color }
      };
    }),
  ];

  // Filter feed items
  const filteredItems = feedItems.filter(item => {
    if (sourceFilter !== "all" && item.type !== sourceFilter) return false;
    
    if (item.type === 'task') {
      const task = item.data as Task;
      if (projectFilter !== "all" && task.projectId !== projectFilter) return false;
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    } else if (item.type === 'conversation') {
      const conv = item.data as Conversation;
      if (projectFilter !== "all" && conv.projectId !== projectFilter) return false;
    } else if (item.type === 'github') {
      const gh = item.data as GithubActivity;
      if (projectFilter !== "all" && gh.projectId !== projectFilter) return false;
    }
    
    return true;
  });

  // Sort by creation date
  const sortedItems = filteredItems.sort((a, b) => {
    const aDate = new Date(a.data.createdAt);
    const bDate = new Date(b.data.createdAt);
    return bDate.getTime() - aDate.getTime();
  });

  const handleCreateTask = async (data: any) => {
    try {
      await apiRequest("POST", "/api/tasks", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setShowTaskModal(false);
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogConversation = async (data: any) => {
    try {
      await apiRequest("POST", "/api/conversations", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setShowConversationModal(false);
      toast({
        title: "Conversation logged",
        description: "Your conversation has been logged. AI extraction will run shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowConversationModal(true)} variant="outline" data-testid="button-log-conversation">
            <Plus className="w-4 h-4 mr-2" />
            Log Conversation
          </Button>
          <Button onClick={() => setShowTaskModal(true)} data-testid="button-create-task">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <FilterBar
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        projects={projects}
      />

      <div className="space-y-3">
        {isLoading ? (
          <>
            <FeedItemSkeleton />
            <FeedItemSkeleton />
            <FeedItemSkeleton />
          </>
        ) : sortedItems.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No items found"
            description="Create a task or log a conversation to get started."
            actionLabel="Create Task"
            onAction={() => setShowTaskModal(true)}
          />
        ) : (
          sortedItems.map((item, idx) => (
            <div key={`${item.type}-${item.data.id}-${idx}`}>
              {item.type === 'task' && <TaskFeedItem task={item.data as any} />}
              {item.type === 'conversation' && <ConversationFeedItem conversation={item.data as any} />}
              {item.type === 'github' && <GithubFeedItem activity={item.data as any} />}
            </div>
          ))
        )}
      </div>

      <CreateTaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        projects={projects}
      />

      <LogConversationModal
        open={showConversationModal}
        onClose={() => setShowConversationModal(false)}
        onSubmit={handleLogConversation}
        projects={projects}
      />
    </div>
  );
}
