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
      }

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
