import type { Task, Project } from "@shared/schema";

interface GitHubIssueResponse {
  number: number;
  html_url: string;
  state: string;
}

export class GitHubIssuesService {
  private githubToken: string | undefined;

  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
  }

  async createIssueFromTask(task: Task, project: Project): Promise<GitHubIssueResponse> {
    if (!this.githubToken) {
      throw new Error("GITHUB_TOKEN environment variable not configured");
    }

    if (!project.githubRepo) {
      throw new Error(`Project ${project.name} does not have a GitHub repository configured`);
    }

    // Parse owner/repo from project.githubRepo (format: "owner/repo")
    const [owner, repo] = project.githubRepo.split("/");
    if (!owner || !repo) {
      throw new Error(`Invalid GitHub repository format: ${project.githubRepo}. Expected format: owner/repo`);
    }

    // Prepare issue body with task details
    const issueBody = this.buildIssueBody(task, project);

    // Prepare labels based on priority
    const labels = this.getLabelsForTask(task);

    // Create issue via GitHub REST API
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: task.title,
        body: issueBody,
        labels: labels,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errorText}`);
    }

    const issue: GitHubIssueResponse = await response.json();
    
    console.log(`Created GitHub issue #${issue.number} for task ${task.id}: ${issue.html_url}`);
    
    return issue;
  }

  private buildIssueBody(task: Task, project: Project): string {
    const parts: string[] = [];

    if (task.description) {
      parts.push(task.description);
      parts.push("");
    }

    parts.push("---");
    parts.push("");
    parts.push("**Task Details**");
    parts.push(`- Priority: ${task.priority}`);
    parts.push(`- Status: ${task.status}`);
    parts.push(`- Source: ${task.source}`);
    
    if (task.sourceUrl) {
      parts.push(`- Source URL: ${task.sourceUrl}`);
    }

    if (task.dueDate) {
      parts.push(`- Due Date: ${new Date(task.dueDate).toLocaleDateString()}`);
    }

    parts.push("");
    parts.push(`*Created from Triad Blue Hub - Project: ${project.name}*`);

    return parts.join("\n");
  }

  private getLabelsForTask(task: Task): string[] {
    const labels: string[] = [];

    // Add priority label
    switch (task.priority) {
      case "urgent":
        labels.push("priority: urgent");
        break;
      case "high":
        labels.push("priority: high");
        break;
      case "medium":
        labels.push("priority: medium");
        break;
      case "low":
        labels.push("priority: low");
        break;
    }

    // Add task label
    labels.push("task");

    // Add source label
    if (task.source) {
      labels.push(`source: ${task.source}`);
    }

    return labels;
  }
}

export const githubIssuesService = new GitHubIssuesService();
