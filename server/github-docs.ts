import type { Project, ProjectDocumentationOutput } from "@shared/schema";

export interface GitHubFile {
  path: string;
  content: string;
}

export interface GitHubCommitResponse {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
}

export class GitHubDocsService {
  private githubToken: string | undefined;

  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
  }

  async pushDocumentation(
    outputs: ProjectDocumentationOutput[],
    project: Project,
    targetPath: string = "docs/"
  ): Promise<GitHubCommitResponse> {
    if (!this.githubToken) {
      throw new Error("GITHUB_TOKEN environment variable not configured");
    }

    if (!project.githubRepo) {
      throw new Error(`Project ${project.name} does not have a GitHub repository configured`);
    }

    const [owner, repo] = project.githubRepo.split("/");
    if (!owner || !repo) {
      throw new Error(`Invalid GitHub repository format: ${project.githubRepo}. Expected format: owner/repo`);
    }

    const branch = project.githubBranch || "main";

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const headers = {
      "Authorization": `Bearer ${this.githubToken}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    };

    const latestCommitSha = await this.getLatestCommitSha(baseUrl, branch, headers);

    const baseTreeSha = await this.getBaseTreeSha(baseUrl, latestCommitSha, headers);

    const blobs = await this.createBlobs(baseUrl, outputs, headers);

    const tree = await this.createTree(baseUrl, baseTreeSha, blobs, targetPath, headers);

    const commit = await this.createCommit(
      baseUrl,
      latestCommitSha,
      tree.sha,
      outputs.length,
      headers
    );

    await this.updateRef(baseUrl, branch, commit.sha, headers);

    console.log(`Pushed ${outputs.length} documentation files to ${project.githubRepo}:${branch} at ${targetPath}`);
    console.log(`Commit SHA: ${commit.sha}`);
    console.log(`Commit URL: ${commit.html_url}`);

    return commit;
  }

  private async getLatestCommitSha(
    baseUrl: string,
    branch: string,
    headers: HeadersInit
  ): Promise<string> {
    const response = await fetch(`${baseUrl}/git/refs/heads/${branch}`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to get latest commit: ${response.status} ${response.statusText}`);
    }

    const ref = await response.json();
    return ref.object.sha;
  }

  private async getBaseTreeSha(
    baseUrl: string,
    commitSha: string,
    headers: HeadersInit
  ): Promise<string> {
    const response = await fetch(`${baseUrl}/git/commits/${commitSha}`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to get base tree: ${response.status} ${response.statusText}`);
    }

    const commit = await response.json();
    return commit.tree.sha;
  }

  private async createBlobs(
    baseUrl: string,
    outputs: ProjectDocumentationOutput[],
    headers: HeadersInit
  ): Promise<Array<{ fileName: string; sha: string }>> {
    const blobs = [];

    for (const output of outputs) {
      const blobResponse = await fetch(`${baseUrl}/git/blobs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: Buffer.from(output.content, "utf-8").toString("base64"),
          encoding: "base64",
        }),
      });

      if (!blobResponse.ok) {
        throw new Error(`Failed to create blob for ${output.fileName}: ${blobResponse.status}`);
      }

      const blob = await blobResponse.json();
      blobs.push({ fileName: output.fileName, sha: blob.sha });
    }

    return blobs;
  }

  private async createTree(
    baseUrl: string,
    baseTreeSha: string,
    blobs: Array<{ fileName: string; sha: string }>,
    targetPath: string,
    headers: HeadersInit
  ): Promise<{ sha: string }> {
    const tree = blobs.map((blob) => ({
      path: `${targetPath}${blob.fileName}`,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    }));

    const treeResponse = await fetch(`${baseUrl}/git/trees`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree,
      }),
    });

    if (!treeResponse.ok) {
      throw new Error(`Failed to create tree: ${treeResponse.status}`);
    }

    return await treeResponse.json();
  }

  private async createCommit(
    baseUrl: string,
    parentSha: string,
    treeSha: string,
    fileCount: number,
    headers: HeadersInit
  ): Promise<GitHubCommitResponse> {
    const message = `Update documentation (${fileCount} file${fileCount !== 1 ? "s" : ""})`;

    const commitResponse = await fetch(`${baseUrl}/git/commits`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        tree: treeSha,
        parents: [parentSha],
      }),
    });

    if (!commitResponse.ok) {
      throw new Error(`Failed to create commit: ${commitResponse.status}`);
    }

    return await commitResponse.json();
  }

  private async updateRef(
    baseUrl: string,
    branch: string,
    commitSha: string,
    headers: HeadersInit
  ): Promise<void> {
    const refResponse = await fetch(`${baseUrl}/git/refs/heads/${branch}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        sha: commitSha,
        force: false,
      }),
    });

    if (!refResponse.ok) {
      const errorData = await refResponse.json().catch(() => ({}));
      const errorMessage = errorData.message || "";
      
      if (refResponse.status === 403) {
        throw new Error(
          `GitHub push denied: ${errorMessage}. This may be due to branch protection rules. ` +
          `Please disable branch protection for "${branch}" or push to a different branch, ` +
          `or configure your repository to allow force pushes.`
        );
      }
      
      if (refResponse.status === 422 && errorMessage.includes("fast-forward")) {
        throw new Error(
          `GitHub push failed: Branch has diverged. ${errorMessage}. ` +
          `This usually means the branch has commits you don't have locally. ` +
          `Try syncing your repository first or use a different branch.`
        );
      }
      
      throw new Error(`Failed to update branch "${branch}": ${errorMessage || `HTTP ${refResponse.status}`}`);
    }
  }
}

export const githubDocsService = new GitHubDocsService();
