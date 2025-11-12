// Referenced from javascript_database blueprint
import {
  users,
  projects,
  apiKeys,
  tasks,
  conversations,
  githubActivity,
  projectPermissions,
  webhooks,
  agentConnections,
  agentChatMessages,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type ApiKey,
  type InsertApiKey,
  type Task,
  type InsertTask,
  type Conversation,
  type InsertConversation,
  type GithubActivity,
  type InsertGithubActivity,
  type ProjectPermission,
  type InsertProjectPermission,
  type Webhook,
  type InsertWebhook,
  type AgentConnection,
  type InsertAgentConnection,
  type AgentChatMessage,
  type InsertAgentChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;

  // API Keys
  getApiKeys(projectId: string): Promise<ApiKey[]>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKeyLastUsed(id: string): Promise<void>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTasksByProject(projectId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversationExtraction(id: string, items: string[]): Promise<void>;

  // GitHub Activity
  getGithubActivity(): Promise<GithubActivity[]>;
  getGithubActivityByProject(projectId: string): Promise<GithubActivity[]>;
  createGithubActivity(activity: InsertGithubActivity): Promise<GithubActivity>;
  bulkCreateGithubActivity(activities: InsertGithubActivity[]): Promise<GithubActivity[]>;
  getGithubActivityBySha(projectId: string, sha: string): Promise<GithubActivity | undefined>;

  // Project Permissions
  getProjectPermissions(userId: string): Promise<ProjectPermission[]>;
  createProjectPermission(permission: InsertProjectPermission): Promise<ProjectPermission>;

  // Webhooks
  getWebhooks(projectId: string): Promise<Webhook[]>;
  getWebhook(id: string): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: string, updates: Partial<InsertWebhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: string): Promise<void>;
  updateWebhookLastTriggered(id: string): Promise<void>;

  // Agent Connections
  getAgentConnections(projectId: string): Promise<AgentConnection[]>;
  getAgentConnection(id: string): Promise<AgentConnection | undefined>;
  createAgentConnection(connection: InsertAgentConnection): Promise<AgentConnection>;
  updateAgentConnection(id: string, updates: Partial<InsertAgentConnection>): Promise<AgentConnection | undefined>;
  deleteAgentConnection(id: string): Promise<void>;
  updateAgentConnectionLastMessage(id: string): Promise<void>;

  // Agent Chat Messages
  getAgentChatMessages(connectionId: string): Promise<AgentChatMessage[]>;
  createAgentChatMessage(message: InsertAgentChatMessage): Promise<AgentChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // API Keys
  async getApiKeys(projectId: string): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.projectId, projectId));
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey || undefined;
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db.insert(apiKeys).values(insertApiKey).returning();
    return apiKey;
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }

  async updateConversationExtraction(id: string, items: string[]): Promise<void> {
    await db
      .update(conversations)
      .set({ extractedItems: items, isProcessed: true })
      .where(eq(conversations.id, id));
  }

  // GitHub Activity
  async getGithubActivity(): Promise<GithubActivity[]> {
    return await db.select().from(githubActivity).orderBy(desc(githubActivity.createdAt));
  }

  async getGithubActivityByProject(projectId: string): Promise<GithubActivity[]> {
    return await db
      .select()
      .from(githubActivity)
      .where(eq(githubActivity.projectId, projectId))
      .orderBy(desc(githubActivity.createdAt));
  }

  async createGithubActivity(insertActivity: InsertGithubActivity): Promise<GithubActivity> {
    const [activity] = await db.insert(githubActivity).values(insertActivity).returning();
    return activity;
  }

  async bulkCreateGithubActivity(activities: InsertGithubActivity[]): Promise<GithubActivity[]> {
    if (activities.length === 0) return [];
    return await db.insert(githubActivity).values(activities).returning();
  }

  async getGithubActivityBySha(projectId: string, sha: string): Promise<GithubActivity | undefined> {
    const [activity] = await db
      .select()
      .from(githubActivity)
      .where(and(eq(githubActivity.projectId, projectId), eq(githubActivity.commitSha, sha)));
    return activity || undefined;
  }

  // Project Permissions
  async getProjectPermissions(userId: string): Promise<ProjectPermission[]> {
    return await db.select().from(projectPermissions).where(eq(projectPermissions.userId, userId));
  }

  async createProjectPermission(insertPermission: InsertProjectPermission): Promise<ProjectPermission> {
    const [permission] = await db.insert(projectPermissions).values(insertPermission).returning();
    return permission;
  }

  // Webhooks
  async getWebhooks(projectId: string): Promise<Webhook[]> {
    return await db.select().from(webhooks).where(eq(webhooks.projectId, projectId)).orderBy(desc(webhooks.createdAt));
  }

  async getWebhook(id: string): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook || undefined;
  }

  async createWebhook(insertWebhook: InsertWebhook): Promise<Webhook> {
    const [webhook] = await db.insert(webhooks).values(insertWebhook).returning();
    return webhook;
  }

  async updateWebhook(id: string, updates: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    const [webhook] = await db
      .update(webhooks)
      .set(updates)
      .where(eq(webhooks.id, id))
      .returning();
    return webhook || undefined;
  }

  async deleteWebhook(id: string): Promise<void> {
    await db.delete(webhooks).where(eq(webhooks.id, id));
  }

  async updateWebhookLastTriggered(id: string): Promise<void> {
    await db
      .update(webhooks)
      .set({ lastTriggeredAt: new Date() })
      .where(eq(webhooks.id, id));
  }

  // Agent Connections
  async getAgentConnections(projectId: string): Promise<AgentConnection[]> {
    return await db.select().from(agentConnections).where(eq(agentConnections.projectId, projectId)).orderBy(desc(agentConnections.createdAt));
  }

  async getAgentConnection(id: string): Promise<AgentConnection | undefined> {
    const [connection] = await db.select().from(agentConnections).where(eq(agentConnections.id, id));
    return connection || undefined;
  }

  async createAgentConnection(insertConnection: InsertAgentConnection): Promise<AgentConnection> {
    const [connection] = await db.insert(agentConnections).values(insertConnection).returning();
    return connection;
  }

  async updateAgentConnection(id: string, updates: Partial<InsertAgentConnection>): Promise<AgentConnection | undefined> {
    const [connection] = await db
      .update(agentConnections)
      .set(updates)
      .where(eq(agentConnections.id, id))
      .returning();
    return connection || undefined;
  }

  async deleteAgentConnection(id: string): Promise<void> {
    await db.delete(agentConnections).where(eq(agentConnections.id, id));
  }

  async updateAgentConnectionLastMessage(id: string): Promise<void> {
    await db
      .update(agentConnections)
      .set({ lastMessageAt: new Date() })
      .where(eq(agentConnections.id, id));
  }

  // Agent Chat Messages
  async getAgentChatMessages(connectionId: string): Promise<AgentChatMessage[]> {
    return await db
      .select()
      .from(agentChatMessages)
      .where(eq(agentChatMessages.connectionId, connectionId))
      .orderBy(agentChatMessages.createdAt);
  }

  async createAgentChatMessage(insertMessage: InsertAgentChatMessage): Promise<AgentChatMessage> {
    const [message] = await db.insert(agentChatMessages).values(insertMessage).returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
