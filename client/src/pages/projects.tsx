import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { ProjectCardSkeleton } from "@/components/loading-skeleton";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FolderKanban } from "lucide-react";
import type { Project, Task } from "@shared/schema";
import { useLocation } from "wouter";

export default function Projects() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const isLoading = projectsLoading || tasksLoading;

  const getTaskCount = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId).length;
  };

  const handleCreateProject = async (data: any) => {
    try {
      await apiRequest("POST", "/api/projects", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowCreateModal(false);
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? All associated data will be removed.")) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/projects/${projectId}`, {});
      await queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "The project has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your Replit projects and their API integrations
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} data-testid="button-create-project">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start tracking tasks and integrating with your Replit apps."
          actionLabel="Create Project"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              taskCount={getTaskCount(project.id)}
              onManage={() => setLocation(`/project/${project.id}`)}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
