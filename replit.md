# ConsoleBlue - Centralized Task Management & Documentation Hub

## Overview

ConsoleBlue is a unified, password-protected task management and documentation hub designed to manage multiple Replit projects. It features a public landing page for the TriadBlue ecosystem (BusinessBlueprint, HostsBlue, SwipesBlue) and acts as a command center for tracking tasks, conversations, GitHub activity, and project data. The system includes AI-powered conversation extraction for action items and API key-based integration for external projects. It follows a dark-first design aesthetic with fluorescent blue accents, Archivo typography, and is built as a full-stack web application with React and Express.js, drawing inspiration from Linear, Notion, and GitHub for productivity and information density.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework:** React 18 with TypeScript, Vite for build/development.
- **Routing:** Wouter for lightweight client-side routing.
- **UI:** Shadcn/ui (New York style) based on Radix UI, Tailwind CSS for styling, CVA for component variants.
- **Design System:** Inter and JetBrains Mono fonts, HSL-based colors, responsive grid (256px sidebar + flexible content), focused on information density.
- **State Management:** TanStack Query for server state and caching, React hooks for UI state.

### Backend

- **Server:** Express.js with TypeScript and ESM.
- **API:** RESTful endpoints, Bearer token authentication for external projects, Zod for request validation.
- **Database:** Drizzle ORM, Neon serverless PostgreSQL, WebSocket support, schema-first design.
- **AI Integration:** OpenAI integration via Replit AI Integrations service (GPT-5 for conversation analysis and action item extraction).

### Authentication

- **Public Access:** Landing page (`/`), Login page (`/login`).
- **Protected Access:** All dashboard routes require authentication.
- **Method:** Password-based (DASHBOARD_PASSWORD env var), server-side session management with httpOnly cookies.

### Key Features

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

## External Dependencies

- **Package Management:** npm.
- **Database:** Neon serverless PostgreSQL (`@neondatabase/serverless`).
- **AI Service:** Replit AI Integrations (OpenAI-compatible API).
- **Development Tools:** Replit-specific Vite plugins, TypeScript, Drizzle Kit.
- **Fonts:** Google Fonts CDN (Inter, JetBrains Mono).
- **Third-Party UI:** date-fns, cmdk, embla-carousel, lucide-react, react-hook-form with Zod, vaul.