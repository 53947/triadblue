import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createServer, type Server } from "http";
import { Octokit } from "octokit";
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
import { scanConsoleBlueRoutes } from "./site-map-scanner";
import { StandardsService } from "./standards-service";
import { TRIADBLUE_PROJECTS } from "./triadblue-config";
import { randomBytes, createHmac, randomUUID, createHash } from "crypto";
import { getUncachableAgentMailClient } from "./agentmail";
import AdmZip from "adm-zip";
import { z } from "zod";
import {
  insertProjectSchema,
  insertTaskSchema,
  insertConversationSchema,
  insertGithubActivitySchema,
  insertApiKeySchema,
  insertAgentConnectionSchema,
  insertAgentChatMessageSchema,
  insertTaskTemplateSchema,
  insertConversationTemplateSchema,
  insertAssetSchema,
  insertSitePlannerNodeSchema,
  insertSitePlannerEdgeSchema,
  insertProjectRouteSchema,
  insertLinkbluePlatformSchema,
  insertLinkblueClientSchema,
  insertLinkblueAlertSchema,
  insertLinkblueActivityFeedSchema,
  insertLinkbluePlatformIntegrationSchema,
} from "@shared/schema";
import {
  authRequired,
  constantTimeCompare,
  setStorageForAuth,
  type AuthRequest,
} from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

// GitHub API Setup for external AI agents
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

function requireGitHubApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  console.log("DEBUG:", typeof apiKey, JSON.stringify(apiKey), typeof process.env.BLUE_API_KEY, JSON.stringify(process.env.BLUE_API_KEY));
  if (apiKey !== process.env.BLUE_API_KEY) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid or missing API key" });
  }
  next();
}

// Helper function to create HMAC signature for webhook payloads
function createHmacSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

// Middleware to validate API key for external requests
async function validateApiKey(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
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
      return res
        .status(403)
        .json({ error: `Permission denied: ${permission} required` });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage for auth middleware
  setStorageForAuth(storage);

  // Validate required environment variables for webhooks
  if (!process.env.AGENTMAIL_WEBHOOK_SECRET) {
    const errorMsg =
      "CRITICAL: AGENTMAIL_WEBHOOK_SECRET environment variable is not set. Email webhooks will be non-functional.";
    console.error(errorMsg);
    throw new Error(
      "AGENTMAIL_WEBHOOK_SECRET is required for webhook security",
    );
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

      // Clean up admin session if exists
      if (authReq.session.adminSessionToken) {
        await storage.deleteAdminSession(authReq.session.adminSessionToken);
      }

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

  // ============= Dual Login System (LINKBlue & ConsoleBlue) =============

  // Secure password hashing using bcrypt
  async function hashPassword(password: string): Promise<string> {
    const bcrypt = await import("bcrypt");
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async function verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const bcrypt = await import("bcrypt");
    return bcrypt.compare(password, hash);
  }

  // Platform-specific middleware to enforce access on protected routes
  async function linkblueAuthRequired(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const authReq = req as AuthRequest;
    if (!authReq.session?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify session token is still valid
    if (authReq.session.adminSessionToken) {
      const session = await storage.getAdminSessionByToken(
        authReq.session.adminSessionToken,
      );
      if (!session || new Date() > session.expiresAt) {
        authReq.session.destroy(() => {});
        return res.status(401).json({ error: "Session expired" });
      }

      // Verify platform access
      if (session.platform !== "linkblue") {
        return res.status(403).json({ error: "LINKBlue access required" });
      }

      // Verify user still has access
      const user = await storage.getAdminUser(session.userId);
      if (!user?.linkblueAccess) {
        return res.status(403).json({ error: "LINKBlue access revoked" });
      }

      await storage.updateAdminSessionActivity(
        authReq.session.adminSessionToken,
      );
    }

    next();
  }

  async function consoleblueAuthRequired(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const authReq = req as AuthRequest;
    if (!authReq.session?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (authReq.session.adminSessionToken) {
      const session = await storage.getAdminSessionByToken(
        authReq.session.adminSessionToken,
      );
      if (!session || new Date() > session.expiresAt) {
        authReq.session.destroy(() => {});
        return res.status(401).json({ error: "Session expired" });
      }

      if (session.platform !== "consoleblue") {
        return res.status(403).json({ error: "ConsoleBlue access required" });
      }

      const user = await storage.getAdminUser(session.userId);
      if (!user?.consoleblueAccess) {
        return res.status(403).json({ error: "ConsoleBlue access revoked" });
      }

      await storage.updateAdminSessionActivity(
        authReq.session.adminSessionToken,
      );
    }

    next();
  }

  // LINKBlue Login
  app.post("/api/auth/linkblue/login", async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await storage.getAdminUserByEmail(email);

      // Always perform password check to prevent timing attacks
      if (!user) {
        // Dummy hash to prevent timing attacks
        await hashPassword(password);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if account is locked
      if (await storage.isAccountLocked(user.id)) {
        return res.status(423).json({
          message:
            "Account is temporarily locked. Please try again in 15 minutes.",
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        const { shouldLock } = await storage.incrementFailedLoginAttempts(
          user.id,
        );
        if (shouldLock) {
          return res.status(423).json({
            message: "Too many failed attempts. Account locked for 15 minutes.",
          });
        }
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user has LINKBlue access
      if (!user.linkblueAccess) {
        return res
          .status(403)
          .json({ message: "You do not have access to LINKBlue Dashboard" });
      }

      // Create session
      const sessionToken = randomUUID();
      const expiresAt = new Date(
        Date.now() +
          (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
      );

      await storage.createAdminSession({
        userId: user.id,
        platform: "linkblue",
        sessionToken,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null,
        expiresAt,
      });

      await storage.updateAdminUserLogin(user.id);

      // Store in express session for compatibility with existing auth
      const authReq = req as AuthRequest;
      authReq.session.user = {
        id: user.id,
        username: user.email,
        role: user.role,
        linkblueAccess: user.linkblueAccess,
        consoleblueAccess: user.consoleblueAccess,
      };
      authReq.session.platform = "linkblue";
      authReq.session.adminSessionToken = sessionToken;

      authReq.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        res.json({
          success: true,
          user: {
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            linkblueAccess: user.linkblueAccess,
            consoleblueAccess: user.consoleblueAccess,
          },
        });
      });
    } catch (error) {
      console.error("LINKBlue login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // ConsoleBlue Login
  app.post("/api/auth/consoleblue/login", async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await storage.getAdminUserByEmail(email);

      if (!user) {
        await hashPassword(password);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (await storage.isAccountLocked(user.id)) {
        return res.status(423).json({
          message:
            "Account is temporarily locked. Please try again in 15 minutes.",
        });
      }

      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        const { shouldLock } = await storage.incrementFailedLoginAttempts(
          user.id,
        );
        if (shouldLock) {
          return res.status(423).json({
            message: "Too many failed attempts. Account locked for 15 minutes.",
          });
        }
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.consoleblueAccess) {
        return res
          .status(403)
          .json({ message: "You do not have access to ConsoleBlue Panel" });
      }

      const sessionToken = randomUUID();
      const expiresAt = new Date(
        Date.now() +
          (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
      );

      await storage.createAdminSession({
        userId: user.id,
        platform: "consoleblue",
        sessionToken,
        ipAddress: req.ip || null,
        userAgent: req.get("User-Agent") || null,
        expiresAt,
      });

      await storage.updateAdminUserLogin(user.id);

      const authReq = req as AuthRequest;
      authReq.session.user = {
        id: user.id,
        username: user.email,
        role: user.role,
        linkblueAccess: user.linkblueAccess,
        consoleblueAccess: user.consoleblueAccess,
      };
      authReq.session.platform = "consoleblue";
      authReq.session.adminSessionToken = sessionToken;

      authReq.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        res.json({
          success: true,
          user: {
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            linkblueAccess: user.linkblueAccess,
            consoleblueAccess: user.consoleblueAccess,
          },
        });
      });
    } catch (error) {
      console.error("ConsoleBlue login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Seed admin user endpoint (for initial setup)
  app.post("/api/auth/seed-admin", async (req, res) => {
    try {
      const { email, password, displayName } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      // Check if admin already exists
      const existingUser = await storage.getAdminUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Admin user already exists" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.createAdminUser({
        email,
        passwordHash,
        displayName: displayName || email.split("@")[0],
        linkblueAccess: true,
        consoleblueAccess: true,
        role: "super_admin",
        isActive: true,
      });

      res.json({
        success: true,
        message: "Admin user created successfully",
        user: { email: user.email, role: user.role },
      });
    } catch (error) {
      console.error("Seed admin error:", error);
      res.status(500).json({ error: "Failed to create admin user" });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email, platform } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Look up user by email
      const user = await storage.getAdminUserByEmail(email);

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({
          success: true,
          message:
            "If an account exists, you will receive a password reset email",
        });
      }

      // Check platform access
      const validPlatform =
        platform === "linkblue" || platform === "consoleblue";
      if (!validPlatform) {
        return res.json({
          success: true,
          message:
            "If an account exists, you will receive a password reset email",
        });
      }

      // Check if user has access to the requested platform
      const hasAccess =
        (platform === "linkblue" && user.linkblueAccess) ||
        (platform === "consoleblue" && user.consoleblueAccess);
      if (!hasAccess) {
        return res.json({
          success: true,
          message:
            "If an account exists, you will receive a password reset email",
        });
      }

      // Generate a secure reset token
      const resetToken = randomBytes(32).toString("hex");

      // Store the token in the database
      await storage.createPasswordResetToken(user.id, resetToken, platform);

      // Build the reset URL — use subdomain if available
      // consoleblue.triadblue.com is decommissioned; Console.Blue now lives at https://console.blue
      const subdomainBase =
        platform === "linkblue"
          ? "https://linkblue.triadblue.com"
          : platform === "consoleblue"
            ? "https://console.blue"
            : "https://triadblue.com";
      const resetUrl = `${subdomainBase}/${platform}/reset-password?token=${resetToken}`;

      // Send email via Resend
      try {
        const { sendPasswordResetEmail } = await import("./resend");
        const emailSent = await sendPasswordResetEmail(
          email,
          resetToken,
          platform,
          user.displayName || undefined,
        );

        if (emailSent) {
          console.log(
            `Password reset email sent to ${email} for platform ${platform}`,
          );
        } else {
          console.error("Failed to send password reset email");
        }
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        // Still return success to prevent email enumeration
      }

      res.json({
        success: true,
        message:
          "If an account exists, you will receive a password reset email",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Reset password endpoint - validates token and updates password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and password are required" });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      }

      // Look up the token
      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset link" });
      }

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({
          message: "Reset link has expired. Please request a new one.",
        });
      }

      // Hash the new password
      const passwordHash = await hashPassword(password);

      // Update the user's password
      await storage.updateAdminUserPassword(resetToken.userId, passwordHash);

      // Delete the used token
      await storage.deletePasswordResetToken(token);

      console.log(
        `Password reset successful for user ${resetToken.userId} on platform ${resetToken.platform}`,
      );

      res.json({
        success: true,
        message: "Password has been reset successfully",
        platform: resetToken.platform,
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Validate reset token endpoint
  app.get("/api/auth/validate-reset-token", async (req, res) => {
    try {
      const token = req.query.token as string;

      if (!token) {
        return res
          .status(400)
          .json({ valid: false, message: "Token is required" });
      }

      const resetToken = await storage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.json({
          valid: false,
          message: "Invalid or expired reset link",
        });
      }

      if (new Date() > resetToken.expiresAt) {
        await storage.deletePasswordResetToken(token);
        return res.json({ valid: false, message: "Reset link has expired" });
      }

      res.json({
        valid: true,
        platform: resetToken.platform,
      });
    } catch (error) {
      console.error("Validate reset token error:", error);
      res.status(500).json({ valid: false, message: "An error occurred" });
    }
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
      if (!authReq.session?.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...data,
        createdById: authReq.session.user.id,
      });
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: error.errors });
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
        return res
          .status(400)
          .json({ error: "Invalid project data", details: error.errors });
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

  app.get(
    "/api/projects/:projectId/api-keys",
    authRequired,
    async (req, res) => {
      try {
        const keys = await storage.getApiKeys(req.params.projectId);
        res.json(keys);
      } catch (error) {
        console.error("Error fetching API keys:", error);
        res.status(500).json({ error: "Failed to fetch API keys" });
      }
    },
  );

  app.post(
    "/api/projects/:projectId/api-keys",
    authRequired,
    async (req, res) => {
      try {
        const { name, permissions } = req.body;

        // Generate a secure random API key
        const key = `hub_${randomBytes(32).toString("hex")}`;

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
    },
  );

  // ============= Webhooks API =============

  app.get(
    "/api/projects/:projectId/webhooks",
    authRequired,
    async (req, res) => {
      try {
        const webhooks = await storage.getWebhooks(req.params.projectId);
        res.json(webhooks);
      } catch (error) {
        console.error("Error fetching webhooks:", error);
        res.status(500).json({ error: "Failed to fetch webhooks" });
      }
    },
  );

  app.post(
    "/api/projects/:projectId/webhooks",
    authRequired,
    async (req, res) => {
      try {
        const { name, url, events } = req.body;

        // Generate a secure random webhook secret for HMAC verification
        const secret = randomBytes(32).toString("hex");

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
    },
  );

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
        return res
          .status(401)
          .json({ error: "Missing X-Hub-Signature header" });
      }

      // Use the raw body for HMAC verification (captured by express.json verify option)
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        return res.status(400).json({
          error: "Unable to verify webhook signature - raw body missing",
        });
      }
      const payload = rawBody.toString("utf8");

      // Get all active webhooks for this project
      const webhooks = await storage.getWebhooks(projectId);
      const activeWebhooks = webhooks.filter((w) => w.isActive);

      if (activeWebhooks.length === 0) {
        return res
          .status(404)
          .json({ error: "No active webhooks configured for this project" });
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
      if (
        matchedWebhook.events.length > 0 &&
        !matchedWebhook.events.includes(eventType)
      ) {
        return res.status(403).json({
          error: `Event type '${eventType}' not allowed for this webhook`,
        });
      }

      console.log(
        `Received webhook event: ${eventType} for project ${projectId}`,
      );

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
            syncEnabled:
              taskData.syncEnabled ?? project?.defaultSyncEnabled ?? false,
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
      } else if (
        eventType === "conversation.created" ||
        eventType === "conversation_created"
      ) {
        const convData = event.data || event.conversation;
        if (convData) {
          await storage.createConversation({
            projectId,
            userId: "default-user", // System user for webhook-created conversations
            title: convData.title || "Webhook Conversation",
            content: convData.content || convData.text || "",
            agentName:
              convData.agentName || convData.agent || "External System",
          });
        }
      }

      // Update webhook last triggered timestamp
      if (matchedWebhook) {
        await storage.updateWebhookLastTriggered(matchedWebhook.id);
      }

      res.json({
        success: true,
        message: "Webhook event processed successfully",
      });
    } catch (error) {
      console.error("Error processing webhook event:", error);
      res.status(500).json({ error: "Failed to process webhook event" });
    }
  });

  // ============= Task Templates API =============

  app.get(
    "/api/projects/:projectId/templates",
    authRequired,
    async (req, res) => {
      try {
        const templates = await storage.getTaskTemplates(req.params.projectId);
        res.json(templates);
      } catch (error) {
        console.error("Error fetching task templates:", error);
        res.status(500).json({ error: "Failed to fetch task templates" });
      }
    },
  );

  app.post(
    "/api/projects/:projectId/templates",
    authRequired,
    async (req, res) => {
      try {
        const authReq = req as AuthRequest;
        if (!authReq.session?.user) {
          return res.status(401).json({ error: "Unauthorized" });
        }
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
    },
  );

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
      const template = await storage.updateTaskTemplate(
        req.params.id,
        req.body,
      );
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
        await notificationService.createUrgentTaskNotification(
          "default-user",
          task,
        );
      }

      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: error.errors });
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
        await notificationService.createUrgentTaskNotification(
          "default-user",
          task,
        );
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
  app.post(
    "/api/tasks/:id/create-github-issue",
    authRequired,
    async (req, res) => {
      try {
        const task = await storage.getTask(req.params.id);
        if (!task) {
          return res.status(404).json({ error: "Task not found" });
        }

        // Check if already synced to GitHub
        if (task.githubIssueNumber) {
          return res.status(400).json({
            error: "Task already synced to GitHub",
            issueUrl: task.githubIssueUrl,
          });
        }

        // Get project to access GitHub repo
        const project = await storage.getProject(task.projectId);
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        // Create GitHub issue
        const issue = await githubIssuesService.createIssueFromTask(
          task,
          project,
        );

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
        res
          .status(500)
          .json({ error: error.message || "Failed to create GitHub issue" });
      }
    },
  );

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
        .catch((err) => {
          console.error("Error extracting action items:", err);
        });

      res.json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: error.errors });
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
        return res
          .status(400)
          .json({ error: "Invalid input", details: error.errors });
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
        return res.status(400).json({
          error: "Project does not have a GitHub repository configured",
        });
      }

      const token = process.env.GITHUB_TOKEN;
      const activities = await syncGitHubActivity(
        projectId,
        project.githubRepo,
        project.githubBranch || "main",
        token,
        project.lastGithubSync || undefined,
      );

      // Filter out commits that already exist in the database
      const newActivities = [];
      for (const activity of activities) {
        const existing = await storage.getGithubActivityBySha(
          projectId,
          activity.commitSha || "",
        );
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
        activities: saved,
      });
    } catch (error: any) {
      console.error("Error syncing GitHub activity:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to sync GitHub activity" });
    }
  });

  // ============= Activity Timeline API =============

  app.get("/api/activities", authRequired, async (req, res) => {
    try {
      const { projectId, type, search, startDate, endDate, limit, offset } =
        req.query;

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
      const unreadCount = notifications.filter((n) => !n.read).length;
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

      await Promise.all(ids.map((id) => storage.markNotificationAsRead(id)));
      res.json({ success: true, count: ids.length });
    } catch (error) {
      console.error("Error bulk marking notifications as read:", error);
      res
        .status(500)
        .json({ error: "Failed to bulk mark notifications as read" });
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
      res
        .status(500)
        .json({ error: "Failed to fetch notification preferences" });
    }
  });

  // Update notification preference
  app.patch("/api/notification-preferences/:type", async (req, res) => {
    try {
      // Use default user (single-user app for now, TODO: implement auth)
      const userId = "default-user";
      const { enabled } = req.body;

      await storage.updateNotificationPreference(
        userId,
        req.params.type,
        enabled,
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating notification preference:", error);
      res
        .status(500)
        .json({ error: "Failed to update notification preference" });
    }
  });

  // ============= External API Endpoints (for project integrations) =============

  // Submit task from external project
  app.post(
    "/api/external/tasks",
    validateApiKey,
    requirePermission("write_tasks"),
    async (req: any, res) => {
      try {
        const {
          title,
          description,
          priority = "medium",
          status = "pending",
          syncUrl,
          syncEnabled,
        } = req.body;

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
    },
  );

  // Log conversation from external project
  app.post(
    "/api/external/conversations",
    validateApiKey,
    requirePermission("log_conversations"),
    async (req: any, res) => {
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
              await storage.updateConversationExtraction(
                conversation.id,
                items,
              );
            }
          })
          .catch((err) => {
            console.error("Error extracting action items:", err);
          });

        res.json(conversation);
      } catch (error) {
        console.error("Error logging external conversation:", error);
        res.status(500).json({ error: "Failed to log conversation" });
      }
    },
  );

  // Report GitHub activity from external project
  app.post(
    "/api/external/github-activity",
    validateApiKey,
    requirePermission("report_github_activity"),
    async (req: any, res) => {
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
    },
  );

  // Fetch and update project metadata from external project's API
  app.post(
    "/api/projects/:projectId/refresh-metadata",
    authRequired,
    async (req, res) => {
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | null = null;

      try {
        const project = await storage.getProject(req.params.projectId);

        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        if (!project.metadataApiUrl) {
          return res.status(400).json({
            error: "Project does not have a metadata API URL configured",
          });
        }

        // Fetch metadata from external project with timeout
        timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response;
        try {
          response = await fetch(project.metadataApiUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          });
        } catch (fetchError: any) {
          if (fetchError.name === "AbortError") {
            return res
              .status(504)
              .json({ error: "Request to external API timed out" });
          }
          return res.status(502).json({
            error: `Failed to connect to external API: ${fetchError.message}`,
          });
        }

        if (!response.ok) {
          return res.status(502).json({
            error: `External API returned error: ${response.status} ${response.statusText}`,
          });
        }

        // Check content length (max 1MB)
        const contentLength = response.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > 1024 * 1024) {
          return res
            .status(413)
            .json({ error: "External API response too large (max 1MB)" });
        }

        // Read response with size limit
        let data;
        try {
          const text = await response.text();
          if (text.length > 1024 * 1024) {
            return res
              .status(413)
              .json({ error: "External API response too large (max 1MB)" });
          }
          data = JSON.parse(text);
        } catch (parseError) {
          return res
            .status(502)
            .json({ error: "External API returned invalid JSON" });
        }

        const { features, techStack } = data;

        // Validate response format
        if (features && !Array.isArray(features)) {
          return res.status(400).json({
            error:
              "External API returned invalid features format (must be array)",
          });
        }

        if (techStack && !Array.isArray(techStack)) {
          return res.status(400).json({
            error:
              "External API returned invalid techStack format (must be array)",
          });
        }

        // Validate array contents and sanitize
        if (
          features &&
          !features.every(
            (f: any) => typeof f === "string" && f.trim().length > 0,
          )
        ) {
          return res.status(400).json({
            error: "External API features must contain only non-empty strings",
          });
        }

        if (
          techStack &&
          !techStack.every(
            (t: any) => typeof t === "string" && t.trim().length > 0,
          )
        ) {
          return res.status(400).json({
            error: "External API techStack must contain only non-empty strings",
          });
        }

        // Sanitize and trim values
        const updateData: any = {};
        if (features)
          updateData.features = features
            .map((f: string) => f.trim())
            .filter((f: string) => f.length > 0);
        if (techStack)
          updateData.techStack = techStack
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0);

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
    },
  );

  // Mock metadata endpoint for testing (remove in production)
  app.get("/mock-metadata", (req, res) => {
    res.json({
      features: [
        "Task Management System",
        "GitHub Integration",
        "Documentation Generator",
        "Real-time Agent Chat",
      ],
      techStack: [
        "React",
        "TypeScript",
        "Express.js",
        "PostgreSQL",
        "Drizzle ORM",
      ],
    });
  });

  // ============= Agent Connections API =============

  // Get agent connections for a project
  app.get("/api/projects/:projectId/agent-connections", async (req, res) => {
    try {
      const connections = await storage.getAgentConnections(
        req.params.projectId,
      );
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
      const projectId =
        req.params.projectId === "default" ? null : req.params.projectId;
      const validated = insertAgentConnectionSchema.parse({
        ...req.body,
        projectId,
      });

      const connection = await storage.createAgentConnection(validated);
      res.json(connection);
    } catch (error: any) {
      console.error("Error creating agent connection:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          error: "Invalid agent connection data",
          details: error.errors,
        });
      }
      res.status(500).json({ error: "Failed to create agent connection" });
    }
  });

  // Update an agent connection
  app.put("/api/agent-connections/:id", authRequired, async (req, res) => {
    try {
      const updates = insertAgentConnectionSchema.partial().parse(req.body);
      const connection = await storage.updateAgentConnection(
        req.params.id,
        updates,
      );

      if (!connection) {
        return res.status(404).json({ error: "Agent connection not found" });
      }

      res.json(connection);
    } catch (error: any) {
      console.error("Error updating agent connection:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          error: "Invalid agent connection data",
          details: error.errors,
        });
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
  app.get(
    "/api/agent-connections/:connectionId/messages",
    authRequired,
    async (req, res) => {
      try {
        const messages = await storage.getAgentChatMessages(
          req.params.connectionId,
        );
        res.json(messages);
      } catch (error) {
        console.error("Error fetching agent chat messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
      }
    },
  );

  // Send a message to an agent
  app.post(
    "/api/agent-connections/:connectionId/messages",
    authRequired,
    async (req, res) => {
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
        const agentReply = await agentService.sendMessage(
          connection,
          content,
          history,
        );

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
        res
          .status(500)
          .json({ error: "Failed to send message", details: error.message });
      }
    },
  );

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

      const exportData = await analyticsService.exportAnalytics(
        format as "json" | "csv",
        filters,
      );

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=analytics-export.csv",
        );
        res.send(exportData);
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=analytics-export.json",
        );
        res.send(exportData);
      }
    } catch (error) {
      console.error("Error exporting analytics:", error);
      res.status(500).json({ error: "Failed to export analytics" });
    }
  });

  // ============= Conversation Templates API =============

  app.get(
    "/api/projects/:projectId/conversation-templates",
    authRequired,
    async (req, res) => {
      try {
        const templates = await storage.getConversationTemplates(
          req.params.projectId,
        );
        res.json(templates);
      } catch (error) {
        console.error("Error fetching conversation templates:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch conversation templates" });
      }
    },
  );

  app.get(
    "/api/conversation-templates/global",
    authRequired,
    async (req, res) => {
      try {
        const templates = await storage.getConversationTemplates(null);
        res.json(templates);
      } catch (error) {
        console.error("Error fetching global conversation templates:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch global conversation templates" });
      }
    },
  );

  app.post(
    "/api/projects/:projectId/conversation-templates",
    authRequired,
    async (req, res) => {
      try {
        const authReq = req as AuthRequest;
        if (!authReq.session?.user) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        const { projectId } = req.params;

        const result = insertConversationTemplateSchema.safeParse({
          ...req.body,
          projectId,
        });

        if (!result.success) {
          return res
            .status(400)
            .json({ error: "Invalid input", details: result.error.errors });
        }

        const template = await storage.createConversationTemplate({
          ...result.data,
          createdById: authReq.session.user.id,
        });
        res.json(template);
      } catch (error) {
        console.error("Error creating conversation template:", error);
        res
          .status(500)
          .json({ error: "Failed to create conversation template" });
      }
    },
  );

  app.put("/api/conversation-templates/:id", authRequired, async (req, res) => {
    try {
      const result = insertConversationTemplateSchema
        .partial()
        .omit({ projectId: true })
        .safeParse(req.body);

      if (!result.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: result.error.errors });
      }

      const template = await storage.updateConversationTemplate(
        req.params.id,
        result.data,
      );
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating conversation template:", error);
      res.status(500).json({ error: "Failed to update conversation template" });
    }
  });

  app.delete(
    "/api/conversation-templates/:id",
    authRequired,
    async (req, res) => {
      try {
        await storage.deleteConversationTemplate(req.params.id);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting conversation template:", error);
        res
          .status(500)
          .json({ error: "Failed to delete conversation template" });
      }
    },
  );

  // ============= Documentation Generator API =============

  app.get("/api/documentation/templates", authRequired, async (req, res) => {
    try {
      const templates = await storage.getDocumentationTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching documentation templates:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch documentation templates" });
    }
  });

  app.get(
    "/api/documentation/templates/:id",
    authRequired,
    async (req, res) => {
      try {
        const template = await storage.getDocumentationTemplate(req.params.id);
        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }
        res.json(template);
      } catch (error) {
        console.error("Error fetching documentation template:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch documentation template" });
      }
    },
  );

  app.get(
    "/api/projects/:projectId/documentation/config",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;
        const configs = await storage.getProjectDocumentationConfigs(projectId);
        if (configs.length === 0) {
          return res
            .status(404)
            .json({ error: "Documentation config not found" });
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
    },
  );

  app.post(
    "/api/projects/:projectId/documentation/config",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;
        const { selectedTemplates, metadata } = req.body;

        if (!Array.isArray(selectedTemplates)) {
          return res
            .status(400)
            .json({ error: "selectedTemplates must be an array" });
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
    },
  );

  app.get(
    "/api/projects/:projectId/documentation/outputs",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;
        const outputs = await storage.getProjectDocumentationOutputs(projectId);
        res.json(
          outputs.map((output) => ({
            ...output,
            metadata: JSON.parse(output.metadata),
          })),
        );
      } catch (error) {
        console.error("Error fetching documentation outputs:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch documentation outputs" });
      }
    },
  );

  app.post(
    "/api/projects/:projectId/documentation/generate",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;
        const { metadata } = req.body;

        if (!metadata || typeof metadata !== "object") {
          return res.status(400).json({ error: "metadata object is required" });
        }

        const configs = await storage.getProjectDocumentationConfigs(projectId);
        if (configs.length === 0) {
          return res.status(400).json({
            error:
              "Documentation config not found. Please configure templates first.",
          });
        }

        const config = configs[0];
        const configMetadata = JSON.parse(config.metadata);

        const allTemplates = await storage.getDocumentationTemplates();
        const selectedTemplates = allTemplates.filter((t) =>
          config.selectedTemplates.includes(t.id),
        );

        if (selectedTemplates.length === 0) {
          return res
            .status(400)
            .json({ error: "No templates selected in configuration" });
        }

        const outputs = [];
        const mergedMetadata = { ...configMetadata, ...metadata };

        for (const template of selectedTemplates) {
          const result = templatingService.render(
            template.body,
            mergedMetadata,
            { detectMissingVariables: true },
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
    },
  );

  app.get(
    "/api/projects/:projectId/documentation/export",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;

        const outputs = await storage.getProjectDocumentationOutputs(projectId);

        if (outputs.length === 0) {
          return res.status(404).json({
            error:
              "No documentation outputs found. Please generate documentation first.",
          });
        }

        const zip = new AdmZip();

        for (const output of outputs) {
          zip.addFile(output.fileName, Buffer.from(output.content, "utf-8"));
        }

        const zipBuffer = zip.toBuffer();

        const project = await storage.getProject(projectId);
        const projectName = project?.name || "project";
        const timestamp = new Date().toISOString().split("T")[0];
        const zipFileName = `${projectName}-documentation-${timestamp}.zip`;

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${zipFileName}"`,
        );
        res.setHeader("Content-Length", zipBuffer.length);
        res.send(zipBuffer);
      } catch (error) {
        console.error("Error exporting documentation:", error);
        res.status(500).json({ error: "Failed to export documentation" });
      }
    },
  );

  app.post(
    "/api/projects/:projectId/documentation/push-to-github",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;
        const { targetPath = "docs/" } = req.body;

        const project = await storage.getProject(projectId);
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        if (!project.githubRepo) {
          return res.status(400).json({
            error:
              "Project does not have a GitHub repository configured. Please configure a repository in project settings.",
          });
        }

        const outputs = await storage.getProjectDocumentationOutputs(projectId);
        if (outputs.length === 0) {
          return res.status(400).json({
            error:
              "No documentation outputs found. Please generate documentation first.",
          });
        }

        const commit = await githubDocsService.pushDocumentation(
          outputs,
          project,
          targetPath,
        );

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
          error: error.message || "Failed to push documentation to GitHub",
        });
      }
    },
  );

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

      const result = templatingService.render(template.body, metadata, {
        detectMissingVariables: true,
      });

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
    "image/png",
    "image/svg+xml",
    "image/x-icon",
    "image/vnd.microsoft.icon",
    "image/webp",
  ];

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/");
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
  app.use("/uploads", express.static("uploads"));

  // Public endpoint for active favicon and logo (no auth required)
  app.get("/api/public/assets/active", async (req, res) => {
    try {
      const { type } = req.query;

      if (type && type !== "favicon" && type !== "logo") {
        return res
          .status(400)
          .json({ error: "Type must be 'favicon' or 'logo'" });
      }

      const assets = await storage.listAssets(
        type ? String(type) : undefined,
        null, // Only global assets (no project-specific)
      );

      // Filter for active assets only
      const activeAssets = assets.filter((asset) => asset.isActive);

      // Disable caching for this endpoint to ensure fresh data
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      res.json(activeAssets);
    } catch (error) {
      console.error("Error fetching active assets:", error);
      res.status(500).json({ error: "Failed to fetch active assets" });
    }
  });

  // Upload new asset
  app.post(
    "/api/assets",
    authRequired,
    upload.single("file"),
    async (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const { type, projectId } = req.body;

        if (!type) {
          await unlinkAsync(req.file.path);
          return res.status(400).json({ error: "Asset type is required" });
        }

        const validTypes = ["favicon", "logo", "image"];
        if (!validTypes.includes(type)) {
          await unlinkAsync(req.file.path);
          return res.status(400).json({
            error: "Invalid asset type. Must be: favicon, logo, or image",
          });
        }

        const userId = "default-user";

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
        res
          .status(500)
          .json({ error: error.message || "Failed to upload asset" });
      }
    },
  );

  // List assets
  app.get("/api/assets", authRequired, async (req, res) => {
    try {
      const { type, projectId } = req.query;

      const parsedProjectId =
        projectId === "null"
          ? null
          : projectId === undefined
            ? undefined
            : String(projectId);

      const assets = await storage.listAssets(
        type ? String(type) : undefined,
        parsedProjectId,
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
      res
        .status(500)
        .json({ error: error.message || "Failed to activate asset" });
    }
  });

  // Delete asset
  app.delete("/api/assets/:id", authRequired, async (req, res) => {
    try {
      const asset = await storage.getAsset(req.params.id);

      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      const filePath = path.join("uploads", asset.filename);

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
  app.get(
    "/api/projects/:projectId/email-threads",
    authRequired,
    async (req, res) => {
      try {
        const threads = await storage.getEmailThreadsByProject(
          req.params.projectId,
        );
        res.json(threads);
      } catch (error) {
        console.error("Error fetching email threads:", error);
        res.status(500).json({ error: "Failed to fetch email threads" });
      }
    },
  );

  // Get messages for an email thread
  app.get(
    "/api/email-threads/:threadId/messages",
    authRequired,
    async (req, res) => {
      try {
        const messages = await storage.getEmailMessagesByThread(
          req.params.threadId,
        );
        res.json(messages);
      } catch (error) {
        console.error("Error fetching email messages:", error);
        res.status(500).json({ error: "Failed to fetch email messages" });
      }
    },
  );

  // Attachment validation schema
  const attachmentSchema = z.object({
    filename: z.string().min(1).max(255),
    contentType: z.string().min(1).max(100),
    content: z.string().refine(
      (val) => {
        // Base64 validation and size check (max 10MB decoded)
        try {
          const buffer = Buffer.from(val, "base64");
          return buffer.length <= 10 * 1024 * 1024; // 10MB limit
        } catch {
          return false;
        }
      },
      { message: "Attachment must be valid base64 and under 10MB" },
    ),
  });

  const sendEmailSchema = z.object({
    to: z.string().email(),
    subject: z.string().min(1),
    body: z.string().min(1),
    attachments: z.array(attachmentSchema).max(10).optional(),
  });

  // Send email to agent
  app.post(
    "/api/projects/:projectId/send-email",
    authRequired,
    async (req, res) => {
      try {
        // Validate request body
        const validation = sendEmailSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            error: "Invalid request data",
            details: validation.error.errors,
          });
        }

        const { to, subject, body, attachments } = validation.data;
        const { projectId } = req.params;

        // Get email config to find inbox ID
        const config = await storage.getEmailConfigByProject(projectId);
        if (!config) {
          return res
            .status(404)
            .json({ error: "Email configuration not found for this project" });
        }

        if (!config.inboxId) {
          return res.status(400).json({
            error:
              "Inbox ID not configured. Please set up the email configuration first.",
          });
        }

        // Get or create email thread
        let thread = await storage.getEmailThreadByProjectAndSubject(
          projectId,
          subject,
        );

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
          fromEmail: config.emailAddress ?? "",
          toEmail: to,
          subject,
          body,
        });

        // Send via AgentMail
        try {
          const { getUncachableAgentMailClient } = await import("./agentmail");
          const client = await getUncachableAgentMailClient();

          const sendPayload: any = {
            to,
            subject,
            text: body,
          };

          // Add attachments if provided (already validated by schema)
          if (attachments && attachments.length > 0) {
            sendPayload.attachments = attachments.map((att) => ({
              filename: att.filename,
              contentType: att.contentType,
              content: att.content,
            }));
          }

          await client.inboxes.messages.send(config.inboxId, sendPayload);
        } catch (emailError: any) {
          console.error("Failed to send email via AgentMail:", emailError);

          // Provide specific error messages for attachment-related failures
          let errorMessage = "Failed to send email via AgentMail";
          if (emailError.message?.includes("attachment")) {
            errorMessage =
              "Failed to send email attachments. Files may be too large or in an unsupported format.";
          }

          return res.status(500).json({
            error: errorMessage,
            details: emailError.message,
          });
        }

        // Update thread last message time
        await storage.updateEmailThreadLastMessage(thread.id);

        res.json({ thread, message });
      } catch (error: any) {
        console.error("Error sending email:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to send email" });
      }
    },
  );

  // Webhook to receive emails from AgentMail
  app.post("/api/webhooks/agentmail", async (req, res) => {
    try {
      // Webhook security: verify shared secret
      const webhookSecret = process.env.AGENTMAIL_WEBHOOK_SECRET!; // Already validated at startup
      const providedSecret =
        req.headers["x-webhook-secret"] || req.query.secret;

      if (!providedSecret) {
        console.warn("Webhook authentication failed: secret not provided");
        return res
          .status(401)
          .json({ error: "Unauthorized: missing webhook secret" });
      }

      if (providedSecret !== webhookSecret) {
        console.warn("Webhook authentication failed: invalid secret");
        return res
          .status(401)
          .json({ error: "Unauthorized: invalid webhook secret" });
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
      let thread = await storage.getEmailThreadByProjectAndSubject(
        project.id,
        subject,
      );

      if (!thread) {
        thread = await storage.createEmailThread({
          projectId: project.id,
          subject,
          agentEmail: to,
          contactEmail: from, // Store sender's email for reply fallback
        });
      } else if (!thread.contactEmail) {
        // Update existing threads that don't have contactEmail set
        await storage.updateEmailThread(thread.id, { contactEmail: from });
        thread.contactEmail = from;
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
          const messages = await storage.getEmailMessagesByThread(thread.id);
          const analysis = await analyzeConversation(messages);

          await storage.updateEmailThread(thread.id, {
            actionableItems: analysis.items,
            analysisSummary: analysis.summary,
          });

          console.log(
            `Thread ${thread.id} analyzed: ${analysis.hasActionableItems ? analysis.items.length + " actionable items found" : "no actionable items"}`,
          );

          // Auto-create GitHub issues for actionable items
          if (analysis.hasActionableItems && analysis.items.length > 0) {
            const createdIssues = await autoCreateGitHubIssues(
              storage,
              thread,
              analysis.items,
              analysis.summary,
            );

            if (createdIssues.length > 0) {
              console.log(
                `Created ${createdIssues.length} GitHub issues for thread ${thread.id}`,
              );
            }
          }
        } catch (error) {
          console.error(`Failed to analyze thread ${thread.id}:`, error);
        }
      })();

      res.json({ success: true, threadId: thread.id });
    } catch (error: any) {
      console.error("Error processing incoming email:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to process email" });
    }
  });

  // Reply to email thread (for assistant workspace)
  app.post(
    "/api/email-threads/:threadId/reply",
    authRequired,
    async (req, res) => {
      try {
        const { threadId } = req.params;
        const { body, attachments } = req.body;

        if (!body) {
          return res.status(400).json({ error: "Email body is required" });
        }

        // Get thread and its messages
        const thread = await storage.getEmailThread(threadId);
        if (!thread) {
          return res.status(404).json({ error: "Thread not found" });
        }

        // Get email config for this project
        const emailConfig = await storage.getEmailConfigByProject(
          thread.projectId,
        );
        if (!emailConfig?.inboxId) {
          return res
            .status(400)
            .json({ error: "Email inbox not configured for this project" });
        }

        // Determine recipient email - try received messages first, then fallback to contactEmail
        const messages = await storage.getEmailMessagesByThread(threadId);
        const receivedMessages = messages.filter(
          (m) => m.direction === "received",
        );

        let recipientEmail: string;
        if (receivedMessages.length > 0) {
          // Get the latest received message (messages are ordered by createdAt)
          const latestReceivedMessage =
            receivedMessages[receivedMessages.length - 1];
          recipientEmail = latestReceivedMessage.fromEmail;
        } else if (thread.contactEmail) {
          // Fallback to contactEmail for outbound-only threads
          recipientEmail = thread.contactEmail;
        } else {
          return res.status(400).json({
            error:
              "Cannot determine recipient - no received messages in thread and no contact email stored.",
          });
        }

        // Validate attachments before sending
        if (attachments && Array.isArray(attachments)) {
          const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB per attachment
          const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB total
          let totalSize = 0;

          for (const att of attachments) {
            // Validate base64 encoding
            if (!att.content || typeof att.content !== "string") {
              return res.status(400).json({
                error: `Invalid attachment: ${att.filename} - missing or invalid content`,
              });
            }

            try {
              const buffer = Buffer.from(att.content, "base64");
              const size = buffer.length;

              if (size > MAX_ATTACHMENT_SIZE) {
                return res.status(400).json({
                  error: `Attachment ${att.filename} exceeds 10MB limit`,
                });
              }

              totalSize += size;
              if (totalSize > MAX_TOTAL_SIZE) {
                return res
                  .status(400)
                  .json({ error: `Total attachment size exceeds 25MB limit` });
              }
            } catch (error) {
              return res.status(400).json({
                error: `Invalid base64 encoding in attachment: ${att.filename}`,
              });
            }
          }
        }

        // Send the email via AgentMail FIRST (fail fast before persisting)
        const response = await fetch(
          "https://api.agentmail.ai/v1/messages/send",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.AGENTMAIL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inboxId: emailConfig.inboxId,
              to: recipientEmail,
              subject: `Re: ${thread.subject}`,
              body,
              attachments,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return res.status(502).json({
            error: `Email service error: ${errorData.message || response.statusText}`,
          });
        }

        // Only persist to database after successful send
        const sentMessage = await storage.createEmailMessage({
          threadId,
          direction: "sent",
          fromEmail: emailConfig.emailAddress ?? "",
          toEmail: recipientEmail,
          subject: `Re: ${thread.subject}`,
          body,
        });

        // Persist attachments with graceful fallback
        let attachmentErrors: string[] = [];
        if (attachments && Array.isArray(attachments)) {
          for (const att of attachments) {
            try {
              const buffer = Buffer.from(att.content, "base64");
              await storage.createEmailAttachment({
                messageId: sentMessage.id,
                filename: att.filename,
                contentType: att.contentType,
                size: buffer.length,
                data: att.content,
              });
            } catch (error: any) {
              console.error(
                `Failed to persist attachment ${att.filename}:`,
                error,
              );
              attachmentErrors.push(att.filename);
            }
          }
        }

        // Update thread last message time
        await storage.updateEmailThreadLastMessage(threadId);

        const response_data: any = {
          success: true,
          sentTo: recipientEmail,
          messageId: sentMessage.id,
        };

        if (attachmentErrors.length > 0) {
          response_data.warning = `Email sent successfully but failed to persist ${attachmentErrors.length} attachment(s): ${attachmentErrors.join(", ")}`;
        }

        res.json(response_data);
      } catch (error: any) {
        console.error("Error replying to email thread:", error);
        res.status(500).json({
          error: error.message || "Internal server error while sending reply",
        });
      }
    },
  );

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
      res
        .status(500)
        .json({ error: error.message || "Failed to create email config" });
    }
  });

  // Get email settings for a specific project
  app.get(
    "/api/projects/:projectId/email-settings",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;
        const configs = await storage.getAllEmailConfigs();
        const projectConfig = configs.find(
          (c) => c.projectId === projectId && c.isActive,
        );

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
    },
  );

  // Update email config
  app.patch("/api/email-configs/:id", authRequired, async (req, res) => {
    try {
      const { id } = req.params;
      const config = await storage.updateEmailConfig(id, req.body);
      res.json(config);
    } catch (error: any) {
      console.error("Error updating email config:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to update email config" });
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
      res
        .status(500)
        .json({ error: error.message || "Failed to delete email config" });
    }
  });

  // Site Planner Routes

  // Get all nodes for a project
  app.get(
    "/api/projects/:projectId/site-planner/nodes",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;
        const nodes = await storage.getSitePlannerNodesByProject(projectId);
        res.json(nodes);
      } catch (error: any) {
        console.error("Error fetching site planner nodes:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to fetch nodes" });
      }
    },
  );

  // Get all edges for a project
  app.get(
    "/api/projects/:projectId/site-planner/edges",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;
        const edges = await storage.getSitePlannerEdgesByProject(projectId);
        res.json(edges);
      } catch (error: any) {
        console.error("Error fetching site planner edges:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to fetch edges" });
      }
    },
  );

  // Save entire planner state (bulk upsert)
  app.post(
    "/api/projects/:projectId/site-planner/save",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;

        // Validate request body with Zod
        const sitePlannerSaveSchema = z.object({
          nodes: z
            .array(insertSitePlannerNodeSchema.omit({ projectId: true }))
            .default([]),
          edges: z
            .array(insertSitePlannerEdgeSchema.omit({ projectId: true }))
            .default([]),
        });

        const validated = sitePlannerSaveSchema.parse(req.body);

        // Inject projectId from route param into all nodes and edges
        const nodesWithProjectId = validated.nodes.map((node) => ({
          ...node,
          projectId,
        }));

        const edgesWithProjectId = validated.edges.map((edge) => ({
          ...edge,
          projectId,
        }));

        // Bulk upsert nodes and edges
        const savedNodes = await storage.bulkUpsertSitePlannerNodes(
          projectId,
          nodesWithProjectId,
        );
        const savedEdges = await storage.bulkUpsertSitePlannerEdges(
          projectId,
          edgesWithProjectId,
        );

        res.json({ nodes: savedNodes, edges: savedEdges });
      } catch (error: any) {
        if (error.name === "ZodError") {
          console.error("Validation error saving site planner:", error);
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        console.error("Error saving site planner:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to save planner" });
      }
    },
  );

  // Create a single node
  app.post("/api/site-planner/nodes", authRequired, async (req, res) => {
    try {
      const node = await storage.createSitePlannerNode(req.body);
      res.json(node);
    } catch (error: any) {
      console.error("Error creating node:", error);
      res.status(500).json({ error: error.message || "Failed to create node" });
    }
  });

  // Update a single node
  app.patch("/api/site-planner/nodes/:id", authRequired, async (req, res) => {
    try {
      const { id } = req.params;
      const node = await storage.updateSitePlannerNode(id, req.body);
      res.json(node);
    } catch (error: any) {
      console.error("Error updating node:", error);
      res.status(500).json({ error: error.message || "Failed to update node" });
    }
  });

  // Delete a single node
  app.delete("/api/site-planner/nodes/:id", authRequired, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSitePlannerNode(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting node:", error);
      res.status(500).json({ error: error.message || "Failed to delete node" });
    }
  });

  // Project Routes (Site Map)

  // Get all routes for a project
  app.get("/api/projects/:projectId/routes", authRequired, async (req, res) => {
    try {
      const { projectId } = req.params;
      const routes = await storage.getProjectRoutes(projectId);
      res.json(routes);
    } catch (error: any) {
      console.error("Error fetching project routes:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch routes" });
    }
  });

  // Trigger route scan for ConsoleBlue project
  app.post(
    "/api/projects/:projectId/routes/scan",
    authRequired,
    async (req, res) => {
      try {
        const { projectId } = req.params;

        // Scan routes from ConsoleBlue codebase
        const scannedRoutes = await scanConsoleBlueRoutes(projectId);

        // Delete existing scanned routes for this project
        await storage.deleteProjectRoutesBySource(projectId, "scan");

        // Insert newly scanned routes
        const savedRoutes = await storage.bulkUpsertProjectRoutes(
          projectId,
          scannedRoutes,
        );

        res.json({
          success: true,
          count: savedRoutes.length,
          routes: savedRoutes,
        });
      } catch (error: any) {
        console.error("Error scanning project routes:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to scan routes" });
      }
    },
  );

  // Accept routes from external projects (API key authenticated)
  app.post(
    "/api/projects/:projectId/routes",
    validateApiKey,
    requirePermission("write_routes"),
    async (req, res) => {
      try {
        const { projectId } = req.params;

        // Verify that the API key belongs to this project
        if (req.apiKey.projectId !== projectId) {
          return res
            .status(403)
            .json({ error: "API key does not belong to this project" });
        }

        // Validate request body
        const externalRoutesSchema = z.object({
          routes: z.array(
            insertProjectRouteSchema.omit({
              projectId: true,
              createdAt: true,
              lastSyncedAt: true,
            }),
          ),
        });

        const validated = externalRoutesSchema.parse(req.body);

        // Inject projectId and ensure source is 'external'
        const routesWithProjectId = validated.routes.map((route) => ({
          ...route,
          projectId,
          source: "external",
        }));

        // Delete existing external routes for this project
        await storage.deleteProjectRoutesBySource(projectId, "external");

        // Insert new routes
        const savedRoutes = await storage.bulkUpsertProjectRoutes(
          projectId,
          routesWithProjectId,
        );

        res.json({
          success: true,
          count: savedRoutes.length,
          routes: savedRoutes,
        });
      } catch (error: any) {
        if (error.name === "ZodError") {
          console.error("Validation error saving external routes:", error);
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        console.error("Error saving external routes:", error);
        res
          .status(500)
          .json({ error: error.message || "Failed to save routes" });
      }
    },
  );

  // ============= TriadBlue Standards API =============

  // Public endpoint: Get current TriadBlue standards
  app.get("/api/standards", async (req, res) => {
    try {
      const standards = StandardsService.generateStandards();
      res.json(standards);
    } catch (error: any) {
      console.error("Error fetching standards:", error);
      res.status(500).json({ error: "Failed to fetch standards" });
    }
  });

  // Protected endpoint: Push standardized replit.md to all TriadBlue projects
  app.post("/api/standards/push-to-github", authRequired, async (req, res) => {
    try {
      if (!process.env.GITHUB_TOKEN) {
        return res.status(500).json({ error: "GITHUB_TOKEN not configured" });
      }

      const replitMdContent = StandardsService.generateReplitMdContent();
      const results: any[] = [];

      // Push to all 7 TriadBlue projects
      for (const project of TRIADBLUE_PROJECTS) {
        try {
          const baseUrl = `https://api.github.com/repos/triadblue/${project.code}`;
          const branch = "main";
          const headers = {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          };

          // Get latest commit
          const refResponse = await fetch(
            `${baseUrl}/git/refs/heads/${branch}`,
            { headers },
          );
          if (!refResponse.ok) throw new Error(`Failed to fetch latest commit`);
          const ref = await refResponse.json();
          const latestCommitSha = ref.object.sha;

          // Get base tree
          const commitResponse = await fetch(
            `${baseUrl}/git/commits/${latestCommitSha}`,
            { headers },
          );
          if (!commitResponse.ok) throw new Error(`Failed to get base tree`);
          const commitData = await commitResponse.json();
          const baseTreeSha = commitData.tree.sha;

          // Create blob
          const blobResponse = await fetch(`${baseUrl}/git/blobs`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              content: Buffer.from(replitMdContent, "utf-8").toString("base64"),
              encoding: "base64",
            }),
          });
          const blobData = await blobResponse.json();

          // Create tree
          const treeResponse = await fetch(`${baseUrl}/git/trees`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              base_tree: baseTreeSha,
              tree: [
                {
                  path: "replit.md",
                  mode: "100644",
                  type: "blob",
                  sha: blobData.sha,
                },
              ],
            }),
          });
          const treeData = await treeResponse.json();

          // Create commit
          const newCommitResponse = await fetch(`${baseUrl}/git/commits`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              message:
                "chore: Update TriadBlue standards from ConsoleBlue [automated]",
              tree: treeData.sha,
              parents: [latestCommitSha],
            }),
          });
          const newCommitData = await newCommitResponse.json();

          // Update ref
          await fetch(`${baseUrl}/git/refs/heads/${branch}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ sha: newCommitData.sha }),
          });

          results.push({
            project: project.name,
            status: "success",
            commitSha: newCommitData.sha,
          });
        } catch (error: any) {
          results.push({
            project: project.name,
            status: "failed",
            error: error.message,
          });
        }
      }

      res.json({
        success: true,
        message: "Standards pushed to projects",
        results,
      });
    } catch (error: any) {
      console.error("Error pushing standards:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to push standards" });
    }
  });

  // ============= LINKBlue API Routes =============

  // Dashboard Stats
  app.get("/api/linkblue/dashboard", authRequired, async (req, res) => {
    try {
      const stats = await storage.getLinkblueDashboardStats();
      const platforms = await storage.getLinkbluePlatforms();
      const integrations = await storage.getLinkblueIntegrations();
      const recentActivity = await storage.getLinkblueActivityFeed(20);
      const activeAlerts = await storage.getLinkblueAlerts({
        isResolved: false,
      });

      // Enrich platform data with health info
      const platformsWithHealth = await Promise.all(
        platforms.map(async (platform) => {
          const health = await storage.getLatestPlatformHealth(platform.id);
          return { ...platform, health };
        }),
      );

      res.json({
        stats,
        platforms: platformsWithHealth,
        integrations,
        recentActivity,
        activeAlerts,
      });
    } catch (error) {
      console.error("Error fetching LINKBlue dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Platforms
  app.get("/api/linkblue/platforms", authRequired, async (req, res) => {
    try {
      const platforms = await storage.getLinkbluePlatforms();
      const platformsWithHealth = await Promise.all(
        platforms.map(async (platform) => {
          const health = await storage.getLatestPlatformHealth(platform.id);
          return { ...platform, health };
        }),
      );
      res.json(platformsWithHealth);
    } catch (error) {
      console.error("Error fetching platforms:", error);
      res.status(500).json({ error: "Failed to fetch platforms" });
    }
  });

  app.get("/api/linkblue/platforms/:id", authRequired, async (req, res) => {
    try {
      const platform = await storage.getLinkbluePlatform(req.params.id);
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      const health = await storage.getLatestPlatformHealth(platform.id);
      const healthHistory = await storage.getPlatformHealthHistory(platform.id);
      res.json({ ...platform, health, healthHistory });
    } catch (error) {
      console.error("Error fetching platform:", error);
      res.status(500).json({ error: "Failed to fetch platform" });
    }
  });

  app.post("/api/linkblue/platforms", authRequired, async (req, res) => {
    try {
      const data = insertLinkbluePlatformSchema.parse(req.body);
      const platform = await storage.createLinkbluePlatform(data);
      res.json(platform);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating platform:", error);
      res.status(500).json({ error: "Failed to create platform" });
    }
  });

  app.patch("/api/linkblue/platforms/:id", authRequired, async (req, res) => {
    try {
      const platform = await storage.updateLinkbluePlatform(
        req.params.id,
        req.body,
      );
      if (!platform) {
        return res.status(404).json({ error: "Platform not found" });
      }
      res.json(platform);
    } catch (error) {
      console.error("Error updating platform:", error);
      res.status(500).json({ error: "Failed to update platform" });
    }
  });

  app.delete("/api/linkblue/platforms/:id", authRequired, async (req, res) => {
    try {
      await storage.deleteLinkbluePlatform(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting platform:", error);
      res.status(500).json({ error: "Failed to delete platform" });
    }
  });

  // Platform Integrations
  app.get("/api/linkblue/integrations", authRequired, async (req, res) => {
    try {
      const integrations = await storage.getLinkblueIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.get("/api/linkblue/integrations/:id", authRequired, async (req, res) => {
    try {
      const integration = await storage.getLinkblueIntegration(req.params.id);
      if (!integration) {
        return res.status(404).json({ error: "Integration not found" });
      }
      const logs = await storage.getIntegrationLogs(integration.id, 50);
      res.json({ ...integration, logs });
    } catch (error) {
      console.error("Error fetching integration:", error);
      res.status(500).json({ error: "Failed to fetch integration" });
    }
  });

  app.post("/api/linkblue/integrations", authRequired, async (req, res) => {
    try {
      const data = insertLinkbluePlatformIntegrationSchema.parse(req.body);
      const integration = await storage.createLinkblueIntegration(data);
      res.json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating integration:", error);
      res.status(500).json({ error: "Failed to create integration" });
    }
  });

  app.patch(
    "/api/linkblue/integrations/:id",
    authRequired,
    async (req, res) => {
      try {
        const integration = await storage.updateLinkblueIntegration(
          req.params.id,
          req.body,
        );
        if (!integration) {
          return res.status(404).json({ error: "Integration not found" });
        }
        res.json(integration);
      } catch (error) {
        console.error("Error updating integration:", error);
        res.status(500).json({ error: "Failed to update integration" });
      }
    },
  );

  // Clients (360° View)
  app.get("/api/linkblue/clients", authRequired, async (req, res) => {
    try {
      const { search } = req.query;
      let clients;
      if (search && typeof search === "string") {
        clients = await storage.searchLinkblueClients(search);
      } else {
        clients = await storage.getLinkblueClients();
      }
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/linkblue/clients/:id", authRequired, async (req, res) => {
    try {
      const client = await storage.getLinkblueClient(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Get all platform accounts for this client
      const accounts = await storage.getClientAccounts(client.id);
      const platforms = await storage.getLinkbluePlatforms();

      // Enrich accounts with platform info
      const accountsWithPlatform = accounts.map((account) => {
        const platform = platforms.find((p) => p.id === account.platformId);
        return { ...account, platform };
      });

      // Get client-related activity
      const activity = await storage.getLinkblueActivityFeed(50);
      const clientActivity = activity.filter((a) => a.clientId === client.id);

      // Get client-related alerts
      const alerts = await storage.getLinkblueAlerts({ isResolved: false });
      const clientAlerts = alerts.filter((a) => a.clientId === client.id);

      res.json({
        ...client,
        accounts: accountsWithPlatform,
        activity: clientActivity,
        alerts: clientAlerts,
      });
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.post("/api/linkblue/clients", authRequired, async (req, res) => {
    try {
      const data = insertLinkblueClientSchema.parse(req.body);
      const client = await storage.createLinkblueClient(data);
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.patch("/api/linkblue/clients/:id", authRequired, async (req, res) => {
    try {
      const client = await storage.updateLinkblueClient(
        req.params.id,
        req.body,
      );
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.delete("/api/linkblue/clients/:id", authRequired, async (req, res) => {
    try {
      await storage.deleteLinkblueClient(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Alerts
  app.get("/api/linkblue/alerts", authRequired, async (req, res) => {
    try {
      const { resolved, severity } = req.query;
      const alerts = await storage.getLinkblueAlerts({
        isResolved:
          resolved === "true" ? true : resolved === "false" ? false : undefined,
        severity: severity as string | undefined,
      });
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.get("/api/linkblue/alerts/:id", authRequired, async (req, res) => {
    try {
      const alert = await storage.getLinkblueAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      console.error("Error fetching alert:", error);
      res.status(500).json({ error: "Failed to fetch alert" });
    }
  });

  app.post("/api/linkblue/alerts", authRequired, async (req, res) => {
    try {
      const data = insertLinkblueAlertSchema.parse(req.body);
      const alert = await storage.createLinkblueAlert(data);
      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating alert:", error);
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  app.patch(
    "/api/linkblue/alerts/:id/acknowledge",
    authRequired,
    async (req, res) => {
      try {
        const authReq = req as AuthRequest;
        const userId = authReq.session?.user?.id || "unknown";
        const alert = await storage.acknowledgeAlert(req.params.id, userId);
        if (!alert) {
          return res.status(404).json({ error: "Alert not found" });
        }
        res.json(alert);
      } catch (error) {
        console.error("Error acknowledging alert:", error);
        res.status(500).json({ error: "Failed to acknowledge alert" });
      }
    },
  );

  app.patch(
    "/api/linkblue/alerts/:id/resolve",
    authRequired,
    async (req, res) => {
      try {
        const alert = await storage.resolveAlert(req.params.id);
        if (!alert) {
          return res.status(404).json({ error: "Alert not found" });
        }
        res.json(alert);
      } catch (error) {
        console.error("Error resolving alert:", error);
        res.status(500).json({ error: "Failed to resolve alert" });
      }
    },
  );

  app.delete("/api/linkblue/alerts/:id", authRequired, async (req, res) => {
    try {
      await storage.deleteLinkblueAlert(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  // Activity Feed
  app.get("/api/linkblue/activity", authRequired, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activity = await storage.getLinkblueActivityFeed(limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ error: "Failed to fetch activity feed" });
    }
  });

  app.post("/api/linkblue/activity", authRequired, async (req, res) => {
    try {
      const data = insertLinkblueActivityFeedSchema.parse(req.body);
      const activity = await storage.createLinkblueActivity(data);
      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: error.errors });
      }
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  // Seed initial platforms data (call once to set up)
  app.post("/api/linkblue/seed", authRequired, async (req, res) => {
    try {
      const existingPlatforms = await storage.getLinkbluePlatforms();
      if (existingPlatforms.length > 0) {
        return res.json({
          message: "Platforms already seeded",
          platforms: existingPlatforms,
        });
      }

      // Create the three TriadBlue platforms
      const platforms = [
        {
          name: "BusinessBlueprint.io",
          shortName: "BB",
          description:
            "Local business growth SaaS - comprehensive business management and growth tools",
          adminUrl: "https://businessblueprint.io/admin",
          apiBaseUrl: "https://businessblueprint.io/api",
          icon: "Building2",
          color: "#3B82F6",
        },
        {
          name: "SwipesBlue.com",
          shortName: "Swipes",
          description:
            "Payment gateway - secure payment processing and merchant services",
          adminUrl: "https://swipesblue.com/admin",
          apiBaseUrl: "https://swipesblue.com/api",
          icon: "CreditCard",
          color: "#10B981",
        },
        {
          name: "HostsBlue.com",
          shortName: "Hosts",
          description:
            "Web services - hosting, domains, and infrastructure management",
          adminUrl: "https://hostsblue.com/admin",
          apiBaseUrl: "https://hostsblue.com/api",
          icon: "Server",
          color: "#8B5CF6",
        },
      ];

      const createdPlatforms = await Promise.all(
        platforms.map((p) => storage.createLinkbluePlatform(p)),
      );

      // Create initial health records with mock data
      for (const platform of createdPlatforms) {
        await storage.createPlatformHealth({
          platformId: platform.id,
          status: "online",
          apiResponseTime: Math.floor(Math.random() * 100) + 50,
          successRate: Math.floor(Math.random() * 5) + 95,
          activeClients: Math.floor(Math.random() * 500) + 100,
          errorCount: Math.floor(Math.random() * 5),
          lastSyncAt: new Date(),
        });
      }

      // Create platform integrations
      const integrations = [
        {
          sourcePlatformId: createdPlatforms[0].id, // BB
          targetPlatformId: createdPlatforms[1].id, // Swipes
          name: "Payment Processing",
          description: "BB uses SwipesBlue for subscription payment processing",
          status: "healthy" as const,
          syncFrequency: "realtime",
        },
        {
          sourcePlatformId: createdPlatforms[0].id, // BB
          targetPlatformId: createdPlatforms[2].id, // Hosts
          name: "Website Hosting",
          description: "BB clients get websites hosted on HostsBlue",
          status: "healthy" as const,
          syncFrequency: "realtime",
        },
        {
          sourcePlatformId: createdPlatforms[1].id, // Swipes
          targetPlatformId: createdPlatforms[2].id, // Hosts
          name: "Hosting Payments",
          description:
            "HostsBlue uses SwipesBlue for hosting subscription payments",
          status: "healthy" as const,
          syncFrequency: "realtime",
        },
      ];

      const createdIntegrations = await Promise.all(
        integrations.map((i) => storage.createLinkblueIntegration(i)),
      );

      // Create sample activity
      await storage.createLinkblueActivity({
        platformId: createdPlatforms[0].id,
        eventType: "integration_sync",
        title: "LINKBlue initialized",
        description:
          "TriadBlue integration panel has been set up with all three platforms",
        severity: "success",
      });

      res.json({
        message: "LINKBlue platforms seeded successfully",
        platforms: createdPlatforms,
        integrations: createdIntegrations,
      });
    } catch (error) {
      console.error("Error seeding platforms:", error);
      res.status(500).json({ error: "Failed to seed platforms" });
    }
  });

  // ========================================
  // GITHUB API ROUTES (for external AI agents)
  // ========================================

  // Health check - no auth required
  app.get("/api/github/health", (req, res) => {
    res.json({
      status: "ok",
      service: "ConsoleBlue GitHub API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // List all repositories
  app.get("/api/github/repos", requireGitHubApiKey, async (req, res) => {
    try {
      const { data } = await octokit.rest.repos.listForUser({
        username: "53947",
        type: "owner",
        sort: "updated",
        per_page: 100,
      });

      const repos = data.map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        updated_at: repo.updated_at,
        default_branch: repo.default_branch,
        language: repo.language,
        size: repo.size,
      }));

      res.json({ count: repos.length, repos });
    } catch (error: any) {
      console.error("Error fetching repos:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
    }
  });

  // Get directory tree or file metadata
  app.get("/api/github/tree", requireGitHubApiKey, async (req, res) => {
    const { repo, path = "" } = req.query;

    if (!repo) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "repo parameter is required" });
    }

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: "53947",
        repo: repo as string,
        path: path as string,
      });

      if (Array.isArray(data)) {
        const contents = data.map((item) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
        }));
        return res.json({
          repo,
          path: path || "/",
          type: "directory",
          contents,
        });
      }

      res.json({
        repo,
        name: data.name,
        path: data.path,
        type: "file",
        size: data.size,
      });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({
          error: "Not Found",
          message: `Path '${path}' not found in repo '${repo}'`,
        });
      }
      console.error("Error fetching tree:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
    }
  });

  // Get file contents
  app.get("/api/github/file", requireGitHubApiKey, async (req, res) => {
    const { repo, path } = req.query;

    if (!repo || !path) {
      return res.status(400).json({
        error: "Bad Request",
        message: "repo and path parameters are required",
      });
    }

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: "53947",
        repo: repo as string,
        path: path as string,
      });

      if (Array.isArray(data) || data.type !== "file") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Path must be a file, not a directory",
        });
      }

      const content = Buffer.from(data.content, "base64").toString("utf-8");

      res.json({
        repo,
        name: data.name,
        path: data.path,
        size: data.size,
        encoding: "utf-8",
        content,
      });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({
          error: "Not Found",
          message: `File '${path}' not found in repo '${repo}'`,
        });
      }
      console.error("Error fetching file:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
    }
  });

  // Extract routes from React app
  app.get("/api/github/routes", requireGitHubApiKey, async (req, res) => {
    const { repo } = req.query;

    if (!repo) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "repo parameter is required" });
    }

    const possiblePaths = [
      "client/src/App.tsx",
      "client/src/App.jsx",
      "src/App.tsx",
      "src/App.jsx",
      "app/routes.tsx",
    ];

    try {
      let routesContent: string | null = null;
      let foundPath: string | null = null;

      for (const filePath of possiblePaths) {
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner: "53947",
            repo: repo as string,
            path: filePath,
          });
          if (!Array.isArray(data) && data.content) {
            routesContent = Buffer.from(data.content, "base64").toString(
              "utf-8",
            );
            foundPath = filePath;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!routesContent) {
        return res
          .status(404)
          .json({ error: "Not Found", message: "Could not find routes file" });
      }

      const routes = new Set<string>();

      // Extract path patterns
      const patterns = [
        /path\s*[=:]\s*["']([^"']+)["']/g,
        /<Route[^>]*\s+path\s*=\s*["']([^"']+)["']/g,
        /to\s*=\s*["']([^"']+)["']/g,
      ];

      for (const pattern of patterns) {
        const matches = routesContent.matchAll(pattern);
        for (const match of matches) {
          if (match[1].startsWith("/")) {
            routes.add(match[1]);
          }
        }
      }

      const sortedRoutes = [...routes].sort();

      res.json({
        repo,
        source_file: foundPath,
        route_count: sortedRoutes.length,
        routes: sortedRoutes,
      });
    } catch (error: any) {
      console.error("Error extracting routes:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
    }
  });

  // Get recent commits
  app.get("/api/github/commits", requireGitHubApiKey, async (req, res) => {
    const { repo, count = "10" } = req.query;

    if (!repo) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "repo parameter is required" });
    }

    const commitCount = Math.min(
      Math.max(parseInt(count as string) || 10, 1),
      100,
    );

    try {
      const { data } = await octokit.rest.repos.listCommits({
        owner: "53947",
        repo: repo as string,
        per_page: commitCount,
      });

      const commits = data.map((commit) => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split("\n")[0],
        author: commit.commit.author?.name,
        date: commit.commit.author?.date,
        url: commit.html_url,
      }));

      res.json({ repo, count: commits.length, commits });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({
          error: "Not Found",
          message: `Repository '${repo}' not found`,
        });
      }
      console.error("Error fetching commits:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
    }
  });

  // Search files in repository
  app.get("/api/github/search", requireGitHubApiKey, async (req, res) => {
    const { repo, query, path = "" } = req.query;

    if (!repo || !query) {
      return res.status(400).json({
        error: "Bad Request",
        message: "repo and query parameters are required",
      });
    }

    try {
      const { data: repoData } = await octokit.rest.repos.get({
        owner: "53947",
        repo: repo as string,
      });

      const { data: treeData } = await octokit.rest.git.getTree({
        owner: "53947",
        repo: repo as string,
        tree_sha: repoData.default_branch,
        recursive: "true",
      });

      const queryLower = (query as string).toLowerCase();
      const pathLower = (path as string).toLowerCase();

      const matchingFiles = treeData.tree
        .filter((item) => {
          if (item.type !== "blob") return false;
          const itemPathLower = item.path?.toLowerCase() || "";
          const matchesQuery = itemPathLower.includes(queryLower);
          const matchesPath = !path || itemPathLower.startsWith(pathLower);
          return matchesQuery && matchesPath;
        })
        .map((item) => ({
          name: item.path?.split("/").pop(),
          path: item.path,
          size: item.size,
        }))
        .slice(0, 100);

      res.json({
        repo,
        query,
        path: path || "/",
        count: matchingFiles.length,
        files: matchingFiles,
      });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({
          error: "Not Found",
          message: `Repository '${repo}' not found`,
        });
      }
      console.error("Error searching:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
    }
  });
  // ========================================
  // PATH-PARAMETER VARIANTS (RESTful URL style)
  // e.g. /api/github/repos/swipesblue/tree
  // ========================================

  // Get directory tree via path param
  app.get(
    "/api/github/repos/:repo/tree",
    requireGitHubApiKey,
    async (req, res) => {
      const repo = req.params.repo;
      const path = (req.query.path as string) || "";

      try {
        const { data } = await octokit.rest.repos.getContent({
          owner: "53947",
          repo,
          path,
        });

        if (Array.isArray(data)) {
          const contents = data.map((item) => ({
            name: item.name,
            path: item.path,
            type: item.type,
            size: item.size,
          }));
          return res.json({
            repo,
            path: path || "/",
            type: "directory",
            contents,
          });
        }

        res.json({
          repo,
          name: data.name,
          path: data.path,
          type: "file",
          size: data.size,
        });
      } catch (error: any) {
        if (error.status === 404) {
          return res.status(404).json({
            error: "Not Found",
            message: `Path '${path}' not found in repo '${repo}'`,
          });
        }
        console.error("Error fetching tree:", error);
        res
          .status(500)
          .json({ error: "Internal Server Error", message: error.message });
      }
    },
  );

  // Get file contents via path param
  app.get(
    "/api/github/repos/:repo/contents/*",
    requireGitHubApiKey,
    async (req, res) => {
      const repo = req.params.repo;
      const filePath = req.params[0] || "";

      if (!filePath) {
        return res
          .status(400)
          .json({ error: "Bad Request", message: "File path is required" });
      }

      try {
        const { data } = await octokit.rest.repos.getContent({
          owner: "53947",
          repo,
          path: filePath,
        });

        if (Array.isArray(data) || data.type !== "file") {
          return res.status(400).json({
            error: "Bad Request",
            message: "Path must be a file, not a directory",
          });
        }

        const content = Buffer.from(data.content, "base64").toString("utf-8");

        res.json({
          repo,
          name: data.name,
          path: data.path,
          size: data.size,
          encoding: "utf-8",
          content,
        });
      } catch (error: any) {
        if (error.status === 404) {
          return res.status(404).json({
            error: "Not Found",
            message: `File '${filePath}' not found in repo '${repo}'`,
          });
        }
        console.error("Error fetching file contents:", error);
        res
          .status(500)
          .json({ error: "Internal Server Error", message: error.message });
      }
    },
  );

  // Extract routes via path param
  app.get(
    "/api/github/repos/:repo/routes",
    requireGitHubApiKey,
    async (req, res) => {
      const repo = req.params.repo;

      const possiblePaths = [
        "client/src/App.tsx",
        "client/src/App.jsx",
        "src/App.tsx",
        "src/App.jsx",
        "app/routes.tsx",
      ];

      try {
        let routesContent: string | null = null;
        let foundPath: string | null = null;

        for (const filePath of possiblePaths) {
          try {
            const { data } = await octokit.rest.repos.getContent({
              owner: "53947",
              repo,
              path: filePath,
            });
            if (!Array.isArray(data) && data.content) {
              routesContent = Buffer.from(data.content, "base64").toString(
                "utf-8",
              );
              foundPath = filePath;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        if (!routesContent) {
          return res.status(404).json({
            error: "Not Found",
            message: "Could not find routes file",
          });
        }

        const routes = new Set<string>();

        const patterns = [
          /path\s*[=:]\s*["']([^"']+)["']/g,
          /<Route[^>]*\s+path\s*=\s*["']([^"']+)["']/g,
          /to\s*=\s*["']([^"']+)["']/g,
        ];

        for (const pattern of patterns) {
          const matches = routesContent.matchAll(pattern);
          for (const match of matches) {
            if (match[1].startsWith("/")) {
              routes.add(match[1]);
            }
          }
        }

        const sortedRoutes = [...routes].sort();

        res.json({
          repo,
          source_file: foundPath,
          route_count: sortedRoutes.length,
          routes: sortedRoutes,
        });
      } catch (error: any) {
        console.error("Error extracting routes:", error);
        res
          .status(500)
          .json({ error: "Internal Server Error", message: error.message });
      }
    },
  );

  // Get recent commits via path param
  app.get(
    "/api/github/repos/:repo/commits",
    requireGitHubApiKey,
    async (req, res) => {
      const repo = req.params.repo;
      const commitCount = Math.min(
        Math.max(parseInt(req.query.count as string) || 10, 1),
        100,
      );

      try {
        const { data } = await octokit.rest.repos.listCommits({
          owner: "53947",
          repo,
          per_page: commitCount,
        });

        const commits = data.map((commit) => ({
          sha: commit.sha.substring(0, 7),
          message: commit.commit.message.split("\n")[0],
          author: commit.commit.author?.name,
          date: commit.commit.author?.date,
          url: commit.html_url,
        }));

        res.json({ repo, count: commits.length, commits });
      } catch (error: any) {
        if (error.status === 404) {
          return res.status(404).json({
            error: "Not Found",
            message: `Repository '${repo}' not found`,
          });
        }
        console.error("Error fetching commits:", error);
        res
          .status(500)
          .json({ error: "Internal Server Error", message: error.message });
      }
    },
  );

  // ========================================
  // END PATH-PARAMETER VARIANTS
  // ========================================
  // ========================================
  // END GITHUB API ROUTES
  // ========================================

  const httpServer = createServer(app);
  return httpServer;
}
