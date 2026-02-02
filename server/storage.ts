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
  notifications,
  notificationPreferences,
  taskTemplates,
  conversationTemplates,
  documentationTemplates,
  projectDocumentationConfigs,
  projectDocumentationOutputs,
  assets,
  emailGithubConfigs,
  emailThreads,
  emailMessages,
  emailAttachments,
  sitePlannerNodes,
  sitePlannerEdges,
  projectRoutes,
  // LINKBlue tables
  linkbluePlatforms,
  linkbluePlatformHealth,
  linkbluePlatformIntegrations,
  linkblueClients,
  linkblueClientAccounts,
  linkblueAlerts,
  linkblueActivityFeed,
  linkblueIntegrationLogs,
  // Admin users
  adminUsers,
  adminSessions,
  passwordResetTokens,
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
  type Notification,
  type InsertNotification,
  type NotificationPreference,
  type InsertNotificationPreference,
  type TaskTemplate,
  type InsertTaskTemplate,
  type ConversationTemplate,
  type InsertConversationTemplate,
  type DocumentationTemplate,
  type InsertDocumentationTemplate,
  type ProjectDocumentationConfig,
  type InsertProjectDocumentationConfig,
  type ProjectDocumentationOutput,
  type InsertProjectDocumentationOutput,
  type Asset,
  type InsertAsset,
  type EmailGithubConfig,
  type InsertEmailGithubConfig,
  type EmailThread,
  type InsertEmailThread,
  type EmailMessage,
  type InsertEmailMessage,
  type EmailAttachment,
  type InsertEmailAttachment,
  type SitePlannerNode,
  type InsertSitePlannerNode,
  type SitePlannerEdge,
  type InsertSitePlannerEdge,
  type ProjectRoute,
  type InsertProjectRoute,
  // LINKBlue types
  type LinkbluePlatform,
  type InsertLinkbluePlatform,
  type LinkbluePlatformHealth,
  type InsertLinkbluePlatformHealth,
  type LinkbluePlatformIntegration,
  type InsertLinkbluePlatformIntegration,
  type LinkblueClient,
  type InsertLinkblueClient,
  type LinkblueClientAccount,
  type InsertLinkblueClientAccount,
  type LinkblueAlert,
  type InsertLinkblueAlert,
  type LinkblueActivityFeed,
  type InsertLinkblueActivityFeed,
  type LinkblueIntegrationLog,
  type InsertLinkblueIntegrationLog,
  type AdminUser,
  type InsertAdminUser,
  type AdminSession,
  type InsertAdminSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, isNull, or } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  ensureSystemAdminUser(): Promise<User>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject & { createdById: string }): Promise<Project>;
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

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  getNotification(id: string): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  deleteNotificationsOlderThan(cutoffDate: Date): Promise<number>;

  // Notification Preferences
  getNotificationPreferences(userId: string): Promise<NotificationPreference[]>;
  createNotificationPreference(preference: InsertNotificationPreference): Promise<NotificationPreference>;
  updateNotificationPreference(userId: string, type: string, enabled: boolean): Promise<void>;

  // Task Templates
  getTaskTemplates(projectId: string): Promise<TaskTemplate[]>;
  getTaskTemplate(id: string): Promise<TaskTemplate | undefined>;
  createTaskTemplate(template: InsertTaskTemplate & { createdById: string }): Promise<TaskTemplate>;
  updateTaskTemplate(id: string, updates: Partial<InsertTaskTemplate>): Promise<TaskTemplate | undefined>;
  deleteTaskTemplate(id: string): Promise<void>;

  // Conversation Templates
  getConversationTemplates(projectId: string | null): Promise<ConversationTemplate[]>;
  getConversationTemplate(id: string): Promise<ConversationTemplate | undefined>;
  createConversationTemplate(template: InsertConversationTemplate & { createdById: string }): Promise<ConversationTemplate>;
  updateConversationTemplate(id: string, updates: Partial<InsertConversationTemplate>): Promise<ConversationTemplate | undefined>;
  deleteConversationTemplate(id: string): Promise<void>;

  // Documentation Templates
  getDocumentationTemplates(): Promise<DocumentationTemplate[]>;
  getDocumentationTemplate(id: string): Promise<DocumentationTemplate | undefined>;
  createDocumentationTemplate(template: InsertDocumentationTemplate): Promise<DocumentationTemplate>;
  updateDocumentationTemplate(id: string, updates: Partial<InsertDocumentationTemplate>): Promise<DocumentationTemplate | undefined>;
  deleteDocumentationTemplate(id: string): Promise<void>;

  // Project Documentation Configs
  getProjectDocumentationConfigs(projectId: string): Promise<ProjectDocumentationConfig[]>;
  getProjectDocumentationConfig(id: string): Promise<ProjectDocumentationConfig | undefined>;
  createProjectDocumentationConfig(config: InsertProjectDocumentationConfig): Promise<ProjectDocumentationConfig>;
  updateProjectDocumentationConfig(id: string, updates: Partial<InsertProjectDocumentationConfig>): Promise<ProjectDocumentationConfig | undefined>;
  upsertProjectDocumentationConfig(config: InsertProjectDocumentationConfig): Promise<ProjectDocumentationConfig>;
  deleteProjectDocumentationConfig(id: string): Promise<void>;

  // Project Documentation Outputs
  getProjectDocumentationOutputs(projectId: string): Promise<ProjectDocumentationOutput[]>;
  getProjectDocumentationOutputsByConfig(configId: string): Promise<ProjectDocumentationOutput[]>;
  getProjectDocumentationOutput(id: string): Promise<ProjectDocumentationOutput | undefined>;
  createProjectDocumentationOutput(output: InsertProjectDocumentationOutput): Promise<ProjectDocumentationOutput>;
  updateProjectDocumentationOutput(id: string, updates: Partial<InsertProjectDocumentationOutput>): Promise<ProjectDocumentationOutput | undefined>;
  deleteProjectDocumentationOutput(id: string): Promise<void>;

  // Assets
  saveAsset(asset: InsertAsset): Promise<Asset>;
  listAssets(type?: string, projectId?: string | null): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | undefined>;
  getActiveAsset(type: string, projectId?: string | null): Promise<Asset | undefined>;
  setActiveAsset(id: string): Promise<void>; // Atomically sets this asset as active, deactivates all others of same type+project
  deleteAsset(id: string): Promise<void>;

  // Email Configs
  getAllEmailConfigs(): Promise<EmailGithubConfig[]>;
  getEmailConfigByProject(projectId: string): Promise<EmailGithubConfig | undefined>;
  getEmailConfigByEmail(emailAddress: string): Promise<EmailGithubConfig | undefined>;
  createEmailConfig(config: InsertEmailGithubConfig): Promise<EmailGithubConfig>;
  updateEmailConfig(id: string, updates: Partial<InsertEmailGithubConfig>): Promise<EmailGithubConfig | undefined>;
  deleteEmailConfig(id: string): Promise<void>;

  // Email Threads
  getEmailThreadsByProject(projectId: string): Promise<EmailThread[]>;
  getEmailThread(id: string): Promise<EmailThread | undefined>;
  getEmailThreadByProjectAndSubject(projectId: string, subject: string): Promise<EmailThread | undefined>;
  createEmailThread(thread: InsertEmailThread): Promise<EmailThread>;
  updateEmailThread(id: string, updates: Partial<InsertEmailThread>): Promise<EmailThread | undefined>;
  updateEmailThreadLastMessage(id: string): Promise<void>;
  deleteEmailThread(id: string): Promise<void>;
  getEmailThreadsBySharedInbox(inboxAddress: string): Promise<EmailThread[]>;

  // Email Messages
  getEmailMessagesByThread(threadId: string): Promise<EmailMessage[]>;
  getEmailMessage(id: string): Promise<EmailMessage | undefined>;
  createEmailMessage(message: InsertEmailMessage): Promise<EmailMessage>;
  deleteEmailMessage(id: string): Promise<void>;

  // Email Attachments
  getAttachmentsByMessage(messageId: string): Promise<EmailAttachment[]>;
  createEmailAttachment(attachment: InsertEmailAttachment): Promise<EmailAttachment>;
  deleteAttachmentsByMessage(messageId: string): Promise<void>;

  // Site Planner Nodes
  getSitePlannerNodesByProject(projectId: string): Promise<SitePlannerNode[]>;
  getSitePlannerNode(id: string): Promise<SitePlannerNode | undefined>;
  createSitePlannerNode(node: InsertSitePlannerNode): Promise<SitePlannerNode>;
  updateSitePlannerNode(id: string, updates: Partial<InsertSitePlannerNode>): Promise<SitePlannerNode | undefined>;
  deleteSitePlannerNode(id: string): Promise<void>;
  bulkUpsertSitePlannerNodes(projectId: string, nodes: InsertSitePlannerNode[]): Promise<SitePlannerNode[]>;

  // Site Planner Edges
  getSitePlannerEdgesByProject(projectId: string): Promise<SitePlannerEdge[]>;
  getSitePlannerEdge(id: string): Promise<SitePlannerEdge | undefined>;
  createSitePlannerEdge(edge: InsertSitePlannerEdge): Promise<SitePlannerEdge>;
  deleteSitePlannerEdge(id: string): Promise<void>;
  bulkUpsertSitePlannerEdges(projectId: string, edges: InsertSitePlannerEdge[]): Promise<SitePlannerEdge[]>;

  // Project Routes
  getProjectRoutes(projectId: string): Promise<ProjectRoute[]>;
  deleteProjectRoutesBySource(projectId: string, source: string): Promise<void>;
  bulkUpsertProjectRoutes(projectId: string, routes: InsertProjectRoute[]): Promise<ProjectRoute[]>;

  // ============= LINKBlue Storage Methods =============

  // Platforms
  getLinkbluePlatforms(): Promise<LinkbluePlatform[]>;
  getLinkbluePlatform(id: string): Promise<LinkbluePlatform | undefined>;
  createLinkbluePlatform(platform: InsertLinkbluePlatform): Promise<LinkbluePlatform>;
  updateLinkbluePlatform(id: string, updates: Partial<InsertLinkbluePlatform>): Promise<LinkbluePlatform | undefined>;
  deleteLinkbluePlatform(id: string): Promise<void>;

  // Platform Health
  getLatestPlatformHealth(platformId: string): Promise<LinkbluePlatformHealth | undefined>;
  getPlatformHealthHistory(platformId: string, limit?: number): Promise<LinkbluePlatformHealth[]>;
  createPlatformHealth(health: InsertLinkbluePlatformHealth): Promise<LinkbluePlatformHealth>;

  // Platform Integrations
  getLinkblueIntegrations(): Promise<LinkbluePlatformIntegration[]>;
  getLinkblueIntegration(id: string): Promise<LinkbluePlatformIntegration | undefined>;
  createLinkblueIntegration(integration: InsertLinkbluePlatformIntegration): Promise<LinkbluePlatformIntegration>;
  updateLinkblueIntegration(id: string, updates: Partial<InsertLinkbluePlatformIntegration>): Promise<LinkbluePlatformIntegration | undefined>;
  deleteLinkblueIntegration(id: string): Promise<void>;

  // Clients
  getLinkblueClients(): Promise<LinkblueClient[]>;
  getLinkblueClient(id: string): Promise<LinkblueClient | undefined>;
  searchLinkblueClients(query: string): Promise<LinkblueClient[]>;
  createLinkblueClient(client: InsertLinkblueClient): Promise<LinkblueClient>;
  updateLinkblueClient(id: string, updates: Partial<InsertLinkblueClient>): Promise<LinkblueClient | undefined>;
  deleteLinkblueClient(id: string): Promise<void>;

  // Client Accounts
  getClientAccounts(clientId: string): Promise<LinkblueClientAccount[]>;
  getClientAccountByPlatform(clientId: string, platformId: string): Promise<LinkblueClientAccount | undefined>;
  createClientAccount(account: InsertLinkblueClientAccount): Promise<LinkblueClientAccount>;
  updateClientAccount(id: string, updates: Partial<InsertLinkblueClientAccount>): Promise<LinkblueClientAccount | undefined>;
  deleteClientAccount(id: string): Promise<void>;

  // Alerts
  getLinkblueAlerts(options?: { isResolved?: boolean; severity?: string }): Promise<LinkblueAlert[]>;
  getLinkblueAlert(id: string): Promise<LinkblueAlert | undefined>;
  createLinkblueAlert(alert: InsertLinkblueAlert): Promise<LinkblueAlert>;
  acknowledgeAlert(id: string, userId: string): Promise<LinkblueAlert | undefined>;
  resolveAlert(id: string): Promise<LinkblueAlert | undefined>;
  deleteLinkblueAlert(id: string): Promise<void>;

  // Activity Feed
  getLinkblueActivityFeed(limit?: number): Promise<LinkblueActivityFeed[]>;
  createLinkblueActivity(activity: InsertLinkblueActivityFeed): Promise<LinkblueActivityFeed>;

  // Integration Logs
  getIntegrationLogs(integrationId: string, limit?: number): Promise<LinkblueIntegrationLog[]>;
  createIntegrationLog(log: InsertLinkblueIntegrationLog): Promise<LinkblueIntegrationLog>;

  // Dashboard aggregations
  getLinkblueDashboardStats(): Promise<{
    totalClients: number;
    totalRevenue: number;
    activeAlerts: number;
    platformHealth: Array<{ platformId: string; status: string; activeClients: number }>;
  }>;
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

  async ensureSystemAdminUser(): Promise<User> {
    const username = "system_admin";
    let user = await this.getUserByUsername(username);
    
    if (!user) {
      user = await this.createUser({
        username,
        password: "N/A",  // Password not used for system user
        role: "owner",
      });
    }
    
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

  async createProject(insertProject: InsertProject & { createdById: string }): Promise<Project> {
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

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications)
      .where(eq(notifications.id, id));
    return notification || undefined;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async deleteNotificationsOlderThan(cutoffDate: Date): Promise<number> {
    const result = await db.delete(notifications)
      .where(sql`${notifications.createdAt} < ${cutoffDate.toISOString()}`)
      .returning();
    return result.length;
  }

  // Notification Preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreference[]> {
    return await db.select().from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
  }

  async createNotificationPreference(insertPreference: InsertNotificationPreference): Promise<NotificationPreference> {
    const [preference] = await db.insert(notificationPreferences).values(insertPreference).returning();
    return preference;
  }

  async updateNotificationPreference(userId: string, type: string, enabled: boolean): Promise<void> {
    await db.update(notificationPreferences)
      .set({ enabled })
      .where(and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.type, type)
      ));
  }

  // Task Templates
  async getTaskTemplates(projectId: string): Promise<TaskTemplate[]> {
    return await db.select().from(taskTemplates)
      .where(eq(taskTemplates.projectId, projectId))
      .orderBy(desc(taskTemplates.createdAt));
  }

  async getTaskTemplate(id: string): Promise<TaskTemplate | undefined> {
    const [template] = await db.select().from(taskTemplates).where(eq(taskTemplates.id, id));
    return template || undefined;
  }

  async createTaskTemplate(insertTemplate: InsertTaskTemplate & { createdById: string }): Promise<TaskTemplate> {
    const [template] = await db.insert(taskTemplates).values(insertTemplate).returning();
    return template;
  }

  async updateTaskTemplate(id: string, updates: Partial<InsertTaskTemplate>): Promise<TaskTemplate | undefined> {
    const [template] = await db
      .update(taskTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(taskTemplates.id, id))
      .returning();
    return template || undefined;
  }

  async deleteTaskTemplate(id: string): Promise<void> {
    await db.delete(taskTemplates).where(eq(taskTemplates.id, id));
  }

  // Conversation Templates
  async getConversationTemplates(projectId: string | null): Promise<ConversationTemplate[]> {
    if (projectId === null) {
      return await db.select().from(conversationTemplates)
        .where(isNull(conversationTemplates.projectId))
        .orderBy(desc(conversationTemplates.createdAt));
    }
    return await db.select().from(conversationTemplates)
      .where(eq(conversationTemplates.projectId, projectId))
      .orderBy(desc(conversationTemplates.createdAt));
  }

  async getConversationTemplate(id: string): Promise<ConversationTemplate | undefined> {
    const [template] = await db.select().from(conversationTemplates).where(eq(conversationTemplates.id, id));
    return template || undefined;
  }

  async createConversationTemplate(insertTemplate: InsertConversationTemplate & { createdById: string }): Promise<ConversationTemplate> {
    const [template] = await db.insert(conversationTemplates).values(insertTemplate).returning();
    return template;
  }

  async updateConversationTemplate(id: string, updates: Partial<InsertConversationTemplate>): Promise<ConversationTemplate | undefined> {
    const [template] = await db
      .update(conversationTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversationTemplates.id, id))
      .returning();
    return template || undefined;
  }

  async deleteConversationTemplate(id: string): Promise<void> {
    await db.delete(conversationTemplates).where(eq(conversationTemplates.id, id));
  }

  // Documentation Templates
  async getDocumentationTemplates(): Promise<DocumentationTemplate[]> {
    return await db.select().from(documentationTemplates)
      .orderBy(desc(documentationTemplates.createdAt));
  }

  async getDocumentationTemplate(id: string): Promise<DocumentationTemplate | undefined> {
    const [template] = await db.select().from(documentationTemplates)
      .where(eq(documentationTemplates.id, id));
    return template || undefined;
  }

  async createDocumentationTemplate(insertTemplate: InsertDocumentationTemplate): Promise<DocumentationTemplate> {
    const [template] = await db.insert(documentationTemplates).values(insertTemplate).returning();
    return template;
  }

  async updateDocumentationTemplate(id: string, updates: Partial<InsertDocumentationTemplate>): Promise<DocumentationTemplate | undefined> {
    const updatePayload: Partial<typeof documentationTemplates.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (updates.key !== undefined) updatePayload.key = updates.key;
    if (updates.label !== undefined) updatePayload.label = updates.label;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.body !== undefined) updatePayload.body = updates.body;
    if (updates.category !== undefined) updatePayload.category = updates.category;

    const [template] = await db
      .update(documentationTemplates)
      .set(updatePayload)
      .where(eq(documentationTemplates.id, id))
      .returning();
    return template || undefined;
  }

  async deleteDocumentationTemplate(id: string): Promise<void> {
    await db.delete(documentationTemplates).where(eq(documentationTemplates.id, id));
  }

  // Project Documentation Configs
  async getProjectDocumentationConfigs(projectId: string): Promise<ProjectDocumentationConfig[]> {
    return await db.select().from(projectDocumentationConfigs)
      .where(eq(projectDocumentationConfigs.projectId, projectId))
      .orderBy(desc(projectDocumentationConfigs.createdAt));
  }

  async getProjectDocumentationConfig(id: string): Promise<ProjectDocumentationConfig | undefined> {
    const [config] = await db.select().from(projectDocumentationConfigs)
      .where(eq(projectDocumentationConfigs.id, id));
    return config || undefined;
  }

  async createProjectDocumentationConfig(insertConfig: InsertProjectDocumentationConfig): Promise<ProjectDocumentationConfig> {
    const [config] = await db.insert(projectDocumentationConfigs).values(insertConfig).returning();
    return config;
  }

  async updateProjectDocumentationConfig(id: string, updates: Partial<InsertProjectDocumentationConfig>): Promise<ProjectDocumentationConfig | undefined> {
    const updatePayload: Partial<typeof projectDocumentationConfigs.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (updates.metadata !== undefined) updatePayload.metadata = updates.metadata;
    if (updates.selectedTemplates !== undefined) updatePayload.selectedTemplates = updates.selectedTemplates;

    const [config] = await db
      .update(projectDocumentationConfigs)
      .set(updatePayload)
      .where(eq(projectDocumentationConfigs.id, id))
      .returning();
    return config || undefined;
  }

  async upsertProjectDocumentationConfig(insertConfig: InsertProjectDocumentationConfig): Promise<ProjectDocumentationConfig> {
    const [config] = await db
      .insert(projectDocumentationConfigs)
      .values(insertConfig)
      .onConflictDoUpdate({
        target: projectDocumentationConfigs.projectId,
        set: {
          metadata: insertConfig.metadata,
          selectedTemplates: insertConfig.selectedTemplates,
          updatedAt: new Date(),
        },
      })
      .returning();
    return config;
  }

  async deleteProjectDocumentationConfig(id: string): Promise<void> {
    await db.delete(projectDocumentationConfigs).where(eq(projectDocumentationConfigs.id, id));
  }

  // Project Documentation Outputs
  async getProjectDocumentationOutputs(projectId: string): Promise<ProjectDocumentationOutput[]> {
    return await db.select().from(projectDocumentationOutputs)
      .where(eq(projectDocumentationOutputs.projectId, projectId))
      .orderBy(desc(projectDocumentationOutputs.renderedAt));
  }

  async getProjectDocumentationOutputsByConfig(configId: string): Promise<ProjectDocumentationOutput[]> {
    return await db.select().from(projectDocumentationOutputs)
      .where(eq(projectDocumentationOutputs.configId, configId))
      .orderBy(desc(projectDocumentationOutputs.renderedAt));
  }

  async getProjectDocumentationOutput(id: string): Promise<ProjectDocumentationOutput | undefined> {
    const [output] = await db.select().from(projectDocumentationOutputs)
      .where(eq(projectDocumentationOutputs.id, id));
    return output || undefined;
  }

  async createProjectDocumentationOutput(insertOutput: InsertProjectDocumentationOutput): Promise<ProjectDocumentationOutput> {
    const [output] = await db.insert(projectDocumentationOutputs).values(insertOutput).returning();
    return output;
  }

  async updateProjectDocumentationOutput(id: string, updates: Partial<InsertProjectDocumentationOutput>): Promise<ProjectDocumentationOutput | undefined> {
    const [output] = await db.update(projectDocumentationOutputs)
      .set(updates)
      .where(eq(projectDocumentationOutputs.id, id))
      .returning();
    return output || undefined;
  }

  async deleteProjectDocumentationOutput(id: string): Promise<void> {
    await db.delete(projectDocumentationOutputs).where(eq(projectDocumentationOutputs.id, id));
  }

  // Assets
  async saveAsset(insertAsset: InsertAsset): Promise<Asset> {
    const [asset] = await db.insert(assets).values(insertAsset).returning();
    return asset;
  }

  async listAssets(type?: string, projectId?: string | null): Promise<Asset[]> {
    let query = db.select().from(assets);
    
    const conditions = [];
    if (type) {
      conditions.push(eq(assets.type, type));
    }
    if (projectId !== undefined) {
      if (projectId === null) {
        conditions.push(isNull(assets.projectId));
      } else {
        conditions.push(eq(assets.projectId, projectId));
      }
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(assets.uploadedAt));
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset || undefined;
  }

  async getActiveAsset(type: string, projectId?: string | null): Promise<Asset | undefined> {
    const conditions = [
      eq(assets.type, type),
      eq(assets.isActive, true),
    ];
    
    if (projectId !== undefined) {
      if (projectId === null) {
        conditions.push(isNull(assets.projectId));
      } else {
        conditions.push(eq(assets.projectId, projectId));
      }
    }
    
    const [asset] = await db.select().from(assets)
      .where(and(...conditions));
    return asset || undefined;
  }

  async setActiveAsset(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      const [targetAsset] = await tx.select().from(assets).where(eq(assets.id, id));
      if (!targetAsset) {
        throw new Error('Asset not found');
      }

      const conditions = [eq(assets.type, targetAsset.type)];
      if (targetAsset.projectId) {
        conditions.push(eq(assets.projectId, targetAsset.projectId));
      } else {
        conditions.push(isNull(assets.projectId));
      }

      await tx.update(assets)
        .set({ isActive: false })
        .where(and(...conditions));

      await tx.update(assets)
        .set({ isActive: true })
        .where(eq(assets.id, id));
    });
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  // Email Configs
  async getAllEmailConfigs(): Promise<EmailGithubConfig[]> {
    return await db.select().from(emailGithubConfigs).orderBy(desc(emailGithubConfigs.createdAt));
  }

  async getEmailConfigByProject(projectId: string): Promise<EmailGithubConfig | undefined> {
    const [config] = await db.select().from(emailGithubConfigs).where(eq(emailGithubConfigs.projectId, projectId));
    return config || undefined;
  }

  async getEmailConfigByEmail(emailAddress: string): Promise<EmailGithubConfig | undefined> {
    // Look up by emailAddress (handles both individual and shared inbox emails)
    const [config] = await db.select().from(emailGithubConfigs).where(
      eq(emailGithubConfigs.emailAddress, emailAddress)
    );
    return config || undefined;
  }

  async createEmailConfig(config: InsertEmailGithubConfig): Promise<EmailGithubConfig> {
    const [result] = await db.insert(emailGithubConfigs).values(config).returning();
    return result;
  }

  async updateEmailConfig(id: string, updates: Partial<InsertEmailGithubConfig>): Promise<EmailGithubConfig | undefined> {
    const [updated] = await db.update(emailGithubConfigs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailGithubConfigs.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEmailConfig(id: string): Promise<void> {
    await db.delete(emailGithubConfigs).where(eq(emailGithubConfigs.id, id));
  }

  // Email Threads
  async getEmailThreadsByProject(projectId: string): Promise<EmailThread[]> {
    return await db.select().from(emailThreads)
      .where(eq(emailThreads.projectId, projectId))
      .orderBy(desc(emailThreads.lastMessageAt));
  }

  async getEmailThread(id: string): Promise<EmailThread | undefined> {
    const [thread] = await db.select().from(emailThreads).where(eq(emailThreads.id, id));
    return thread || undefined;
  }

  async getEmailThreadByProjectAndSubject(projectId: string, subject: string): Promise<EmailThread | undefined> {
    const [thread] = await db.select().from(emailThreads)
      .where(and(
        eq(emailThreads.projectId, projectId),
        eq(emailThreads.subject, subject)
      ));
    return thread || undefined;
  }

  async createEmailThread(thread: InsertEmailThread): Promise<EmailThread> {
    const [result] = await db.insert(emailThreads).values(thread).returning();
    return result;
  }

  async updateEmailThread(id: string, updates: Partial<InsertEmailThread>): Promise<EmailThread | undefined> {
    const [updated] = await db.update(emailThreads)
      .set(updates)
      .where(eq(emailThreads.id, id))
      .returning();
    return updated || undefined;
  }

  async updateEmailThreadLastMessage(id: string): Promise<void> {
    await db.update(emailThreads)
      .set({ lastMessageAt: new Date() })
      .where(eq(emailThreads.id, id));
  }

  async deleteEmailThread(id: string): Promise<void> {
    await db.delete(emailThreads).where(eq(emailThreads.id, id));
  }

  async getEmailThreadsBySharedInbox(inboxAddress: string): Promise<EmailThread[]> {
    // Get all projects using this shared inbox
    const projectConfigs = await db.select({ projectId: emailGithubConfigs.projectId })
      .from(emailGithubConfigs)
      .where(eq(emailGithubConfigs.emailAddress, inboxAddress));
    
    if (projectConfigs.length === 0) return [];
    
    const projectIds = projectConfigs.map(c => c.projectId);
    
    // Get threads from all projects sharing this inbox
    const threads = await db.select().from(emailThreads).where(
      sql`${emailThreads.projectId} = ANY(${JSON.stringify(projectIds).split(',').join("','")}::text[])`
    );
    
    return threads;
  }

  // Email Messages
  async getEmailMessagesByThread(threadId: string): Promise<EmailMessage[]> {
    return await db.select().from(emailMessages)
      .where(eq(emailMessages.threadId, threadId))
      .orderBy(emailMessages.createdAt);
  }

  async getEmailMessage(id: string): Promise<EmailMessage | undefined> {
    const [message] = await db.select().from(emailMessages).where(eq(emailMessages.id, id));
    return message || undefined;
  }

  async createEmailMessage(message: InsertEmailMessage): Promise<EmailMessage> {
    const [result] = await db.insert(emailMessages).values(message).returning();
    return result;
  }

  async deleteEmailMessage(id: string): Promise<void> {
    await db.delete(emailMessages).where(eq(emailMessages.id, id));
  }

  // Email Attachments
  async getAttachmentsByMessage(messageId: string): Promise<EmailAttachment[]> {
    return await db.select().from(emailAttachments)
      .where(eq(emailAttachments.messageId, messageId))
      .orderBy(emailAttachments.createdAt);
  }

  async createEmailAttachment(attachment: InsertEmailAttachment): Promise<EmailAttachment> {
    const [result] = await db.insert(emailAttachments).values(attachment).returning();
    return result;
  }

  async deleteAttachmentsByMessage(messageId: string): Promise<void> {
    await db.delete(emailAttachments).where(eq(emailAttachments.messageId, messageId));
  }

  // Site Planner Nodes
  async getSitePlannerNodesByProject(projectId: string): Promise<SitePlannerNode[]> {
    return await db.select().from(sitePlannerNodes)
      .where(eq(sitePlannerNodes.projectId, projectId))
      .orderBy(sitePlannerNodes.createdAt);
  }

  async getSitePlannerNode(id: string): Promise<SitePlannerNode | undefined> {
    const [node] = await db.select().from(sitePlannerNodes).where(eq(sitePlannerNodes.id, id));
    return node || undefined;
  }

  async createSitePlannerNode(node: InsertSitePlannerNode): Promise<SitePlannerNode> {
    const [result] = await db.insert(sitePlannerNodes).values(node).returning();
    return result;
  }

  async updateSitePlannerNode(id: string, updates: Partial<InsertSitePlannerNode>): Promise<SitePlannerNode | undefined> {
    const [updated] = await db.update(sitePlannerNodes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sitePlannerNodes.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSitePlannerNode(id: string): Promise<void> {
    await db.delete(sitePlannerNodes).where(eq(sitePlannerNodes.id, id));
  }

  async bulkUpsertSitePlannerNodes(projectId: string, nodes: InsertSitePlannerNode[]): Promise<SitePlannerNode[]> {
    // Delete existing nodes for this project
    await db.delete(sitePlannerNodes).where(eq(sitePlannerNodes.projectId, projectId));
    
    // Insert new nodes
    if (nodes.length === 0) return [];
    return await db.insert(sitePlannerNodes).values(nodes).returning();
  }

  // Site Planner Edges
  async getSitePlannerEdgesByProject(projectId: string): Promise<SitePlannerEdge[]> {
    return await db.select().from(sitePlannerEdges)
      .where(eq(sitePlannerEdges.projectId, projectId))
      .orderBy(sitePlannerEdges.createdAt);
  }

  async getSitePlannerEdge(id: string): Promise<SitePlannerEdge | undefined> {
    const [edge] = await db.select().from(sitePlannerEdges).where(eq(sitePlannerEdges.id, id));
    return edge || undefined;
  }

  async createSitePlannerEdge(edge: InsertSitePlannerEdge): Promise<SitePlannerEdge> {
    const [result] = await db.insert(sitePlannerEdges).values(edge).returning();
    return result;
  }

  async deleteSitePlannerEdge(id: string): Promise<void> {
    await db.delete(sitePlannerEdges).where(eq(sitePlannerEdges.id, id));
  }

  async bulkUpsertSitePlannerEdges(projectId: string, edges: InsertSitePlannerEdge[]): Promise<SitePlannerEdge[]> {
    // Delete existing edges for this project
    await db.delete(sitePlannerEdges).where(eq(sitePlannerEdges.projectId, projectId));
    
    // Insert new edges
    if (edges.length === 0) return [];
    return await db.insert(sitePlannerEdges).values(edges).returning();
  }

  // Project Routes
  async getProjectRoutes(projectId: string): Promise<ProjectRoute[]> {
    return await db.select().from(projectRoutes)
      .where(eq(projectRoutes.projectId, projectId))
      .orderBy(projectRoutes.path);
  }

  async deleteProjectRoutesBySource(projectId: string, source: string): Promise<void> {
    await db.delete(projectRoutes)
      .where(and(
        eq(projectRoutes.projectId, projectId),
        eq(projectRoutes.source, source)
      ));
  }

  async bulkUpsertProjectRoutes(projectId: string, routes: InsertProjectRoute[]): Promise<ProjectRoute[]> {
    // If there are routes to insert, insert them
    if (routes.length === 0) return [];
    return await db.insert(projectRoutes).values(routes).returning();
  }

  // ============= LINKBlue Storage Implementation =============

  // Platforms
  async getLinkbluePlatforms(): Promise<LinkbluePlatform[]> {
    return await db.select().from(linkbluePlatforms).orderBy(linkbluePlatforms.name);
  }

  async getLinkbluePlatform(id: string): Promise<LinkbluePlatform | undefined> {
    const [platform] = await db.select().from(linkbluePlatforms).where(eq(linkbluePlatforms.id, id));
    return platform || undefined;
  }

  async createLinkbluePlatform(platform: InsertLinkbluePlatform): Promise<LinkbluePlatform> {
    const [result] = await db.insert(linkbluePlatforms).values(platform).returning();
    return result;
  }

  async updateLinkbluePlatform(id: string, updates: Partial<InsertLinkbluePlatform>): Promise<LinkbluePlatform | undefined> {
    const [updated] = await db.update(linkbluePlatforms)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(linkbluePlatforms.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLinkbluePlatform(id: string): Promise<void> {
    await db.delete(linkbluePlatforms).where(eq(linkbluePlatforms.id, id));
  }

  // Platform Health
  async getLatestPlatformHealth(platformId: string): Promise<LinkbluePlatformHealth | undefined> {
    const [health] = await db.select().from(linkbluePlatformHealth)
      .where(eq(linkbluePlatformHealth.platformId, platformId))
      .orderBy(desc(linkbluePlatformHealth.createdAt))
      .limit(1);
    return health || undefined;
  }

  async getPlatformHealthHistory(platformId: string, limit = 24): Promise<LinkbluePlatformHealth[]> {
    return await db.select().from(linkbluePlatformHealth)
      .where(eq(linkbluePlatformHealth.platformId, platformId))
      .orderBy(desc(linkbluePlatformHealth.createdAt))
      .limit(limit);
  }

  async createPlatformHealth(health: InsertLinkbluePlatformHealth): Promise<LinkbluePlatformHealth> {
    const [result] = await db.insert(linkbluePlatformHealth).values(health).returning();
    return result;
  }

  // Platform Integrations
  async getLinkblueIntegrations(): Promise<LinkbluePlatformIntegration[]> {
    return await db.select().from(linkbluePlatformIntegrations).orderBy(linkbluePlatformIntegrations.name);
  }

  async getLinkblueIntegration(id: string): Promise<LinkbluePlatformIntegration | undefined> {
    const [integration] = await db.select().from(linkbluePlatformIntegrations).where(eq(linkbluePlatformIntegrations.id, id));
    return integration || undefined;
  }

  async createLinkblueIntegration(integration: InsertLinkbluePlatformIntegration): Promise<LinkbluePlatformIntegration> {
    const [result] = await db.insert(linkbluePlatformIntegrations).values(integration).returning();
    return result;
  }

  async updateLinkblueIntegration(id: string, updates: Partial<InsertLinkbluePlatformIntegration>): Promise<LinkbluePlatformIntegration | undefined> {
    const [updated] = await db.update(linkbluePlatformIntegrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(linkbluePlatformIntegrations.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLinkblueIntegration(id: string): Promise<void> {
    await db.delete(linkbluePlatformIntegrations).where(eq(linkbluePlatformIntegrations.id, id));
  }

  // Clients
  async getLinkblueClients(): Promise<LinkblueClient[]> {
    return await db.select().from(linkblueClients).orderBy(desc(linkblueClients.updatedAt));
  }

  async getLinkblueClient(id: string): Promise<LinkblueClient | undefined> {
    const [client] = await db.select().from(linkblueClients).where(eq(linkblueClients.id, id));
    return client || undefined;
  }

  async searchLinkblueClients(query: string): Promise<LinkblueClient[]> {
    const searchPattern = `%${query.toLowerCase()}%`;
    return await db.select().from(linkblueClients)
      .where(
        or(
          sql`LOWER(${linkblueClients.companyName}) LIKE ${searchPattern}`,
          sql`LOWER(${linkblueClients.email}) LIKE ${searchPattern}`,
          sql`LOWER(${linkblueClients.domain}) LIKE ${searchPattern}`,
          sql`LOWER(${linkblueClients.contactName}) LIKE ${searchPattern}`,
          sql`${linkblueClients.universalClientId} LIKE ${searchPattern}`
        )
      )
      .orderBy(linkblueClients.companyName)
      .limit(50);
  }

  async createLinkblueClient(client: InsertLinkblueClient): Promise<LinkblueClient> {
    const [result] = await db.insert(linkblueClients).values(client).returning();
    return result;
  }

  async updateLinkblueClient(id: string, updates: Partial<InsertLinkblueClient>): Promise<LinkblueClient | undefined> {
    const [updated] = await db.update(linkblueClients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(linkblueClients.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLinkblueClient(id: string): Promise<void> {
    await db.delete(linkblueClients).where(eq(linkblueClients.id, id));
  }

  // Client Accounts
  async getClientAccounts(clientId: string): Promise<LinkblueClientAccount[]> {
    return await db.select().from(linkblueClientAccounts)
      .where(eq(linkblueClientAccounts.clientId, clientId));
  }

  async getClientAccountByPlatform(clientId: string, platformId: string): Promise<LinkblueClientAccount | undefined> {
    const [account] = await db.select().from(linkblueClientAccounts)
      .where(and(
        eq(linkblueClientAccounts.clientId, clientId),
        eq(linkblueClientAccounts.platformId, platformId)
      ));
    return account || undefined;
  }

  async createClientAccount(account: InsertLinkblueClientAccount): Promise<LinkblueClientAccount> {
    const [result] = await db.insert(linkblueClientAccounts).values(account).returning();
    return result;
  }

  async updateClientAccount(id: string, updates: Partial<InsertLinkblueClientAccount>): Promise<LinkblueClientAccount | undefined> {
    const [updated] = await db.update(linkblueClientAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(linkblueClientAccounts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteClientAccount(id: string): Promise<void> {
    await db.delete(linkblueClientAccounts).where(eq(linkblueClientAccounts.id, id));
  }

  // Alerts
  async getLinkblueAlerts(options?: { isResolved?: boolean; severity?: string }): Promise<LinkblueAlert[]> {
    let query = db.select().from(linkblueAlerts);
    
    const conditions: any[] = [];
    if (options?.isResolved !== undefined) {
      conditions.push(eq(linkblueAlerts.isResolved, options.isResolved));
    }
    if (options?.severity) {
      conditions.push(eq(linkblueAlerts.severity, options.severity));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return await query.orderBy(desc(linkblueAlerts.createdAt));
  }

  async getLinkblueAlert(id: string): Promise<LinkblueAlert | undefined> {
    const [alert] = await db.select().from(linkblueAlerts).where(eq(linkblueAlerts.id, id));
    return alert || undefined;
  }

  async createLinkblueAlert(alert: InsertLinkblueAlert): Promise<LinkblueAlert> {
    const [result] = await db.insert(linkblueAlerts).values(alert).returning();
    return result;
  }

  async acknowledgeAlert(id: string, userId: string): Promise<LinkblueAlert | undefined> {
    const [updated] = await db.update(linkblueAlerts)
      .set({ 
        isAcknowledged: true, 
        acknowledgedBy: userId, 
        acknowledgedAt: new Date() 
      })
      .where(eq(linkblueAlerts.id, id))
      .returning();
    return updated || undefined;
  }

  async resolveAlert(id: string): Promise<LinkblueAlert | undefined> {
    const [updated] = await db.update(linkblueAlerts)
      .set({ isResolved: true, resolvedAt: new Date() })
      .where(eq(linkblueAlerts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLinkblueAlert(id: string): Promise<void> {
    await db.delete(linkblueAlerts).where(eq(linkblueAlerts.id, id));
  }

  // Activity Feed
  async getLinkblueActivityFeed(limit = 50): Promise<LinkblueActivityFeed[]> {
    return await db.select().from(linkblueActivityFeed)
      .orderBy(desc(linkblueActivityFeed.createdAt))
      .limit(limit);
  }

  async createLinkblueActivity(activity: InsertLinkblueActivityFeed): Promise<LinkblueActivityFeed> {
    const [result] = await db.insert(linkblueActivityFeed).values(activity).returning();
    return result;
  }

  // Integration Logs
  async getIntegrationLogs(integrationId: string, limit = 100): Promise<LinkblueIntegrationLog[]> {
    return await db.select().from(linkblueIntegrationLogs)
      .where(eq(linkblueIntegrationLogs.integrationId, integrationId))
      .orderBy(desc(linkblueIntegrationLogs.createdAt))
      .limit(limit);
  }

  async createIntegrationLog(log: InsertLinkblueIntegrationLog): Promise<LinkblueIntegrationLog> {
    const [result] = await db.insert(linkblueIntegrationLogs).values(log).returning();
    return result;
  }

  // Dashboard aggregations
  async getLinkblueDashboardStats(): Promise<{
    totalClients: number;
    totalRevenue: number;
    activeAlerts: number;
    platformHealth: Array<{ platformId: string; status: string; activeClients: number }>;
  }> {
    // Get total clients
    const [clientCount] = await db.select({ count: sql<number>`count(*)::int` }).from(linkblueClients);
    
    // Get total revenue
    const [revenueSum] = await db.select({ 
      total: sql<number>`COALESCE(SUM(${linkblueClients.totalRevenue}), 0)::int` 
    }).from(linkblueClients);
    
    // Get active alerts count
    const [alertCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(linkblueAlerts)
      .where(eq(linkblueAlerts.isResolved, false));
    
    // Get latest health for each platform
    const platforms = await this.getLinkbluePlatforms();
    const platformHealth = await Promise.all(
      platforms.map(async (platform) => {
        const health = await this.getLatestPlatformHealth(platform.id);
        return {
          platformId: platform.id,
          status: health?.status || 'unknown',
          activeClients: health?.activeClients || 0,
        };
      })
    );

    return {
      totalClients: clientCount?.count || 0,
      totalRevenue: revenueSum?.total || 0,
      activeAlerts: alertCount?.count || 0,
      platformHealth,
    };
  }

  // ============= Admin Users =============
  
  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase()));
    return user || undefined;
  }

  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const [result] = await db.insert(adminUsers).values({
      ...user,
      email: user.email.toLowerCase(),
    }).returning();
    return result;
  }

  async updateAdminUserLogin(id: string): Promise<void> {
    await db.update(adminUsers)
      .set({ 
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        accountLocked: false,
        lockedUntil: null,
      })
      .where(eq(adminUsers.id, id));
  }

  async incrementFailedLoginAttempts(id: string): Promise<{ failedAttempts: number; shouldLock: boolean }> {
    const user = await this.getAdminUser(id);
    if (!user) return { failedAttempts: 0, shouldLock: false };

    const newAttempts = (user.failedLoginAttempts || 0) + 1;
    const shouldLock = newAttempts >= 5;

    await db.update(adminUsers)
      .set({
        failedLoginAttempts: newAttempts,
        lastFailedLogin: new Date(),
        accountLocked: shouldLock,
        lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null, // 15 minutes
      })
      .where(eq(adminUsers.id, id));

    return { failedAttempts: newAttempts, shouldLock };
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.getAdminUser(userId);
    if (!user) return false;
    if (!user.accountLocked) return false;
    if (user.lockedUntil && new Date() > user.lockedUntil) {
      // Unlock the account
      await db.update(adminUsers)
        .set({ accountLocked: false, lockedUntil: null, failedLoginAttempts: 0 })
        .where(eq(adminUsers.id, userId));
      return false;
    }
    return true;
  }

  // ============= Admin Sessions =============

  async createAdminSession(session: InsertAdminSession): Promise<AdminSession> {
    const [result] = await db.insert(adminSessions).values(session).returning();
    return result;
  }

  async getAdminSessionByToken(token: string): Promise<AdminSession | undefined> {
    const [session] = await db.select().from(adminSessions)
      .where(eq(adminSessions.sessionToken, token));
    return session || undefined;
  }

  async deleteAdminSession(token: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.sessionToken, token));
  }

  async updateAdminSessionActivity(token: string): Promise<void> {
    await db.update(adminSessions)
      .set({ lastActivity: new Date() })
      .where(eq(adminSessions.sessionToken, token));
  }

  async deleteExpiredAdminSessions(): Promise<void> {
    await db.delete(adminSessions)
      .where(sql`${adminSessions.expiresAt} < NOW()`);
  }

  // ============= Password Reset Tokens =============

  async createPasswordResetToken(userId: string, token: string, platform: string): Promise<void> {
    // Delete any existing tokens for this user/platform first
    await db.delete(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.userId, userId),
        eq(passwordResetTokens.platform, platform)
      ));
    
    // Create new token (expires in 1 hour)
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      platform,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
  }

  async getPasswordResetToken(token: string): Promise<{ userId: string; platform: string; expiresAt: Date } | undefined> {
    const [result] = await db.select({
      userId: passwordResetTokens.userId,
      platform: passwordResetTokens.platform,
      expiresAt: passwordResetTokens.expiresAt,
    }).from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return result || undefined;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async updateAdminUserPassword(userId: string, passwordHash: string): Promise<void> {
    await db.update(adminUsers)
      .set({ passwordHash })
      .where(eq(adminUsers.id, userId));
  }
}

export const storage = new DatabaseStorage();
