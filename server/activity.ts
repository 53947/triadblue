import { db } from "./db";
import { tasks, conversations, githubActivity, agentChatMessages, projects, agentConnections } from "@shared/schema";
import { desc, and, eq, or, like, gte, lte, sql } from "drizzle-orm";

export interface ActivityItem {
  id: string;
  type: 'task' | 'conversation' | 'github' | 'agent_message';
  projectId: string | null;
  projectName?: string;
  projectColor?: string;
  title: string;
  description?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface ActivityFilters {
  projectId?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class ActivityService {
  async getActivities(filters: ActivityFilters = {}): Promise<{ activities: ActivityItem[], total: number }> {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    // Build unified activity query by combining all sources
    const allActivities: ActivityItem[] = [];

    // Fetch tasks
    if (!filters.type || filters.type === 'task') {
      const taskQuery = db
        .select({
          id: tasks.id,
          projectId: tasks.projectId,
          projectName: projects.name,
          projectColor: projects.color,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          source: tasks.source,
          syncStatus: tasks.syncStatus,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id));

      // Apply filters
      const conditions = [];
      if (filters.projectId) conditions.push(eq(tasks.projectId, filters.projectId));
      if (filters.search) conditions.push(or(
        like(tasks.title, `%${filters.search}%`),
        like(tasks.description, `%${filters.search}%`)
      ));
      if (filters.startDate) conditions.push(gte(tasks.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(tasks.createdAt, new Date(filters.endDate)));

      const taskResults = conditions.length > 0 
        ? await taskQuery.where(and(...conditions))
        : await taskQuery;

      allActivities.push(...taskResults.map(t => ({
        id: t.id,
        type: 'task' as const,
        projectId: t.projectId,
        projectName: t.projectName || undefined,
        projectColor: t.projectColor || undefined,
        title: t.title,
        description: t.description || undefined,
        metadata: {
          status: t.status,
          priority: t.priority,
          source: t.source,
          syncStatus: t.syncStatus,
          updatedAt: t.updatedAt,
        },
        createdAt: t.createdAt,
      })));
    }

    // Fetch conversations
    if (!filters.type || filters.type === 'conversation') {
      const convQuery = db
        .select({
          id: conversations.id,
          projectId: conversations.projectId,
          projectName: projects.name,
          projectColor: projects.color,
          title: conversations.title,
          content: conversations.content,
          agentName: conversations.agentName,
          extractedItems: conversations.extractedItems,
          createdAt: conversations.createdAt,
        })
        .from(conversations)
        .leftJoin(projects, eq(conversations.projectId, projects.id));

      const conditions = [];
      if (filters.projectId) conditions.push(eq(conversations.projectId, filters.projectId));
      if (filters.search) conditions.push(or(
        like(conversations.title, `%${filters.search}%`),
        like(conversations.content, `%${filters.search}%`)
      ));
      if (filters.startDate) conditions.push(gte(conversations.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(conversations.createdAt, new Date(filters.endDate)));

      const convResults = conditions.length > 0 
        ? await convQuery.where(and(...conditions))
        : await convQuery;

      allActivities.push(...convResults.map(c => ({
        id: c.id,
        type: 'conversation' as const,
        projectId: c.projectId,
        projectName: c.projectName || undefined,
        projectColor: c.projectColor || undefined,
        title: c.title,
        description: c.content.substring(0, 200),
        metadata: {
          agentName: c.agentName,
          extractedItems: c.extractedItems,
        },
        createdAt: c.createdAt,
      })));
    }

    // Fetch GitHub activity
    if (!filters.type || filters.type === 'github') {
      const githubQuery = db
        .select({
          id: githubActivity.id,
          projectId: githubActivity.projectId,
          projectName: projects.name,
          projectColor: projects.color,
          repository: githubActivity.repository,
          commitSha: githubActivity.commitSha,
          commitMessage: githubActivity.commitMessage,
          author: githubActivity.author,
          fileChanges: githubActivity.fileChanges,
          createdAt: githubActivity.createdAt,
        })
        .from(githubActivity)
        .leftJoin(projects, eq(githubActivity.projectId, projects.id));

      const conditions = [];
      if (filters.projectId) conditions.push(eq(githubActivity.projectId, filters.projectId));
      if (filters.search) conditions.push(or(
        like(githubActivity.commitMessage, `%${filters.search}%`),
        like(githubActivity.author, `%${filters.search}%`)
      ));
      if (filters.startDate) conditions.push(gte(githubActivity.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(githubActivity.createdAt, new Date(filters.endDate)));

      const githubResults = conditions.length > 0 
        ? await githubQuery.where(and(...conditions))
        : await githubQuery;

      allActivities.push(...githubResults.map(g => ({
        id: g.id,
        type: 'github' as const,
        projectId: g.projectId,
        projectName: g.projectName || undefined,
        projectColor: g.projectColor || undefined,
        title: g.commitMessage || 'Commit',
        description: `${g.author} • ${g.repository}`,
        metadata: {
          commitSha: g.commitSha,
          author: g.author,
          repository: g.repository,
          fileChanges: g.fileChanges,
        },
        createdAt: g.createdAt,
      })));
    }

    // Fetch agent messages
    if (!filters.type || filters.type === 'agent_message') {
      const agentQuery = db
        .select({
          id: agentChatMessages.id,
          connectionId: agentChatMessages.connectionId,
          role: agentChatMessages.role,
          content: agentChatMessages.content,
          createdAt: agentChatMessages.createdAt,
          connectionName: agentConnections.name,
          projectId: agentConnections.projectId,
          projectName: projects.name,
          projectColor: projects.color,
        })
        .from(agentChatMessages)
        .leftJoin(agentConnections, eq(agentChatMessages.connectionId, agentConnections.id))
        .leftJoin(projects, eq(agentConnections.projectId, projects.id));

      const conditions = [];
      if (filters.projectId) conditions.push(eq(agentConnections.projectId, filters.projectId));
      if (filters.search) conditions.push(like(agentChatMessages.content, `%${filters.search}%`));
      if (filters.startDate) conditions.push(gte(agentChatMessages.createdAt, new Date(filters.startDate)));
      if (filters.endDate) conditions.push(lte(agentChatMessages.createdAt, new Date(filters.endDate)));

      const agentResults = conditions.length > 0 
        ? await agentQuery.where(and(...conditions))
        : await agentQuery;

      allActivities.push(...agentResults.map(a => ({
        id: a.id,
        type: 'agent_message' as const,
        projectId: a.projectId,
        projectName: a.projectName || undefined,
        projectColor: a.projectColor || undefined,
        title: `${a.role === 'user' ? 'You' : a.connectionName}: ${a.content.substring(0, 50)}...`,
        description: a.content.substring(0, 200),
        metadata: {
          role: a.role,
          connectionName: a.connectionName,
        },
        createdAt: a.createdAt,
      })));
    }

    // Sort all activities by date (newest first)
    allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const total = allActivities.length;
    const paginatedActivities = allActivities.slice(offset, offset + limit);

    return {
      activities: paginatedActivities,
      total,
    };
  }
}

export const activityService = new ActivityService();
