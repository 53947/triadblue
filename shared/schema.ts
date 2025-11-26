import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, unique, json } from "drizzle-orm/pg-core";
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
  
  // Documentation metadata
  features: json("features").$type<string[]>(), // Project features list
  techStack: json("tech_stack").$type<string[]>(), // Technology stack list
  metadataApiUrl: text("metadata_api_url"), // API endpoint in external project to fetch metadata from
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
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }),
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

// Notifications for users
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'urgent_task', 'sync_failed', 'task_due_soon', 'webhook_error', 'github_sync'
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadata: text("metadata"), // JSON string for additional data (task details, error context, etc.)
  taskId: varchar("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userReadIdx: sql`create index if not exists "notifications_user_read_idx" on ${table} ("user_id", "read")`,
  userCreatedIdx: sql`create index if not exists "notifications_user_created_idx" on ${table} ("user_id", "created_at" desc)`,
}));

// Notification preferences - allows users to opt out of specific notification types
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // Matches notification types
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Task Templates - project-specific templates for creating standardized tasks
export const taskTemplates = pgTable("task_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  defaultPriority: text("default_priority").notNull().default("medium"),
  defaultSource: text("default_source").notNull().default("manual"),
  customFields: text("custom_fields"), // JSON string for custom field definitions
  isActive: boolean("is_active").notNull().default(true),
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Conversation Templates - templates for creating standardized conversation prompts
// Note: projectId can be null for global templates, non-null for project-specific templates
export const conversationTemplates = pgTable("conversation_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  defaultTitle: text("default_title"),
  defaultContent: text("default_content"),
  defaultAgentName: text("default_agent_name"),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").notNull().default(true),
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  uniqueProjectName: unique().on(table.projectId, table.name),
}));

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

// Documentation Templates - stores template definitions (README, replit.md, etc.)
export const documentationTemplates = pgTable("documentation_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // 'readme', 'replit', 'architecture', etc.
  label: text("label").notNull(), // Human-readable name
  description: text("description"),
  body: text("body").notNull(), // Template content with {{VARIABLES}}
  category: text("category").notNull().default("core"), // 'core', 'brand_pack', 'optional'
  isSystem: boolean("is_system").notNull().default(false), // System templates are protected
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Project Documentation Configs - stores metadata for generating project docs
export const projectDocumentationConfigs = pgTable("project_documentation_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }).unique(),
  metadata: text("metadata").notNull(), // JSON string with all variables (PROJECT_NAME, PLATFORMS[], etc.)
  selectedTemplates: text("selected_templates").array().notNull().default(sql`ARRAY[]::text[]`), // Template keys to generate
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Project Documentation Outputs - stores generated documentation history
export const projectDocumentationOutputs = pgTable("project_documentation_outputs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  configId: varchar("config_id").notNull().references(() => projectDocumentationConfigs.id, { onDelete: "cascade" }),
  templateKey: text("template_key").notNull(), // Immutable template identifier for historical fidelity
  fileName: text("file_name").notNull(), // Output file name for ZIP export
  content: text("content").notNull(), // Rendered documentation content
  metadata: text("metadata").notNull().default('{}'), // JSON snapshot of generation-time metadata
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  renderedAt: timestamp("rendered_at").notNull().defaultNow(),
  githubCommitSha: text("github_commit_sha"), // If pushed to GitHub
});

// Documentation Distribution Tracking - tracks which agents/projects have received documentation
export const documentationDistributions = pgTable("documentation_distributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  documentationType: text("documentation_type").notNull(), // 'required_endpoints', 'architecture', 'standards', etc.
  distributionMethod: text("distribution_method").notNull(), // 'github_push', 'email', 'chat_upload', 'replit_md'
  status: text("status").notNull().default("pending"), // 'pending', 'sent', 'received', 'acknowledged'
  details: text("details"), // JSON string with additional info (GitHub commit SHA, email thread ID, etc.)
  sentAt: timestamp("sent_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email-GitHub Configurations - maps project emails to GitHub repos for issue tracking
// Multiple projects can share the same inbox (inboxAddress/inboxId) if they have the same inboxCategory
export const emailGithubConfigs = pgTable("email_github_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }).unique(),
  emailAddress: text("email_address"), // e.g., "listit@agentmail.triadblue.com" - now nullable for shared inboxes
  inboxAddress: text("inbox_address"), // Shared inbox address (e.g., "agents@agentmail.triadblue.com")
  inboxCategory: text("inbox_category").notNull().default("agent"), // 'siteinspector', 'agent', 'assistant' - determines which shared inbox to use
  inboxId: text("inbox_id"), // AgentMail inbox ID required for sending emails
  githubOwner: text("github_owner"), // GitHub username or organization
  githubRepo: text("github_repo"), // Repository name
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Email Threads - stores email conversation threads with project agents
export const emailThreads = pgTable("email_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  agentEmail: text("agent_email").notNull(), // e.g., "listit@agentmail.triadblue.com"
  contactEmail: text("contact_email"), // External contact email - used for outbound-only threads
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  hasActionableItems: boolean("has_actionable_items").notNull().default(false), // AI detected issues/tasks
  isAnalyzed: boolean("is_analyzed").notNull().default(false), // Has AI analysis been run?
  actionableItems: json("actionable_items"), // Structured list of detected items from AI analysis
  analysisSummary: text("analysis_summary"), // AI-generated summary of conversation
  githubIssues: json("github_issues"), // Array of {id, type, descriptionHash, severity, issueNumber, issueUrl, createdAt}
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email Messages - stores individual email messages within threads
export const emailMessages = pgTable("email_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => emailThreads.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(), // 'sent' or 'received'
  fromEmail: text("from_email").notNull(),
  toEmail: text("to_email").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  metadata: text("metadata"), // JSON string for additional data (headers, etc.)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email Attachments - stores full attachment data for sent and received emails
export const emailAttachments = pgTable("email_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => emailMessages.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(), // Size in bytes
  data: text("data").notNull(), // Base64-encoded file data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Assets - stores uploaded files (favicons, logos, images)
export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }), // Nullable for global assets, set for project-specific branding
  type: varchar("type", { length: 50 }).notNull(), // 'favicon', 'logo', 'image'
  filename: varchar("filename", { length: 255 }).notNull(), // Safe filename with extension (server-generated UUID-based)
  originalFilename: varchar("original_filename", { length: 255 }).notNull(), // Original user-provided name
  mimeType: varchar("mime_type", { length: 100 }).notNull(), // 'image/png', 'image/svg+xml', etc.
  size: integer("size").notNull(), // File size in bytes
  isActive: boolean("is_active").notNull().default(false), // Only one active per type+project
  uploadedById: varchar("uploaded_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
}, (table) => ({
  // Ensure only one active asset per type+project combination (coalescing NULL to sentinel handles global assets)
  uniqueActiveAsset: sql`create unique index if not exists "assets_unique_active_idx" on ${table} ("type", coalesce("project_id",'00000000-0000-0000-0000-000000000000')) where "is_active" = true`,
  // Index for filtering by type
  typeIdx: sql`create index if not exists "assets_type_idx" on ${table} ("type", "uploaded_at" desc)`,
  // Index for audit/user lookup
  uploadedByIdx: sql`create index if not exists "assets_uploaded_by_idx" on ${table} ("uploaded_by_id", "uploaded_at" desc)`,
}));

// Site Planner Nodes - stores page/component nodes in the visual planner
export const sitePlannerNodes = pgTable("site_planner_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull(), // React Flow node ID (e.g., "node-1", "node-2")
  label: text("label").notNull(), // Page name (e.g., "Home", "About", "Contact")
  description: text("description"), // Optional description
  status: text("status").notNull().default("planned"), // 'planned', 'in_progress', 'completed'
  positionX: integer("position_x").notNull(), // X coordinate on canvas
  positionY: integer("position_y").notNull(), // Y coordinate on canvas
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Ensure unique nodeId per project
  uniqueNodeId: unique("site_planner_nodes_unique_node_id").on(table.projectId, table.nodeId),
}));

// Site Planner Edges - stores connections between nodes
export const sitePlannerEdges = pgTable("site_planner_edges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  edgeId: text("edge_id").notNull(), // React Flow edge ID (e.g., "edge-1-2")
  sourceNodeId: text("source_node_id").notNull(), // Node ID of source
  targetNodeId: text("target_node_id").notNull(), // Node ID of target
  label: text("label"), // Optional edge label (e.g., "Click", "Navigate")
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  // Ensure unique edgeId per project
  uniqueEdgeId: unique("site_planner_edges_unique_edge_id").on(table.projectId, table.edgeId),
}));

// Project Routes - stores actual routes/pages from projects for sitemap generation
export const projectRoutes = pgTable("project_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Display name (e.g., "Dashboard", "User Profile")
  path: text("path").notNull(), // Route path (e.g., "/", "/projects", "/user/:id")
  filePath: text("file_path"), // File location (e.g., "client/src/pages/dashboard.tsx")
  routeType: text("route_type").notNull().default("static"), // 'static', 'dynamic', 'layout'
  framework: text("framework").notNull().default("wouter"), // 'wouter', 'react-router', 'nextjs', 'other'
  parentId: varchar("parent_id"), // Self-reference for nested routes
  meta: json("meta").$type<{ methods?: string[], component?: string, exact?: boolean, [key: string]: any }>(), // Additional metadata
  source: text("source").notNull().default("scan"), // 'scan' (auto-scanned), 'external' (from API)
  lastSyncedAt: timestamp("last_synced_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdProjects: many(projects),
  assignedTasks: many(tasks),
  conversations: many(conversations),
  projectPermissions: many(projectPermissions),
  uploadedAssets: many(assets),
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
  taskTemplates: many(taskTemplates),
  conversationTemplates: many(conversationTemplates),
  documentationConfig: one(projectDocumentationConfigs),
  documentationOutputs: many(projectDocumentationOutputs),
  emailThreads: many(emailThreads),
  emailConfig: one(emailGithubConfigs),
  sitePlannerNodes: many(sitePlannerNodes),
  sitePlannerEdges: many(sitePlannerEdges),
  routes: many(projectRoutes),
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

export const taskTemplatesRelations = relations(taskTemplates, ({ one }) => ({
  project: one(projects, {
    fields: [taskTemplates.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [taskTemplates.createdById],
    references: [users.id],
  }),
}));

export const conversationTemplatesRelations = relations(conversationTemplates, ({ one }) => ({
  project: one(projects, {
    fields: [conversationTemplates.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [conversationTemplates.createdById],
    references: [users.id],
  }),
}));

export const documentationTemplatesRelations = relations(documentationTemplates, ({ one }) => ({
  createdBy: one(users, {
    fields: [documentationTemplates.createdById],
    references: [users.id],
  }),
}));

export const projectDocumentationConfigsRelations = relations(projectDocumentationConfigs, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectDocumentationConfigs.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [projectDocumentationConfigs.createdById],
    references: [users.id],
  }),
  outputs: many(projectDocumentationOutputs),
}));

export const projectDocumentationOutputsRelations = relations(projectDocumentationOutputs, ({ one }) => ({
  project: one(projects, {
    fields: [projectDocumentationOutputs.projectId],
    references: [projects.id],
  }),
  config: one(projectDocumentationConfigs, {
    fields: [projectDocumentationOutputs.configId],
    references: [projectDocumentationConfigs.id],
  }),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [assets.uploadedById],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [assets.projectId],
    references: [projects.id],
  }),
}));

export const emailThreadsRelations = relations(emailThreads, ({ one, many }) => ({
  project: one(projects, {
    fields: [emailThreads.projectId],
    references: [projects.id],
  }),
  messages: many(emailMessages),
}));

export const emailMessagesRelations = relations(emailMessages, ({ one }) => ({
  thread: one(emailThreads, {
    fields: [emailMessages.threadId],
    references: [emailThreads.id],
  }),
}));

export const emailGithubConfigsRelations = relations(emailGithubConfigs, ({ one }) => ({
  project: one(projects, {
    fields: [emailGithubConfigs.projectId],
    references: [projects.id],
  }),
}));

export const sitePlannerNodesRelations = relations(sitePlannerNodes, ({ one }) => ({
  project: one(projects, {
    fields: [sitePlannerNodes.projectId],
    references: [projects.id],
  }),
}));

export const sitePlannerEdgesRelations = relations(sitePlannerEdges, ({ one }) => ({
  project: one(projects, {
    fields: [sitePlannerEdges.projectId],
    references: [projects.id],
  }),
}));

export const projectRoutesRelations = relations(projectRoutes, ({ one }) => ({
  project: one(projects, {
    fields: [projectRoutes.projectId],
    references: [projects.id],
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

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
});
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;

export const insertTaskTemplateSchema = createInsertSchema(taskTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
});
export type InsertTaskTemplate = z.infer<typeof insertTaskTemplateSchema>;
export type TaskTemplate = typeof taskTemplates.$inferSelect;

export const insertConversationTemplateSchema = createInsertSchema(conversationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
});
export type InsertConversationTemplate = z.infer<typeof insertConversationTemplateSchema>;
export type ConversationTemplate = typeof conversationTemplates.$inferSelect;

// Documentation schemas
export const insertDocumentationTemplateSchema = createInsertSchema(documentationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDocumentationTemplate = z.infer<typeof insertDocumentationTemplateSchema>;
export type DocumentationTemplate = typeof documentationTemplates.$inferSelect;

export const insertProjectDocumentationConfigSchema = createInsertSchema(projectDocumentationConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProjectDocumentationConfig = z.infer<typeof insertProjectDocumentationConfigSchema>;
export type ProjectDocumentationConfig = typeof projectDocumentationConfigs.$inferSelect;

export const insertProjectDocumentationOutputSchema = createInsertSchema(projectDocumentationOutputs).omit({
  id: true,
  renderedAt: true,
});
export type InsertProjectDocumentationOutput = z.infer<typeof insertProjectDocumentationOutputSchema>;
export type ProjectDocumentationOutput = typeof projectDocumentationOutputs.$inferSelect;

// Asset schemas
export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  uploadedAt: true,
});
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

// Email-GitHub Config schemas
export const insertEmailGithubConfigSchema = createInsertSchema(emailGithubConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmailGithubConfig = z.infer<typeof insertEmailGithubConfigSchema>;
export type EmailGithubConfig = typeof emailGithubConfigs.$inferSelect;

// Email Thread schemas
export const insertEmailThreadSchema = createInsertSchema(emailThreads).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
  hasActionableItems: true,
  isAnalyzed: true,
});
export type InsertEmailThread = z.infer<typeof insertEmailThreadSchema>;
export type EmailThread = typeof emailThreads.$inferSelect;

// Email Message schemas
export const insertEmailMessageSchema = createInsertSchema(emailMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertEmailMessage = z.infer<typeof insertEmailMessageSchema>;
export type EmailMessage = typeof emailMessages.$inferSelect;

// Email Attachment schemas
export const insertEmailAttachmentSchema = createInsertSchema(emailAttachments).omit({
  id: true,
  createdAt: true,
});
export type InsertEmailAttachment = z.infer<typeof insertEmailAttachmentSchema>;
export type EmailAttachment = typeof emailAttachments.$inferSelect;

// Site Planner Node schemas
export const insertSitePlannerNodeSchema = createInsertSchema(sitePlannerNodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSitePlannerNode = z.infer<typeof insertSitePlannerNodeSchema>;
export type SitePlannerNode = typeof sitePlannerNodes.$inferSelect;

// Site Planner Edge schemas
export const insertSitePlannerEdgeSchema = createInsertSchema(sitePlannerEdges).omit({
  id: true,
  createdAt: true,
});
export type InsertSitePlannerEdge = z.infer<typeof insertSitePlannerEdgeSchema>;
export type SitePlannerEdge = typeof sitePlannerEdges.$inferSelect;

// Project Route schemas
export const insertProjectRouteSchema = createInsertSchema(projectRoutes).omit({
  id: true,
  createdAt: true,
  lastSyncedAt: true,
});
export type InsertProjectRoute = z.infer<typeof insertProjectRouteSchema>;
export type ProjectRoute = typeof projectRoutes.$inferSelect;
