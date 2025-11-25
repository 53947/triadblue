# TriadBlue Required API Endpoints

## ⚠️ MANDATORY FOR ALL TRIADBLUE ECOSYSTEM PROJECTS

All projects in the TriadBlue ecosystem must implement these two standard API endpoints. ConsoleBlue is pre-configured with these URL patterns for all projects:

```
https://{projectname}.replit.app/api/metadata
https://{projectname}.replit.app/api/agent
```

These endpoints enable:
- **Metadata Endpoint**: Automatic documentation generation
- **Agent Endpoint**: Conversational AI interaction via Agent Chat

---

## 1. Metadata Endpoint (`/api/metadata`)

**Purpose**: Provides project features and tech stack for ConsoleBlue's Documentation Generator.

### Requirements

- **Method**: GET
- **Path**: `/api/metadata`
- **Authentication**: None (public endpoint)
- **Response Format**: JSON

### Response Schema

```json
{
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "techStack": ["Technology 1", "Technology 2", "Technology 3"]
}
```

### Implementation Example (Node.js/Express)

```javascript
app.get("/api/metadata", (req, res) => {
  res.json({
    features: [
      "User authentication",
      "Task management",
      "Real-time updates",
      "Data visualization"
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

### Implementation Example (Python/Flask)

```python
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
            'React'
        ]
    })
```

**See**: `EXTERNAL_PROJECT_METADATA_API.md` for complete implementation guide.

---

## 2. Agent Endpoint (`/api/agent`)

**Purpose**: Enables conversational AI interaction through ConsoleBlue's Agent Chat interface.

### Requirements

- **Method**: POST
- **Path**: `/api/agent`
- **Authentication**: Optional (Bearer token if needed)
- **Request Format**: JSON
- **Response Format**: JSON

### Request Schema

```json
{
  "message": "User's message content",
  "context": {
    "conversationId": "optional-conversation-id",
    "userId": "optional-user-id"
  }
}
```

### Response Schema

```json
{
  "content": "Agent's text response",
  "screenshot": "https://optional-screenshot-url.png",
  "metadata": {
    "processingTime": 1234,
    "model": "gpt-4"
  }
}
```

**Required Fields**:
- `content`: String containing the agent's response text

**Optional Fields**:
- `screenshot`: URL to a screenshot if the agent performed visual analysis
- `metadata`: Additional information about the response

### Implementation Example (Node.js/Express)

```javascript
app.post("/api/agent", async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Process the message with your AI/agent logic
    const response = await processAgentMessage(message, context);
    
    res.json({
      content: response.text,
      screenshot: response.screenshotUrl, // Optional
      metadata: {
        processingTime: response.duration,
        model: "gpt-4"
      }
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to process agent message",
      details: error.message
    });
  }
});

async function processAgentMessage(message, context) {
  // Your implementation here
  // Example: Call OpenAI, analyze data, generate screenshots, etc.
  return {
    text: `I received your message: ${message}`,
    screenshotUrl: null,
    duration: 100
  };
}
```

### Implementation Example (Python/Flask)

```python
@app.route('/api/agent', methods=['POST'])
def handle_agent_message():
    try:
        data = request.get_json()
        message = data.get('message')
        context = data.get('context', {})
        
        # Process the message with your AI/agent logic
        response = process_agent_message(message, context)
        
        return jsonify({
            'content': response['text'],
            'screenshot': response.get('screenshot_url'),
            'metadata': {
                'processingTime': response['duration'],
                'model': 'gpt-4'
            }
        })
    except Exception as e:
        return jsonify({
            'error': 'Failed to process agent message',
            'details': str(e)
        }), 500

def process_agent_message(message, context):
    # Your implementation here
    return {
        'text': f"I received your message: {message}",
        'screenshot_url': None,
        'duration': 100
    }
```

---

## Implementation Checklist

For each new TriadBlue project, ensure:

- [ ] `/api/metadata` endpoint is implemented and returns valid JSON
- [ ] `/api/agent` endpoint is implemented and handles POST requests
- [ ] Metadata endpoint includes current features and tech stack
- [ ] Agent endpoint integrates with project-specific AI/analysis logic
- [ ] Both endpoints are accessible at `https://{projectname}.replit.app`
- [ ] Endpoints are tested manually before deployment
- [ ] Project is registered in ConsoleBlue with pre-filled URLs

---

## URL Pattern Standard

ConsoleBlue automatically pre-fills these URLs based on project name:

```
Project Name: "Site Inspector"
Metadata URL: https://siteinspector.replit.app/api/metadata
Agent URL: https://siteinspector.replit.app/api/agent

Project Name: "BusinessBlueprint"
Metadata URL: https://businessblueprint.replit.app/api/metadata
Agent URL: https://businessblueprint.replit.app/api/agent
```

**Note**: URLs are pre-configured but editable in ConsoleBlue's project settings if your deployment uses custom domains or different patterns.

---

## Testing Your Endpoints

### Test Metadata Endpoint

```bash
curl https://your-project.replit.app/api/metadata
```

Expected response:
```json
{
  "features": ["Feature 1", "Feature 2"],
  "techStack": ["Tech 1", "Tech 2"]
}
```

### Test Agent Endpoint

```bash
curl -X POST https://your-project.replit.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, agent!"}'
```

Expected response:
```json
{
  "content": "Hello! How can I help you today?",
  "metadata": { ... }
}
```

---

## Error Handling

Both endpoints should return appropriate HTTP status codes:

- **200 OK**: Successful response
- **400 Bad Request**: Invalid request format
- **500 Internal Server Error**: Processing failure

Example error response:
```json
{
  "error": "Invalid request format",
  "details": "Missing required field: message"
}
```

---

## Security Considerations

### Metadata Endpoint
- Public endpoint (no authentication needed)
- Only expose non-sensitive project information
- Don't include API keys, credentials, or user data

### Agent Endpoint
- Consider rate limiting to prevent abuse
- Validate all input data
- Sanitize user messages before processing
- Optionally require Bearer token authentication
- Log requests for monitoring and debugging

---

## Integration with ConsoleBlue

Once implemented:

1. **Metadata**: Go to Documentation Generator in ConsoleBlue, select your project, click "Refresh from API"
2. **Agent Chat**: Go to Agent Chat in ConsoleBlue, select your project's agent connection, start chatting

ConsoleBlue will use the pre-configured URLs automatically. You can update the URLs in Project Settings if needed.

---

## Support

For implementation questions or issues, contact the TriadBlue team or refer to:
- `EXTERNAL_PROJECT_METADATA_API.md` for metadata endpoint details
- `API_KEY_NAMING_GUIDE.md` for authentication standards
- `ARCHITECTURE.md` for system architecture context
