import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import {
  seedDefaultUser,
  seedTriadBlueProjects,
  seedLocalPlatformBuilderAgent,
  seedSharedEmailInboxes,
  seedAdminUser,
} from "./seed";
import { seedDocumentationTemplates } from "./seed-documentation-templates";
import path from "path";
import { getBranding, type Platform } from "../shared/branding";

const app = express();

// Allow external API access for AI agents (bypass Replit proxy restrictions)
app.use("/api/github", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "x-api-key, content-type");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Trust proxy for secure cookies in production (Replit)
app.set("trust proxy", 1);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// PostgreSQL session store for production persistence
const PostgresStore = pgSession(session);
const sessionPool = new Pool({ connectionString: process.env.DATABASE_URL });

// Session configuration with PostgreSQL store
app.use(
  session({
    store: new PostgresStore({
      pool: sessionPool,
      createTableIfMissing: true,
    }),
    secret:
      process.env.SESSION_SECRET ||
      "consoleblue-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Refresh session on each request
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined, // B1: cross-subdomain session sharing
    },
  }),
);

// B2: Hostname detection middleware — sets res.locals.platform
app.use((req, res, next) => {
  const hostname = req.hostname || "";
  if (hostname.startsWith("linkblue.")) {
    res.locals.platform = "linkblue";
  } else if (hostname.startsWith("consoleblue.")) {
    res.locals.platform = "consoleblue";
  } else {
    res.locals.platform = "unknown";
  }
  next();
});

// B6: Per-subdomain favicon routing
app.get("/favicon.ico", (req, res, next) => {
  const platform =
    res.locals.platform === "linkblue" || res.locals.platform === "consoleblue"
      ? res.locals.platform
      : "triadblue";
  res.sendFile(path.resolve(`client/public/favicons/${platform}/favicon.png`));
});

// Dynamic manifest.json — platform-specific name, icons, theme
app.get("/manifest.json", (req, res) => {
  const platform: Platform =
    res.locals.platform === "linkblue" || res.locals.platform === "consoleblue"
      ? res.locals.platform
      : "unknown";
  const faviconDir = platform === "unknown" ? "triadblue" : platform;
  const branding = getBranding(platform);
  res.json({
    name: branding.title,
    short_name: branding.title,
    description: branding.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: branding.themeColor,
    icons: [
      {
        src: `/favicons/${faviconDir}/favicon-192x192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `/favicons/${faviconDir}/favicon-512x512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: `/favicons/${faviconDir}/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Log environment availability (not values)
  console.log(`GITHUB_TOKEN exists: ${!!process.env.GITHUB_TOKEN}`);
  console.log(`BLUE_API_KEY exists: ${!!process.env.BLUE_API_KEY}`);

  // Seed default user for foreign key constraints
  const systemUser = await seedDefaultUser();

  // Seed admin user for LINKBlue/ConsoleBlue access
  await seedAdminUser();

  // Seed TriadBlue projects and agent connections
  await seedTriadBlueProjects();

  // Seed local Platform Builder agent for direct communication
  await seedLocalPlatformBuilderAgent();

  // Seed 3 shared email inboxes with project-level filtering
  await seedSharedEmailInboxes();

  // Seed documentation templates
  await seedDocumentationTemplates(systemUser.id);

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
