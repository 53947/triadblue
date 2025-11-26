# TriadBlue Project Setup Guide
## API Keys, Webhooks & Hardcoded Configuration

This guide shows exactly what API keys and secrets each TriadBlue project needs, and how they're auto-configured when projects are seeded into ConsoleBlue.

---

## 🏗️ ConsoleBlue (Central Hub)

### Required Secrets in Replit

| Secret Name | Value | Where It Comes From |
|------------|-------|-------------------|
| `DASHBOARD_PASSWORD` | Your chosen password | You create this |
| `AGENTMAIL_API_KEY` | `ak_live_xxxxx` | AgentMail Dashboard → Settings → API Keys |
| `AGENTMAIL_WEBHOOK_SECRET` | `whsec_xxxxx` | AgentMail Dashboard → Webhooks → Signing Secret |
| `SESSION_SECRET` | Random 32+ chars | Generate: `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL URL | Auto-created by Replit |

### Shared Email Inbox IDs

These are optional but recommended for multi-inbox support:

| Env Var | Inbox Address | Description |
|---------|---------------|-------------|
| `AGENTMAIL_SITEINSPECTOR_INBOX_ID` | `siteinspector@agentmail.triadblue.com` | Site Inspector receives all emails |
| `AGENTMAIL_AGENTS_INBOX_ID` | `agents@agentmail.triadblue.com` | 4 agent projects share this inbox |
| `AGENTMAIL_ASSISTANTS_INBOX_ID` | `assistants@agentmail.triadblue.com` | Assistant sessions monitor here |

**Getting Inbox IDs from AgentMail:**
1. Go to AgentMail Dashboard
2. For each inbox, copy the UUID shown next to the inbox name
3. Paste into the corresponding env var above

### Auto-Generated API Keys (in ConsoleBlue)

When projects are seeded, ConsoleBlue automatically generates API keys for each project so they can call back to ConsoleBlue. These keys are hardcoded into project profiles:

```
[ProjectName] - Production - Full Access
```

**Example keys auto-created:**
- `Site Inspector - Production - Full Access`
- `BusinessBlueprint - Production - Full Access`
- `HostsBlue - Production - Full Access`
- `SwipesBlue - Production - Full Access`
- `List It - Production - Full Access`

---

## 🔍 Site Inspector

### In Replit Secrets

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `AGENTMAIL_API_KEY` | Copy from ConsoleBlue | Send/receive emails |
| `AGENTMAIL_WEBHOOK_SECRET` | Copy from ConsoleBlue | Verify email webhooks |
| `CONSOLEBLUEREPLIT_API_KEY` | Auto-provided by ConsoleBlue | Call ConsoleBlue API |
| `CONSOLEBLUEREPLIT_WEBHOOK_SECRET` | Auto-provided by ConsoleBlue | Receive webhooks from ConsoleBlue |

**How to get ConsoleBlue API Key:**
1. Go to ConsoleBlue → API Keys → Project Keys
2. Find "Site Inspector - Production - Full Access"
3. Copy the key value into Site Inspector's `CONSOLEBLUEREPLIT_API_KEY`

### Hardcoded Configuration (Auto-Populated)

When Site Inspector is seeded in ConsoleBlue, these are automatically set:

```typescript
{
  name: "Site Inspector",
  code: "siteinspector",
  metadataApiUrl: "https://siteinspector.replit.app/api/metadata",
  agentApiUrl: "https://siteinspector.replit.app/api/agent",
  emailAddress: "siteinspector@agentmail.triadblue.com", // Isolated inbox
  color: "#10B981",
  icon: "Microscope"
}
```

### Email Configuration

- **Inbox Type:** Dedicated (not shared)
- **Email Address:** `siteinspector@agentmail.triadblue.com`
- **Inbox ID:** Add `AGENTMAIL_SITEINSPECTOR_INBOX_ID` to ConsoleBlue secrets
- **Assistant Session:** `siteinspector.assistant` (monitors this inbox)

---

## 🏢 BusinessBlueprint, HostsBlue, SwipesBlue, List It

### In Replit Secrets (Same for All 4)

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `AGENTMAIL_API_KEY` | Copy from ConsoleBlue | Send/receive emails |
| `AGENTMAIL_WEBHOOK_SECRET` | Copy from ConsoleBlue | Verify email webhooks |
| `CONSOLEBLUEREPLIT_API_KEY` | Auto-provided by ConsoleBlue | Call ConsoleBlue API |
| `CONSOLEBLUEREPLIT_WEBHOOK_SECRET` | Auto-provided by ConsoleBlue | Receive webhooks from ConsoleBlue |

### Hardcoded Configuration (Auto-Populated)

When each project is seeded, ConsoleBlue sets:

#### BusinessBlueprint
```typescript
{
  name: "BusinessBlueprint",
  code: "businessblueprint",
  metadataApiUrl: "https://businessblueprint.replit.app/api/metadata",
  agentApiUrl: "https://businessblueprint.replit.app/api/agent",
  emailAddress: "agents@agentmail.triadblue.com", // SHARED inbox
  color: "#8B5CF6",
  icon: "Briefcase"
}
```

#### HostsBlue
```typescript
{
  name: "HostsBlue",
  code: "hostsblue",
  metadataApiUrl: "https://hostsblue.replit.app/api/metadata",
  agentApiUrl: "https://hostsblue.replit.app/api/agent",
  emailAddress: "agents@agentmail.triadblue.com", // SHARED inbox
  color: "#06B6D4",
  icon: "Server"
}
```

#### SwipesBlue
```typescript
{
  name: "SwipesBlue",
  code: "swipesblue",
  metadataApiUrl: "https://swipesblue.replit.app/api/metadata",
  agentApiUrl: "https://swipesblue.replit.app/api/agent",
  emailAddress: "agents@agentmail.triadblue.com", // SHARED inbox
  color: "#EC4899",
  icon: "Heart"
}
```

#### List It
```typescript
{
  name: "List It",
  code: "listit",
  metadataApiUrl: "https://listit.replit.app/api/metadata",
  agentApiUrl: "https://listit.replit.app/api/agent",
  emailAddress: "agents@agentmail.triadblue.com", // SHARED inbox
  color: "#F59E0B",
  icon: "List"
}
```

### Email Configuration

- **Inbox Type:** Shared (4 projects use same inbox)
- **Email Address:** `agents@agentmail.triadblue.com`
- **Inbox ID:** Add `AGENTMAIL_AGENTS_INBOX_ID` to ConsoleBlue secrets
- **Backend Filtering:** ConsoleBlue filters messages by project name so each project only sees their emails
- **Assistant Session:** `[projectname].assistant` (e.g., `businessblueprint.assistant`)

---

## 🔑 Setup Checklist

### Step 1: ConsoleBlue Configuration

- [ ] Set `DASHBOARD_PASSWORD` in Replit Secrets
- [ ] Set `AGENTMAIL_API_KEY` in Replit Secrets
- [ ] Set `AGENTMAIL_WEBHOOK_SECRET` in Replit Secrets
- [ ] Set `SESSION_SECRET` in Replit Secrets
- [ ] Create 3 AgentMail inboxes:
  - `siteinspector@agentmail.triadblue.com`
  - `agents@agentmail.triadblue.com`
  - `assistants@agentmail.triadblue.com`
- [ ] Copy inbox IDs and set env vars:
  - `AGENTMAIL_SITEINSPECTOR_INBOX_ID`
  - `AGENTMAIL_AGENTS_INBOX_ID`
  - `AGENTMAIL_ASSISTANTS_INBOX_ID`
- [ ] Restart ConsoleBlue - projects auto-seed with hardcoded config
- [ ] Go to API Keys page and note the auto-generated keys for each project

### Step 2: Site Inspector Configuration

- [ ] Copy `AGENTMAIL_API_KEY` from ConsoleBlue to Site Inspector Secrets
- [ ] Copy `AGENTMAIL_WEBHOOK_SECRET` from ConsoleBlue to Site Inspector Secrets
- [ ] Get `Site Inspector - Production - Full Access` key from ConsoleBlue API Keys
- [ ] Set `CONSOLEBLUEREPLIT_API_KEY` in Site Inspector Secrets
- [ ] Generate webhook secret: `openssl rand -base64 32`
- [ ] Set `CONSOLEBLUEREPLIT_WEBHOOK_SECRET` in Site Inspector Secrets
- [ ] Restart Site Inspector

### Step 3: Agent Projects (BusinessBlueprint, HostsBlue, SwipesBlue, List It)

Repeat for each project:

- [ ] Copy `AGENTMAIL_API_KEY` from ConsoleBlue to project Secrets
- [ ] Copy `AGENTMAIL_WEBHOOK_SECRET` from ConsoleBlue to project Secrets
- [ ] Get `[ProjectName] - Production - Full Access` key from ConsoleBlue API Keys
- [ ] Set `CONSOLEBLUEREPLIT_API_KEY` in project Secrets
- [ ] Generate webhook secret: `openssl rand -base64 32`
- [ ] Set `CONSOLEBLUEREPLIT_WEBHOOK_SECRET` in project Secrets
- [ ] Restart project

---

## 🔄 What Gets Hardcoded Automatically

When ConsoleBlue runs, it **automatically hardcodes** these into project profiles:

### 1. Project Metadata (in database at startup)
- Project name, color, icon
- Standard API endpoint URLs
- Email inbox configuration
- Metadata API URL

### 2. Agent Connections (auto-created)
- Agent endpoint URL for each project
- Agent is marked as active
- Ready to receive conversations from ConsoleBlue

### 3. Email Configuration (auto-seeded)
- Site Inspector → isolated `siteinspector@agentmail.triadblue.com`
- 4 Agent Projects → shared `agents@agentmail.triadblue.com`
- Backend filtering ensures project isolation

### 4. API Keys (auto-generated)
- One key per project: `[ProjectName] - Production - Full Access`
- Used by projects to call ConsoleBlue API
- Full permissions: read/write tasks + conversations

---

## 🚀 Auto-Seeding Flow

When ConsoleBlue starts:

```
1. seedDefaultUser() - Create system user
2. seedTriadBlueProjects() - Create all 5 projects with hardcoded config
3. seedLocalPlatformBuilderAgent() - Create Platform Builder agent
4. seedSharedEmailInboxes() - Auto-configure email inboxes
5. seedDocumentationTemplates() - Pre-load documentation

Result: All projects auto-configured, ready to use
```

---

## 📋 Quick Reference

### ConsoleBlue Secrets (Required)
```bash
DASHBOARD_PASSWORD=your_password
AGENTMAIL_API_KEY=ak_live_xxxxx
AGENTMAIL_WEBHOOK_SECRET=whsec_xxxxx
SESSION_SECRET=$(openssl rand -base64 32)
DATABASE_URL=auto
AGENTMAIL_SITEINSPECTOR_INBOX_ID=uuid
AGENTMAIL_AGENTS_INBOX_ID=uuid
AGENTMAIL_ASSISTANTS_INBOX_ID=uuid
```

### Site Inspector Secrets (Required)
```bash
AGENTMAIL_API_KEY=[copy from ConsoleBlue]
AGENTMAIL_WEBHOOK_SECRET=[copy from ConsoleBlue]
CONSOLEBLUEREPLIT_API_KEY=[get from ConsoleBlue API Keys]
CONSOLEBLUEREPLIT_WEBHOOK_SECRET=$(openssl rand -base64 32)
```

### Agent Projects Secrets (Required)
```bash
AGENTMAIL_API_KEY=[copy from ConsoleBlue]
AGENTMAIL_WEBHOOK_SECRET=[copy from ConsoleBlue]
CONSOLEBLUEREPLIT_API_KEY=[get from ConsoleBlue API Keys - one per project]
CONSOLEBLUEREPLIT_WEBHOOK_SECRET=$(openssl rand -base64 32)
```

---

## 🔐 Security Notes

1. **Never commit secrets** - All values stored in Replit Secrets
2. **API Keys are unique per project** - Each project gets its own ConsoleBlue API key
3. **Webhook secrets are per-project** - Different secret for each project's webhooks
4. **AgentMail API Key is shared** - All projects use ConsoleBlue's AgentMail key (for cost efficiency)
5. **Email isolation is database-backed** - Shared inbox, project-level filtering in backend

---

## ❓ Troubleshooting

### API Key Not Working?
- Verify it matches the project name exactly (case-sensitive)
- Check permissions in ConsoleBlue API Keys page
- Regenerate if needed

### Emails Not Arriving?
- Verify inbox ID is correctly set in ConsoleBlue Email Settings
- Check that project uses correct email address (siteinspector@ or agents@)
- Confirm webhook secret matches in both systems

### Projects Not Seeding?
- Restart ConsoleBlue
- Check server logs for seed errors
- Verify database connection is working

---

**Last Updated:** 2025-11-26  
**Maintained by:** ConsoleBlue Development Team
