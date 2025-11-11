import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractActionItemsFromConversation } from "./ai";
import { syncGitHubActivity } from "./github";
import { randomBytes } from "crypto";
import { z } from "zod";
import { insertProjectSchema, insertTaskSchema, insertConversationSchema, insertGithubActivitySchema, insertApiKeySchema } from "@shared/schema";

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

  // ============= External API Endpoints (for project integrations) =============

  // Submit task from external project
  app.post("/api/external/tasks", validateApiKey, requirePermission("write_tasks"), async (req, res) => {
    try {
      const { title, description, priority = "medium", status = "pending" } = req.body;
      
      const task = await storage.createTask({
        projectId: req.apiKey.projectId,
        title,
        description,
        priority,
        status,
        source: "api",
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

  const httpServer = createServer(app);
  return httpServer;
}
