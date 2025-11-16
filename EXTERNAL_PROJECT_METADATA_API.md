# External Project Metadata API Setup Guide

This guide explains how to set up a metadata API endpoint in your external Replit projects so ConsoleBlue can automatically pull Features and Tech Stack information.

## Overview

ConsoleBlue pulls metadata from your project's API endpoint when you click "Refresh from API" in the Documentation Generator. Your project needs to expose a simple GET endpoint that returns JSON with your features and tech stack.

---

## Step 1: Create the API Endpoint

In your external Replit project, create a GET endpoint that returns metadata.

### Example: Node.js/Express

```javascript
// In your server file (e.g., server/index.ts or server/routes.ts)

app.get("/api/metadata", (req, res) => {
  res.json({
    features: [
      "Task management",
      "List organization",
      "Priority tracking",
      "Due date reminders"
    ],
    techStack: [
      "React",
      "TypeScript",
      "Express",
      "PostgreSQL",
      "Drizzle ORM",
      "TailwindCSS"
    ]
  });
});
```

### Example: Python/Flask

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/metadata', methods=['GET'])
def get_metadata():
    return jsonify({
        'features': [
            'User authentication',
            'Data visualization',
            'Real-time updates'
        ],
        'techStack': [
            'Python',
            'Flask',
            'PostgreSQL',
            'React',
            'Chart.js'
        ]
    })
```

---

## Step 2: Configure in ConsoleBlue

1. Log into ConsoleBlue
2. Go to **Projects** page
3. Click on your project
4. Find the **Metadata API URL** field
5. Enter your endpoint URL:
   ```
   https://your-project-name.replit.app/api/metadata
   ```
6. Save the project

---

## Step 3: Use in Documentation Generator

1. Go to **Documentation Generator** in ConsoleBlue
2. Select your project
3. Click the **"Refresh from API"** button
4. Features and Tech Stack will auto-fill from your API!

---

## API Response Format

Your endpoint must return JSON in this exact format:

```json
{
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "techStack": [
    "Technology 1",
    "Technology 2",
    "Technology 3"
  ]
}
```

**Requirements:**
- Both `features` and `techStack` are optional, but at least one should be provided
- Each must be an array of non-empty strings
- Strings will be trimmed of whitespace

---

## Dynamic Metadata

For projects where features/tech stack change frequently, you can generate the metadata dynamically:

```javascript
// Read from package.json or database
import packageJson from '../package.json';

app.get("/api/metadata", async (req, res) => {
  // Get features from database or config
  const features = await database.getActiveFeatures();
  
  // Extract tech stack from dependencies
  const techStack = Object.keys(packageJson.dependencies);
  
  res.json({ features, techStack });
});
```

---

## Error Handling

ConsoleBlue expects:
- **200 OK** response
- Valid JSON format
- Arrays of strings only

If your API returns an error, ConsoleBlue will display a helpful error message with the status code.

---

## Security Notes

- The endpoint does **not** require authentication (it's read-only metadata)
- Don't expose sensitive information through this endpoint
- Only return public project information

---

## Testing Your Endpoint

Test your endpoint manually:

```bash
curl https://your-project-name.replit.app/api/metadata
```

Expected output:
```json
{
  "features": ["Feature 1", "Feature 2"],
  "techStack": ["Tech 1", "Tech 2"]
}
```

---

## Result

Once set up, every time you click "Refresh from API" in ConsoleBlue's Documentation Generator, it will pull the latest features and tech stack from your project automatically! ✨

No more manual updates! 🎉
