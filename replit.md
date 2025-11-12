# ConsoleBlue - Centralized Task Management & Documentation Hub

## Overview

ConsoleBlue is a unified task management and documentation hub designed to manage multiple Replit projects from a centralized, password-protected dashboard. The application features a public landing page showcasing the TriadBlue ecosystem (BusinessBlueprint, HostsBlue, SwipesBlue platforms) and serves as a command center for tracking tasks, conversations, GitHub activity, and project-related data across different applications.

The system includes AI-powered conversation extraction to identify undocumented action items and provides API key-based integration for external projects to push data to the hub. Built with ConsoleBlue command console branding featuring fluorescent blue (#0000FF) accents, Archivo typography, and dark-first design aesthetic.

The system is built as a full-stack web application with a modern React frontend and Express.js backend, designed with productivity and information density in mind, following design principles inspired by Linear, Notion, and GitHub.

## User Preferences

Preferred communication style: Simple, everyday language.

## Authentication System

**Public Access:**
- Landing page (`/`) - Publicly accessible TriadBlue ecosystem showcase
- Login page (`/login`) - Password authentication portal

**Protected Access:**
- All dashboard routes (`/dashboard`, `/tasks`, `/projects`, `/agent-chat`, `/timeline`, `/analytics`, etc.) require authentication
- Password stored securely in `DASHBOARD_PASSWORD` environment variable
- Server-side session management with httpOnly cookies (7-day expiry, sameSite=lax)
- Constant-time password comparison prevents timing attacks
- All dashboard API routes protected with `authRequired` middleware

**Authentication Flow:**
1. User visits landing page at `/`
2. Clicks "Dashboard Login" to access `/login`
3. Enters password (validated against DASHBOARD_PASSWORD env var)
4. Server creates session with `{ user: { role: "admin" } }`
5. Session cookie automatically sent with subsequent requests
6. Protected routes check session via `/api/auth/me` endpoint
7. Logout button destroys server session and redirects to landing page

**Security Features:**
- Password never exposed in frontend bundle (server-side only)
- HttpOnly cookies prevent client-side JavaScript access
- Session-based auth (not localStorage) prevents client tampering
- Protected API routes return 401 for unauthenticated requests
- ProtectedRoute wrapper redirects to `/login` if auth check fails

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing instead of React Router
- Path aliases configured for clean imports (@/ for client, @shared/ for shared code)

**UI Component System**
- Shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design system tokens
- Class Variance Authority (CVA) for managing component variants
- Custom CSS variables for theme support (light/dark mode)

**Design System**
- Typography: Inter font family for UI, JetBrains Mono for code/monospace content
- Color system: HSL-based colors with CSS custom properties for theme switching
- Spacing: Tailwind units (2, 4, 8, 12, 16) for consistent vertical rhythm
- Layout: Responsive grid with fixed 256px sidebar + flexible main content area
- Visual hierarchy emphasizes information density without clutter

**State Management**
- TanStack Query (React Query) for server state management and caching
- Local component state with React hooks for UI state
- Query invalidation pattern for optimistic updates after mutations
- Global toast notifications for user feedback

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript with ESM modules for modern JavaScript features
- Middleware for request logging, JSON parsing, and API key validation

**API Design**
- RESTful endpoints organized by resource (projects, tasks, conversations, etc.)
- Bearer token authentication for API key-based access from external projects
- Permission-based authorization system (read_tasks, write_tasks, view_conversations, etc.)
- Request validation using Zod schemas derived from database schema

**Database Layer**
- Drizzle ORM for type-safe database queries and migrations
- Neon serverless PostgreSQL as the database provider
- WebSocket support for serverless database connections
- Schema-first approach with automatic TypeScript types

**Database Schema Design**
- Users table: Supports owner/collaborator roles (single default user in current version)
- Projects table: Represents different Replit apps with color coding and metadata
- API Keys table: Per-project keys with granular permissions for external integrations
- Tasks table: Multi-source tasks (manual, conversation, GitHub, API) with status tracking
- Conversations table: AI agent interaction logs with optional project association
- GitHub Activity table: Commit tracking with project linkage
- Relational structure with cascade deletes for data integrity

**AI Integration**
- OpenAI integration via Replit AI Integrations service
- Conversation analysis to extract undocumented action items
- JSON-structured responses for reliable parsing
- GPT-5 model for enhanced extraction capabilities

### Application Features

**Multi-Project Management**
- Color-coded project cards for visual organization
- Project-specific API keys for external data ingestion
- Task aggregation across all projects in unified feed
- Per-project detail views with API key management

**Task Tracking**
- Multiple sources: manual entry, conversation extraction, GitHub commits, external API
- Status workflow: pending → in_progress → completed/cancelled
- Priority levels: low, medium, high, urgent
- Rich filtering by source, project, status, and priority
- Source URL tracking for traceability

**Conversation Logging**
- Manual conversation entry with AI-powered action item extraction
- Agent name tracking for multi-agent conversations
- Optional project association for context
- Automated task creation from extracted items

**GitHub Integration** *(Completed - Task 1)*
- Real GitHub API integration to fetch commit history from configured repositories
- Per-project GitHub repository and branch configuration via project detail page
- Manual sync functionality via "Sync Now" button to fetch latest commits
- SHA-based deduplication to prevent duplicate commit entries
- Commit tracking with repository, branch, message, author, and timestamp metadata
- Last sync timestamp tracking (lastGithubSync) for future incremental sync support
- Graceful error handling when GitHub token is not configured
- GitHub activity displayed in unified dashboard feed alongside tasks and conversations
- Backend service (server/github.ts) handles GitHub API communication
- Storage layer supports bulk operations for efficient commit insertion
- Requires GITHUB_TOKEN environment variable for authenticated API access

**Bidirectional GitHub Sync** *(Completed - Task 4)*
- Push tasks to GitHub as issues directly from task cards
- GitHubIssuesService (server/github-issues.ts): Creates GitHub issues via REST API
- Automatic labeling based on task priority (urgent/high/medium/low)
- Issue body includes task description, priority, status, source, and due date
- Database tracking: githubIssueNumber, githubIssueUrl, githubIssueState, githubSyncedAt
- Frontend "Push to GitHub" button on tasks (appears when not yet synced)
- After sync, displays clickable GitHub issue badge (#123) with external link
- Optimistic UI updates for instant visual feedback
- Prevents duplicate GitHub issues with validation
- API endpoint POST /api/tasks/:id/create-github-issue
- Architect-approved UI compliance: proper button sizing, optimistic cache updates

**Webhook System** *(Completed - Task 2)*
- Inbound webhook receiver endpoint (POST /api/projects/:projectId/webhook-events) for external projects to POST events
- HMAC-SHA256 signature verification using X-Hub-Signature header against raw request payload
- Event type filtering - only processes events in webhook's configured events array
- Event processing pipeline handles task.created, task.updated, conversation.created events
- Auto-creates tasks/conversations from verified webhook payloads
- Webhook management API: create, list, update, delete webhooks per project
- Auto-generated secure secrets for each webhook (64-character hex)
- Tracks lastTriggeredAt timestamp for webhook activity monitoring
- Returns 401 for missing/invalid signatures, 403 for disallowed event types
- Backend properly uses raw body for HMAC verification (avoids JSON re-serialization issues)

**Multi-Project Agent Chat Interface** *(Completed - Task 2)*
- Database schema for agent connections (agentConnections table) and messages (agentChatMessages table)
- Project-scoped agent connection management with CRUD operations
- AgentService (server/agent.ts) handles external HTTP communication with bearer token authentication
- Complete REST API: connection CRUD, message sending/retrieval, connection testing
- Frontend chat UI (client/src/pages/agent-chat.tsx) with agent selector dropdown
- Add agent connection dialog with form validation (project, name, endpoint, optional API key)
- Real-time message display with user/assistant role differentiation
- Message input with send button and Enter key support
- Conversation history persistence and retrieval ordered by timestamp
- Agent communication: Hub forwards user messages to external agent endpoints with full conversation context
- External agents expected to accept JSON with message + history, respond with "reply" field
- Empty states for no agent selected and no messages
- Project context display showing selected agent's project and endpoint URL
- Enables chatting with AI agents running in other Replit projects from centralized hub interface

**Activity Timeline** *(Completed - Task 12)*
- Unified activity timeline aggregating all system events
- Backend API endpoint /api/activities combines tasks, conversations, GitHub commits, agent messages
- Frontend page with chronological feed and date grouping (today/yesterday/this week)
- Advanced filtering: project, activity type (all/tasks/conversations/github/agent)
- Search functionality across all activity types
- Sidebar navigation integration
- Efficient query performance with optimized data aggregation
- ActivityService (server/activity.ts) handles multi-source data queries

**Task Templates** *(Completed - Task 7)*
- Database schema: taskTemplates table with projectId, name, description, defaultTitle, defaultDescription, defaultPriority, defaultTags, defaultDueInDays
- Nullable projectId for global templates, unique constraint on (projectId, name)
- Storage CRUD methods in DatabaseStorage: getTaskTemplates, getTaskTemplate, createTaskTemplate, updateTaskTemplate, deleteTaskTemplate
- Complete REST API with Zod validation: GET/POST/PUT/DELETE endpoints
- Frontend ProjectTemplates component integrated into project detail page
- Create/edit/delete functionality with form validation
- Template application flow: select template → populate form → create task
- Manual and E2E testing confirmed all functions work correctly
- Architect-approved minimal integration (Option B)

**Conversation Templates** *(Completed - Task 8 - Backend Only)*
- Database schema: conversationTemplates table with projectId, name, description, defaultTitle, defaultContent, defaultAgentName, tags
- Nullable projectId for global templates, unique constraint on (projectId, name)
- Default empty array for tags, relations added to projects and users
- Storage CRUD methods in DatabaseStorage: getConversationTemplates, getConversationTemplate, createConversationTemplate, updateConversationTemplate, deleteConversationTemplate
- Complete REST API with Zod validation and immutable field protection:
  - GET /api/projects/:projectId/conversation-templates
  - GET /api/conversation-templates/global
  - POST /api/projects/:projectId/conversation-templates (with validation)
  - PUT /api/conversation-templates/:id (protects projectId, createdById)
  - DELETE /api/conversation-templates/:id
- Server-side createdById population with default-user
- Request validation using insertConversationTemplateSchema.safeParse
- Returns 400 on validation errors, 500 on unexpected errors
- Architect-approved after validation fixes (POST/PUT properly validate, protect immutable fields)
- Frontend integration deferred to conserve token budget for rapid deployment
- Ready for frontend integration when needed (follow task templates pattern)

**Task Status Sync Back** *(Completed - Task 3)*
- Bidirectional task update synchronization to source projects via HTTP API
- Database schema extensions: sync tracking fields (syncEnabled, syncUrl, syncStatus, lastSyncAt, syncRetryCount, syncError)
- Project-level default sync configuration (defaultSyncEnabled, defaultSyncUrl) with per-task overrides
- SyncService (server/sync.ts): HTTP client sending PATCH requests with task data to external endpoints
- SyncScheduler (server/sync-scheduler.ts): In-memory job queue with background worker processing
- Dual-snapshot tracking system (currentTask + latestSnapshot) ensures correct ordering of concurrent updates
- Automatic sync triggering when task status or priority changes via PUT /api/tasks/:id
- Manual sync API (POST /api/tasks/:id/sync) for on-demand synchronization
- Sync status query API (GET /api/tasks/:id/sync-status) for frontend status display
- Exponential backoff retry logic: 2s, 4s, 8s delays with max 3 attempts per sync job
- Auto-configuration: Tasks created from webhooks/API automatically inherit project sync defaults
- Frontend UI indicators (client/src/components/feed-item.tsx):
  - Color-coded sync status badges (green=success, blue=syncing, red=failed, gray=idle)
  - Status-specific icons (CheckCircle, RefreshCw with spin animation, AlertCircle)
  - Detailed tooltips showing sync URL, last sync time, and error messages
  - Only visible when task has syncEnabled=true
- Enables external projects to receive real-time task updates as changes occur in the Hub
- Resilient sync pipeline handles network failures and concurrent task modifications

### External Dependencies

**Package Management**
- npm for dependency management
- Key dependencies: React, Express, Drizzle ORM, TanStack Query, Radix UI components

**Database Service**
- Neon serverless PostgreSQL (via @neondatabase/serverless package)
- Connection pooling for efficient resource usage
- DATABASE_URL environment variable for configuration

**AI Service**
- Replit AI Integrations (OpenAI-compatible API)
- Configured via AI_INTEGRATIONS_OPENAI_BASE_URL and API_KEY environment variables
- No external OpenAI API key required

**Development Tools**
- Replit-specific Vite plugins for runtime error overlay and cartographer
- TypeScript compiler for type checking
- Drizzle Kit for database migrations and schema management

**Font Delivery**
- Google Fonts CDN for Inter and JetBrains Mono typefaces
- Preconnect optimization for faster font loading

**Third-Party UI Libraries**
- date-fns for date formatting and manipulation
- cmdk for command palette functionality
- embla-carousel for carousel components
- lucide-react for icon system
- react-hook-form with Zod resolvers for form validation
- vaul for drawer components