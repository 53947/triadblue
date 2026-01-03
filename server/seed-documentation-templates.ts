import { storage } from "./storage";

export async function seedDocumentationTemplates(createdById: string) {
  const templates = [
    {
      key: "readme",
      label: "README.md",
      description: "Standard project README with overview, features, and setup instructions",
      category: "core",
      isSystem: true,
      body: `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Overview

{{PROJECT_OVERVIEW}}

## Features

{{#each FEATURES}}
- {{this}}
{{/each}}

## Tech Stack

{{#each TECH_STACK}}
- **{{this.category}}**: {{this.technologies}}
{{/each}}

## Getting Started

### Prerequisites

{{#each PREREQUISITES}}
- {{this}}
{{/each}}

### Installation

\`\`\`bash
{{INSTALL_COMMANDS}}
\`\`\`

### Configuration

{{CONFIGURATION_INSTRUCTIONS}}

### Running the Application

\`\`\`bash
{{RUN_COMMANDS}}
\`\`\`

## Project Structure

\`\`\`
{{PROJECT_STRUCTURE}}
\`\`\`

## Documentation

{{#each DOCUMENTATION_LINKS}}
- [{{this.name}}]({{this.url}})
{{/each}}

## Contributing

{{CONTRIBUTING_GUIDELINES}}

## License

{{LICENSE}}

## Contact

{{CONTACT_INFO}}

## Asset Management

This application includes a built-in Asset Management system accessible from the authenticated dashboard.

### Upload Favicon

1. Navigate to Settings → Asset Management (or Asset Management page)
2. Click "Upload Favicon"
3. Select an ICO, PNG, or SVG file (max 2MB)
4. Preview and confirm
5. Favicon updates immediately in browser tabs

### Upload Company Logo

1. Navigate to Settings → Asset Management
2. Click "Upload Logo"
3. Select a PNG or SVG file (max 2MB)
4. Set as active to display in header
5. Logo updates across the application

### File Storage

- Assets stored in \`/uploads\` directory (or Replit App Storage for production)
- Metadata tracked in PostgreSQL \`assets\` table
- Served via \`/uploads/:filename\` route
- All uploads require authentication
`,
      createdById,
    },
    {
      key: "replit",
      label: "replit.md",
      description: "Replit Agent memory file with project context and preferences",
      category: "core",
      isSystem: true,
      body: `# {{PROJECT_NAME}}

## Overview

{{PROJECT_DESCRIPTION}}

{{#if PROJECT_GOAL}}
## Project Goal

{{PROJECT_GOAL}}
{{/if}}

## User Preferences

{{#each USER_PREFERENCES}}
- {{this.category}}: {{this.value}}
{{/each}}

## System Architecture

### Frontend

{{FRONTEND_ARCHITECTURE}}

### Backend

{{BACKEND_ARCHITECTURE}}

### Database

{{DATABASE_ARCHITECTURE}}

### Authentication

{{AUTH_ARCHITECTURE}}

## Key Features

{{#each KEY_FEATURES}}
### {{this.name}}

{{this.description}}

{{#if this.implementation}}
**Implementation Details:**
{{this.implementation}}
{{/if}}
{{/each}}

## External Dependencies

{{#each EXTERNAL_DEPENDENCIES}}
- **{{this.name}}**: {{this.description}}
{{/each}}

## Development Guidelines

{{DEVELOPMENT_GUIDELINES}}

## Asset Management (MANDATORY)

**All TriadBlue ecosystem applications MUST include asset upload functionality from day one.**

- Build upload interface in dashboard for favicon and company logos
- Implement backend API with file validation (PNG/SVG/ICO/WEBP, max 2MB)
- Store assets in database with metadata tracking
- Enable dynamic favicon injection (no hardcoded favicon in HTML)
- Support logo management in headers/widgets via API

**Reference**: See ASSET_MANAGEMENT_STANDARDS.md for complete implementation guide.

**Non-negotiable**: Projects without asset upload capability are incomplete.

## Recent Changes

{{#each RECENT_CHANGES}}
- **{{this.date}}**: {{this.description}}
{{/each}}
`,
      createdById,
    },
    {
      key: "architecture",
      label: "ARCHITECTURE.md",
      description: "Detailed system architecture documentation",
      category: "core",
      isSystem: true,
      body: `# {{PROJECT_NAME}} - Architecture Documentation

## System Overview

{{SYSTEM_OVERVIEW}}

## Architecture Diagram

\`\`\`
{{ARCHITECTURE_DIAGRAM}}
\`\`\`

## Core Components

{{#each CORE_COMPONENTS}}
### {{this.name}}

**Purpose**: {{this.purpose}}

**Technology**: {{this.technology}}

**Key Responsibilities**:
{{#each this.responsibilities}}
- {{this}}
{{/each}}

{{#if this.dependencies}}
**Dependencies**:
{{#each this.dependencies}}
- {{this}}
{{/each}}
{{/if}}

{{#if this.apis}}
**APIs**:
{{#each this.apis}}
- \`{{this.method}} {{this.path}}\` - {{this.description}}
{{/each}}
{{/if}}
{{/each}}

## Data Flow

{{DATA_FLOW_DESCRIPTION}}

\`\`\`
{{DATA_FLOW_DIAGRAM}}
\`\`\`

## Database Schema

{{#each DATABASE_TABLES}}
### {{this.name}}

{{this.description}}

**Columns**:
{{#each this.columns}}
- \`{{this.name}}\` ({{this.type}}{{#if this.required}} - required{{/if}}) - {{this.description}}
{{/each}}

{{#if this.relations}}
**Relations**:
{{#each this.relations}}
- {{this}}
{{/each}}
{{/if}}
{{/each}}

## Security Architecture

{{SECURITY_ARCHITECTURE}}

## Deployment Architecture

{{DEPLOYMENT_ARCHITECTURE}}

## Performance Considerations

{{PERFORMANCE_CONSIDERATIONS}}

## Scalability Strategy

{{SCALABILITY_STRATEGY}}

## ⚠️ Required API Endpoints (TriadBlue Standard)

**All TriadBlue ecosystem projects MUST implement these two standard endpoints:**

### 1. Metadata Endpoint (\`/api/metadata\`)

- **Purpose**: Provides project features and tech stack for ConsoleBlue's Documentation Generator
- **Method**: GET
- **Authentication**: None (public endpoint)
- **Pre-configured URL**: \`https://{{PROJECT_CODE}}.replit.app/api/metadata\`

**Response Format**:
\`\`\`json
{
  "features": ["Feature 1", "Feature 2"],
  "techStack": ["Technology 1", "Technology 2"]
}
\`\`\`

### 2. Agent Endpoint (\`/api/agent\`)

- **Purpose**: Enables conversational AI interaction through ConsoleBlue's Agent Chat interface
- **Method**: POST
- **Authentication**: Optional (Bearer token if needed)
- **Pre-configured URL**: \`https://{{PROJECT_CODE}}.replit.app/api/agent\`

**Request Format**:
\`\`\`json
{
  "message": "User's message content",
  "context": { "conversationId": "optional-id" }
}
\`\`\`

**Response Format**:
\`\`\`json
{
  "content": "Agent's text response",
  "screenshot": "https://optional-screenshot-url.png",
  "metadata": { "processingTime": 1234 }
}
\`\`\`

**Implementation Guides**:
- \`/api/metadata\` - See \`EXTERNAL_PROJECT_METADATA_API.md\`
- \`/api/agent\` - See \`TRIADBLUE_REQUIRED_ENDPOINTS.md\`

**Integration**: These endpoints are pre-configured in ConsoleBlue and automatically used for documentation generation and agent chat functionality.
`,
      createdById,
    },
    {
      key: "standards",
      label: "CODING_STANDARDS.md",
      description: "Team coding standards and conventions",
      category: "core",
      isSystem: true,
      body: `# {{PROJECT_NAME}} - Coding Standards

## General Principles

{{CODING_PRINCIPLES}}

## Code Style

### {{PRIMARY_LANGUAGE}}

{{PRIMARY_LANGUAGE_STYLE_GUIDE}}

### Naming Conventions

{{#each NAMING_CONVENTIONS}}
#### {{this.type}}

{{#each this.rules}}
- {{this}}
{{/each}}

**Examples**:
\`\`\`{{../PRIMARY_LANGUAGE}}
{{this.examples}}
\`\`\`
{{/each}}

## File Organization

{{FILE_ORGANIZATION_RULES}}

## Component Structure

{{COMPONENT_STRUCTURE_GUIDELINES}}

## State Management

{{STATE_MANAGEMENT_GUIDELINES}}

## API Design

{{API_DESIGN_GUIDELINES}}

## Error Handling

{{ERROR_HANDLING_GUIDELINES}}

## Testing Standards

{{#each TESTING_STANDARDS}}
### {{this.type}}

{{this.description}}

**Requirements**:
{{#each this.requirements}}
- {{this}}
{{/each}}

**Example**:
\`\`\`{{../PRIMARY_LANGUAGE}}
{{this.example}}
\`\`\`
{{/each}}

## Documentation Requirements

{{DOCUMENTATION_REQUIREMENTS}}

## Git Workflow

{{GIT_WORKFLOW}}

## Code Review Checklist

{{#each CODE_REVIEW_CHECKLIST}}
- [ ] {{this}}
{{/each}}

## Performance Guidelines

{{PERFORMANCE_GUIDELINES}}

## Security Guidelines

{{SECURITY_GUIDELINES}}

## Asset Management Requirements (MANDATORY)

**This is a required deliverable for all TriadBlue ecosystem applications.**

### Requirements

You MUST implement a complete asset upload interface from day one:

1. **Asset Upload Dashboard Page**
   - Upload form for favicon (ICO, PNG, SVG, WEBP, max 2MB)
   - Upload form for company logos (PNG, SVG, WEBP, max 2MB)
   - File validation and preview functionality
   - Replace/delete controls for existing assets

2. **Backend Implementation**
   - Assets table in database (id, type, filename, mimeType, size, uploadedAt, isActive)
   - File upload API using multer middleware
   - Storage in \`/uploads\` directory or Replit App Storage
   - Authentication required for all asset operations

3. **Dynamic Favicon Injection**
   - Query database for active favicon
   - Inject \`<link rel="icon">\` dynamically in HTML head
   - NO hardcoded favicon in index.html

4. **Logo Integration**
   - Header/widget logos fetched from API
   - Support fallback to default logo
   - Auto-refresh when new logo activated

### Acceptance Criteria

- [ ] Asset Management page exists in authenticated dashboard
- [ ] User can upload favicon and see it immediately in browser tab
- [ ] User can upload company logo and see it in header/widgets
- [ ] File validation prevents invalid formats and oversized files
- [ ] Preview functionality works before confirming upload
- [ ] Delete/replace operations work correctly
- [ ] No hardcoded image imports for favicon or primary logos
- [ ] All asset operations require authentication
- [ ] Success/error feedback is clear to user

**Reference Implementation**: See ConsoleBlue project for complete example.

**Non-compliance**: Projects without asset upload functionality are incomplete.
`,
      createdById,
    },
    {
      key: "constants",
      label: "CONSTANTS.md",
      description: "Project constants and configuration values",
      category: "optional",
      isSystem: false,
      body: `# {{PROJECT_NAME}} - Constants Documentation

## Environment Variables

{{#each ENVIRONMENT_VARIABLES}}
### {{this.name}}

**Type**: {{this.type}}
**Required**: {{this.required}}
**Description**: {{this.description}}
{{#if this.default}}
**Default**: \`{{this.default}}\`
{{/if}}
{{#if this.example}}
**Example**: \`{{this.example}}\`
{{/if}}
{{/each}}

## API Endpoints

{{#each API_ENDPOINTS}}
### {{this.name}}

**Base URL**: \`{{this.baseUrl}}\`

**Endpoints**:
{{#each this.endpoints}}
- \`{{this.method}} {{this.path}}\` - {{this.description}}
{{/each}}
{{/each}}

## Status Codes

{{#each STATUS_CODES}}
### {{this.category}}

{{#each this.codes}}
- \`{{this.code}}\`: {{this.name}} - {{this.description}}
{{/each}}
{{/each}}

## Validation Rules

{{#each VALIDATION_RULES}}
### {{this.field}}

{{#each this.rules}}
- {{this.type}}: {{this.description}}
{{/each}}
{{/each}}

## Feature Flags

{{#each FEATURE_FLAGS}}
- \`{{this.name}}\`: {{this.description}} (Default: {{this.default}})
{{/each}}

## Rate Limits

{{#each RATE_LIMITS}}
- **{{this.endpoint}}**: {{this.limit}} requests per {{this.window}}
{{/each}}

## Storage Limits

{{#each STORAGE_LIMITS}}
- **{{this.type}}**: {{this.limit}}
{{/each}}
`,
      createdById,
    },
    {
      key: "issue_template_guide",
      label: "ISSUE_TEMPLATES.md",
      description: "Guide for creating GitHub issue templates",
      category: "optional",
      isSystem: false,
      body: `# {{PROJECT_NAME}} - Issue Template Guide

## Bug Report Template

\`\`\`markdown
---
name: Bug Report
about: Report a bug to help us improve
title: '[BUG] '
labels: bug
assignees: {{DEFAULT_ASSIGNEE}}
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
{{#each BUG_REPORT_ENVIRONMENT}}
- {{this.field}}: [e.g. {{this.example}}]
{{/each}}

**Additional context**
Any other context about the problem.
\`\`\`

## Feature Request Template

\`\`\`markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: {{DEFAULT_ASSIGNEE}}
---

**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
\`\`\`

## Task Template

\`\`\`markdown
---
name: Task
about: Create a task for the project
title: '[TASK] '
labels: task
assignees: {{DEFAULT_ASSIGNEE}}
---

**Task Description**
Clear description of what needs to be done.

**Acceptance Criteria**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Technical Notes**
Any technical implementation details.

**Dependencies**
- Related issues or dependencies

**Estimated Effort**
[Small/Medium/Large]
\`\`\`

## Custom Labels

{{#each CUSTOM_LABELS}}
- **{{this.name}}** ({{this.color}}): {{this.description}}
{{/each}}
`,
      createdById,
    },
    {
      key: "onboarding",
      label: "ONBOARDING.md",
      description: "Team onboarding guide",
      category: "optional",
      isSystem: false,
      body: `# {{PROJECT_NAME}} - Onboarding Guide

## Welcome to the Team!

{{WELCOME_MESSAGE}}

## CRITICAL: AI Operations Guide (READ FIRST)

**Before starting ANY work on TriadBlue projects, external AI agents MUST read the AI_OPERATIONS_GUIDE.md.**

This guide defines:
- What external agents CAN and CANNOT do
- Mandatory 6-step workflow (Read → Confirm → Plan → Wait → Implement → Verify)
- Standards compliance requirements
- Violation consequences
- Authority chain and approval process

**Location:** \`/docs/AI_OPERATIONS_GUIDE.md\` or generate from ConsoleBlue Documentation Generator

**Non-negotiable:** No coding begins until this guide is read and confirmed.

---

## Getting Started Checklist

{{#each ONBOARDING_CHECKLIST}}
### {{this.phase}}

{{#each this.tasks}}
- [ ] {{this}}
{{/each}}
{{/each}}

## Development Environment Setup

### Required Tools

{{#each REQUIRED_TOOLS}}
- **{{this.name}}** ({{this.version}}): {{this.purpose}}
  - Install: \`{{this.installCommand}}\`
{{/each}}

### Initial Setup Steps

{{#each SETUP_STEPS}}
{{@index}}. {{this.step}}
   \`\`\`bash
   {{this.command}}
   \`\`\`
   {{#if this.note}}
   *Note: {{this.note}}*
   {{/if}}
{{/each}}

## Project Overview

{{PROJECT_OVERVIEW_FOR_NEW_MEMBERS}}

## Key Repositories

{{#each KEY_REPOSITORIES}}
- [{{this.name}}]({{this.url}}): {{this.description}}
{{/each}}

## Development Workflow

{{DEVELOPMENT_WORKFLOW}}

## Code Review Process

{{CODE_REVIEW_PROCESS}}

## Testing Guidelines

{{TESTING_GUIDELINES}}

## Deployment Process

{{DEPLOYMENT_PROCESS}}

## Communication Channels

{{#each COMMUNICATION_CHANNELS}}
- **{{this.name}}**: {{this.purpose}} ({{this.link}})
{{/each}}

## Team Structure

{{#each TEAM_STRUCTURE}}
### {{this.team}}

{{#each this.members}}
- **{{this.name}}** - {{this.role}} ({{this.contact}})
{{/each}}
{{/each}}

## Important Resources

{{#each IMPORTANT_RESOURCES}}
- [{{this.name}}]({{this.url}}): {{this.description}}
{{/each}}

## FAQs

{{#each FAQS}}
**Q: {{this.question}}**

A: {{this.answer}}

{{/each}}

## Getting Help

{{GETTING_HELP_GUIDE}}

## Asset Management Setup (MANDATORY)

**This must be completed as part of initial development - not deferred.**

### Quick Setup Checklist

- [ ] **Database Schema**: Add \`assets\` table to \`shared/schema.ts\`
- [ ] **Storage Layer**: Add asset CRUD methods to \`server/storage.ts\`
- [ ] **Install Multer**: Run packager tool to install multer for file uploads
- [ ] **API Routes**: Implement upload/list/delete endpoints in \`server/routes.ts\`
- [ ] **Create /uploads**: Make directory and configure static serving
- [ ] **Dashboard UI**: Build Asset Management page with upload forms
- [ ] **Dynamic Favicon**: Implement injection based on active asset in database
- [ ] **Test Upload Flow**: Upload favicon, verify browser tab icon updates
- [ ] **Test Logo Flow**: Upload logo, verify header/widget display

### Why This Matters

Users should NEVER need to edit code to change a favicon or company logo. The upload interface is a core feature, not optional. This is standard for all TriadBlue ecosystem applications.

### Reference

See **ConsoleBlue** project implementation:
- \`shared/schema.ts\` - Assets table definition
- \`server/storage.ts\` - Asset CRUD operations  
- \`server/routes.ts\` - Upload API with multer
- \`client/src/pages/asset-management.tsx\` - Upload UI
- \`client/index.html\` - Dynamic favicon injection

For complete standards, see **ASSET_MANAGEMENT_STANDARDS.md** in the repository root.
`,
      createdById,
    },
    {
      key: "status_report",
      label: "STATUS_REPORT.md",
      description: "Project status report template",
      category: "optional",
      isSystem: false,
      body: `# {{PROJECT_NAME}} - Status Report

**Report Date**: {{REPORT_DATE}}
**Reporting Period**: {{REPORTING_PERIOD}}
**Reporter**: {{REPORTER_NAME}}

## Executive Summary

{{EXECUTIVE_SUMMARY}}

## Project Health

**Overall Status**: {{#if OVERALL_STATUS_GREEN}}[GREEN] On Track{{/if}}{{#if OVERALL_STATUS_YELLOW}}[YELLOW] At Risk{{/if}}{{#if OVERALL_STATUS_RED}}[RED] Off Track{{/if}}

### Key Metrics

{{#each KEY_METRICS}}
- **{{this.name}}**: {{this.current}} / {{this.target}} ({{this.percentage}}%)
{{/each}}

## Completed This Period

{{#each COMPLETED_ITEMS}}
### {{this.title}}

**Status**: [COMPLETE]
**Completed**: {{this.completedDate}}
**Impact**: {{this.impact}}

{{#if this.details}}
**Details**: {{this.details}}
{{/if}}
{{/each}}

## In Progress

{{#each IN_PROGRESS_ITEMS}}
### {{this.title}}

**Status**: {{this.status}}
**Progress**: {{this.progress}}%
**Owner**: {{this.owner}}
**Expected Completion**: {{this.expectedCompletion}}

{{#if this.blockers}}
**Blockers**: {{this.blockers}}
{{/if}}
{{/each}}

## Upcoming Next Period

{{#each UPCOMING_ITEMS}}
- {{this.title}} (Owner: {{this.owner}}, Start: {{this.startDate}})
{{/each}}

## Risks and Issues

{{#each RISKS}}
### {{this.title}}

**Severity**: {{this.severity}}
**Probability**: {{this.probability}}
**Impact**: {{this.impact}}
**Mitigation**: {{this.mitigation}}
{{/each}}

## Budget Status

**Allocated**: {{BUDGET_ALLOCATED}}
**Spent**: {{BUDGET_SPENT}} ({{BUDGET_PERCENTAGE}}%)
**Remaining**: {{BUDGET_REMAINING}}

{{#if BUDGET_NOTES}}
**Notes**: {{BUDGET_NOTES}}
{{/if}}

## Team Updates

{{#each TEAM_UPDATES}}
- {{this}}
{{/each}}

## Decisions Made

{{#each DECISIONS}}
- **{{this.date}}**: {{this.decision}} (Rationale: {{this.rationale}})
{{/each}}

## Action Items

{{#each ACTION_ITEMS}}
- [ ] {{this.task}} (Owner: {{this.owner}}, Due: {{this.dueDate}})
{{/each}}

## Next Steps

{{#each NEXT_STEPS}}
{{@index}}. {{this}}
{{/each}}

## Questions or Feedback

{{QUESTIONS_OR_FEEDBACK}}
`,
      createdById,
    },
    {
      key: "project_metadata_schema",
      label: "Project Metadata Schema",
      description: "JSON schema defining all required metadata variables for documentation generation",
      category: "core",
      isSystem: true,
      body: `# Project Metadata Schema

This document defines all available variables for documentation generation.

## Required Variables

### Project Basics
- \`{{PROJECT_NAME}}\` - Full project name
- \`{{PROJECT_DESCRIPTION}}\` - One-line project description
- \`{{PROJECT_OVERVIEW}}\` - Detailed project overview (2-3 paragraphs)

### Features & Capabilities
- \`{{FEATURES}}\` - Array of feature strings
- \`{{KEY_FEATURES}}\` - Array of objects: {name, description, implementation}

### Technology Stack
- \`{{TECH_STACK}}\` - Array of objects: {category, technologies}
- \`{{PRIMARY_LANGUAGE}}\` - Primary programming language
- \`{{FRONTEND_ARCHITECTURE}}\` - Frontend architecture description
- \`{{BACKEND_ARCHITECTURE}}\` - Backend architecture description
- \`{{DATABASE_ARCHITECTURE}}\` - Database architecture description
- \`{{AUTH_ARCHITECTURE}}\` - Authentication architecture description

### Setup & Configuration
- \`{{PREREQUISITES}}\` - Array of prerequisite strings
- \`{{INSTALL_COMMANDS}}\` - Installation commands
- \`{{RUN_COMMANDS}}\` - Commands to run the application
- \`{{CONFIGURATION_INSTRUCTIONS}}\` - Configuration steps

### Project Structure
- \`{{PROJECT_STRUCTURE}}\` - ASCII tree of project structure
- \`{{CORE_COMPONENTS}}\` - Array of objects: {name, purpose, technology, responsibilities[], dependencies[], apis[]}

### Documentation & Resources
- \`{{DOCUMENTATION_LINKS}}\` - Array of objects: {name, url}
- \`{{IMPORTANT_RESOURCES}}\` - Array of objects: {name, url, description}

### Team & Workflow
- \`{{TEAM_STRUCTURE}}\` - Array of objects: {team, members[{name, role, contact}]}
- \`{{COMMUNICATION_CHANNELS}}\` - Array of objects: {name, purpose, link}
- \`{{DEVELOPMENT_WORKFLOW}}\` - Development workflow description
- \`{{CODE_REVIEW_PROCESS}}\` - Code review process description
- \`{{GIT_WORKFLOW}}\` - Git workflow description

### Guidelines & Standards
- \`{{CODING_PRINCIPLES}}\` - Core coding principles
- \`{{NAMING_CONVENTIONS}}\` - Array of objects: {type, rules[], examples}
- \`{{FILE_ORGANIZATION_RULES}}\` - File organization guidelines
- \`{{COMPONENT_STRUCTURE_GUIDELINES}}\` - Component structure guidelines
- \`{{STATE_MANAGEMENT_GUIDELINES}}\` - State management guidelines
- \`{{API_DESIGN_GUIDELINES}}\` - API design guidelines
- \`{{ERROR_HANDLING_GUIDELINES}}\` - Error handling guidelines
- \`{{TESTING_STANDARDS}}\` - Array of objects: {type, description, requirements[], example}
- \`{{CODE_REVIEW_CHECKLIST}}\` - Array of checklist items
- \`{{PERFORMANCE_GUIDELINES}}\` - Performance guidelines
- \`{{SECURITY_GUIDELINES}}\` - Security guidelines

### Architecture Details
- \`{{SYSTEM_OVERVIEW}}\` - High-level system overview
- \`{{ARCHITECTURE_DIAGRAM}}\` - ASCII architecture diagram
- \`{{DATABASE_TABLES}}\` - Array of objects: {name, description, columns[], relations[]}
- \`{{DATA_FLOW_DESCRIPTION}}\` - Data flow description
- \`{{DATA_FLOW_DIAGRAM}}\` - ASCII data flow diagram
- \`{{SECURITY_ARCHITECTURE}}\` - Security architecture description
- \`{{DEPLOYMENT_ARCHITECTURE}}\` - Deployment architecture description
- \`{{PERFORMANCE_CONSIDERATIONS}}\` - Performance considerations
- \`{{SCALABILITY_STRATEGY}}\` - Scalability strategy

### Configuration & Constants
- \`{{ENVIRONMENT_VARIABLES}}\` - Array of objects: {name, type, required, description, default, example}
- \`{{API_ENDPOINTS}}\` - Array of objects: {name, baseUrl, endpoints[]}
- \`{{STATUS_CODES}}\` - Array of objects: {category, codes[{code, name, description}]}
- \`{{VALIDATION_RULES}}\` - Array of objects: {field, rules[{type, description}]}
- \`{{FEATURE_FLAGS}}\` - Array of objects: {name, description, default}
- \`{{RATE_LIMITS}}\` - Array of objects: {endpoint, limit, window}
- \`{{STORAGE_LIMITS}}\` - Array of objects: {type, limit}

### Onboarding & Help
- \`{{WELCOME_MESSAGE}}\` - Welcome message for new team members
- \`{{ONBOARDING_CHECKLIST}}\` - Array of objects: {phase, tasks[]}
- \`{{REQUIRED_TOOLS}}\` - Array of objects: {name, version, purpose, installCommand}
- \`{{SETUP_STEPS}}\` - Array of objects: {step, command, note}
- \`{{FAQS}}\` - Array of objects: {question, answer}
- \`{{GETTING_HELP_GUIDE}}\` - Guide for getting help
- \`{{KEY_REPOSITORIES}}\` - Array of objects: {name, url, description}

### Issue Management
- \`{{DEFAULT_ASSIGNEE}}\` - Default issue assignee
- \`{{BUG_REPORT_ENVIRONMENT}}\` - Array of objects: {field, example}
- \`{{CUSTOM_LABELS}}\` - Array of objects: {name, color, description}

### Status Reporting
- \`{{REPORT_DATE}}\` - Report date
- \`{{REPORTING_PERIOD}}\` - Reporting period
- \`{{REPORTER_NAME}}\` - Reporter name
- \`{{EXECUTIVE_SUMMARY}}\` - Executive summary
- \`{{OVERALL_STATUS_GREEN}}\` - Boolean: project is on track
- \`{{OVERALL_STATUS_YELLOW}}\` - Boolean: project is at risk
- \`{{OVERALL_STATUS_RED}}\` - Boolean: project is off track
- \`{{KEY_METRICS}}\` - Array of objects: {name, current, target, percentage}
- \`{{COMPLETED_ITEMS}}\` - Array of objects: {title, completedDate, impact, details}
- \`{{IN_PROGRESS_ITEMS}}\` - Array of objects: {title, status, progress, owner, expectedCompletion, blockers}
- \`{{UPCOMING_ITEMS}}\` - Array of objects: {title, owner, startDate}
- \`{{RISKS}}\` - Array of objects: {title, severity, probability, impact, mitigation}
- \`{{BUDGET_ALLOCATED}}\` - Budget allocated
- \`{{BUDGET_SPENT}}\` - Budget spent
- \`{{BUDGET_PERCENTAGE}}\` - Budget percentage used
- \`{{BUDGET_REMAINING}}\` - Budget remaining
- \`{{BUDGET_NOTES}}\` - Budget notes
- \`{{TEAM_UPDATES}}\` - Array of update strings
- \`{{DECISIONS}}\` - Array of objects: {date, decision, rationale}
- \`{{ACTION_ITEMS}}\` - Array of objects: {task, owner, dueDate}
- \`{{NEXT_STEPS}}\` - Array of next step strings
- \`{{QUESTIONS_OR_FEEDBACK}}\` - Questions or feedback section

### Miscellaneous
- \`{{PROJECT_GOAL}}\` - Specific project goal
- \`{{USER_PREFERENCES}}\` - Array of objects: {category, value}
- \`{{EXTERNAL_DEPENDENCIES}}\` - Array of objects: {name, description}
- \`{{DEVELOPMENT_GUIDELINES}}\` - Development guidelines text
- \`{{RECENT_CHANGES}}\` - Array of objects: {date, description}
- \`{{CONTRIBUTING_GUIDELINES}}\` - Contributing guidelines
- \`{{LICENSE}}\` - License information
- \`{{CONTACT_INFO}}\` - Contact information
- \`{{PROJECT_OVERVIEW_FOR_NEW_MEMBERS}}\` - New member overview
- \`{{TESTING_GUIDELINES}}\` - Testing guidelines
- \`{{DEPLOYMENT_PROCESS}}\` - Deployment process description
- \`{{DOCUMENTATION_REQUIREMENTS}}\` - Documentation requirements
- \`{{PRIMARY_LANGUAGE_STYLE_GUIDE}}\` - Primary language style guide

## Handlebars Helpers

### Conditionals
\`\`\`handlebars
{{#if VARIABLE}}...{{/if}}
{{#unless VARIABLE}}...{{/unless}}
\`\`\`

### Iteration
\`\`\`handlebars
{{#each ARRAY}}
  {{this}} or {{this.property}}
  {{@index}} - current index
{{/each}}
\`\`\`

### Comments
\`\`\`handlebars
{{!-- This is a comment --}}
\`\`\`
`,
      createdById,
    },
    {
      key: "ai_operations_guide",
      label: "AI_OPERATIONS_GUIDE.md",
      description: "Mandatory workflow guide for external AI agents working on TriadBlue projects",
      category: "core",
      isSystem: true,
      body: `# TriadBlue AI Operations Guide  
**Version:** 2.0  
**Effective Date:** January 2026  
**Owner:** Dean Laskowski

---

## Overview

TriadBlue operates three integrated digital platforms:
- **BusinessBlueprint.io** - AI-powered digital intelligence for local businesses
- **HostsBlue.com** - Web hosting and domain services
- **SwipesBlue.com** - Payment processing gateway

When external AI agents (Replit Builder, Claude, ChatGPT, etc.) are brought in to assist with development, they must follow strict protocols to maintain system integrity and quality standards.

---

## External AI Agent Classification

### Who Are External Agents?

**External AI agents are temporary contractors brought in for specific tasks:**

- **Replit Builder Agent** - Implementation and coding tasks within Replit
- **Claude (via Dean)** - Architecture, planning, complex problem-solving
- **ChatGPT/GPT** - Specialized assistance or quick tasks
- **GitHub Copilot** - Code completion assistance
- **Any other AI assistant** - Brought in for specific needs

### Who Are NOT External Agents?

- **AI API Services** - Claude API, OpenAI API, DeepSeek API
  - These are tools/services that power features (like Coach Blue)
  - They don't make independent decisions
  - They're configured once and run automatically

---

## External Agent Authority & Limits

### What External Agents CAN Do:

- Implement approved plans exactly as specified
- Write code according to documented standards
- Create and modify files per instructions
- Run tests and verify outputs
- Ask clarifying questions when uncertain
- Report progress and blockers
- Suggest improvements (but NOT implement without approval)

### What External Agents CANNOT Do:

- **Make independent architectural decisions**
- **Change branding, colors, fonts, or design** without explicit approval
- **Start coding before plan approval**
- **Ignore or skip documentation**
- **Override established standards**
- **Make assumptions** - must ask when uncertain
- **Work on multiple tasks simultaneously** without coordination

---

## Mandatory Workflow for External Agents

**ALL external agents must follow this exact workflow. No exceptions.**

### Step 1: Read Required Documentation

Before doing ANYTHING, external agents must read:

**Required Every Time:**
- \`/docs/AI_OPERATIONS_GUIDE.md\` (this document)
- \`/docs/replit.md\` (workflow and development standards)
- \`/docs/TRIAD_BLUE_STANDARDS.md\` (branding and design rules)
- \`/docs/_constants.md\` (technical constants and values)
- The specific implementation prompt for the current task

**If Relevant to Task:**
- \`/docs/ARCHITECTURE.md\` (system architecture)
- \`/docs/TEAM_PROTOCOL.md\` (task management)
- \`/docs/PRESCRIPTION_SYSTEM.md\` (prescription workflows)
- Any skill-specific documentation referenced in prompt

### Step 2: Confirm Reading

External agent must explicitly state:

\`\`\`
I have read all required documentation:
- AI_OPERATIONS_GUIDE.md
- replit.md
- TRIAD_BLUE_STANDARDS.md
- _constants.md
- [Implementation Prompt Name]

[Note any unclear areas or questions]
\`\`\`

### Step 3: Create Implementation Plan

External agent must present a detailed plan including:

**Required Elements:**
1. **Overview** - Brief summary of what will be accomplished
2. **Approach** - High-level strategy
3. **Files to Create/Modify** - Complete list with descriptions
4. **Step-by-Step Implementation** - Ordered tasks
5. **Testing Strategy** - How verification will happen
6. **Potential Risks** - What could go wrong
7. **Estimated Time** - How long it will take

**Format:**
- Clear, numbered steps
- Specific file paths
- Concrete actions (not vague descriptions)

### Step 4: Wait for Approval

**CRITICAL: Do NOT proceed until Dean explicitly approves.**

**Acceptable approval phrases:**
- "Approved"
- "Proceed"
- "Go ahead"
- "Looks good, implement it"

**If Dean says:**
- "Let me think about it" → WAIT
- "Can you adjust..." → Revise plan, present again
- Asks questions → Answer, then wait for approval again

**Starting code without approval is a CRITICAL VIOLATION.**

### Step 5: Implement Approved Plan

Only after approval:

- Follow the approved plan exactly
- Work through steps in order
- Report progress as you go
- Log what you're doing
- Ask questions if ambiguity arises
- Stay within scope of approval

**If you discover the plan needs adjustment during implementation:**
1. Stop immediately
2. Explain the issue
3. Propose the adjustment
4. Wait for approval of the change
5. Then continue

### Step 6: Test & Verify

After implementation:

- Run all specified tests
- Verify acceptance criteria met
- Check against standards docs
- Present results to Dean
- Wait for final verification

**Implementation is NOT complete until Dean verifies success.**

---

## Standards Compliance

### Branding Standards (TRIAD_BLUE_STANDARDS.md)

External agents must follow these exactly:

**Fonts:**
- Headers/Titles: Archivo Semi Expanded (bold)
- Body/Content: Archivo (regular weight)

**Colors:**
- Master Blue: \`#0000FF\`
- Orange Accent: \`#F97316\`
- Accent Blues: \`#6EA6FF\`, \`#3B82F6\`
- Green: \`#00FF40\`
- Red: \`#FF0040\`
- Purple: \`#8000FF\`
- Yellow: \`#FFEF45\`
- Email Background: \`#EEFBFF\`

**Logo Usage:**
- Never modify logos
- Use provided assets only
- Maintain proper spacing and sizing

### Development Standards (replit.md)

**Workflow Rules:**
- Never auto-change anything
- Explicit approval required for all features
- Reliability > creativity
- Document every task

**File Structure:**
- Don't rename routes without approval
- Don't restructure folders without approval
- Keep Vite assets under \`/assets/*\`

### Technical Constants (_constants.md)

**Always reference this file for:**
- API endpoints
- Database table names
- Environment variables
- Configuration values
- System-wide constants

**Never hardcode values that exist in _constants.md**

---

## Violation Consequences

If an external agent violates this protocol:

**First Violation:**
- Work stopped immediately
- Agent reminded of correct process
- Must restart from Step 1 (read docs)

**Second Violation:**
- Changes may be reverted
- Detailed explanation required
- Trust significantly damaged

**Third Violation:**
- Agent may be replaced
- All work reviewed for compliance
- Future use reconsidered

**Critical Violations (immediate replacement):**
- Coding before plan approval
- Ignoring branding standards
- Making unauthorized architectural changes
- Skipping documentation review

---

## Authority Chain

\`\`\`
Dean (Owner & Decision Maker)
          ↓
  Implementation Prompt
          ↓
    External Agent
    (presents plan)
          ↓
      ⏸️ WAIT
          ↓
    Dean Approves
          ↓
External Agent Implements
\`\`\`

**Decision Authority:**
- **Dean** - Final say on everything
- **Documentation** - Source of truth for standards
- **External Agent** - Executes approved plans only

---

## Success Criteria for External Agents

**A successful engagement means:**

- Read all documentation before starting
- Presented clear implementation plan
- Waited for approval without assumptions
- Followed plan exactly as approved
- Stayed within branding and technical standards
- Tested thoroughly before presenting results
- Communicated clearly throughout
- Delivered working, verified solution

**Success ≠ Speed**  
**Success = Following process + Quality outcome**

---

## Integration with Existing Systems

### Task Management

If work requires a task to be created (significant features):
- Reference TEAM_PROTOCOL.md
- Tasks sync to GitHub automatically
- Use appropriate labels and priority

### GitHub Integration

- All code changes tracked via commits
- Reference issue numbers in commits
- Follow conventional commit messages
- Document changes in STATUS_REPORT.md if applicable

### AI Services (Not Agents)

The platform uses AI APIs for features:
- **Assessment Analysis** - Powered by DeepSeek/Claude/OpenAI (configurable)
- **Coach Blue** - Powered by Claude (premium coaching)
- **Prescription Generation** - Powered by DeepSeek (cost-effective)

External agents may work on these systems but:
- Cannot change which AI service is used (admin panel controls this)
- Must follow existing service abstractions
- Cannot bypass the unified AI provider layer

---

## Quick Reference Card

**Before coding, ask yourself:**

1. Did I read all required docs?
2. Did I confirm reading with Dean?
3. Did I present a detailed plan?
4. Did Dean explicitly approve?
5. Am I following the plan exactly?
6. Am I staying within standards?

**If any answer is NO → STOP and fix it.**

---

## Documentation Directory

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **AI_OPERATIONS_GUIDE.md** | This file - workflow for external agents | Every task |
| **replit.md** | Development standards and workflow | Every task |
| **TRIAD_BLUE_STANDARDS.md** | Branding, fonts, colors, design | Any UI/design work |
| **_constants.md** | Technical constants and config | Any technical implementation |
| **ARCHITECTURE.md** | System architecture and flows | Complex features |
| **TEAM_PROTOCOL.md** | Task management system | When creating tasks |
| **PRESCRIPTION_SYSTEM.md** | Prescription workflows | Prescription-related work |

**All docs located in:** \`/docs/\` directory

---

## Onboarding Checklist

When a new external agent is brought in:

**Dean Must Provide:**
- [ ] Access to \`/docs\` folder
- [ ] Specific implementation prompt
- [ ] Clear acceptance criteria
- [ ] Expected timeline
- [ ] Instruction to read this guide FIRST

**External Agent Must:**
- [ ] Read all required documentation
- [ ] Confirm reading completion
- [ ] Ask clarifying questions upfront
- [ ] Present implementation plan
- [ ] Wait for approval
- [ ] Execute only after approval

---

## Best Practices

### For Planning:
- Be specific, not vague
- Include concrete file paths
- Anticipate edge cases
- Estimate conservatively
- Ask questions early

### For Implementation:
- Work in small, testable increments
- Commit frequently with clear messages
- Test as you go, not just at the end
- Stay in scope of approved plan
- Communicate progress

### For Communication:
- Be concise and clear
- State assumptions explicitly
- Ask rather than guess
- Report blockers immediately
- Confirm understanding when uncertain

---

## Version History

- **v2.0** (January 2026) - Simplified to external agents only, removed internal AI team
- **v1.0** (November 2025) - Initial version with internal AI team (Axel, Rune, Lumen, Cyen)

---

## FAQ

**Q: What if I find a better way to implement something during coding?**  
A: Stop, explain the better approach, get approval, then implement.

**Q: Can I work on multiple parts simultaneously?**  
A: Only if explicitly approved in the plan. Otherwise, work sequentially.

**Q: What if documentation contradicts the prompt?**  
A: Ask Dean which takes precedence. Never assume.

**Q: How detailed should my plan be?**  
A: Detailed enough that Dean can understand exactly what you'll do without ambiguity.

**Q: What if I disagree with a standard or requirement?**  
A: Present your reasoning as a suggestion, but follow the standard regardless. Dean decides.

**Q: Can I improve something outside my task scope?**  
A: No. Stay in scope. Note improvements for future work.

---

## Closing Principles

**TriadBlue's development philosophy:**

> "Standards create freedom. Process creates quality. Communication creates trust."

**Remember:**
- You are a temporary contractor, not a team member
- Dean is the architect and final decision maker
- Documentation is the source of truth
- Process exists to prevent mistakes, not slow you down
- Quality and reliability always trump speed

**When in doubt:** Stop. Ask. Wait for clarity. Then proceed with confidence.

---

**Welcome to TriadBlue development. Follow the process, deliver quality, earn trust.**
`,
      createdById,
    },
  ];

  const createdTemplates = [];
  for (const template of templates) {
    try {
      const existing = await storage.getDocumentationTemplates();
      const existingTemplate = existing.find(t => t.key === template.key);
      
      if (existingTemplate) {
        console.log(`Template '${template.key}' already exists, skipping...`);
        createdTemplates.push(existingTemplate);
      } else {
        const created = await storage.createDocumentationTemplate(template);
        console.log(`Created template '${template.key}'`);
        createdTemplates.push(created);
      }
    } catch (error) {
      console.error(`Error creating template '${template.key}':`, error);
    }
  }

  console.log(`\nSeeded ${createdTemplates.length} documentation templates`);
  return createdTemplates;
}
