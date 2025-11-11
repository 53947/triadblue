import type { InsertGithubActivity } from "../shared/schema";

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
  stats?: {
    total: number;
  };
}

export interface GitHubAPIResponse {
  commits: GitHubCommit[];
  error?: string;
}

export async function fetchGitHubCommits(
  repo: string,
  branch: string = "main",
  token?: string,
  since?: Date
): Promise<GitHubCommit[]> {
  if (!repo || !repo.includes("/")) {
    throw new Error("Invalid repository format. Expected 'owner/repo'");
  }

  const headers: HeadersInit = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Project-Hub-App",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const sinceParam = since ? `&since=${since.toISOString()}` : "";
  const url = `https://api.github.com/repos/${repo}/commits?sha=${branch}${sinceParam}&per_page=30`;

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Repository ${repo} not found or not accessible`);
      }
      if (response.status === 403) {
        throw new Error("GitHub API rate limit exceeded or insufficient permissions");
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const commits: GitHubCommit[] = await response.json();
    return commits;
  } catch (error) {
    console.error("Error fetching GitHub commits:", error);
    throw error;
  }
}

export function transformCommitsToActivities(
  commits: GitHubCommit[],
  projectId: string,
  repo: string
): InsertGithubActivity[] {
  return commits.map((commit) => ({
    projectId,
    repository: repo,
    commitSha: commit.sha,
    commitMessage: commit.commit.message,
    author: commit.commit.author.name,
    fileChanges: commit.stats?.total,
    activityType: "commit" as const,
    url: commit.html_url,
  }));
}

export async function syncGitHubActivity(
  projectId: string,
  repo: string,
  branch: string = "main",
  token?: string,
  lastSync?: Date
): Promise<InsertGithubActivity[]> {
  const commits = await fetchGitHubCommits(repo, branch, token, lastSync);
  return transformCommitsToActivities(commits, projectId, repo);
}
