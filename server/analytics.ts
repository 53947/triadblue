import { db } from "./db";
import { tasks, conversations, githubActivity, agentChatMessages, projects } from "@shared/schema";
import { sql, and, gte, lte, count, eq, SQL } from "drizzle-orm";

export interface AnalyticsSummary {
  overview: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completionRate: number;
    totalConversations: number;
    totalGithubCommits: number;
    totalAgentMessages: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  tasksByStatus: {
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  tasksByProject: Array<{
    projectId: string;
    projectName: string;
    projectColor: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
  tasksBySource: {
    manual: number;
    conversation: number;
    github: number;
    api: number;
  };
  timeSeriesData: {
    date: string;
    tasksCreated: number;
    tasksCompleted: number;
    conversations: number;
    githubCommits: number;
  }[];
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export class AnalyticsService {
  async getAnalyticsSummary(filters: DateRangeFilter = {}): Promise<AnalyticsSummary> {
    const { startDate, endDate } = filters;

    // Get all tasks with optional date filter
    let allTasks;
    if (startDate && endDate) {
      allTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            gte(tasks.createdAt, startDate),
            lte(tasks.createdAt, endDate)
          )
        );
    } else {
      allTasks = await db.select().from(tasks);
    }

    // Calculate task statistics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === "completed").length;
    const pendingTasks = allTasks.filter((t) => t.status === "pending").length;
    const inProgressTasks = allTasks.filter((t) => t.status === "in_progress").length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Tasks by priority
    const tasksByPriority = {
      low: allTasks.filter((t) => t.priority === "low").length,
      medium: allTasks.filter((t) => t.priority === "medium").length,
      high: allTasks.filter((t) => t.priority === "high").length,
      urgent: allTasks.filter((t) => t.priority === "urgent").length,
    };

    // Tasks by status
    const tasksByStatus = {
      pending: pendingTasks,
      in_progress: inProgressTasks,
      completed: completedTasks,
      cancelled: allTasks.filter((t) => t.status === "cancelled").length,
    };

    // Tasks by source
    const tasksBySource = {
      manual: allTasks.filter((t) => t.source === "manual").length,
      conversation: allTasks.filter((t) => t.source === "conversation").length,
      github: allTasks.filter((t) => t.source === "github").length,
      api: allTasks.filter((t) => t.source === "api").length,
    };

    // Get all projects
    const allProjects = await db.select().from(projects);

    // Tasks by project
    const tasksByProject = allProjects.map((project) => {
      const projectTasks = allTasks.filter((t) => t.projectId === project.id);
      const projectCompletedTasks = projectTasks.filter((t) => t.status === "completed").length;
      return {
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color,
        totalTasks: projectTasks.length,
        completedTasks: projectCompletedTasks,
        completionRate: projectTasks.length > 0 ? (projectCompletedTasks / projectTasks.length) * 100 : 0,
      };
    });

    // Get conversation count
    let allConversations;
    if (startDate && endDate) {
      allConversations = await db
        .select()
        .from(conversations)
        .where(
          and(
            gte(conversations.createdAt, startDate),
            lte(conversations.createdAt, endDate)
          )
        );
    } else {
      allConversations = await db.select().from(conversations);
    }
    const totalConversations = allConversations.length;

    // Get GitHub activity count
    let allGithubCommits;
    if (startDate && endDate) {
      allGithubCommits = await db
        .select()
        .from(githubActivity)
        .where(
          and(
            gte(githubActivity.createdAt, startDate),
            lte(githubActivity.createdAt, endDate)
          )
        );
    } else {
      allGithubCommits = await db.select().from(githubActivity);
    }
    const totalGithubCommits = allGithubCommits.length;

    // Get agent message count
    let allAgentMessages;
    if (startDate && endDate) {
      allAgentMessages = await db
        .select()
        .from(agentChatMessages)
        .where(
          and(
            gte(agentChatMessages.createdAt, startDate),
            lte(agentChatMessages.createdAt, endDate)
          )
        );
    } else {
      allAgentMessages = await db.select().from(agentChatMessages);
    }
    const totalAgentMessages = allAgentMessages.length;

    // Time series data (last 30 days or custom range)
    const timeSeriesData = await this.getTimeSeriesData(startDate, endDate);

    return {
      overview: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        completionRate: Math.round(completionRate * 10) / 10,
        totalConversations,
        totalGithubCommits,
        totalAgentMessages,
      },
      tasksByPriority,
      tasksByStatus,
      tasksByProject,
      tasksBySource,
      timeSeriesData,
    };
  }

  private async getTimeSeriesData(startDate?: Date, endDate?: Date): Promise<AnalyticsSummary["timeSeriesData"]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // Generate date range
    const dates: string[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fetch data for each date
    const timeSeriesData = await Promise.all(
      dates.map(async (date) => {
        const dayStart = new Date(date);
        const dayEnd = new Date(date);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const [tasksCreatedData, tasksCompletedData, conversationsData, githubCommitsData] = await Promise.all([
          db
            .select({ count: count() })
            .from(tasks)
            .where(and(gte(tasks.createdAt, dayStart), lte(tasks.createdAt, dayEnd))),
          db
            .select({ count: count() })
            .from(tasks)
            .where(
              and(
                eq(tasks.status, "completed"),
                gte(tasks.updatedAt, dayStart),
                lte(tasks.updatedAt, dayEnd)
              )
            ),
          db
            .select({ count: count() })
            .from(conversations)
            .where(
              and(gte(conversations.createdAt, dayStart), lte(conversations.createdAt, dayEnd))
            ),
          db
            .select({ count: count() })
            .from(githubActivity)
            .where(
              and(
                gte(githubActivity.createdAt, dayStart),
                lte(githubActivity.createdAt, dayEnd)
              )
            ),
        ]);

        return {
          date,
          tasksCreated: tasksCreatedData[0]?.count || 0,
          tasksCompleted: tasksCompletedData[0]?.count || 0,
          conversations: conversationsData[0]?.count || 0,
          githubCommits: githubCommitsData[0]?.count || 0,
        };
      })
    );

    return timeSeriesData;
  }

  async exportAnalytics(format: "json" | "csv", filters: DateRangeFilter = {}): Promise<string> {
    const analytics = await this.getAnalyticsSummary(filters);

    if (format === "json") {
      return JSON.stringify(analytics, null, 2);
    }

    // CSV format
    const csv: string[] = [];
    csv.push("Analytics Report");
    csv.push("");
    csv.push("Overview");
    csv.push("Metric,Value");
    csv.push(`Total Tasks,${analytics.overview.totalTasks}`);
    csv.push(`Completed Tasks,${analytics.overview.completedTasks}`);
    csv.push(`Pending Tasks,${analytics.overview.pendingTasks}`);
    csv.push(`In Progress Tasks,${analytics.overview.inProgressTasks}`);
    csv.push(`Completion Rate,${analytics.overview.completionRate}%`);
    csv.push(`Total Conversations,${analytics.overview.totalConversations}`);
    csv.push(`Total GitHub Commits,${analytics.overview.totalGithubCommits}`);
    csv.push(`Total Agent Messages,${analytics.overview.totalAgentMessages}`);
    csv.push("");
    csv.push("Tasks by Priority");
    csv.push("Priority,Count");
    csv.push(`Low,${analytics.tasksByPriority.low}`);
    csv.push(`Medium,${analytics.tasksByPriority.medium}`);
    csv.push(`High,${analytics.tasksByPriority.high}`);
    csv.push(`Urgent,${analytics.tasksByPriority.urgent}`);
    csv.push("");
    csv.push("Tasks by Project");
    csv.push("Project,Total Tasks,Completed,Completion Rate");
    analytics.tasksByProject.forEach((p) => {
      csv.push(`${p.projectName},${p.totalTasks},${p.completedTasks},${p.completionRate.toFixed(1)}%`);
    });
    csv.push("");
    csv.push("Time Series");
    csv.push("Date,Tasks Created,Tasks Completed,Conversations,GitHub Commits");
    analytics.timeSeriesData.forEach((d) => {
      csv.push(`${d.date},${d.tasksCreated},${d.tasksCompleted},${d.conversations},${d.githubCommits}`);
    });

    return csv.join("\n");
  }
}

export const analyticsService = new AnalyticsService();
