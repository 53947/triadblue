# Project Hub - Centralized Task Management & Documentation System

## Overview

This is a unified task management and documentation hub designed to manage multiple Replit projects from a centralized dashboard. The application serves as a command center for tracking tasks, conversations, GitHub activity, and project-related data across different applications. It features AI-powered conversation extraction to identify undocumented action items and provides API key-based integration for external projects to push data to the hub.

The system is built as a full-stack web application with a modern React frontend and Express.js backend, designed with productivity and information density in mind, following design principles inspired by Linear, Notion, and GitHub.

## User Preferences

Preferred communication style: Simple, everyday language.

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

**GitHub Activity**
- Commit history tracking linked to projects
- Repository and branch information
- Commit message and SHA storage for reference

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