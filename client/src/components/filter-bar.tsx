import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter } from "lucide-react";
import type { Project } from "@shared/schema";

interface FilterBarProps {
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  projectFilter: string;
  onProjectFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  projects?: Project[];
}

export function FilterBar({
  sourceFilter,
  onSourceFilterChange,
  projectFilter,
  onProjectFilterChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  projects = [],
}: FilterBarProps) {
  const activeFilters = [
    sourceFilter !== "all" && { type: "source", value: sourceFilter },
    projectFilter !== "all" && { type: "project", value: projectFilter },
    statusFilter !== "all" && { type: "status", value: statusFilter },
    priorityFilter !== "all" && { type: "priority", value: priorityFilter },
  ].filter(Boolean);

  const clearFilter = (type: string) => {
    switch (type) {
      case "source":
        onSourceFilterChange("all");
        break;
      case "project":
        onProjectFilterChange("all");
        break;
      case "status":
        onStatusFilterChange("all");
        break;
      case "priority":
        onPriorityFilterChange("all");
        break;
    }
  };

  const clearAllFilters = () => {
    onSourceFilterChange("all");
    onProjectFilterChange("all");
    onStatusFilterChange("all");
    onPriorityFilterChange("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={sourceFilter === "all" ? "secondary" : "default"}
            size="sm"
            onClick={() => onSourceFilterChange("all")}
            data-testid="filter-all"
          >
            All
          </Button>
          <Button
            variant={sourceFilter === "task" ? "default" : "secondary"}
            size="sm"
            onClick={() => onSourceFilterChange("task")}
            data-testid="filter-tasks"
          >
            Tasks
          </Button>
          <Button
            variant={sourceFilter === "conversation" ? "default" : "secondary"}
            size="sm"
            onClick={() => onSourceFilterChange("conversation")}
            data-testid="filter-conversations"
          >
            Conversations
          </Button>
          <Button
            variant={sourceFilter === "github" ? "default" : "secondary"}
            size="sm"
            onClick={() => onSourceFilterChange("github")}
            data-testid="filter-github"
          >
            GitHub
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={projectFilter} onValueChange={onProjectFilterChange}>
            <SelectTrigger className="w-40" data-testid="select-project-filter">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
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

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-32" data-testid="select-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-32" data-testid="select-priority-filter">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter: any) => (
            <Badge
              key={filter.type}
              variant="secondary"
              className="gap-1"
              data-testid={`active-filter-${filter.type}`}
            >
              {filter.type}: {filter.value}
              <button
                onClick={() => clearFilter(filter.type)}
                className="hover:text-foreground"
                data-testid={`clear-filter-${filter.type}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs"
            data-testid="button-clear-all-filters"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
