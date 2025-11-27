# TriadBlue Secrets Setup Checklist
## Copy-Paste Ready Configuration for All Projects

---

## 🟢 Step 1: BlueLink (Central Hub)

### Replit Secrets to Add

```
DASHBOARD_PASSWORD = [your secure password]
AGENTMAIL_API_KEY = [from AgentMail Dashboard → Settings → API Keys]
AGENTMAIL_WEBHOOK_SECRET = [from AgentMail Dashboard → Webhooks → Signing Secret]
SESSION_SECRET = [run: openssl rand -base64 32]
AGENTMAIL_SITEINSPECTOR_INBOX_ID = [UUID from agentmail.triadblue.com]
AGENTMAIL_AGENTS_INBOX_ID = [UUID from agentmail.triadblue.com]
AGENTMAIL_ASSISTANTS_INBOX_ID = [UUID from agentmail.triadblue.com]
```

**Steps:**
1. Create 3 inboxes in AgentMail:
   - `siteinspector@agentmail.triadblue.com`
   - `agents@agentmail.triadblue.com`
   - `assistants@agentmail.triadblue.com`
2. For each inbox, copy the UUID shown in AgentMail Dashboard
3. Paste the 3 UUIDs into the env vars above
4. Restart BlueLink

### Auto-Generated (No Action Needed)

When BlueLink restarts, these are automatically created:
- ✅ 5 Projects auto-seeded
- ✅ Agent connections auto-configured
- ✅ Email inboxes auto-assigned
- ✅ API keys auto-generated (one per project)

**Access auto-generated API keys:**
- Go to BlueLink → API Keys → Project Keys
- Copy the key for each project below

---

## 🟢 Step 2: Site Inspector

### Replit Secrets to Add

```
AGENTMAIL_API_KEY = [COPY FROM BLUELINK]
AGENTMAIL_WEBHOOK_SECRET = [COPY FROM BLUELINK]
BLUELINKREPLIT_API_KEY = [GET FROM BLUELINK API KEYS PAGE]
BLUELINKREPLIT_WEBHOOK_SECRET = [run: openssl rand -base64 32]
```

**How to copy:**
1. Open BlueLink → Settings → Secrets (or use Replit Secrets tool)
2. Copy `AGENTMAIL_API_KEY` value
3. Paste into Site Inspector Replit Secrets as `AGENTMAIL_API_KEY`
4. Repeat for `AGENTMAIL_WEBHOOK_SECRET`
5. Open BlueLink → API Keys page
6. Find "Site Inspector - Production - Full Access"
7. Copy that API key value
8. Paste into Site Inspector as `BLUELINKREPLIT_API_KEY`
9. Generate and paste a new secret for `BLUELINKREPLIT_WEBHOOK_SECRET`

---

## 🟢 Step 3: BusinessBlueprint

### Replit Secrets to Add

```
AGENTMAIL_API_KEY = [COPY FROM BLUELINK]
AGENTMAIL_WEBHOOK_SECRET = [COPY FROM BLUELINK]
BLUELINKREPLIT_API_KEY = [GET FROM BLUELINK API KEYS PAGE]
BLUELINKREPLIT_WEBHOOK_SECRET = [run: openssl rand -base64 32]
```

**How to get:**
- Same as Site Inspector above, but use "BusinessBlueprint - Production - Full Access" key

---

## 🟢 Step 4: HostsBlue

### Replit Secrets to Add

```
AGENTMAIL_API_KEY = [COPY FROM BLUELINK]
AGENTMAIL_WEBHOOK_SECRET = [COPY FROM BLUELINK]
BLUELINKREPLIT_API_KEY = [GET FROM BLUELINK API KEYS PAGE]
BLUELINKREPLIT_WEBHOOK_SECRET = [run: openssl rand -base64 32]
```

**How to get:**
- Same as Site Inspector above, but use "HostsBlue - Production - Full Access" key

---

## 🟢 Step 5: SwipesBlue

### Replit Secrets to Add

```
AGENTMAIL_API_KEY = [COPY FROM BLUELINK]
AGENTMAIL_WEBHOOK_SECRET = [COPY FROM BLUELINK]
BLUELINKREPLIT_API_KEY = [GET FROM BLUELINK API KEYS PAGE]
BLUELINKREPLIT_WEBHOOK_SECRET = [run: openssl rand -base64 32]
```

**How to get:**
- Same as Site Inspector above, but use "SwipesBlue - Production - Full Access" key

---

## 🟢 Step 6: List It

### Replit Secrets to Add

```
AGENTMAIL_API_KEY = [COPY FROM BLUELINK]
AGENTMAIL_WEBHOOK_SECRET = [COPY FROM BLUELINK]
BLUELINKREPLIT_API_KEY = [GET FROM BLUELINK API KEYS PAGE]
BLUELINKREPLIT_WEBHOOK_SECRET = [run: openssl rand -base64 32]
```

**How to get:**
- Same as Site Inspector above, but use "List It - Production - Full Access" key

---

## 📋 Quick Summary Table

| Env Var | BlueLink | Site Inspector | BusinessBlueprint | HostsBlue | SwipesBlue | List It |
|---------|------------|---------------|-----------------|---------|-----------|----|
| AGENTMAIL_API_KEY | ✅ Set | Copy from BL | Copy from BL | Copy from BL | Copy from BL | Copy from BL |
| AGENTMAIL_WEBHOOK_SECRET | ✅ Set | Copy from BL | Copy from BL | Copy from BL | Copy from BL | Copy from BL |
| AGENTMAIL_SITEINSPECTOR_INBOX_ID | ✅ Set | — | — | — | — | — |
| AGENTMAIL_AGENTS_INBOX_ID | ✅ Set | — | — | — | — | — |
| AGENTMAIL_ASSISTANTS_INBOX_ID | ✅ Set | — | — | — | — | — |
| BLUELINKREPLIT_API_KEY | — | Get from BL | Get from BL | Get from BL | Get from BL | Get from BL |
| BLUELINKREPLIT_WEBHOOK_SECRET | — | ✅ Generate | ✅ Generate | ✅ Generate | ✅ Generate | ✅ Generate |
| SESSION_SECRET | ✅ Generate | — | — | — | — | — |
| DASHBOARD_PASSWORD | ✅ Set | — | — | — | — | — |

---

## 🔄 What Gets Hardcoded Automatically

When BlueLink starts with the secrets above, it **auto-hardcodes**:

### Email Inbox Configuration
- ✅ Site Inspector → `siteinspector@agentmail.triadblue.com` (isolated)
- ✅ BusinessBlueprint → `agents@agentmail.triadblue.com` (shared)
- ✅ HostsBlue → `agents@agentmail.triadblue.com` (shared)
- ✅ SwipesBlue → `agents@agentmail.triadblue.com` (shared)
- ✅ List It → `agents@agentmail.triadblue.com` (shared)

### API Endpoints (Pre-configured)
- ✅ Agent API URLs for each project
- ✅ Metadata API URLs for each project
- ✅ Webhook receiver endpoints

### Agent Connections
- ✅ Platform Builder agent (for direct chat)
- ✅ One agent per project (for project communication)

### API Keys
- ✅ One API key auto-generated per project
- ✅ Names: `[ProjectName] - Production - Full Access`
- ✅ Location: ConsoleBlue → API Keys → Project Keys

---

## ✅ Complete Verification Checklist

After setting all secrets:

- [ ] BlueLink starts without errors
- [ ] Go to Projects page - see all 5 projects with colors/icons
- [ ] Go to Email Settings - see inbox assignments:
  - Site Inspector → `siteinspector@`
  - Others → `agents@`
- [ ] Go to API Keys - see 5 auto-generated keys with project names
- [ ] Go to Agent Chat - select Platform Builder, type "help"
- [ ] Start Site Inspector project
- [ ] Verify its secrets are set
- [ ] Go to BlueLink → Projects → Site Inspector → Details
- [ ] Verify agent connection shows "Online"

---

## 🚨 Troubleshooting

**Projects not showing?**
- Restart BlueLink
- Check server logs for seed errors

**Emails not configured?**
- Verify inbox IDs are set (not empty strings)
- Check that inbox addresses match what you created in AgentMail

**API Key not working?**
- Verify it matches the project name exactly
- Check that permissions include the needed actions
- Regenerate if unsure

---

## 📖 For More Details

See: `TRIADBLUE_PROJECT_SETUP_GUIDE.md` for full explanation of each config

Last Updated: 2025-11-27
