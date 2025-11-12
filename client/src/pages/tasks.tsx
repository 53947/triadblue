import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/filter-bar";
import { TaskFeedItem } from "@/components/feed-item";
import { EmptyState } from "@/components/empty-state";
import { FeedItemSkeleton } from "@/components/loading-skeleton";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task, Project } from "@shared/schema";
import { ListTodo } from "lucide-react";

export default function Tasks() {
  const { toast } = useToast();
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const isLoading = projectsLoading || tasksLoading;

  const tasksWithProject = tasks.map(task => {
    const project = projects.find(p => p.id === task.projectId);
    return {
      ...task,
      projectName: project?.name,
      projectColor: project?.color
    };
  });

  const filteredTasks = tasksWithProject.filter(task => {
    if (projectFilter !== "all" && task.projectId !== projectFilter) return false;
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    return true;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    const aDate = new Date(a.createdAt);
    const bDate = new Date(b.createdAt);
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

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your tasks across projects
          </p>
        </div>
        <Button onClick={() => setShowTaskModal(true)} data-testid="button-create-task">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <FilterBar
        sourceFilter="all"
        onSourceFilterChange={() => {}}
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
        ) : sortedTasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="No tasks found"
            description="Create your first task to get started"
          />
        ) : (
          sortedTasks.map((task) => (
            <TaskFeedItem key={task.id} task={task} />
          ))
        )}
      </div>

      <CreateTaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        projects={projects}
      />
    </div>
  );
}
