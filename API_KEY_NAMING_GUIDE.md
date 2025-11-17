# ConsoleBlue API Key & Secret Naming Guide

**Purpose:** This document defines the EXACT names for all API keys and secrets used in ConsoleBlue. Follow these names precisely - no creativity allowed!

---

## 1️⃣ Replit Secrets (Environment Variables)

These are stored in Replit's Secrets tool and accessed as environment variables.

### Required Secrets

| Secret Name | Purpose | Example Value | Where to Get It |
|------------|---------|---------------|-----------------|
| `DASHBOARD_PASSWORD` | Password to log into ConsoleBlue dashboard | `MySecurePass123!` | You create this |
| `AGENTMAIL_API_KEY` | AgentMail service API key | `ak_live_xxxxx` | AgentMail Dashboard → Settings → API Keys |
| `AGENTMAIL_WEBHOOK_SECRET` | Verify AgentMail webhooks | `whsec_xxxxx` | AgentMail Dashboard → Webhooks → Signing Secret |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` | Auto-created by Replit Database |
| `SESSION_SECRET` | Encrypt user sessions | Any random 32+ char string | Generate with: `openssl rand -base64 32` |

### Optional Secrets

| Secret Name | Purpose | When Needed |
|------------|---------|-------------|
| `GITHUB_TOKEN` | Access GitHub API for commits/issues | If using GitHub integration |
| `OPENAI_API_KEY` | AI conversation analysis | Auto-provided by Replit AI Integration |

**❌ DO NOT CREATE:**
- `REPLIT_DB_URL` - Auto-created, never expose
- Custom creative names - stick to the table above

---

## 2️⃣ AgentMail Configuration

### Inbox Setup

Each TriadBlue project gets its own AgentMail inbox. Use these EXACT assistant names:

| Project | Assistant Name | Inbox Name in AgentMail |
|---------|---------------|-------------------------|
| BusinessBlueprint | `businessblueprint.assistant` | BusinessBlueprint |
| HostsBlue | `hostsblue.assistant` | HostsBlue |
| SwipesBlue | `swipesblue.assistant` | SwipesBlue |
| List It | `listit.assistant` | ListIt |
| ConsoleBlue | `consoleblue.assistant` | ConsoleBlue |

### Email Settings in ConsoleBlue

For each project in ConsoleBlue → Email Settings:

1. **Inbox ID:** Copy the exact UUID from AgentMail Dashboard
   - ❌ Wrong: `businessblueprint-inbox`
   - ✅ Correct: `550e8400-e29b-41d4-a716-446655440000` (from AgentMail)

2. **Agent Email:** Use the exact assistant name from the table above
   - ✅ Correct: `businessblueprint.assistant`

---

## 3️⃣ ConsoleBlue API Keys (for External Projects)

These are generated IN ConsoleBlue for external Replit projects to push tasks/conversations.

### Naming Convention

Format: `[ProjectName] - [Environment] - [Purpose]`

| Key Name Example | When to Use |
|-----------------|-------------|
| `BusinessBlueprint - Production - Full Access` | Live project with read/write tasks + conversations |
| `HostsBlue - Development - Tasks Only` | Dev environment, only task creation |
| `SwipesBlue - CI/CD - Read Only` | Automated testing, read-only access |

### Permissions Structure

**Standard Permission Sets:**

1. **Full Access** (recommended for production):
   - ✅ read_tasks
   - ✅ write_tasks
   - ✅ read_conversations
   - ✅ write_conversations

2. **Tasks Only** (for task-focused integrations):
   - ✅ read_tasks
   - ✅ write_tasks

3. **Read Only** (for monitoring/reporting):
   - ✅ read_tasks
   - ✅ read_conversations

**❌ DO NOT:**
- Mix creative names like "My Super Cool Key" 
- Use vague names like "API Key 1"
- Create keys without clear purpose labels

---

## 4️⃣ GitHub Integration

### Personal Access Token (PAT)

Store in Replit Secrets as: `GITHUB_TOKEN`

**Required Scopes:**
- `repo` (full control of private repositories)
- `read:user` (read user profile data)

**Token Name in GitHub:**
- Format: `ConsoleBlue - [YourName] - [Date]`
- Example: `ConsoleBlue - Jordan - 2025-11`

### Repository Configuration

In each Project Detail page → GitHub Integration:

| Field | Format | Example |
|-------|--------|---------|
| **Repository** | `owner/repo` | `triadblue/businessblueprint` |
| **Branch** | Branch name | `main` or `development` |

---

## 5️⃣ Quick Reference Checklist

### Setting Up a New Project

- [ ] Create project in ConsoleBlue
- [ ] Create AgentMail inbox with assistant name: `[projectname].assistant`
- [ ] Copy AgentMail Inbox ID to ConsoleBlue Email Settings
- [ ] Generate API key: `[ProjectName] - Production - Full Access`
- [ ] Add `GITHUB_TOKEN` to Replit Secrets (if using GitHub)
- [ ] Configure GitHub repo in Project Detail: `owner/repo`

### Required Replit Secrets

- [ ] `DASHBOARD_PASSWORD` is set
- [ ] `AGENTMAIL_API_KEY` is set
- [ ] `AGENTMAIL_WEBHOOK_SECRET` is set
- [ ] `DATABASE_URL` exists (auto-created)
- [ ] `SESSION_SECRET` is set

---

## 🚨 Common Mistakes to Avoid

1. **Using different assistant name formats**
   - ❌ `BusinessBlueprint.Assistant` (wrong case)
   - ✅ `businessblueprint.assistant` (all lowercase)

2. **Creating custom inbox IDs**
   - ❌ Making up your own UUID
   - ✅ Copy EXACT ID from AgentMail Dashboard

3. **Vague API key names**
   - ❌ "Test Key", "Key 123", "Temp"
   - ✅ "BusinessBlueprint - Production - Full Access"

4. **Mixing up secrets and API keys**
   - Secrets = Replit environment variables (AGENTMAIL_API_KEY)
   - API Keys = Generated in ConsoleBlue for external projects

---

## 📚 Where This Guide Lives

- **File:** `API_KEY_NAMING_GUIDE.md` (root directory)
- **Referenced in:** `replit.md` under "External Dependencies"
- **For Agents:** Always consult this guide before creating/naming keys

---

**Last Updated:** 2025-11-15  
**Maintained By:** ConsoleBlue Development Team
