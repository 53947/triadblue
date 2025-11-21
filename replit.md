# ConsoleBlue - Centralized Task Management & Documentation Hub

## Overview

ConsoleBlue is a unified, password-protected task management and documentation hub built within the **TriadBlue Replit Account**. It serves as the command center for managing multiple sibling projects (BusinessBlueprint, HostsBlue, SwipesBlue, List It) that are also built under the same TriadBlue account.

**Public Demo:** ConsoleBlue features a public demo dashboard at `/demo` (no login required) that showcases key features with mock data, allowing visitors to explore the platform's capabilities before signing in.

**Organizational Structure:**
- **TriadBlue** = Replit Account (top-level)
- **ConsoleBlue** = Sub-project (this application)
- **BusinessBlueprint, HostsBlue, SwipesBlue, List It** = Sibling sub-projects at the same level

ConsoleBlue features a public landing page for the TriadBlue ecosystem and acts as a centralized hub for tracking tasks, conversations, GitHub activity, and project data across all TriadBlue projects. The system includes AI-powered conversation extraction for action items, API key-based integration for external projects, and a Project Documentation Generator for creating standardized documentation using Handlebars templates. It follows a dark-first design aesthetic with fluorescent blue accents, Archivo typography, and is built as a full-stack web application with React and Express.js, drawing inspiration from Linear, Notion, and GitHub for productivity and information density.

## User Preferences

Preferred communication style: Simple, everyday language.

## Builder Roles

ConsoleBlue supports multiple AI builder roles, each with equal status and distinct responsibilities:

### Platform Builder
- **Role:** Builds and maintains ConsoleBlue application features
- **Access:** This chat interface
- **Responsibilities:** Code development, bug fixes, feature implementation, infrastructure
- **Naming:** Standard agent session

### Email Assistant
- **Role:** Monitors and responds to project emails
- **Access:** `/assistant-workspace` page in ConsoleBlue
- **Responsibilities:** Read emails across all projects, reply to user instructions, create tasks/conversations based on email content
- **Naming Convention:** `{project}.assistant` (e.g., `listit.assistant`, `businessblueprint.assistant`)
- **Email Access:** Monitors existing project email inboxes configured in Email Settings
- **Note:** Assistant names are just labels for AI sessions - they do NOT have their own email addresses

All builders are **equal** - no hierarchical structure. Email chat is preferred over Replit messages for better searchability and history tracking.

## System Architecture

### Frontend

- **Framework:** React 18 with TypeScript, Vite for build/development.
- **Routing:** Wouter for lightweight client-side routing.
- **UI:** Shadcn/ui (New York style) based on Radix UI, Tailwind CSS for styling, CVA for component variants.
- **Design System:** Inter and JetBrains Mono fonts, HSL-based colors, responsive grid (256px sidebar + flexible content), focused on information density.
- **State Management:** TanStack Query for server state and caching, React hooks for UI state.

### Backend

- **Server:** Express.js with TypeScript and ESM, trust proxy enabled for Replit deployment.
- **API:** RESTful endpoints, Bearer token authentication for external projects, Zod for request validation.
- **Database:** Drizzle ORM, Neon serverless PostgreSQL, WebSocket support, schema-first design.
- **AI Integration:** OpenAI integration via Replit AI Integrations service (GPT-5 for conversation analysis and action item extraction).

### Authentication

- **Public Access:** Landing page (`/`), Login page (`/login`), Demo Dashboard (`/demo` and all `/demo/*` routes).
- **Protected Access:** All main dashboard routes require authentication.
- **Method:** Password-based (DASHBOARD_PASSWORD env var), server-side session management with httpOnly cookies.
- **Session Security:** Rolling sessions (7-day expiry), SameSite=lax, secure cookies in production, trust proxy for Replit deployment.

### Key Features

- **Public Demo Dashboard:** Public showcase at `/demo` (no authentication required) featuring 5 pages with mock data: Demo Home with feature cards, Email Chat inbox with sample threads, Asset Management with upload UI and sample assets, Site Map with hierarchical routes, and Site Planner with visual flowcharts. Includes clear demo mode indicators, login CTAs, and read-only controls. All pages comply with project guidelines (no emojis, comprehensive data-testid attributes).
- **Multi-Project Management:** Color-coded project cards, project-specific API keys, aggregated task views.
- **Task Tracking:** Multi-source task creation (manual, AI, GitHub, API), status workflow, priority levels, filtering, source URL tracking.
- **Conversation Logging:** Manual entry, AI-powered action item extraction, optional project association, automated task creation.
- **GitHub Integration:** Fetch commit history, bidirectional sync (push tasks to GitHub issues with labeling and status tracking).
- **Webhook System:** Inbound webhook receiver with HMAC-SHA256 verification, event processing pipeline, webhook management API.
- **Multi-Project Agent Chat:** Project-scoped agent connections, real-time chat UI, message persistence, context forwarding to external agents.
- **Activity Timeline:** Unified chronological feed of all system events (tasks, conversations, GitHub, agent messages) with filtering and search.
- **Task Templates:** Project-specific and global templates for pre-populating task creation forms.
- **Conversation Templates:** Backend-only API for project-specific and global conversation templates, ready for frontend integration.
- **Task Status Sync Back:** Bidirectional task update synchronization to source projects via HTTP API with configurable sync behavior, retry logic, and UI indicators.
- **Project Documentation Generator:** Complete Handlebars-based documentation system with multi-step wizard UI. Features include 9 seeded templates (README.md, replit.md, ARCHITECTURE.md, CODING_STANDARDS.md, etc.), dynamic metadata form with JSON type detection, AST-based variable extraction, live preview rendering with missing variable warnings, atomic configuration upsert, ZIP export with fetch/Blob download, and GitHub push integration with enhanced error handling for protected branches. Full backend API with template listing, config persistence, generation, preview, export, and GitHub push endpoints. Frontend implements project selection, template selection with categories, type-aware metadata inputs, real-time preview, save/generate/export/push workflows with proper loading states and error handling.
- **Asset Management System:** Production-ready favicon and logo upload system with comprehensive documentation standards (ASSET_MANAGEMENT_STANDARDS.md). Database schema with UUID-based assets table, nullable projectId for global assets, partial unique index enforcing single active asset per type. Multer-based upload pipeline with file validation (PNG, SVG, ICO, WEBP, max 2MB), server-side MIME validation, and secure filename generation. Full CRUD API with authenticated routes for upload/list/activate/delete, plus unauthenticated /uploads static serving for public asset access. Asset Management UI page at /assets with separate upload forms for favicon and logo, file previews, asset library with activation controls, and active asset indicators. Dynamic favicon injection component that fetches active favicon from API and updates document head for both public and authenticated routes. All TriadBlue documentation templates mandate asset upload interfaces from project start.
- **Speech-to-Text Voice Input:** Browser-based Web Speech API integration for hands-free input across the application. Reusable VoiceInput component (icon button) and VoiceInputButton (text button with recording states) support both single-utterance and continuous recording modes. Integrated into Agent Chat message input, Email Chat (both reply and new thread message inputs), Task creation modal (title and description fields), and Conversations page (all text inputs). Features real-time interim transcript display, error handling for microphone permissions, and automatic text appending to existing input. No external API keys required - uses native browser capabilities.
- **Assistant Workspace:** Dedicated interface at `/assistant-workspace` for Email Assistant agents to monitor and respond to emails across all projects. Aggregates email threads from all project inboxes into unified view. AI assistants with names like `listit.assistant` and `businessblueprint.assistant` monitor their respective project inboxes. Supports reading messages, replying with attachments (max 10 files, 10MB each), and voice input for hands-free operation. Separate from main Email Chat page to enable clean organization and searchability for both platform builders and email assistants. Assistant names are just session labels - they monitor existing project email infrastructure configured in Email Settings.
- **Site Planner:** Visual flowchart tool at `/site-planner` for planning page layouts and user flows. Uses ReactFlow for interactive node-based editing with drag-and-drop, connection creation, and real-time updates. Supports multiple node types (page, component, decision, data) with auto-save functionality. Project-scoped diagrams stored in site_planner_nodes and site_planner_edges tables with JSON-based position and styling data. Designed for planning application structure before implementation.
- **Site Map:** Hierarchical route explorer at `/site-map` displaying auto-generated tree view of actual routes from TriadBlue projects. ConsoleBlue routes are scanned directly from codebase (App.tsx and pages directory) via regex-based parser. External projects (BusinessBlueprint, HostsBlue, SwipesBlue, List It) can POST routes via API with "write_routes" permission. Features include collapsible tree navigation with path-based nesting, route metadata display (name, path, file location, type, framework), and dual-source support (scanned vs external). Database schema (project_routes table) tracks route information with source attribution and JSON metadata field. Scanner service parses wouter routes including component imports, inline routes, public routes, and dynamic segments.

## API Key & Secret Naming Standards

**⚠️ IMPORTANT:** All API keys and secrets MUST follow the naming conventions in `API_KEY_NAMING_GUIDE.md`. This guide provides:
- Exact names for all Replit Secrets (DASHBOARD_PASSWORD, AGENTMAIL_API_KEY, etc.)
- AgentMail inbox configuration (email format: `[projectname]@agentmail.triadblue.com`)
- ConsoleBlue API key naming format: `[ProjectName] - [Environment] - [Purpose]`
- GitHub token setup and repository configuration
- Common mistakes to avoid

**Agents:** Consult `API_KEY_NAMING_GUIDE.md` before creating or naming any API keys or secrets.

## External Dependencies

- **Package Management:** npm.
- **Database:** Neon serverless PostgreSQL (`@neondatabase/serverless`).
- **AI Service:** Replit AI Integrations (OpenAI-compatible API).
- **Email Service:** AgentMail integration for project-specific email communication.
- **Development Tools:** Replit-specific Vite plugins, TypeScript, Drizzle Kit.
- **Fonts:** Google Fonts CDN (Inter, JetBrains Mono).
- **Third-Party UI:** date-fns, cmdk, embla-carousel, lucide-react, react-hook-form with Zod, vaul.