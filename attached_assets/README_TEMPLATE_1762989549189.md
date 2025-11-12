# 🌐 {{ECOSYSTEM_NAME}} Ecosystem  
### Unified Documentation, Architecture, and Brand Standards  

**Version:** 2.0  
**Last Updated:** {{CURRENT_DATE}}  

---

## 🧱 Overview

The **{{ECOSYSTEM_NAME}} Ecosystem** combines {{PLATFORM_COUNT}} modular platforms into one connected business infrastructure:  

| Platform | Domain | Description |
|-----------|---------|-------------|
{{#each PLATFORMS}}
| **{{name}}** | {{domain}} | {{description}} |
{{/each}}

> Each operates independently but shares **authentication (SSO)** and **payment processing**.

---

## 📘 Pre-Work Requirements

Before starting a task or editing any file:
1. **Review the following documents:**
   - [Collaboration Guide](replit.md)
   - [Brand Standards](docs/brand_pack/STANDARDS.md)
   - [System Constants](docs/brand_pack/_constants.md)
   - [Architecture Reference](docs/ARCHITECTURE.md)
2. Confirm your assigned Issue in GitHub.  
3. Post a check-in comment:  
   > "Checked constants and standards — ready to start task."

---

## 👥 Roles & Responsibilities

| Role | Description | Key Tasks |
|------|--------------|-----------|
{{#each ROLES}}
| **{{role}}** | {{responsibilities}} | {{authority}} |
{{/each}}

> **Rule:** No merges or edits outside assigned Issues. No one builds off the record.

---

## 🔁 Workflow

1. **Issue Created** → Task assigned  
2. **{{AGENT_NAME}} Builds** → Commit with Issue ID  
3. **{{ARCHITECT_NAME}} Reviews** → Approves merge  
4. **{{ASSISTANT_NAME}} Updates** → Docs, text, or content fixes  
5. **Main Branch** merges only through {{ARCHITECT_NAME}}

---

## ⚙️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Database migration
npm run db:push
```

---

## 🔄 GitHub Automation & Sync Rules  
**Applies to All Contributors — Non-Negotiable**

**📘 PURPOSE:**  
GitHub is the single source of truth for all *approved* documentation, task progress, and code activity.

**🔁 Sync Cadence:**  
- **{{SYNC_TIME_1}}** → Push active commits + update `STATUS_REPORT.md`  
- **{{SYNC_TIME_2}}** → Final sync + update all open Issues  

**✅ Must Be Versioned in GitHub**
- `/README.md` — Project overview and workflow policies  
- `/replit.md` — Collaboration standards  
- `/docs/ARCHITECTURE.md` — Technical system structure  
- `/docs/brand_pack/_constants.md` — Brand definitions  
- `/docs/brand_pack/STANDARDS.md` — Design specifications  

**🚫 Keep Private (Do Not Push)**
- `/docs/private_notes.md` — Internal issue logs  
- `/docs/secrets_config.md` — Credentials, deployment configs  
- Any `/notes/` or `/tmp/` folders  

**🧾 GitHub Issues Policy**
- Every commit must reference an Issue ID (`#24 – Description`)  
- No task may begin without an associated Issue  
- Close Issues only after documentation and testing are complete  

---

## 📂 Documentation Reference Map

| Document | Full Path | Purpose | When to Read |
|----------|-----------|---------|--------------|
| **README.md** | `/README.md` | Public-facing project summary | Before external communication |
| **replit.md** | `/replit.md` | Collaboration & governance rules | FIRST - Read before any work |
| **STANDARDS.md** | `/docs/brand_pack/STANDARDS.md` | Design & branding standards | Before ANY UI/design changes (read TWICE) |
| **_constants.md** | `/docs/brand_pack/_constants.md` | Brand constants (colors, fonts, values) | Before using any colors/fonts |
| **ARCHITECTURE.md** | `/docs/ARCHITECTURE.md` | Technical structure & system design | Before technical/structural changes |
| **STATUS_REPORT.md** | `/STATUS_REPORT.md` | Running operational log | Update {{UPDATE_FREQUENCY}} |

---

## 🚨 Critical Rules

1. **Never break existing features** without explicit approval
2. **Always reference GitHub Issues** in commits
3. **Update STATUS_REPORT.md {{UPDATE_FREQUENCY}}**
4. **Read standards documentation** before UI changes
5. **Discuss first** — never auto-fix
6. **Test before delivery** — verify changes work
7. **Document everything** — no undocumented changes

---

## 🔗 Links

- **GitHub Repository:** {{GITHUB_REPO}}
- **Live Site:** https://{{PRIMARY_DOMAIN}}
- **Tech Stack:** {{TECH_STACK}}

---

## 🔄 Version History

- **v2.0** ({{CURRENT_DATE}}) - Template-based documentation system
- **v1.0** - Initial project setup

---

**Remember:** This file governs **how we work together**. For **what we're building**, see the technical docs referenced above.
