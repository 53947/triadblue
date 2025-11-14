import { createHash } from "crypto";
import { createGitHubIssue } from "./github-integration";
import type { IStorage } from "./storage";
import type { EmailThread } from "@shared/schema";

interface ActionableItem {
  type: "bug" | "task" | "feature" | "question";
  description: string;
  severity: "low" | "medium" | "high";
}

interface GitHubIssueRecord {
  id: string;
  type: string;
  descriptionHash: string;
  severity: string;
  issueNumber: number;
  issueUrl: string;
  createdAt: string;
}

/**
 * Creates a deterministic hash for an actionable item to detect duplicates.
 * Includes thread ID to prevent cross-thread collisions.
 */
function hashActionableItem(item: ActionableItem, threadId: string): string {
  const normalized = `${threadId}:${item.type.toLowerCase()}:${item.description.toLowerCase().trim()}`;
  return createHash("sha256").update(normalized).digest("hex").substring(0, 16);
}

/**
 * Formats a GitHub issue title from an actionable item
 */
function formatIssueTitle(item: ActionableItem, subject: string): string {
  const prefix = item.type === "bug" ? "[Bug]" : 
                 item.type === "task" ? "[Task]" :
                 item.type === "feature" ? "[Feature]" : 
                 "[Question]";
  
  return `${prefix} ${item.description.substring(0, 100)}${item.description.length > 100 ? "..." : ""}`;
}

/**
 * Formats a GitHub issue body with email context
 */
function formatIssueBody(
  item: ActionableItem,
  thread: EmailThread,
  analysisSummary: string
): string {
  return `## Actionable Item from Email Conversation

**Type:** ${item.type}
**Severity:** ${item.severity}

### Description
${item.description}

### Email Thread Context
- **Subject:** ${thread.subject}
- **Agent Email:** ${thread.agentEmail}
- **Thread ID:** ${thread.id}

### AI Analysis Summary
${analysisSummary || "No summary available"}

---
*This issue was automatically created from an email conversation analyzed by AI.*`;
}

/**
 * Gets labels for a GitHub issue based on actionable item properties
 */
function getLabelsForItem(item: ActionableItem): string[] {
  const labels: string[] = [];
  
  // Type label
  labels.push(item.type);
  
  // Severity label
  if (item.severity === "high") {
    labels.push("priority: high");
  } else if (item.severity === "medium") {
    labels.push("priority: medium");
  }
  
  // Source label
  labels.push("source: email");
  labels.push("automated");
  
  return labels;
}

/**
 * Auto-creates GitHub issues for actionable items detected in email threads.
 * Implements idempotent deduplication using content hashing.
 */
export async function autoCreateGitHubIssues(
  storage: IStorage,
  thread: EmailThread,
  actionableItems: ActionableItem[],
  analysisSummary: string
): Promise<GitHubIssueRecord[]> {
  try {
    // Get GitHub config for the project
    const config = await storage.getEmailConfigByProject(thread.projectId);
    
    if (!config || !config.githubOwner || !config.githubRepo) {
      console.log(`No GitHub config found for project ${thread.projectId}, skipping issue creation`);
      return [];
    }

    // Get existing GitHub issues from thread to prevent duplicates
    const existingIssues = (thread.githubIssues as GitHubIssueRecord[]) || [];
    const existingHashes = new Set(existingIssues.map(i => i.descriptionHash));

    const createdIssues: GitHubIssueRecord[] = [];

    // Create issues for new actionable items
    for (const item of actionableItems) {
      const itemHash = hashActionableItem(item, thread.id);
      
      // Skip if already created (check both existing and newly created in this run)
      if (existingHashes.has(itemHash)) {
        console.log(`Skipping duplicate actionable item (hash: ${itemHash})`);
        continue;
      }

      try {
        const title = formatIssueTitle(item, thread.subject);
        const body = formatIssueBody(item, thread, analysisSummary);
        const labels = getLabelsForItem(item);

        // Create GitHub issue
        const issue = await createGitHubIssue(
          config.githubOwner,
          config.githubRepo,
          title,
          body,
          labels
        );

        const issueRecord: GitHubIssueRecord = {
          id: itemHash,
          type: item.type,
          descriptionHash: itemHash,
          severity: item.severity,
          issueNumber: issue.number,
          issueUrl: issue.html_url,
          createdAt: new Date().toISOString(),
        };

        createdIssues.push(issueRecord);
        existingHashes.add(itemHash); // Update set to prevent duplicates within this run
        console.log(`Created GitHub issue #${issue.number} for ${item.type}: ${issue.html_url}`);
      } catch (error) {
        console.error(`Failed to create GitHub issue for actionable item:`, error);
        // Continue with other items even if one fails
      }
    }

    // Update thread with new GitHub issues
    if (createdIssues.length > 0) {
      const allIssues = [...existingIssues, ...createdIssues];
      await storage.updateEmailThread(thread.id, {
        githubIssues: allIssues,
      });
    }

    return createdIssues;
  } catch (error) {
    console.error(`Failed to auto-create GitHub issues for thread ${thread.id}:`, error);
    return [];
  }
}
