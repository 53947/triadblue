import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractActionItemsFromConversation } from "./ai";
import { syncGitHubActivity } from "./github";
import { agentService } from "./agent";
import { activityService } from "./activity";
import { githubIssuesService } from "./github-issues";
import { initializeSyncScheduler } from "./sync-scheduler";
import { NotificationService } from "./notification";
import { analyticsService } from "./analytics";
import { randomBytes, createHmac } from "crypto";
import { z } from "zod";
import { insertProjectSchema, insertTaskSchema, insertConversationSchema, insertGithubActivitySchema, insertApiKeySchema, insertAgentConnectionSchema, insertAgentChatMessageSchema, insertTaskTemplateSchema } from "@shared/schema";

// Helper function to create HMAC signature for webhook payloads
function createHmacSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

// Middleware to validate API key for external requests
async function validateApiKey(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const key = authHeader.substring(7);
  const apiKey = await storage.getApiKeyByKey(key);

  if (!apiKey || !apiKey.isActive) {
    return res.status(401).json({ error: "Invalid or inactive API key" });
  }

  // Update last used timestamp
  await storage.updateApiKeyLastUsed(apiKey.id);

  // Attach project ID and permissions to request
  req.apiKey = apiKey;
  next();
}

// Check if API key has specific permission
function requirePermission(permission: string) {
  return (req: any, res: any, next: any) => {
    if (!req.apiKey || !req.apiKey.permissions.includes(permission)) {
      return res.status(403).json({ error: `Permission denied: ${permission} required` });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the sync scheduler
  const syncScheduler = initializeSyncScheduler(storage);
  console.log("SyncScheduler initialized and started");

  // Initialize notification service
  const notificationService = new NotificationService(storage);
  console.log("NotificationService initialized");
  
  // ============= Projects API =============
  
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      // For now, use a default user ID. In a real app, this would come from auth
      const project = await storage.createProject({ ...data, createdById: "default-user" });
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateProject(req.params.id, updates);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // ============= API Keys =============

  app.get("/api/projects/:projectId/api-keys", async (req, res) => {
    try {
      const keys = await storage.getApiKeys(req.params.projectId);
      res.json(keys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/projects/:projectId/api-keys", async (req, res) => {
    try {
      const { name, permissions } = req.body;
      
      // Generate a secure random API key
      const key = `hub_${randomBytes(32).toString('hex')}`;
      
      const apiKey = await storage.createApiKey({
        projectId: req.params.projectId,
        key,
        name,
        permissions,
        isActive: true,
      });
      
      res.json(apiKey);
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  // ============= Webhooks API =============

  app.get("/api/projects/:projectId/webhooks", async (req, res) => {
    try {
      const webhooks = await storage.getWebhooks(req.params.projectId);
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ error: "Failed to fetch webhooks" });
    }
  });

  app.post("/api/projects/:projectId/webhooks", async (req, res) => {
    try {
      const { name, url, events } = req.body;
      
      // Generate a secure random webhook secret for HMAC verification
      const secret = randomBytes(32).toString('hex');
      
      const webhook = await storage.createWebhook({
        projectId: req.params.projectId,
        name,
        url,
        secret,
        events,
        isActive: true,
      });
      
      res.json(webhook);
    } catch (error) {
      console.error("Error creating webhook:", error);
      res.status(500).json({ error: "Failed to create webhook" });
    }
  });

  app.put("/api/webhooks/:id", async (req, res) => {
    try {
      const updates = req.body;
      const webhook = await storage.updateWebhook(req.params.id, updates);
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      res.json(webhook);
    } catch (error) {
      console.error("Error updating webhook:", error);
      res.status(500).json({ error: "Failed to update webhook" });
    }
  });

  app.delete("/api/webhooks/:id", async (req, res) => {
    try {
      await storage.deleteWebhook(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({ error: "Failed to delete webhook" });
    }
  });

  // INBOUND webhook receiver - external projects POST events here
  app.post("/api/projects/:projectId/webhook-events", async (req, res) => {
    try {
      const { projectId } = req.params;
      const signature = req.headers["x-hub-signature"] as string;
      
      if (!signature) {
        return res.status(401).json({ error: "Missing X-Hub-Signature header" });
      }

      // Use the raw body for HMAC verification (captured by express.json verify option)
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        return res.status(400).json({ error: "Unable to verify webhook signature - raw body missing" });
      }
      const payload = rawBody.toString('utf8');

      // Get all active webhooks for this project
      const webhooks = await storage.getWebhooks(projectId);
      const activeWebhooks = webhooks.filter(w => w.isActive);

      if (activeWebhooks.length === 0) {
        return res.status(404).json({ error: "No active webhooks configured for this project" });
      }

      // Verify signature against all active webhook secrets
      let verified = false;
      let matchedWebhook = null;

      for (const webhook of activeWebhooks) {
        const expectedSignature = createHmacSignature(payload, webhook.secret);
        if (signature === expectedSignature) {
          verified = true;
          matchedWebhook = webhook;
          break;
        }
      }

      if (!verified) {
        return res.status(401).json({ error: "Invalid webhook signature" });
      }

      // Process webhook event
      const event = req.body;
      const eventType = event.event || event.type;
      
      // Check if event type is allowed for this webhook
      if (matchedWebhook.events.length > 0 && !matchedWebhook.events.includes(eventType)) {
        return res.status(403).json({ error: `Event type '${eventType}' not allowed for this webhook` });
      }

      console.log(`Received webhook event: ${eventType} for project ${projectId}`);

      // Handle different event types
      if (eventType === "task.created" || eventType === "task_created") {
        const taskData = event.data || event.task;
        if (taskData) {
          // Fetch project to get default sync configuration
          const project = await storage.getProject(projectId);
          
          await storage.createTask({
            projectId,
            title: taskData.title || "Untitled Task",
            description: taskData.description || "",
            status: taskData.status || "pending",
            priority: taskData.priority || "medium",
            source: "api",
            sourceUrl: taskData.sourceUrl || taskData.url,
            // Auto-configure sync from project defaults (allow task-level override)
            syncEnabled: taskData.syncEnabled ?? project?.defaultSyncEnabled ?? false,
            syncUrl: taskData.syncUrl || project?.defaultSyncUrl || undefined,
          });
        }
      } else if (eventType === "task.updated" || eventType === "task_updated") {
        const taskData = event.data || event.task;
        if (taskData && taskData.id) {
          await storage.updateTask(taskData.id, {
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            priority: taskData.priority,
          });
        }
      } else if (eventType === "conversation.created" || eventType === "conversation_created") {
        const convData = event.data || event.conversation;
        if (convData) {
          await storage.createConversation({
            projectId,
            userId: "default-user", // System user for webhook-created conversations
            title: convData.title || "Webhook Conversation",
            content: convData.content || convData.text || "",
            agentName: convData.agentName || convData.agent || "External System",
          });
        }
      }

      // Update webhook last triggered timestamp
      if (matchedWebhook) {
        await storage.updateWebhookLastTriggered(matchedWebhook.id);
      }

      res.json({ success: true, message: "Webhook event processed successfully" });
    } catch (error) {
      console.error("Error processing webhook event:", error);
      res.status(500).json({ error: "Failed to process webhook event" });
    }
  });

  // ============= Task Templates API =============

  app.get("/api/projects/:projectId/templates", async (req, res) => {
    try {
      const templates = await storage.getTaskTemplates(req.params.projectId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching task templates:", error);
      res.status(500).json({ error: "Failed to fetch task templates" });
    }
  });

  app.post("/api/projects/:projectId/templates", async (req, res) => {
    try {
      const { projectId } = req.params;
      const data = req.body;
      
      const template = await storage.createTaskTemplate({
        ...data,
        projectId,
        createdById: "default-user", // TODO: Get from auth when implemented
      });
      
      res.json(template);
    } catch (error) {
      console.error("Error creating task template:", error);
      res.status(500).json({ error: "Failed to create task template" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTaskTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.updateTaskTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      await storage.deleteTaskTemplate(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  app.post("/api/templates/:id/instantiate", async (req, res) => {
    try {
      const template = await storage.getTaskTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const overrides = req.body || {};
      
      const task = await storage.createTask({
        projectId: template.projectId,
        title: overrides.title || template.name,
        description: overrides.description || template.description || "",
        priority: overrides.priority || template.defaultPriority,
        source: template.defaultSource,
        status: overrides.status || "pending",
      });

      res.json(task);
    } catch (error) {
      console.error("Error instantiating template:", error);
      res.status(500).json({ error: "Failed to instantiate template" });
    }
  });

  // ============= Tasks API =============

  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({ ...data, source: "manual" });
      
      // Create notification for urgent tasks
      if (task.priority === "urgent") {
        // Use default user (single-user app for now, TODO: implement auth)
        await notificationService.createUrgentTaskNotification("default-user", task);
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const updates = req.body;
      const task = await storage.updateTask(req.params.id, updates);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      // Create notification if task changed to urgent priority
      if (updates.priority === "urgent") {
        // Use default user (single-user app for now, TODO: implement auth)
        await notificationService.createUrgentTaskNotification("default-user", task);
      }
      
      // Trigger sync if status or priority changed and sync is enabled
      if ((updates.status || updates.priority) && task.syncEnabled) {
        await syncScheduler.enqueue(task, false);
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Create GitHub issue from task
  app.post("/api/tasks/:id/create-github-issue", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Check if already synced to GitHub
      if (task.githubIssueNumber) {
        return res.status(400).json({ 
          error: "Task already synced to GitHub",
          issueUrl: task.githubIssueUrl 
        });
      }

      // Get project to access GitHub repo
      const project = await storage.getProject(task.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Create GitHub issue
      const issue = await githubIssuesService.createIssueFromTask(task, project);

      // Update task with GitHub info
      const updatedTask = await storage.updateTask(task.id, {
        githubIssueNumber: issue.number,
        githubIssueUrl: issue.html_url,
        githubIssueState: issue.state,
        githubSyncedAt: new Date(),
      });

      console.log(`Task ${task.id} synced to GitHub issue #${issue.number}`);

      res.json({
        success: true,
        issue: {
          number: issue.number,
          url: issue.html_url,
          state: issue.state,
        },
        task: updatedTask,
      });
    } catch (error: any) {
      console.error("Error creating GitHub issue:", error);
      res.status(500).json({ error: error.message || "Failed to create GitHub issue" });
    }
  });

  // Manual sync trigger
  app.post("/api/tasks/:id/sync", async (req, res) => {
    try {
      const result = await syncScheduler.manualSync(req.params.id);
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error("Error triggering manual sync:", error);
      res.status(500).json({ error: "Failed to trigger sync" });
    }
  });

  // Get sync status for a task
  app.get("/api/tasks/:id/sync-status", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const queueStatus = syncScheduler.getSyncStatus(req.params.id);
      
      res.json({
        syncEnabled: task.syncEnabled,
        syncUrl: task.syncUrl,
        syncStatus: task.syncStatus,
        lastSyncAt: task.lastSyncAt,
        syncRetryCount: task.syncRetryCount,
        syncError: task.syncError,
        inQueue: queueStatus.inQueue,
        queueJob: queueStatus.job,
      });
    } catch (error) {
      console.error("Error fetching sync status:", error);
      res.status(500).json({ error: "Failed to fetch sync status" });
    }
  });

  // ============= Conversations API =============

  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const data = req.body;
      
      // Create conversation with a default user ID
      const conversation = await storage.createConversation({
        ...data,
        userId: "default-user",
      });

      // Extract action items using AI in the background
      extractActionItemsFromConversation(data.content)
        .then(async (items) => {
          if (items.length > 0) {
            await storage.updateConversationExtraction(conversation.id, items);
          }
        })
        .catch(err => {
          console.error("Error extracting action items:", err);
        });

      res.json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // ============= GitHub Activity API =============

  app.get("/api/github-activity", async (req, res) => {
    try {
      const activity = await storage.getGithubActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching GitHub activity:", error);
      res.status(500).json({ error: "Failed to fetch GitHub activity" });
    }
  });

  app.post("/api/github-activity", async (req, res) => {
    try {
      const data = insertGithubActivitySchema.parse(req.body);
      const activity = await storage.createGithubActivity(data);
      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating GitHub activity:", error);
      res.status(500).json({ error: "Failed to create GitHub activity" });
    }
  });

  // Sync GitHub activity for a project
  app.post("/api/projects/:projectId/sync-github", async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!project.githubRepo) {
        return res.status(400).json({ error: "Project does not have a GitHub repository configured" });
      }

      const token = process.env.GITHUB_TOKEN;
      const activities = await syncGitHubActivity(
        projectId,
        project.githubRepo,
        project.githubBranch || "main",
        token,
        project.lastGithubSync || undefined
      );

      // Filter out commits that already exist in the database
      const newActivities = [];
      for (const activity of activities) {
        const existing = await storage.getGithubActivityBySha(projectId, activity.commitSha || "");
        if (!existing) {
          newActivities.push(activity);
        }
      }

      const saved = await storage.bulkCreateGithubActivity(newActivities);

      // Update lastGithubSync timestamp
      await storage.updateProject(projectId, { lastGithubSync: new Date() });

      res.json({ 
        synced: saved.length,
        total: activities.length,
        activities: saved 
      });
    } catch (error: any) {
      console.error("Error syncing GitHub activity:", error);
      res.status(500).json({ error: error.message || "Failed to sync GitHub activity" });
    }
  });

  // ============= Activity Timeline API =============

  app.get("/api/activities", async (req, res) => {
    try {
      const { projectId, type, search, startDate, endDate, limit, offset } = req.query;
      
      const result = await activityService.getActivities({
        projectId: projectId as string | undefined,
        type: type as string | undefined,
        search: search as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // ============= Notifications API =============

  // Get notifications for current user
  app.get("/api/notifications", async (req, res) => {
    try {
      // Use default user (single-user app for now, TODO: implement auth)
      const userId = "default-user";
      
      const notifications = await storage.getNotifications(userId);
      
      // Add unread count in response header
      const unreadCount = notifications.filter(n => !n.read).length;
      res.set("X-Unread-Count", unreadCount.toString());
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Bulk mark as read
  app.post("/api/notifications/bulk-read", async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "ids must be an array" });
      }

      await Promise.all(ids.map(id => storage.markNotificationAsRead(id)));
      res.json({ success: true, count: ids.length });
    } catch (error) {
      console.error("Error bulk marking notifications as read:", error);
      res.status(500).json({ error: "Failed to bulk mark notifications as read" });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // Get notification preferences
  app.get("/api/notification-preferences", async (req, res) => {
    try {
      // Use default user (single-user app for now, TODO: implement auth)
      const userId = "default-user";
      
      const preferences = await storage.getNotificationPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ error: "Failed to fetch notification preferences" });
    }
  });

  // Update notification preference
  app.patch("/api/notification-preferences/:type", async (req, res) => {
    try {
      // Use default user (single-user app for now, TODO: implement auth)
      const userId = "default-user";
      const { enabled } = req.body;
      
      await storage.updateNotificationPreference(userId, req.params.type, enabled);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating notification preference:", error);
      res.status(500).json({ error: "Failed to update notification preference" });
    }
  });

  // ============= External API Endpoints (for project integrations) =============

  // Submit task from external project
  app.post("/api/external/tasks", validateApiKey, requirePermission("write_tasks"), async (req, res) => {
    try {
      const { title, description, priority = "medium", status = "pending", syncUrl, syncEnabled } = req.body;
      
      // Fetch project to get default sync configuration
      const project = await storage.getProject(req.apiKey.projectId);
      
      const task = await storage.createTask({
        projectId: req.apiKey.projectId,
        title,
        description,
        priority,
        status,
        source: "api",
        // Auto-configure sync from project defaults (allow task-level override)
        syncEnabled: syncEnabled ?? project?.defaultSyncEnabled ?? false,
        syncUrl: syncUrl || project?.defaultSyncUrl || undefined,
      });

      res.json(task);
    } catch (error) {
      console.error("Error creating external task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  // Log conversation from external project
  app.post("/api/external/conversations", validateApiKey, requirePermission("log_conversations"), async (req, res) => {
    try {
      const { title, content, agentName } = req.body;

      const conversation = await storage.createConversation({
        projectId: req.apiKey.projectId,
        userId: "default-user",
        title,
        content,
        agentName,
      });

      // Extract action items in background
      extractActionItemsFromConversation(content)
        .then(async (items) => {
          if (items.length > 0) {
            await storage.updateConversationExtraction(conversation.id, items);
          }
        })
        .catch(err => {
          console.error("Error extracting action items:", err);
        });

      res.json(conversation);
    } catch (error) {
      console.error("Error logging external conversation:", error);
      res.status(500).json({ error: "Failed to log conversation" });
    }
  });

  // Report GitHub activity from external project
  app.post("/api/external/github-activity", validateApiKey, requirePermission("report_github_activity"), async (req, res) => {
    try {
      const data = req.body;
      
      const activity = await storage.createGithubActivity({
        projectId: req.apiKey.projectId,
        ...data,
      });

      res.json(activity);
    } catch (error) {
      console.error("Error reporting GitHub activity:", error);
      res.status(500).json({ error: "Failed to report GitHub activity" });
    }
  });

  // ============= Agent Connections API =============
  
  // Get agent connections for a project
  app.get("/api/projects/:projectId/agent-connections", async (req, res) => {
    try {
      const connections = await storage.getAgentConnections(req.params.projectId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching agent connections:", error);
      res.status(500).json({ error: "Failed to fetch agent connections" });
    }
  });

  // Get a specific agent connection
  app.get("/api/agent-connections/:id", async (req, res) => {
    try {
      const connection = await storage.getAgentConnection(req.params.id);
      if (!connection) {
        return res.status(404).json({ error: "Agent connection not found" });
      }
      res.json(connection);
    } catch (error) {
      console.error("Error fetching agent connection:", error);
      res.status(500).json({ error: "Failed to fetch agent connection" });
    }
  });

  // Create a new agent connection
  app.post("/api/projects/:projectId/agent-connections", async (req, res) => {
    try {
      const validated = insertAgentConnectionSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });

      const connection = await storage.createAgentConnection(validated);
      res.json(connection);
    } catch (error: any) {
      console.error("Error creating agent connection:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid agent connection data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create agent connection" });
    }
  });

  // Update an agent connection
  app.put("/api/agent-connections/:id", async (req, res) => {
    try {
      const updates = insertAgentConnectionSchema.partial().parse(req.body);
      const connection = await storage.updateAgentConnection(req.params.id, updates);
      
      if (!connection) {
        return res.status(404).json({ error: "Agent connection not found" });
      }
      
      res.json(connection);
    } catch (error: any) {
      console.error("Error updating agent connection:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid agent connection data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update agent connection" });
    }
  });

  // Delete an agent connection
  app.delete("/api/agent-connections/:id", async (req, res) => {
    try {
      await storage.deleteAgentConnection(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting agent connection:", error);
      res.status(500).json({ error: "Failed to delete agent connection" });
    }
  });

  // Test an agent connection
  app.post("/api/agent-connections/:id/test", async (req, res) => {
    try {
      const connection = await storage.getAgentConnection(req.params.id);
      if (!connection) {
        return res.status(404).json({ error: "Agent connection not found" });
      }

      const isConnected = await agentService.testConnection(connection);
      res.json({ success: isConnected });
    } catch (error) {
      console.error("Error testing agent connection:", error);
      res.status(500).json({ error: "Failed to test agent connection" });
    }
  });

  // ============= Agent Chat Messages API =============

  // Get messages for a connection
  app.get("/api/agent-connections/:connectionId/messages", async (req, res) => {
    try {
      const messages = await storage.getAgentChatMessages(req.params.connectionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching agent chat messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message to an agent
  app.post("/api/agent-connections/:connectionId/messages", async (req, res) => {
    try {
      const { content } = req.body;
      const connectionId = req.params.connectionId;

      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Get the connection
      const connection = await storage.getAgentConnection(connectionId);
      if (!connection) {
        return res.status(404).json({ error: "Agent connection not found" });
      }

      // Get conversation history
      const history = await storage.getAgentChatMessages(connectionId);

      // Save user message
      const userMessage = await storage.createAgentChatMessage({
        connectionId,
        role: "user",
        content,
      });

      // Send message to agent and get response
      const agentReply = await agentService.sendMessage(connection, content, history);

      // Save agent response
      const assistantMessage = await storage.createAgentChatMessage({
        connectionId,
        role: "assistant",
        content: agentReply,
      });

      // Update last message timestamp
      await storage.updateAgentConnectionLastMessage(connectionId);

      res.json({
        userMessage,
        assistantMessage,
      });
    } catch (error: any) {
      console.error("Error sending message to agent:", error);
      res.status(500).json({ error: "Failed to send message", details: error.message });
    }
  });

  // ============= Analytics API =============

  // Get analytics summary
  app.get("/api/analytics", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const analytics = await analyticsService.getAnalyticsSummary(filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Export analytics data
  app.get("/api/analytics/export", async (req, res) => {
    try {
      const { format = "json", startDate, endDate } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const exportData = await analyticsService.exportAnalytics(format as "json" | "csv", filters);
      
      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=analytics-export.csv");
        res.send(exportData);
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=analytics-export.json");
        res.send(exportData);
      }
    } catch (error) {
      console.error("Error exporting analytics:", error);
      res.status(500).json({ error: "Failed to export analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
