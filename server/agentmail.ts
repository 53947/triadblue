import { AgentMailClient } from 'agentmail';

let cachedCredentials: { apiKey: string } | null = null;
let credentialsFetchedAt = 0;
const CREDENTIALS_TTL_MS = 50 * 60 * 1000; // 50 minutes

async function getCredentials() {
  // Return cached credentials if still fresh
  if (cachedCredentials && (Date.now() - credentialsFetchedAt) < CREDENTIALS_TTL_MS) {
    return cachedCredentials;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=agentmail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error('AgentMail not connected');
  }

  cachedCredentials = { apiKey: connectionSettings.settings.api_key };
  credentialsFetchedAt = Date.now();
  return cachedCredentials;
}

export async function getUncachableAgentMailClient() {
  const {apiKey} = await getCredentials();
  return new AgentMailClient({ apiKey });
}
