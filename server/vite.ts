import express, { type Express, type Response } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { getBranding, type Platform } from "../shared/branding";

const viteLogger = createLogger();

/** Rewrite index.html with per-platform branding (title, meta, favicons, theme) */
function brandIndexHtml(html: string, platform: Platform): string {
  const branding = getBranding(platform);
  const faviconDir = platform === "unknown" ? "triadblue" : platform;

  // Title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${branding.title}</title>`);

  // Meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${branding.description}"`,
  );

  // OG tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${branding.title}"`,
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${branding.description}"`,
  );

  // Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${branding.title}"`,
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${branding.description}"`,
  );

  // Favicon link hrefs → /favicons/{platform}/ paths
  html = html.replace(
    /href="\/favicons\/triadblue\//g,
    `href="/favicons/${faviconDir}/`,
  );

  // OG/Twitter image
  html = html.replace(
    /content="\/favicons\/triadblue\//g,
    `content="/favicons/${faviconDir}/`,
  );

  // Add theme-color meta if not present, or update it
  if (html.includes('<meta name="theme-color"')) {
    html = html.replace(
      /<meta name="theme-color" content="[^"]*"/,
      `<meta name="theme-color" content="${branding.themeColor}"`,
    );
  } else {
    html = html.replace(
      '</head>',
      `    <meta name="theme-color" content="${branding.themeColor}" />\n  </head>`,
    );
  }

  return html;
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      let page = await vite.transformIndexHtml(url, template);
      const platform = (res as Response).locals?.platform || "unknown";
      page = brandIndexHtml(page, platform as Platform);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist — brand per-subdomain
  app.use("*", (_req, res) => {
    const platform = (res as Response).locals?.platform || "unknown";
    let html = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
    html = brandIndexHtml(html, platform as Platform);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });
}
