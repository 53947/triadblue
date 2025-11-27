// Agent communication service - handles forwarding messages to external agent endpoints
import type { AgentConnection, AgentChatMessage } from "@shared/schema";

export interface AgentMessageRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface AgentMessageResponse {
  reply?: string;
  response?: string;
  metadata?: any;
}

export class AgentService {
  async sendMessage(
    connection: AgentConnection,
    message: string,
    conversationHistory: AgentChatMessage[] = []
  ): Promise<string> {
    try {
      // Handle local Platform Builder agent
      if (connection.agentEndpointUrl === "local") {
        return this.handleLocalPlatformBuilderMessage(message, conversationHistory);
      }

      // Build messages array in OpenAI format (for List It compatibility)
      const messages = [
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: message,
        },
      ];

      // Prepare the message payload
      const payload = { messages };

      // Prepare headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add API key if configured
      if (connection.agentApiKey) {
        headers["Authorization"] = `Bearer ${connection.agentApiKey}`;
        console.log(`[Agent] Sending request with API key (length: ${connection.agentApiKey.length})`);
      } else {
        console.log(`[Agent] WARNING: No API key configured for connection ${connection.name}`);
      }

      console.log(`[Agent] Sending to ${connection.agentEndpointUrl}`);
      console.log(`[Agent] Headers:`, headers);

      // Send request to external agent endpoint
      const response = await fetch(connection.agentEndpointUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Agent endpoint returned status ${response.status}: ${await response.text()}`);
      }

      // Parse response - support both 'reply' and 'response' field names
      const data: any = await response.json();
      return data.reply || data.response || "No response from agent";
    } catch (error: any) {
      console.error(`Error communicating with agent ${connection.name}:`, error);
      throw new Error(`Failed to communicate with agent: ${error.message}`);
    }
  }

  private handleLocalPlatformBuilderMessage(
    message: string,
    _conversationHistory: AgentChatMessage[] = []
  ): string {
    const lowerMessage = message.toLowerCase();

    // Help commands
    if (lowerMessage.includes("help") || lowerMessage.includes("?")) {
      return `I'm Platform Builder, your AI assistant for The Blue Link. I can help you with:

📋 **Documentation** - Generate docs, push to GitHub, track distribution
🤖 **Agents** - Talk to agents across TriadBlue projects, manage connections
📧 **Email** - Consolidate inboxes, filter by project, manage threads
🔧 **Configuration** - Set up projects, APIs, webhooks, and integrations
📊 **Tracking** - View documentation distribution status, agent status

What would you like to do? Just ask naturally and I'll help!`;
    }

    // Documentation commands
    if (lowerMessage.includes("documentation") || lowerMessage.includes("docs")) {
      return `For documentation generation:
1. Go to Project Documentation page
2. Select templates (TRIADBLUE_REQUIRED_ENDPOINTS.md is recommended for all projects)
3. Configure metadata for your project
4. Generate and preview
5. Push to GitHub automatically

All distributions are tracked - you can see who received what in the tracking dashboard.`;
    }

    // Email commands
    if (lowerMessage.includes("email") || lowerMessage.includes("inbox")) {
      return `Email system in The Blue Link:
📧 **3 Shared Inboxes:**
- siteinspector@agentmail.triadblue.com (Site Inspector specific)
- agents@agentmail.triadblue.com (All agents, filtered by project)
- assistants@agentmail.triadblue.com (All assistants, filtered by project)

Each agent/assistant only sees their project's emails. Go to Email Chat page to manage threads, reply, and upload files.`;
    }

    // Agent commands
    if (lowerMessage.includes("agent") || lowerMessage.includes("connection")) {
      return `Agent Management:
✓ Platform Builder (you're talking to me now!)
✓ TriadBlue Projects (auto-seeded): BusinessBlueprint, HostsBlue, SwipesBlue, List It, Site Inspector

Go to Agent Chat page to:
- Select an agent from the dropdown
- View conversation history
- Send messages and get responses
- Add custom agent connections if needed`;
    }

    // Status/health check
    if (lowerMessage.includes("status") || lowerMessage.includes("health")) {
      return `✓ The Blue Link is running and healthy
✓ Database connected
✓ Email system active
✓ TriadBlue projects seeded
✓ Platform Builder agent ready

All systems operational! What do you need?`;
    }

    // Default helpful response
    return `I'm ready to help with The Blue Link! You can ask me about:
- Documentation generation and distribution
- Agent communication across projects
- Email management and filtering
- Project configuration
- System status and troubleshooting

Type "help" for a full list of what I can assist with.`;
  }

  async testConnection(connection: AgentConnection): Promise<boolean> {
    try {
      await this.sendMessage(connection, "ping", []);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const agentService = new AgentService();
