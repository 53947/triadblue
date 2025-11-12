// Agent communication service - handles forwarding messages to external agent endpoints
import type { AgentConnection, AgentChatMessage } from "@shared/schema";

export interface AgentMessageRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface AgentMessageResponse {
  reply: string;
  metadata?: any;
}

export class AgentService {
  async sendMessage(
    connection: AgentConnection,
    message: string,
    conversationHistory: AgentChatMessage[] = []
  ): Promise<string> {
    try {
      // Prepare the message payload
      const payload: AgentMessageRequest = {
        message,
        conversationHistory: conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      };

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

      // Parse response
      const data: AgentMessageResponse = await response.json();
      return data.reply || "No response from agent";
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
