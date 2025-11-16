# External Project Metadata API

This guide explains how external Replit projects can automatically send their Features and Tech Stack to ConsoleBlue.

## Overview

When you add a feature or technology to your project, send it to ConsoleBlue via API. The Documentation Generator will then auto-fill these fields.

---

## API Endpoint

```
POST https://consoleblue.replit.app/api/external/project-metadata
```

### Authentication

Use your project's API key from ConsoleBlue:
- Header: `Authorization: Bearer YOUR_API_KEY`
- Permission required: `write_project_metadata`

### Request Body

```json
{
  "features": [
    "User authentication",
    "Data visualization", 
    "Real-time updates"
  ],
  "techStack": [
    "React",
    "TypeScript",
    "Express",
    "PostgreSQL"
  ]
}
```

Both `features` and `techStack` are optional, but at least one must be provided.

---

## Example: Node.js/Express

```javascript
// In your external project's startup script or deployment hook

const CONSOLEBLUE_API_KEY = process.env.CONSOLEBLUE_API_KEY;
const CONSOLEBLUE_URL = "https://consoleblue.replit.app";

async function sendMetadataToConsoleBlue() {
  const metadata = {
    features: [
      "Task management",
      "List organization",
      "Priority tracking"
    ],
    techStack: [
      "React",
      "TypeScript",
      "Express",
      "PostgreSQL",
      "Drizzle ORM"
    ]
  };

  try {
    const response = await fetch(`${CONSOLEBLUE_URL}/api/external/project-metadata`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONSOLEBLUE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send metadata to ConsoleBlue:', error);
      return;
    }

    const result = await response.json();
    console.log('✓ Metadata sent to ConsoleBlue:', result);
  } catch (error) {
    console.error('Error sending metadata to ConsoleBlue:', error);
  }
}

// Send on startup
sendMetadataToConsoleBlue();
```

---

## When to Send

Send metadata:
- **On deployment** - Add to your deployment script
- **When features change** - After adding/removing features
- **When tech stack changes** - After adding/removing technologies
- **On startup** - Quick sync on every server restart

---

## Response

Success response:
```json
{
  "success": true,
  "project": {
    "id": "abc123",
    "name": "List It",
    "features": ["Task management", "List organization"],
    "techStack": ["React", "TypeScript", "Express"]
  }
}
```

Error response:
```json
{
  "error": "features must be an array of strings"
}
```

---

## Setting Up API Key

1. Log into ConsoleBlue dashboard
2. Go to your project settings
3. Generate an API key with `write_project_metadata` permission
4. Add to your project's environment variables:
   ```
   CONSOLEBLUE_API_KEY=your-api-key-here
   ```

---

## Result

After sending metadata, when you open the Documentation Generator in ConsoleBlue and select your project, the Features and Tech Stack fields will auto-fill! ✨
