// Referenced from javascript_openai_ai_integrations blueprint
import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

export async function extractActionItemsFromConversation(
  conversationContent: string
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing agent conversations and extracting undocumented action items that weren't properly documented according to Triad Blue standards. 
          
Your task is to identify:
1. Decisions made that weren't formally documented
2. Tasks mentioned but not created
3. Requirements discussed but not tracked
4. Follow-up actions that were agreed upon
5. Implementation details that need to be recorded

Return ONLY a JSON array of action items. Each item should be a concise, actionable string.
Example: ["Implement user authentication", "Add error handling to API endpoints", "Document deployment process"]

If no action items are found, return an empty array: []`
        },
        {
          role: "user",
          content: `Analyze this conversation and extract all undocumented action items:\n\n${conversationContent}`
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    const parsed = JSON.parse(content);
    
    // Handle different possible response formats
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed.action_items && Array.isArray(parsed.action_items)) {
      return parsed.action_items;
    }
    if (parsed.items && Array.isArray(parsed.items)) {
      return parsed.items;
    }
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      return parsed.tasks;
    }
    
    return [];
  } catch (error) {
    console.error("Error extracting action items:", error);
    return [];
  }
}
