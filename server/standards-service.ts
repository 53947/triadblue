/**
 * TriadBlue Standards Service
 * Manages standardized requirements for all TriadBlue projects
 */

import { TRIADBLUE_PROJECTS } from "./triadblue-config";

export interface StandardsEndpointSpec {
  name: string;
  path: string;
  method: string;
  description: string;
  authentication: string;
  required: boolean;
  documentationUrl: string;
}

export interface TriadBlueStandards {
  version: string;
  lastUpdated: string;
  requiredEndpoints: StandardsEndpointSpec[];
  projectCount: number;
  documentationUrl: string;
}

export class StandardsService {
  static generateStandards(): TriadBlueStandards {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      projectCount: TRIADBLUE_PROJECTS.length,
      documentationUrl: "https://console.blue/docs/standards",
      requiredEndpoints: [
        {
          name: "Metadata API",
          path: "/api/metadata",
          method: "GET",
          description: "Returns project features and tech stack for documentation generation",
          authentication: "None (public)",
          required: true,
          documentationUrl: "https://console.blue/docs/api/metadata",
        },
        {
          name: "Agent API",
          path: "/api/agent",
          method: "POST",
          description: "Handles conversational AI requests for agent chat integration",
          authentication: "Optional Bearer token",
          required: true,
          documentationUrl: "https://console.blue/docs/api/agent",
        },
        {
          name: "Routes API",
          path: "/api/routes",
          method: "GET",
          description: "Returns application routes for site map generation",
          authentication: "None (public)",
          required: true,
          documentationUrl: "https://console.blue/docs/api/routes",
        },
      ],
    };
  }

  static generateReplitMdContent(): string {
    const standards = this.generateStandards();
    
    return `# TriadBlue Standards & Requirements

## Overview
This project is part of the TriadBlue ecosystem. All TriadBlue projects follow standardized requirements to enable seamless integration with ConsoleBlue (the centralized hub).

## Getting Started
Visit **https://console.blue/api/standards** to fetch the latest TriadBlue standards. This ensures your project is always aligned with current requirements.

## Required Endpoints

Every TriadBlue project **MUST** implement these three API endpoints:

### 1. Metadata API (\`/api/metadata\`)
**Purpose**: Provides project information for ConsoleBlue's documentation generator.
- **Method**: GET
- **Authentication**: None (public)
- **Response**: JSON with \`features\` (array) and \`techStack\` (array)

**Example**:
\`\`\`json
{
  "features": ["Feature 1", "Feature 2"],
  "techStack": ["React", "TypeScript", "Express"]
}
\`\`\`

### 2. Agent API (\`/api/agent\`)
**Purpose**: Enables AI agent interaction via ConsoleBlue's Agent Chat.
- **Method**: POST
- **Authentication**: Optional Bearer token
- **Request**: \`{ "message": "...", "context": {...} }\`
- **Response**: \`{ "content": "...", "metadata": {...} }\`

### 3. Routes API (\`/api/routes\`)
**Purpose**: Returns application routes for Site Map visualization.
- **Method**: GET
- **Authentication**: None (public)
- **Response**: Array of route objects with \`path\`, \`name\`, \`framework\` fields

**Example**:
\`\`\`json
[
  { "path": "/", "name": "Home", "framework": "wouter" },
  { "path": "/about", "name": "About", "framework": "wouter" }
]
\`\`\`

## Standards Distribution

Your project automatically receives updates from ConsoleBlue through an automated system. When ConsoleBlue maintainers need to update TriadBlue standards:

1. They click the **"Push Standards"** button in ConsoleBlue's dashboard
2. ConsoleBlue automatically generates updated documentation with the latest requirements
3. All 7 TriadBlue projects (including yours) receive a GitHub commit with the new \`replit.md\`
4. Your \`replit.md\` is automatically updated with zero manual effort

**This means**: You don't need to manually track standards changes. Your project will always stay in sync with the latest TriadBlue requirements.

## Important Links
- **Standards Documentation**: https://console.blue/api/standards
- **ConsoleBlue Dashboard**: https://console.blue
- **ConsoleBlue Docs**: https://console.blue/docs
- **TriadBlue Ecosystem**: https://triadblue.com

## Questions?
Contact the ConsoleBlue team or post in the TriadBlue Slack channel.
`;
  }
}
