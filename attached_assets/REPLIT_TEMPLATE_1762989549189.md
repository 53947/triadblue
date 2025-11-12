# {{ECOSYSTEM_NAME}} Replit Workspace – Collaboration & Governance Rules

**Version 2.0 — {{CURRENT_DATE}}**

---

## 📘 Purpose

This document defines **how the team works together** in the Replit environment. It establishes behavioral rules, approval workflows, and documentation standards for all contributors.

For **technical architecture**, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)  
For **design standards**, see [`docs/brand_pack/STANDARDS.md`](docs/brand_pack/STANDARDS.md)  
For **brand constants**, see [`docs/brand_pack/_constants.md`](docs/brand_pack/_constants.md)

---

## 🔁 Core Workflow Rules

### Discuss First — Never Auto-Change
- **DO NOT** make changes to existing features without explicit approval
- When user points something out → **DISCUSS FIRST** (do not automatically fix)
- Only implement changes when user **explicitly requests** them
- Reliability and consistency are critical
- Changes only happen when discussed and approved

### Explicit Approval Required
- No feature edits outside assigned GitHub Issues
- No merges or code changes "off the record"
- Every commit must reference an Issue ID (e.g., `#24 – Fix login flow`)

### Reliability > Creativity
- Existing functionality must not break
- New features must be tested before delivery
- User-facing changes require explicit sign-off

---

## 👥 Team Roles & Responsibilities

| Role | Responsibilities | Authority |
|------|------------------|-----------|
{{#each ROLES}}
| **{{role}} ({{name}})** | {{responsibilities}} | {{authority}} |
{{/each}}

**Rule:** No one builds or merges without an assigned GitHub Issue.

---

## 📝 Documentation Standards

### {{UPDATE_FREQUENCY}} STATUS_REPORT.md Updates (MANDATORY)
- **{{SYNC_TIME_1}}** → Push active commits + update STATUS_REPORT.md
- **{{SYNC_TIME_2}}** → Final sync + update all open Issues

### GitHub Issues Policy
- Every commit must reference an Issue ID
- No task may begin without an associated Issue
- Close Issues only after documentation and testing are complete

### File Update Requirements
When making changes, update:
1. **STATUS_REPORT.md** - Log what was done
2. **GitHub Issue** - Mark progress
3. **ARCHITECTURE.md** (if technical structure changes)
4. **STANDARDS.md** (if design standards change)

---

## 🎨 Design & Branding Rules

### Read Standards TWICE Before UI Changes
Before making any UI/branding changes:
1. Read [`docs/brand_pack/STANDARDS.md`](docs/brand_pack/STANDARDS.md) **twice**
2. Reference [`docs/brand_pack/_constants.md`](docs/brand_pack/_constants.md) for all color/font values
3. Verify navigation structure matches standards

### Navigation Structure (CRITICAL - NO CHANGES WITHOUT OWNER APPROVAL)
**⚠️ IMPORTANT:** The navigation menu structure is defined in `docs/brand_pack/STANDARDS.md`. Do NOT modify without explicit approval from {{OWNER_NAME}} (Owner).

### Logo & Typography Rules
- Logo specifications defined in STANDARDS.md
- All colors and fonts defined in _constants.md
- Never use arbitrary colors or fonts
- See brand pack for canonical values

---

## 🔐 Communication Style

### User Preferences
- Use **simple, everyday language** (no technical jargon)
- Explain changes clearly before implementing
- Ask for approval when uncertain
- Be direct and concise

### When to Ask vs. Execute
**Ask first:**
- Feature changes or removals
- Design/UI modifications
- Database schema changes
- Route/navigation changes

**Execute directly:**
- Bug fixes (non-breaking)
- Performance improvements
- Code cleanup (no behavior change)
- Documentation updates

---

## ⚙️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database migration
npm run db:push
```

---

## 📂 Documentation Reference Map

**⚠️ ALL DOCUMENTS BELOW ARE REQUIRED READING BEFORE MAKING ANY CHANGES**

| Document | Full Path | Purpose | When to Read |
|----------|-----------|---------|--------------|
| **README.md** | `/README.md` | Public-facing project summary | Before external communication |
| **replit.md** | `/replit.md` | **THIS FILE** — Behavioral & governance rules | FIRST - Read before any work |
| **STANDARDS.md** | `/docs/brand_pack/STANDARDS.md` | Design & branding standards | Before ANY UI/design changes (read TWICE) |
| **_constants.md** | `/docs/brand_pack/_constants.md` | Brand constants (colors, fonts, values) | Before using any colors/fonts |
| **ARCHITECTURE.md** | `/docs/ARCHITECTURE.md` | Technical structure & system design | Before technical/structural changes |
| **STATUS_REPORT.md** | `/STATUS_REPORT.md` | Running operational log | Update {{UPDATE_FREQUENCY}} ({{SYNC_TIME_1}}/{{SYNC_TIME_2}}) |

**No excuses — these paths are explicit. Read the relevant docs before proceeding.**

---

## 🚨 Critical Rules

1. **Never break existing features** without explicit approval
2. **Always reference GitHub Issues** in commits
3. **Update STATUS_REPORT.md {{UPDATE_FREQUENCY}}** ({{SYNC_TIME_1}} / {{SYNC_TIME_2}})
4. **Read standards documentation** before UI changes
5. **Discuss first** — never auto-fix
6. **Test before delivery** — verify changes work
7. **Document everything** — no undocumented changes

---

## 🔄 Version History

- **v2.0** ({{CURRENT_DATE}}) - Reorganized into behavioral/governance focus
- **v1.0** - Initial combined documentation

---

**Remember:** This file governs **how we work together**. For **what we're building**, see the technical docs referenced above.
