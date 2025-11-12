import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("collaborator"), // 'owner' or 'collaborator'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Projects table - represents different Replit apps/websites
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#3B82F6"), // For visual identification
  icon: text("icon"), // Lucide icon name
  githubRepo: text("github_repo"), // Format: "owner/repo" - NOT storing token in DB for security
  githubBranch: text("github_branch").default("main"), // Branch to track
  lastGithubSync: timestamp("last_github_sync"), // Last successful GitHub sync
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  
  // Default sync configuration for tasks created in this project
  defaultSyncEnabled: boolean("default_sync_enabled").notNull().default(false),
  defaultSyncUrl: text("default_sync_url"), // Default endpoint for task status syncs
});

// API Keys for projects - allows projects to send data to this hub
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  key: text("key").notNull().unique(), // The actual API key
  name: text("name").notNull(), // Friendly name for the key
  permissions: text("permissions").array().notNull().default(sql`ARRAY[]::text[]`), // ['read_tasks', 'write_tasks', 'view_conversations']
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

// Tasks from various projects
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'cancelled'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  source: text("source").notNull().default("manual"), // 'manual', 'conversation', 'github', 'api'
  sourceUrl: text("source_url"), // Link back to source
  assignedTo: varchar("assigned_to").references(() => users.id, { onDelete: "set null" }),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  
  // Sync back fields
  syncEnabled: boolean("sync_enabled").notNull().default(false),
  syncUrl: text("sync_url"), // Endpoint to send status updates to
  syncStatus: text("sync_status").default("idle"), // 'idle', 'syncing', 'success', 'failed'
  lastSyncAt: timestamp("last_sync_at"),
  syncRetryCount: integer("sync_retry_count").default(0),
  syncError: text("sync_error"),
  
  // GitHub sync fields
  githubIssueNumber: integer("github_issue_number"), // GitHub issue number if synced
  githubIssueUrl: text("github_issue_url"), // URL to GitHub issue
  githubIssueState: text("github_issue_state"), // 'open', 'closed'
  githubSyncedAt: timestamp("github_synced_at"), // When task was synced to GitHub
});

// Conversations with agents
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(), // Full conversation text
  agentName: text("agent_name"), // Which agent was involved
  extractedItems: text("extracted_items").array().default(sql`ARRAY[]::text[]`), // AI-extracted action items
  isProcessed: boolean("is_processed").notNull().default(false), // Has AI extraction been run?
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// GitHub activity tracking
export const githubActivity = pgTable("github_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  repository: text("repository").notNull(), // e.g., "username/repo"
  commitSha: text("commit_sha"),
  commitMessage: text("commit_message"),
  author: text("author").notNull(),
  fileChanges: integer("file_changes"),
  activityType: text("activity_type").notNull().default("commit"), // 'commit', 'pr', 'issue'
  url: text("url").notNull(), // Link to GitHub
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Webhooks - allows external projects to register webhook endpoints
export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Friendly name for the webhook
  url: text("url").notNull(), // Endpoint URL to POST to
  secret: text("secret").notNull(), // HMAC secret for signature verification
  events: text("events").array().notNull().default(sql`ARRAY[]::text[]`), // ['task.created', 'task.updated', 'conversation.created']
  isActive: boolean("is_active").notNull().default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Agent Connections - stores connection info for agents in other Replit projects
export const agentConnections = pgTable("agent_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Friendly name for the agent connection
  agentEndpointUrl: text("agent_endpoint_url").notNull(), // URL to send messages to
  agentApiKey: text("agent_api_key"), // Optional API key for authentication
  isActive: boolean("is_active").notNull().default(true),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Agent Chat Messages - stores chat messages between user and agents
export const agentChatMessages = pgTable("agent_chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: varchar("connection_id").notNull().references(() => agentConnections.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(), // Message text
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Project permissions for users
export const projectPermissions = pgTable("project_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  canView: boolean("can_view").notNull().default(true),
  canEdit: boolean("can_edit").notNull().default(false),
  canDelete: boolean("can_delete").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdProjects: many(projects),
  assignedTasks: many(tasks),
  conversations: many(conversations),
  projectPermissions: many(projectPermissions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [projects.createdById],
    references: [users.id],
  }),
  apiKeys: many(apiKeys),
  tasks: many(tasks),
  conversations: many(conversations),
  githubActivity: many(githubActivity),
  webhooks: many(webhooks),
  agentConnections: many(agentConnections),
  permissions: many(projectPermissions),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  project: one(projects, {
    fields: [apiKeys.projectId],
    references: [projects.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  project: one(projects, {
    fields: [conversations.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
}));

export const githubActivityRelations = relations(githubActivity, ({ one }) => ({
  project: one(projects, {
    fields: [githubActivity.projectId],
    references: [projects.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  project: one(projects, {
    fields: [webhooks.projectId],
    references: [projects.id],
  }),
}));

export const projectPermissionsRelations = relations(projectPermissions, ({ one }) => ({
  user: one(users, {
    fields: [projectPermissions.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [projectPermissions.projectId],
    references: [projects.id],
  }),
}));

export const agentConnectionsRelations = relations(agentConnections, ({ one, many }) => ({
  project: one(projects, {
    fields: [agentConnections.projectId],
    references: [projects.id],
  }),
  messages: many(agentChatMessages),
}));

export const agentChatMessagesRelations = relations(agentChatMessages, ({ one }) => ({
  connection: one(agentConnections, {
    fields: [agentChatMessages.connectionId],
    references: [agentConnections.id],
  }),
}));

// Zod schemas for inserts
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true, // Backend will set this automatically
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  extractedItems: true,
  isProcessed: true,
});

export const insertGithubActivitySchema = createInsertSchema(githubActivity).omit({
  id: true,
  createdAt: true,
});

export const insertProjectPermissionSchema = createInsertSchema(projectPermissions).omit({
  id: true,
  createdAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  lastTriggeredAt: true,
});

export const insertAgentConnectionSchema = createInsertSchema(agentConnections).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertAgentChatMessageSchema = createInsertSchema(agentChatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertGithubActivity = z.infer<typeof insertGithubActivitySchema>;
export type GithubActivity = typeof githubActivity.$inferSelect;

export type InsertProjectPermission = z.infer<typeof insertProjectPermissionSchema>;
export type ProjectPermission = typeof projectPermissions.$inferSelect;

export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;

export type InsertAgentConnection = z.infer<typeof insertAgentConnectionSchema>;
export type AgentConnection = typeof agentConnections.$inferSelect;

export type InsertAgentChatMessage = z.infer<typeof insertAgentChatMessageSchema>;
export type AgentChatMessage = typeof agentChatMessages.$inferSelect;
