import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Settings, Key, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  taskCount?: number;
  onManage?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({ project, taskCount = 0, onManage, onDelete }: ProjectCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`project-card-${project.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: project.color }}
          >
            <FolderKanban className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold mb-1 truncate">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">{taskCount}</span>
            <span>task{taskCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Updated</span>
            <span className="font-medium text-foreground">
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2">
        {onManage && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onManage}
            data-testid={`button-manage-${project.id}`}
          >
            <Settings className="w-3 h-3 mr-2" />
            Manage
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            data-testid={`button-delete-${project.id}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
