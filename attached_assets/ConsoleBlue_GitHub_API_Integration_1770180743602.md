# ConsoleBlue - GitHub API Integration

## ⚠️ CRITICAL: ADD TO EXISTING PROJECT - DO NOT REPLACE ANYTHING

ConsoleBlue is an **existing, full-featured application** with 30+ pages, authentication, database, and complete functionality. You are ONLY adding new API routes for GitHub access.

---

## What Already Exists (DO NOT TOUCH)

- **Frontend:** 30+ React pages (Dashboard, Projects, Tasks, Agent Chat, Analytics, Asset Management, etc.)
- **Backend:** Express.js server with PostgreSQL database
- **Authentication:** Login/logout/password reset flows
- **Components:** Full shadcn/ui library, sidebars, modals
- **Routing:** wouter-based routing in App.tsx
- **Database:** Drizzle ORM with existing tables

---

## What You're Adding

**7 new API routes** in `server/routes.ts` that allow external AI agents to:
1. Check API health
2. List repositories
3. Get directory trees
4. Read file contents
5. Extract routes from React apps
6. Get recent commits
7. Search for files

---

## Step-by-Step Instructions

### Step 1: Install Octokit

In Replit Shell, run:
```bash
npm install octokit
```

### Step 2: Add Environment Variables

In Replit Secrets (Tools → Secrets), add:
- `GITHUB_TOKEN` = Your GitHub Personal Access Token (create at https://github.com/settings/tokens with `repo` scope)
- `CONSOLE_API_KEY` = A secret key like `cb_live_xxxxxxxxxxxx` (you create this)

### Step 3: Modify server/routes.ts

Open `server/routes.ts` and make these changes:

#### 3a. Add Import at Top
Find the imports section and add:
```typescript
import { Octokit } from 'octokit';
```

#### 3b. Add Octokit Instance and Middleware
After the imports, before `export async function registerRoutes`, add:
```typescript
// GitHub API Setup
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

function requireGitHubApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.CONSOLE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or missing API key' });
  }
  next();
}
```

#### 3c. Add Routes Inside registerRoutes Function
Find the `registerRoutes` function. Add these routes AFTER the existing routes but BEFORE any catch-all or 404 handlers:

```typescript
  // ========================================
  // GITHUB API ROUTES (for external AI agents)
  // ========================================

  // Health check - no auth required
  app.get('/api/github/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ConsoleBlue GitHub API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // List all repositories
  app.get('/api/github/repos', requireGitHubApiKey, async (req, res) => {
    try {
      const { data } = await octokit.rest.repos.listForUser({
        username: '53947',
        type: 'owner',
        sort: 'updated',
        per_page: 100
      });

      const repos = data.map(repo => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        updated_at: repo.updated_at,
        default_branch: repo.default_branch,
        language: repo.language,
        size: repo.size
      }));

      res.json({ count: repos.length, repos });
    } catch (error: any) {
      console.error('Error fetching repos:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Get directory tree or file metadata
  app.get('/api/github/tree', requireGitHubApiKey, async (req, res) => {
    const { repo, path = '' } = req.query;

    if (!repo) {
      return res.status(400).json({ error: 'Bad Request', message: 'repo parameter is required' });
    }

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: '53947',
        repo: repo as string,
        path: path as string
      });

      if (Array.isArray(data)) {
        const contents = data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size
        }));
        return res.json({ repo, path: path || '/', type: 'directory', contents });
      }

      res.json({
        repo,
        name: data.name,
        path: data.path,
        type: 'file',
        size: data.size
      });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ error: 'Not Found', message: `Path '${path}' not found in repo '${repo}'` });
      }
      console.error('Error fetching tree:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Get file contents
  app.get('/api/github/file', requireGitHubApiKey, async (req, res) => {
    const { repo, path } = req.query;

    if (!repo || !path) {
      return res.status(400).json({ error: 'Bad Request', message: 'repo and path parameters are required' });
    }

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: '53947',
        repo: repo as string,
        path: path as string
      });

      if (Array.isArray(data) || data.type !== 'file') {
        return res.status(400).json({ error: 'Bad Request', message: 'Path must be a file, not a directory' });
      }

      const content = Buffer.from(data.content, 'base64').toString('utf-8');

      res.json({
        repo,
        name: data.name,
        path: data.path,
        size: data.size,
        encoding: 'utf-8',
        content
      });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ error: 'Not Found', message: `File '${path}' not found in repo '${repo}'` });
      }
      console.error('Error fetching file:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Extract routes from React app
  app.get('/api/github/routes', requireGitHubApiKey, async (req, res) => {
    const { repo } = req.query;

    if (!repo) {
      return res.status(400).json({ error: 'Bad Request', message: 'repo parameter is required' });
    }

    const possiblePaths = [
      'client/src/App.tsx',
      'client/src/App.jsx',
      'src/App.tsx',
      'src/App.jsx',
      'app/routes.tsx'
    ];

    try {
      let routesContent: string | null = null;
      let foundPath: string | null = null;

      for (const filePath of possiblePaths) {
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner: '53947',
            repo: repo as string,
            path: filePath
          });
          if (!Array.isArray(data) && data.content) {
            routesContent = Buffer.from(data.content, 'base64').toString('utf-8');
            foundPath = filePath;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!routesContent) {
        return res.status(404).json({ error: 'Not Found', message: 'Could not find routes file' });
      }

      const routes = new Set<string>();
      
      // Extract path patterns
      const patterns = [
        /path\s*[=:]\s*["']([^"']+)["']/g,
        /<Route[^>]*\s+path\s*=\s*["']([^"']+)["']/g,
        /to\s*=\s*["']([^"']+)["']/g
      ];

      for (const pattern of patterns) {
        const matches = routesContent.matchAll(pattern);
        for (const match of matches) {
          if (match[1].startsWith('/')) {
            routes.add(match[1]);
          }
        }
      }

      const sortedRoutes = [...routes].sort();

      res.json({
        repo,
        source_file: foundPath,
        route_count: sortedRoutes.length,
        routes: sortedRoutes
      });
    } catch (error: any) {
      console.error('Error extracting routes:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Get recent commits
  app.get('/api/github/commits', requireGitHubApiKey, async (req, res) => {
    const { repo, count = '10' } = req.query;

    if (!repo) {
      return res.status(400).json({ error: 'Bad Request', message: 'repo parameter is required' });
    }

    const commitCount = Math.min(Math.max(parseInt(count as string) || 10, 1), 100);

    try {
      const { data } = await octokit.rest.repos.listCommits({
        owner: '53947',
        repo: repo as string,
        per_page: commitCount
      });

      const commits = data.map(commit => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split('\n')[0],
        author: commit.commit.author?.name,
        date: commit.commit.author?.date,
        url: commit.html_url
      }));

      res.json({ repo, count: commits.length, commits });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ error: 'Not Found', message: `Repository '${repo}' not found` });
      }
      console.error('Error fetching commits:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Search files in repository
  app.get('/api/github/search', requireGitHubApiKey, async (req, res) => {
    const { repo, query, path = '' } = req.query;

    if (!repo || !query) {
      return res.status(400).json({ error: 'Bad Request', message: 'repo and query parameters are required' });
    }

    try {
      const { data: repoData } = await octokit.rest.repos.get({
        owner: '53947',
        repo: repo as string
      });

      const { data: treeData } = await octokit.rest.git.getTree({
        owner: '53947',
        repo: repo as string,
        tree_sha: repoData.default_branch,
        recursive: 'true'
      });

      const queryLower = (query as string).toLowerCase();
      const pathLower = (path as string).toLowerCase();

      const matchingFiles = treeData.tree
        .filter(item => {
          if (item.type !== 'blob') return false;
          const itemPathLower = item.path?.toLowerCase() || '';
          const matchesQuery = itemPathLower.includes(queryLower);
          const matchesPath = !path || itemPathLower.startsWith(pathLower);
          return matchesQuery && matchesPath;
        })
        .map(item => ({
          name: item.path?.split('/').pop(),
          path: item.path,
          size: item.size
        }))
        .slice(0, 100);

      res.json({
        repo,
        query,
        path: path || '/',
        count: matchingFiles.length,
        files: matchingFiles
      });
    } catch (error: any) {
      if (error.status === 404) {
        return res.status(404).json({ error: 'Not Found', message: `Repository '${repo}' not found` });
      }
      console.error('Error searching:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // ========================================
  // END GITHUB API ROUTES
  // ========================================
```

---

## Testing After Deployment

```bash
# Health check (no auth needed)
curl https://console.blue/api/github/health

# List repos
curl -H "x-api-key: YOUR_CONSOLE_API_KEY" https://console.blue/api/github/repos

# Get file tree
curl -H "x-api-key: YOUR_CONSOLE_API_KEY" "https://console.blue/api/github/tree?repo=swipesblue&path=client/src"

# Get file contents
curl -H "x-api-key: YOUR_CONSOLE_API_KEY" "https://console.blue/api/github/file?repo=swipesblue&path=package.json"

# Get routes
curl -H "x-api-key: YOUR_CONSOLE_API_KEY" "https://console.blue/api/github/routes?repo=swipesblue"

# Get commits
curl -H "x-api-key: YOUR_CONSOLE_API_KEY" "https://console.blue/api/github/commits?repo=swipesblue&count=5"

# Search files
curl -H "x-api-key: YOUR_CONSOLE_API_KEY" "https://console.blue/api/github/search?repo=swipesblue&query=.tsx"
```

---

## Summary Checklist

- [ ] Run `npm install octokit`
- [ ] Add `GITHUB_TOKEN` to Replit Secrets
- [ ] Add `CONSOLE_API_KEY` to Replit Secrets
- [ ] Add `import { Octokit } from 'octokit';` to server/routes.ts
- [ ] Add `octokit` instance and `requireGitHubApiKey` middleware
- [ ] Add all 7 routes inside registerRoutes function
- [ ] Test `/api/github/health` returns status "ok"
- [ ] Test all other endpoints with valid API key

---

## CRITICAL RULES

1. **DO NOT** delete or modify any existing code
2. **DO NOT** touch any frontend files
3. **DO NOT** change database schema
4. **DO NOT** modify existing routes
5. **ONLY** add the imports, middleware, and 7 new routes shown above
6. Routes must be added INSIDE the existing `registerRoutes` function
7. All routes (except health) require `x-api-key` header authentication
