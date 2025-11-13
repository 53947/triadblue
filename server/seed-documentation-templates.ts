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
