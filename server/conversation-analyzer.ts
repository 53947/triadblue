import OpenAI from "openai";
import type { EmailMessage } from "@shared/schema";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface ActionableItem {
  type: "bug" | "task" | "feature" | "question";
  description: string;
  severity: "low" | "medium" | "high";
}

interface AnalysisResult {
  hasActionableItems: boolean;
  items: ActionableItem[];
  summary: string;
}

/**
 * Analyzes an email conversation thread to detect bugs, tasks, and actionable items.
 * Uses GPT-5 to intelligently parse the conversation and identify issues that should
 * be tracked in GitHub.
 */
export async function analyzeConversation(
  messages: EmailMessage[]
): Promise<AnalysisResult> {
  if (messages.length === 0) {
    return {
      hasActionableItems: false,
      items: [],
      summary: "No messages to analyze",
    };
  }

  // Format conversation for AI analysis
  const conversationText = messages
    .map((msg) => {
      const direction = msg.direction === "inbound" ? "Agent" : "User";
      return `[${direction}]: ${msg.body}`;
    })
    .join("\n\n");

  const systemPrompt = `You are an expert at analyzing technical conversations between users and AI agents to identify actionable items that should be tracked.

Your task is to analyze email conversations and identify:
- Bugs: Software defects, errors, or unexpected behavior
- Tasks: Feature requests, improvements, or changes needed
- Questions: Unresolved questions or clarifications needed

Respond in JSON format with:
{
  "hasActionableItems": boolean,
  "items": [
    {
      "type": "bug" | "task" | "feature" | "question",
      "description": "Brief description of the item",
      "severity": "low" | "medium" | "high"
    }
  ],
  "summary": "Brief summary of the conversation"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this conversation and identify actionable items:\n\n${conversationText}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    // Return safe default on error
    return {
      hasActionableItems: false,
      items: [],
      summary: "Error analyzing conversation",
    };
  }
}
