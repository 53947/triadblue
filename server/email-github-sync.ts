import { getUncachableAgentMailClient } from './agentmail';
import { createGitHubIssue } from './github-integration';

export interface ProjectEmailConfig {
  projectName: string;
  emailAddress: string; // e.g., "listit@agentmail.triadblue.com"
  githubRepo: string; // e.g., "username/listit"
  githubOwner: string;
  githubRepoName: string;
}

export const PROJECT_EMAIL_CONFIGS: ProjectEmailConfig[] = [
  {
    projectName: "List It",
    emailAddress: "listit@agentmail.triadblue.com",
    githubRepo: "", // To be filled in
    githubOwner: "",
    githubRepoName: ""
  },
  {
    projectName: "BusinessBlueprint",
    emailAddress: "businessblueprint@agentmail.triadblue.com",
    githubRepo: "", // To be filled in
    githubOwner: "",
    githubRepoName: ""
  },
  {
    projectName: "HostsBlue",
    emailAddress: "hostsblue@agentmail.triadblue.com",
    githubRepo: "", // To be filled in
    githubOwner: "",
    githubRepoName: ""
  },
  {
    projectName: "SwipesBlue",
    emailAddress: "swipesblue@agentmail.triadblue.com",
    githubRepo: "", // To be filled in
    githubOwner: "",
    githubRepoName: ""
  },
];

export async function syncEmailThreadToGitHub(
  projectConfig: ProjectEmailConfig,
  emailSubject: string,
  emailBody: string,
  from: string,
  to: string
) {
  if (!projectConfig.githubOwner || !projectConfig.githubRepoName) {
    throw new Error(`GitHub repo not configured for ${projectConfig.projectName}`);
  }

  const issueTitle = `[${projectConfig.projectName} Agent] ${emailSubject}`;
  const issueBody = `
## Email Communication

**From:** ${from}
**To:** ${to}
**Subject:** ${emailSubject}

---

${emailBody}

---

*This issue was automatically created from an email conversation with the ${projectConfig.projectName} Agent.*
  `.trim();

  const issue = await createGitHubIssue(
    projectConfig.githubOwner,
    projectConfig.githubRepoName,
    issueTitle,
    issueBody,
    [projectConfig.projectName.toLowerCase().replace(/\s+/g, '-'), 'agent-email']
  );

  return issue;
}

export async function sendEmailToAgent(
  projectConfig: ProjectEmailConfig,
  subject: string,
  body: string,
  fromAddress: string = "console@agentmail.triadblue.com"
) {
  const client = await getUncachableAgentMailClient();
  
  // Get or create inbox for sending
  const inboxes = await client.inboxes.list();
  let senderInbox: any = null;
  
  if (Array.isArray(inboxes)) {
    senderInbox = inboxes.find((inbox: any) => 
      inbox.email_address === fromAddress
    );
  }

  if (!senderInbox) {
    // Create console inbox if it doesn't exist
    const [username, domain] = fromAddress.split('@');
    senderInbox = await client.inboxes.create({
      username,
      domain,
      displayName: "ConsoleBlue",
    });
  }

  // Send email to the project agent
  await client.inboxes.messages.send(senderInbox.inbox_id, {
    to: projectConfig.emailAddress,
    subject,
    text: body,
  });

  return {
    sent: true,
    from: fromAddress,
    to: projectConfig.emailAddress,
    subject,
  };
}
