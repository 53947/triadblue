import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractActionItemsFromConversation } from "./ai";
import { syncGitHubActivity } from "./github";
import { agentService } from "./agent";
import { analyzeConversation } from "./conversation-analyzer";
import { autoCreateGitHubIssues } from "./github-issue-automation";
import { activityService } from "./activity";
import { githubIssuesService } from "./github-issues";
import { githubDocsService } from "./github-docs";
import { initializeSyncScheduler } from "./sync-scheduler";
import { NotificationService } from "./notification";
import { analyticsService } from "./analytics";
import { templatingService } from "./templating";
import { randomBytes, createHmac, randomUUID } from "crypto";
import AdmZip from "adm-zip";
import { z } from "zod";
import { insertProjectSchema, insertTaskSchema, insertConversationSchema, insertGithubActivitySchema, insertApiKeySchema, insertAgentConnectionSchema, insertAgentChatMessageSchema, insertTaskTemplateSchema, insertConversationTemplateSchema, insertAssetSchema } from "@shared/schema";
import { authRequired, constantTimeCompare, setStorageForAuth, type AuthRequest } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

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
  // Initialize storage for auth middleware
  setStorageForAuth(storage);
  
  // Validate required environment variables for webhooks
  if (!process.env.AGENTMAIL_WEBHOOK_SECRET) {
    const errorMsg = "CRITICAL: AGENTMAIL_WEBHOOK_SECRET environment variable is not set. Email webhooks will be non-functional.";
    console.error(errorMsg);
    throw new Error("AGENTMAIL_WEBHOOK_SECRET is required for webhook security");
  }

  // Initialize the sync scheduler
  const syncScheduler = initializeSyncScheduler(storage);
  console.log("SyncScheduler initialized and started");

  // Initialize notification service
  const notificationService = new NotificationService(storage);
  console.log("NotificationService initialized");
  
  // ============= Authentication API =============
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { password } = req.body;
      const correctPassword = process.env.DASHBOARD_PASSWORD;

      if (!correctPassword) {
        console.error("DASHBOARD_PASSWORD not configured");
        return res.status(500).json({ error: "Authentication not configured" });
      }

      if (!password || !constantTimeCompare(password, correctPassword)) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Ensure system admin user exists and get it
      const systemUser = await storage.ensureSystemAdminUser();

      const authReq = req as AuthRequest;
      authReq.session.user = {
        id: systemUser.id,
        username: systemUser.username,
        role: systemUser.role,
      };
      
      authReq.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        res.json({ success: true, user: authReq.session.user });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authReq = req as AuthRequest;
      authReq.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const authReq = req as AuthRequest;
    if (!authReq.session?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ user: authReq.session.user });
  });
  
  // ============= Projects API =============
  
  app.get("/api/projects", authRequired, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", authRequired, async (req, res) => {
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

  app.post("/api/projects", authRequired, async (req, res) => {
    try {
      const authReq = req as AuthRequest;
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...data,
        createdById: authReq.session.user.id,
      });
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", authRequired, async (req, res) => {
    try {
      // Validate project updates with Zod schema
      const projectUpdateSchema = z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        githubRepo: z.string().nullable().optional(),
        githubBranch: z.string().optional(),
        defaultSyncEnabled: z.boolean().optional(),
        defaultSyncUrl: z.string().url().nullable().optional(),
        features: z.array(z.string()).optional(),
        techStack: z.array(z.string()).optional(),
        metadataApiUrl: z.string().url().nullable().optional(),
      });

      const updates = projectUpdateSchema.parse(req.body);
      const project = await storage.updateProject(req.params.id, updates);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      console.error("Error updating project:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", authRequired, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // ============= API Keys =============

  app.get("/api/projects/:projectId/api-keys", authRequired, async (req, res) => {
    try {
      const keys = await storage.getApiKeys(req.params.projectId);
      res.json(keys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/projects/:projectId/api-keys", authRequired, async (req, res) => {
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

  app.get("/api/projects/:projectId/webhooks", authRequired, async (req, res) => {
    try {
      const webhooks = await storage.getWebhooks(req.params.projectId);
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ error: "Failed to fetch webhooks" });
    }
  });

  app.post("/api/projects/:projectId/webhooks", authRequired, async (req, res) => {
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

  app.put("/api/webhooks/:id", authRequired, async (req, res) => {
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

  app.delete("/api/webhooks/:id", authRequired, async (req, res) => {
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

      if (!verified || !matchedWebhook) {
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

  app.get("/api/projects/:projectId/templates", authRequired, async (req, res) => {
    try {
      const templates = await storage.getTaskTemplates(req.params.projectId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching task templates:", error);
      res.status(500).json({ error: "Failed to fetch task templates" });
    }
  });

  app.post("/api/projects/:projectId/templates", authRequired, async (req, res) => {
    try {
      const authReq = req as AuthRequest;
      const { projectId } = req.params;
      const data = req.body;
      
      const template = await storage.createTaskTemplate({
        ...data,
        projectId,
        createdById: authReq.session.user.id,
      });
      
      res.json(template);
    } catch (error) {
      console.error("Error creating task template:", error);
      res.status(500).json({ error: "Failed to create task template" });
    }
  });

  app.get("/api/templates/:id", authRequired, async (req, res) => {
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

  app.put("/api/templates/:id", authRequired, async (req, res) => {
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

  app.delete("/api/templates/:id", authRequired, async (req, res) => {
    try {
      await storage.deleteTaskTemplate(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  app.post("/api/templates/:id/instantiate", authRequired, async (req, res) => {
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

  app.get("/api/tasks", authRequired, async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", authRequired, async (req, res) => {
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

  app.post("/api/tasks", authRequired, async (req, res) => {
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

  app.put("/api/tasks/:id", authRequired, async (req, res) => {
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

  app.delete("/api/tasks/:id", authRequired, async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Create GitHub issue from task
  app.post("/api/tasks/:id/create-github-issue", authRequired, async (req, res) => {
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
  app.post("/api/tasks/:id/sync", authRequired, async (req, res) => {
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
  app.get("/api/tasks/:id/sync-status", authRequired, async (req, res) => {
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

  app.get("/api/conversations", authRequired, async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", authRequired, async (req, res) => {
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

  app.post("/api/conversations", authRequired, async (req, res) => {
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

  app.get("/api/github-activity", authRequired, async (req, res) => {
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

  app.get("/api/activities", authRequired, async (req, res) => {
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
  app.get("/api/notifications", authRequired, async (req, res) => {
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
  app.post("/api/external/tasks", validateApiKey, requirePermission("write_tasks"), async (req: any, res) => {
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
  app.post("/api/external/conversations", validateApiKey, requirePermission("log_conversations"), async (req: any, res) => {
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
  app.post("/api/external/github-activity", validateApiKey, requirePermission("report_github_activity"), async (req: any, res) => {
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

  // Fetch and update project metadata from external project's API
  app.post("/api/projects/:projectId/refresh-metadata", authRequired, async (req, res) => {
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      const project = await storage.getProject(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!project.metadataApiUrl) {
        return res.status(400).json({ error: "Project does not have a metadata API URL configured" });
      }

      // Fetch metadata from external project with timeout
      timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let response;
      try {
        response = await fetch(project.metadataApiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          return res.status(504).json({ error: "Request to external API timed out" });
        }
        return res.status(502).json({ 
          error: `Failed to connect to external API: ${fetchError.message}` 
        });
      }

      if (!response.ok) {
        return res.status(502).json({ 
          error: `External API returned error: ${response.status} ${response.statusText}` 
        });
      }

      // Check content length (max 1MB)
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 1024 * 1024) {
        return res.status(413).json({ error: "External API response too large (max 1MB)" });
      }

      // Read response with size limit
      let data;
      try {
        const text = await response.text();
        if (text.length > 1024 * 1024) {
          return res.status(413).json({ error: "External API response too large (max 1MB)" });
        }
        data = JSON.parse(text);
      } catch (parseError) {
        return res.status(502).json({ error: "External API returned invalid JSON" });
      }

      const { features, techStack } = data;

      // Validate response format
      if (features && !Array.isArray(features)) {
        return res.status(400).json({ error: "External API returned invalid features format (must be array)" });
      }
      
      if (techStack && !Array.isArray(techStack)) {
        return res.status(400).json({ error: "External API returned invalid techStack format (must be array)" });
      }

      // Validate array contents and sanitize
      if (features && !features.every((f: any) => typeof f === 'string' && f.trim().length > 0)) {
        return res.status(400).json({ error: "External API features must contain only non-empty strings" });
      }
      
      if (techStack && !techStack.every((t: any) => typeof t === 'string' && t.trim().length > 0)) {
        return res.status(400).json({ error: "External API techStack must contain only non-empty strings" });
      }

      // Sanitize and trim values
      const updateData: any = {};
      if (features) updateData.features = features.map((f: string) => f.trim()).filter((f: string) => f.length > 0);
      if (techStack) updateData.techStack = techStack.map((t: string) => t.trim()).filter((t: string) => t.length > 0);

      if (Object.keys(updateData).length > 0) {
        await storage.updateProject(req.params.projectId, updateData);
      }
      
      const updatedProject = await storage.getProject(req.params.projectId);
      res.json({
        project: {
          id: updatedProject?.id,
          name: updatedProject?.name,
          features: updatedProject?.features,
          techStack: updatedProject?.techStack,
        },
      });
    } catch (error) {
      console.error("Error refreshing project metadata:", error);
      res.status(500).json({ error: "Failed to refresh project metadata" });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  });

  // Mock metadata endpoint for testing (remove in production)
  app.get("/mock-metadata", (req, res) => {
    res.json({
      features: [
        "Task Management System",
        "GitHub Integration",
        "Documentation Generator",
        "Real-time Agent Chat"
      ],
      techStack: [
        "React",
        "TypeScript",
        "Express.js",
        "PostgreSQL",
        "Drizzle ORM"
      ]
    });
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
  app.get("/api/agent-connections/:id", authRequired, async (req, res) => {
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
      const projectId = req.params.projectId === 'default' ? null : req.params.projectId;
      const validated = insertAgentConnectionSchema.parse({
        ...req.body,
        projectId,
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
  app.put("/api/agent-connections/:id", authRequired, async (req, res) => {
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
  app.delete("/api/agent-connections/:id", authRequired, async (req, res) => {
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
  app.get("/api/agent-connections/:connectionId/messages", authRequired, async (req, res) => {
    try {
      const messages = await storage.getAgentChatMessages(req.params.connectionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching agent chat messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message to an agent
  app.post("/api/agent-connections/:connectionId/messages", authRequired, async (req, res) => {
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

  // ============= Conversation Templates API =============
  
  app.get("/api/projects/:projectId/conversation-templates", authRequired, async (req, res) => {
    try {
      const templates = await storage.getConversationTemplates(req.params.projectId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching conversation templates:", error);
      res.status(500).json({ error: "Failed to fetch conversation templates" });
    }
  });

  app.get("/api/conversation-templates/global", authRequired, async (req, res) => {
    try {
      const templates = await storage.getConversationTemplates(null);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching global conversation templates:", error);
      res.status(500).json({ error: "Failed to fetch global conversation templates" });
    }
  });

  app.post("/api/projects/:projectId/conversation-templates", authRequired, async (req, res) => {
    try {
      const authReq = req as AuthRequest;
      const { projectId } = req.params;
      
      const result = insertConversationTemplateSchema.safeParse({
        ...req.body,
        projectId,
      });

      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.errors });
      }

      const template = await storage.createConversationTemplate({
        ...result.data,
        createdById: authReq.session.user.id,
      });
      res.json(template);
    } catch (error) {
      console.error("Error creating conversation template:", error);
      res.status(500).json({ error: "Failed to create conversation template" });
    }
  });

  app.put("/api/conversation-templates/:id", authRequired, async (req, res) => {
    try {
      const result = insertConversationTemplateSchema
        .partial()
        .omit({ projectId: true })
        .safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.errors });
      }

      const template = await storage.updateConversationTemplate(req.params.id, result.data);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating conversation template:", error);
      res.status(500).json({ error: "Failed to update conversation template" });
    }
  });

  app.delete("/api/conversation-templates/:id", authRequired, async (req, res) => {
    try {
      await storage.deleteConversationTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation template:", error);
      res.status(500).json({ error: "Failed to delete conversation template" });
    }
  });

  // ============= Documentation Generator API =============

  app.get("/api/documentation/templates", authRequired, async (req, res) => {
    try {
      const templates = await storage.getDocumentationTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching documentation templates:", error);
      res.status(500).json({ error: "Failed to fetch documentation templates" });
    }
  });

  app.get("/api/documentation/templates/:id", authRequired, async (req, res) => {
    try {
      const template = await storage.getDocumentationTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching documentation template:", error);
      res.status(500).json({ error: "Failed to fetch documentation template" });
    }
  });

  app.get("/api/projects/:projectId/documentation/config", authRequired, async (req, res) => {
    try {
      const { projectId } = req.params;
      const configs = await storage.getProjectDocumentationConfigs(projectId);
      if (configs.length === 0) {
        return res.status(404).json({ error: "Documentation config not found" });
      }
      const config = configs[0];
      res.json({
        ...config,
        metadata: JSON.parse(config.metadata),
      });
    } catch (error) {
      console.error("Error fetching documentation config:", error);
      res.status(500).json({ error: "Failed to fetch documentation config" });
    }
  });

  app.post("/api/projects/:projectId/documentation/config", authRequired, async (req, res) => {
    try {
      const { projectId } = req.params;
      const { selectedTemplates, metadata } = req.body;

      if (!Array.isArray(selectedTemplates)) {
        return res.status(400).json({ error: "selectedTemplates must be an array" });
      }

      if (metadata && typeof metadata !== "object") {
        return res.status(400).json({ error: "metadata must be an object" });
      }

      // Save features and tech stack to project profile
      if (metadata.FEATURES || metadata.TECH_STACK) {
        await storage.updateProject(projectId, {
          features: metadata.FEATURES || undefined,
          techStack: metadata.TECH_STACK || undefined,
        });
      }

      const config = await storage.upsertProjectDocumentationConfig({
        projectId,
        selectedTemplates,
        metadata: JSON.stringify(metadata || {}),
        createdById: "default-user",
      });

      res.json({
        ...config,
        metadata: JSON.parse(config.metadata),
      });
    } catch (error) {
      console.error("Error saving documentation config:", error);
      res.status(500).json({ error: "Failed to save documentation config" });
    }
  });

  app.get("/api/projects/:projectId/documentation/outputs", authRequired, async (req, res) => {
    try {
      const { projectId } = req.params;
      const outputs = await storage.getProjectDocumentationOutputs(projectId);
      res.json(outputs.map(output => ({
        ...output,
        metadata: JSON.parse(output.metadata),
      })));
    } catch (error) {
      console.error("Error fetching documentation outputs:", error);
      res.status(500).json({ error: "Failed to fetch documentation outputs" });
    }
  });

  app.post("/api/projects/:projectId/documentation/generate", authRequired, async (req, res) => {
    try {
      const { projectId } = req.params;
      const { metadata } = req.body;

      if (!metadata || typeof metadata !== "object") {
        return res.status(400).json({ error: "metadata object is required" });
      }

      const configs = await storage.getProjectDocumentationConfigs(projectId);
      if (configs.length === 0) {
        return res.status(400).json({ error: "Documentation config not found. Please configure templates first." });
      }

      const config = configs[0];
      const configMetadata = JSON.parse(config.metadata);

      const allTemplates = await storage.getDocumentationTemplates();
      const selectedTemplates = allTemplates.filter(t => 
        config.selectedTemplates.includes(t.id)
      );

      if (selectedTemplates.length === 0) {
        return res.status(400).json({ error: "No templates selected in configuration" });
      }

      const outputs = [];
      const mergedMetadata = { ...configMetadata, ...metadata };

      for (const template of selectedTemplates) {
        const result = templatingService.render(
          template.body,
          mergedMetadata,
          { detectMissingVariables: true }
        );

        if (!result.success) {
          return res.status(500).json({
            error: `Failed to render template ${template.label}`,
            details: result.error,
          });
        }

        const output = await storage.createProjectDocumentationOutput({
          projectId,
          configId: config.id,
          templateKey: template.key,
          fileName: template.label,
          content: result.output!,
          metadata: JSON.stringify(mergedMetadata),
          createdById: "default-user",
        });

        outputs.push({
          ...output,
          metadata: mergedMetadata,
          missingVariables: result.missingVariables,
        });
      }

      res.json({
        success: true,
        outputs,
        message: `Generated ${outputs.length} documentation files`,
      });
    } catch (error) {
      console.error("Error generating documentation:", error);
      res.status(500).json({ error: "Failed to generate documentation" });
    }
  });

  app.get("/api/projects/:projectId/documentation/export", authRequired, async (req, res) => {
    try {
      const { projectId } = req.params;

      const outputs = await storage.getProjectDocumentationOutputs(projectId);

      if (outputs.length === 0) {
        return res.status(404).json({ error: "No documentation outputs found. Please generate documentation first." });
      }

      const zip = new AdmZip();

      for (const output of outputs) {
        zip.addFile(output.fileName, Buffer.from(output.content, "utf-8"));
      }

      const zipBuffer = zip.toBuffer();

      const project = await storage.getProject(projectId);
      const projectName = project?.name || "project";
      const timestamp = new Date().toISOString().split('T')[0];
      const zipFileName = `${projectName}-documentation-${timestamp}.zip`;

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${zipFileName}"`);
      res.setHeader("Content-Length", zipBuffer.length);
      res.send(zipBuffer);
    } catch (error) {
      console.error("Error exporting documentation:", error);
      res.status(500).json({ error: "Failed to export documentation" });
    }
  });

  app.post("/api/projects/:projectId/documentation/push-to-github", authRequired, async (req, res) => {
    try {
      const { projectId } = req.params;
      const { targetPath = "docs/" } = req.body;

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!project.githubRepo) {
        return res.status(400).json({ 
          error: "Project does not have a GitHub repository configured. Please configure a repository in project settings." 
        });
      }

      const outputs = await storage.getProjectDocumentationOutputs(projectId);
      if (outputs.length === 0) {
        return res.status(400).json({ 
          error: "No documentation outputs found. Please generate documentation first." 
        });
      }

      const commit = await githubDocsService.pushDocumentation(outputs, project, targetPath);

      for (const output of outputs) {
        await storage.updateProjectDocumentationOutput(output.id, {
          githubCommitSha: commit.sha,
        });
      }

      res.json({
        success: true,
        commit: {
          sha: commit.sha,
          url: commit.html_url,
          message: commit.commit.message,
        },
        filesCount: outputs.length,
        repository: project.githubRepo,
        branch: project.githubBranch || "main",
        targetPath,
      });
    } catch (error: any) {
      console.error("Error pushing documentation to GitHub:", error);
      res.status(500).json({ 
        error: error.message || "Failed to push documentation to GitHub" 
      });
    }
  });

  app.post("/api/documentation/preview", authRequired, async (req, res) => {
    try {
      const { templateId, metadata } = req.body;

      if (!templateId) {
        return res.status(400).json({ error: "templateId is required" });
      }

      if (!metadata || typeof metadata !== "object") {
        return res.status(400).json({ error: "metadata object is required" });
      }

      const template = await storage.getDocumentationTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const result = templatingService.render(
        template.body,
        metadata,
        { detectMissingVariables: true }
      );

      if (!result.success) {
        return res.status(500).json({
          error: "Failed to render template",
          details: result.error,
        });
      }

      res.json({
        success: true,
        output: result.output,
        missingVariables: result.missingVariables,
        extractedVariables: templatingService.extractVariables(template.body),
      });
    } catch (error) {
      console.error("Error previewing documentation:", error);
      res.status(500).json({ error: "Failed to preview documentation" });
    }
  });

  // ============= Assets API =============

  // Configure multer for file uploads
  const ALLOWED_MIME_TYPES = [
    'image/png',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/webp',
  ];
  
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeFilename = `${randomUUID()}${ext}`;
        cb(null, safeFilename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed: PNG, SVG, ICO, WEBP`));
      }
      cb(null, true);
    },
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  });

  // Serve uploaded assets
  app.use('/uploads', express.static('uploads'));

  // Public endpoint for active favicon and logo (no auth required)
  app.get("/api/public/assets/active", async (req, res) => {
    try {
      const { type } = req.query;
      
      if (type && type !== 'favicon' && type !== 'logo') {
        return res.status(400).json({ error: "Type must be 'favicon' or 'logo'" });
      }
      
      const assets = await storage.listAssets(
        type ? String(type) : undefined,
        null // Only global assets (no project-specific)
      );
      
      // Filter for active assets only
      const activeAssets = assets.filter(asset => asset.isActive);
      
      res.json(activeAssets);
    } catch (error) {
      console.error("Error fetching active assets:", error);
      res.status(500).json({ error: "Failed to fetch active assets" });
    }
  });

  // Upload new asset
  app.post("/api/assets", authRequired, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { type, projectId } = req.body;

      if (!type) {
        await unlinkAsync(req.file.path);
        return res.status(400).json({ error: "Asset type is required" });
      }

      const validTypes = ['favicon', 'logo', 'image'];
      if (!validTypes.includes(type)) {
        await unlinkAsync(req.file.path);
        return res.status(400).json({ error: "Invalid asset type. Must be: favicon, logo, or image" });
      }

      const userId = 'default-user';

      const asset = await storage.saveAsset({
        type,
        projectId: projectId || null,
        filename: req.file.filename,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        isActive: false,
        uploadedById: userId,
      });

      res.json(asset);
    } catch (error: any) {
      if (req.file) {
        try {
          await unlinkAsync(req.file.path);
        } catch (e) {
          console.error("Failed to delete uploaded file after error:", e);
        }
      }
      console.error("Error uploading asset:", error);
      res.status(500).json({ error: error.message || "Failed to upload asset" });
    }
  });

  // List assets
  app.get("/api/assets", authRequired, async (req, res) => {
    try {
      const { type, projectId } = req.query;
      
      const parsedProjectId = projectId === 'null' ? null : projectId === undefined ? undefined : String(projectId);
      
      const assets = await storage.listAssets(
        type ? String(type) : undefined,
        parsedProjectId
      );
      
      res.json(assets);
    } catch (error) {
      console.error("Error listing assets:", error);
      res.status(500).json({ error: "Failed to list assets" });
    }
  });

  // Get single asset
  app.get("/api/assets/:id", authRequired, async (req, res) => {
    try {
      const asset = await storage.getAsset(req.params.id);
      
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      
      res.json(asset);
    } catch (error) {
      console.error("Error getting asset:", error);
      res.status(500).json({ error: "Failed to get asset" });
    }
  });

  // Set asset as active
  app.patch("/api/assets/:id/activate", authRequired, async (req, res) => {
    try {
      const asset = await storage.getAsset(req.params.id);
      
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      await storage.setActiveAsset(req.params.id);
      
      const updatedAsset = await storage.getAsset(req.params.id);
      res.json(updatedAsset);
    } catch (error: any) {
      console.error("Error activating asset:", error);
      res.status(500).json({ error: error.message || "Failed to activate asset" });
    }
  });

  // Delete asset
  app.delete("/api/assets/:id", authRequired, async (req, res) => {
    try {
      const asset = await storage.getAsset(req.params.id);
      
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      const filePath = path.join('uploads', asset.filename);
      
      try {
        if (fs.existsSync(filePath)) {
          await unlinkAsync(filePath);
        }
      } catch (fileError) {
        console.error("Failed to delete file from disk:", fileError);
      }

      await storage.deleteAsset(req.params.id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ error: "Failed to delete asset" });
    }
  });

  // ============= Email Communication API =============

  // Get email threads for a project
  app.get("/api/projects/:projectId/email-threads", authRequired, async (req, res) => {
    try {
      const threads = await storage.getEmailThreadsByProject(req.params.projectId);
      res.json(threads);
    } catch (error) {
      console.error("Error fetching email threads:", error);
      res.status(500).json({ error: "Failed to fetch email threads" });
    }
  });

  // Get messages for an email thread
  app.get("/api/email-threads/:threadId/messages", authRequired, async (req, res) => {
    try {
      const messages = await storage.getEmailMessagesByThread(req.params.threadId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching email messages:", error);
      res.status(500).json({ error: "Failed to fetch email messages" });
    }
  });

  // Send email to agent
  app.post("/api/projects/:projectId/send-email", authRequired, async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      const { projectId } = req.params;

      if (!to || !subject || !body) {
        return res.status(400).json({ error: "Missing required fields: to, subject, body" });
      }

      // Get email config to find inbox ID
      const config = await storage.getEmailConfigByProject(projectId);
      if (!config) {
        return res.status(404).json({ error: "Email configuration not found for this project" });
      }

      if (!config.inboxId) {
        return res.status(400).json({ error: "Inbox ID not configured. Please set up the email configuration first." });
      }

      // Get or create email thread
      let thread = await storage.getEmailThreadByProjectAndSubject(projectId, subject);
      
      if (!thread) {
        thread = await storage.createEmailThread({
          projectId,
          subject,
          agentEmail: to,
        });
      }

      // Create outgoing message record
      const message = await storage.createEmailMessage({
        threadId: thread.id,
        direction: "sent",
        fromEmail: config.emailAddress,
        toEmail: to,
        subject,
        body,
      });

      // Send via AgentMail
      try {
        const { getUncachableAgentMailClient } = await import('./agentmail');
        const client = await getUncachableAgentMailClient();
        
        await client.inboxes.messages.send(config.inboxId, {
          to,
          subject,
          text: body,
        });
      } catch (emailError: any) {
        console.error("Failed to send email via AgentMail:", emailError);
        return res.status(500).json({ 
          error: "Failed to send email via AgentMail", 
          details: emailError.message 
        });
      }

      // Update thread last message time
      await storage.updateEmailThreadLastMessage(thread.id);

      res.json({ thread, message });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // Webhook to receive emails from AgentMail
  app.post("/api/webhooks/agentmail", async (req, res) => {
    try {
      // Webhook security: verify shared secret
      const webhookSecret = process.env.AGENTMAIL_WEBHOOK_SECRET!; // Already validated at startup
      const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
      
      if (!providedSecret) {
        console.warn("Webhook authentication failed: secret not provided");
        return res.status(401).json({ error: "Unauthorized: missing webhook secret" });
      }
      
      if (providedSecret !== webhookSecret) {
        console.warn("Webhook authentication failed: invalid secret");
        return res.status(401).json({ error: "Unauthorized: invalid webhook secret" });
      }

      const { from, to, subject, body, metadata } = req.body;

      if (!from || !to || !subject || !body) {
        return res.status(400).json({ error: "Missing required email fields" });
      }

      // Find project by agent email address
      const config = await storage.getEmailConfigByEmail(to);
      
      if (!config) {
        console.warn(`No email config found for ${to}`);
        return res.status(404).json({ error: "Email address not configured" });
      }

      const project = await storage.getProject(config.projectId);
      
      if (!project) {
        console.warn(`No project found for ${config.projectId}`);
        return res.status(404).json({ error: "Project not found" });
      }

      // Get or create email thread
      let thread = await storage.getEmailThreadByProjectAndSubject(project.id, subject);
      
      if (!thread) {
        thread = await storage.createEmailThread({
          projectId: project.id,
          subject,
          agentEmail: to,
        });
      }

      // Create incoming message record
      await storage.createEmailMessage({
        threadId: thread.id,
        direction: "received",
        fromEmail: from,
        toEmail: to,
        subject,
        body,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      });

      // Update thread last message time
      await storage.updateEmailThreadLastMessage(thread.id);

      // Analyze conversation for actionable items (async, don't await to avoid blocking webhook response)
      (async () => {
        try {
          const messages = await storage.getEmailThreadMessages(thread.id);
          const analysis = await analyzeConversation(messages);
          
          await storage.updateEmailThread(thread.id, {
            hasActionableItems: analysis.hasActionableItems,
            isAnalyzed: true,
            actionableItems: analysis.items,
            analysisSummary: analysis.summary,
          });
          
          console.log(`Thread ${thread.id} analyzed: ${analysis.hasActionableItems ? analysis.items.length + ' actionable items found' : 'no actionable items'}`);
          
          // Auto-create GitHub issues for actionable items
          if (analysis.hasActionableItems && analysis.items.length > 0) {
            const createdIssues = await autoCreateGitHubIssues(
              storage,
              thread,
              analysis.items,
              analysis.summary
            );
            
            if (createdIssues.length > 0) {
              console.log(`Created ${createdIssues.length} GitHub issues for thread ${thread.id}`);
            }
          }
        } catch (error) {
          console.error(`Failed to analyze thread ${thread.id}:`, error);
        }
      })();

      res.json({ success: true, threadId: thread.id });
    } catch (error: any) {
      console.error("Error processing incoming email:", error);
      res.status(500).json({ error: error.message || "Failed to process email" });
    }
  });

  // Get email config for a project
  app.get("/api/email-configs", authRequired, async (req, res) => {
    try {
      const configs = await storage.getAllEmailConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching email configs:", error);
      res.status(500).json({ error: "Failed to fetch email configs" });
    }
  });

  // Create or update email config
  app.post("/api/email-configs", authRequired, async (req, res) => {
    try {
      const config = await storage.createEmailConfig(req.body);
      res.json(config);
    } catch (error: any) {
      console.error("Error creating email config:", error);
      res.status(500).json({ error: error.message || "Failed to create email config" });
    }
  });

  // Get email settings for a specific project
  app.get("/api/projects/:projectId/email-settings", authRequired, async (req, res) => {
    try {
      const { projectId } = req.params;
      const configs = await storage.getAllEmailConfigs();
      const projectConfig = configs.find(c => c.projectId === projectId && c.isActive);
      
      if (!projectConfig) {
        return res.status(404).json(null);
      }
      
      res.json({
        agentEmail: projectConfig.emailAddress,
        inboxId: projectConfig.inboxId,
        githubOwner: projectConfig.githubOwner,
        githubRepo: projectConfig.githubRepo,
      });
    } catch (error) {
      console.error("Error fetching email settings:", error);
      res.status(500).json({ error: "Failed to fetch email settings" });
    }
  });

  // Update email config
  app.patch("/api/email-configs/:id", authRequired, async (req, res) => {
    try {
      const { id } = req.params;
      const config = await storage.updateEmailConfig(id, req.body);
      res.json(config);
    } catch (error: any) {
      console.error("Error updating email config:", error);
      res.status(500).json({ error: error.message || "Failed to update email config" });
    }
  });

  // Delete email config
  app.delete("/api/email-configs/:id", authRequired, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmailConfig(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting email config:", error);
      res.status(500).json({ error: error.message || "Failed to delete email config" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
