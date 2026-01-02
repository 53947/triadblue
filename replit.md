# ConsoleBlue - Centralized Task Management & Documentation Hub

## Overview

ConsoleBlue is a unified, password-protected task management and documentation hub within the TriadBlue Replit Account. It acts as the command center for managing sibling projects (BusinessBlueprint, HostsBlue, SwipesBlue, List It) within the same account. It features a public demo dashboard at `/demo` to showcase capabilities.

ConsoleBlue serves as a centralized hub for tracking tasks, conversations, GitHub activity, and project data across all TriadBlue projects. It includes AI-powered conversation analysis for action items, API key-based integration for external projects, and a Project Documentation Generator using Handlebars templates. The design follows a dark-first aesthetic with fluorescent blue accents and Archivo typography. It's built as a full-stack web application with React and Express.js, drawing inspiration from Linear, Notion, and GitHub for productivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework:** React 18 with TypeScript, Vite.
- **Routing:** Wouter.
- **UI:** Shadcn/ui (New York style) based on Radix UI, Tailwind CSS, CVA.
- **Design System:** Inter and JetBrains Mono fonts, HSL-based colors, responsive grid, focused on information density.
- **State Management:** TanStack Query for server state, React hooks for UI state.

### Backend
- **Server:** Express.js with TypeScript and ESM.
- **API:** RESTful endpoints, Bearer token authentication, Zod validation.
- **Database:** Drizzle ORM, Neon serverless PostgreSQL, WebSocket support, schema-first design.
- **AI Integration:** OpenAI via Replit AI Integrations (GPT-5).

### Authentication
- **Public Access:** Landing page, Login pages, Demo Dashboard.
- **Protected Access:** Main dashboard routes require authentication.
- **Dual Login System:** Separate authentication for LINKBlue Dashboard and ConsoleBlue Panel.
  - **LINKBlue Dashboard:** `/linkblue/login` - Platform health monitoring and client management.
  - **ConsoleBlue Panel:** `/consoleblue/login` - Task management and documentation hub.
- **Admin Users:** Stored in `admin_users` table with platform-specific access flags (`linkblueAccess`, `consoleblueAccess`).
- **Security:** 
  - bcrypt password hashing with 12 salt rounds.
  - Account locking after 5 failed attempts (15-minute lockout).
  - Platform-specific middleware validates access on every protected request.
  - Session tokens stored in `admin_sessions` table with expiration tracking.
- **Legacy Access:** Password-based (DASHBOARD_PASSWORD env var) still supported for ConsoleBlue.

### Key Features
- **Public Demo Dashboard:** `/demo` with mock data, showcasing features like Email Chat inbox, Asset Management, Site Map, and Site Planner.
- **Multi-Project Management:** Color-coded project cards, API keys, aggregated task views.
- **Task Tracking:** Multi-source task creation, status workflow, priority levels, filtering.
- **Conversation Logging:** Manual entry, AI-powered action item extraction, automated task creation.
- **GitHub Integration:** Fetch commit history, bidirectional sync (tasks to GitHub issues).
- **Webhook System:** Inbound webhook receiver with HMAC-SHA256 verification.
- **Multi-Project Agent Chat:** Project-scoped, real-time chat, message persistence.
- **Activity Timeline:** Unified chronological feed of events with filtering.
- **Task Templates:** Project-specific and global templates.
- **Conversation Templates:** Backend API for project-specific and global templates.
- **Task Status Sync Back:** Bidirectional task update synchronization to source projects via HTTP API.
- **Project Documentation Generator:** Handlebars-based system with seeded templates, dynamic metadata forms, live preview, ZIP export, and GitHub push integration.
- **Asset Management System:** Favicon and logo upload system with database schema (UUID-based assets), Multer-based upload pipeline, and full CRUD API.
- **Speech-to-Text Voice Input:** Browser-based Web Speech API integration for hands-free input across the application.
- **Assistant Workspace:** Dedicated interface at `/assistant-workspace` for Email Assistant agents to monitor and respond to emails across all projects.
- **Site Planner:** Visual flowchart tool at `/site-planner` using ReactFlow for interactive node-based editing.
- **Site Map:** Hierarchical route explorer at `/site-map` displaying auto-generated tree view of routes from TriadBlue projects.

### TriadBlue Standard URL Configuration & Standards Distribution
- **Live Standards API:** ConsoleBlue publishes current TriadBlue requirements at `/api/standards` (public endpoint).
- **Required Endpoints:** All TriadBlue projects **MUST** implement Metadata API, Agent API, and Routes API.
- **Automatic Configuration:** ConsoleBlue seeds all 7 TriadBlue projects at startup, pre-fills metadata URLs, creates agent connections, and normalizes legacy connections.
- **Standards Distribution System:** ConsoleBlue pushes updated `replit.md` files to all TriadBlue projects via GitHub when requirements change.

### API Key & Secret Naming Standards
- All API keys and secrets **MUST** follow conventions in `API_KEY_NAMING_GUIDE.md`.

## External Dependencies

- **Package Management:** npm.
- **Database:** Neon serverless PostgreSQL (`@neondatabase/serverless`).
- **AI Service:** Replit AI Integrations (OpenAI-compatible API).
- **Email Service:** AgentMail integration.
- **Development Tools:** Replit-specific Vite plugins, TypeScript, Drizzle Kit.
- **Fonts:** Google Fonts CDN (Inter, JetBrains Mono).
- **Third-Party UI:** date-fns, cmdk, embla-carousel, lucide-react, react-hook-form with Zod, vaul.