# Documentation Template System
**Created by: Architect (Rune)**  
**Version:** 1.0  
**Date:** November 2025

---

## 📦 What's in This Folder

This folder contains **generalized documentation templates** extracted from the TriadBlue/BusinessBlueprint project, ready for use in a multi-project dashboard system.

---

## 📂 Files Included

### 1. Core Templates (Use These for Every Project)

| File | Purpose | Output File |
|------|---------|-------------|
| **README_TEMPLATE.md** | Public-facing project overview | `README.md` |
| **REPLIT_TEMPLATE.md** | Collaboration & governance rules | `replit.md` |
| **ARCHITECTURE_TEMPLATE.md** | Technical structure & system design | `docs/ARCHITECTURE.md` |
| **STATUS_REPORT_TEMPLATE.md** | Running operational log | `STATUS_REPORT.md` |

### 2. Brand Pack Templates (Project-Specific)

| File | Purpose | Output File |
|------|---------|-------------|
| **STANDARDS_TEMPLATE.md** | Design & branding standards | `docs/brand_pack/STANDARDS.md` |
| **CONSTANTS_TEMPLATE.md** | Brand constants (colors, fonts) | `docs/brand_pack/_constants.md` |

### 3. Setup & Documentation

| File | Purpose |
|------|---------|
| **PROJECT_METADATA_SCHEMA.md** | Defines all variables to populate |
| **ONBOARDING_GUIDE.md** | How to use these templates |
| **ISSUE_TEMPLATE_GUIDE.md** | How to generate GitHub issue templates |
| **README.md** (this file) | Overview of template system |

---

## 🚀 Quick Start

### For Dashboard Developers

**To set up a new project:**

1. **Read** `ONBOARDING_GUIDE.md` (comprehensive instructions)
2. **Fill out** `PROJECT_METADATA_SCHEMA.md` with your project's details
3. **Run template substitution** to replace `{{VARIABLES}}` with actual values
4. **Create brand pack** using STANDARDS_TEMPLATE and CONSTANTS_TEMPLATE
5. **Generate issue templates** following ISSUE_TEMPLATE_GUIDE
6. **Commit** generated docs to project repo

### For Project Owners

**Share these files with your agent:**

When onboarding a new agent to your project, give them:
1. Generated `README.md` (project overview)
2. Generated `replit.md` (how to work on this project)
3. Generated `docs/ARCHITECTURE.md` (technical structure)
4. Generated `docs/brand_pack/STANDARDS.md` (design rules)
5. Generated `docs/brand_pack/_constants.md` (brand constants)
6. Live `STATUS_REPORT.md` (what's been done)

---

## 🎯 Key Design Principles

### Separation of Concerns

**Universal Governance** (same across all projects):
- Workflow rules (Discuss First, Explicit Approval)
- Sync cadence (twice-daily updates)
- GitHub issue policy
- Team roles & responsibilities

**Project-Specific Content** (unique per project):
- Brand colors, logos, fonts
- Platform roster (if multi-platform)
- Navigation structure
- Product-specific features

### Template Variables

All templates use `{{VARIABLE}}` syntax:

**Examples:**
- `{{PROJECT_NAME}}` → "BusinessBlueprint"
- `{{ECOSYSTEM_NAME}}` → "TriadBlue"
- `{{PRIMARY_COLOR}}` → "#0000FF"
- `{{OWNER_NAME}}` → "Dean"

**Your dashboard should:**
1. Collect these values when creating a new project
2. Replace all variables in templates
3. Output final documentation files

### Consolidation (No Redundancy)

Original TriadBlue docs had redundant policies (sync rules repeated in 3+ files).

**Templates fix this:**
- Sync rules defined ONCE in `REPLIT_TEMPLATE.md`
- Other files reference replit.md instead of duplicating
- Single source of truth prevents conflicting information

---

## 📋 Variable Reference

### Core Variables (Used in All Templates)

```yaml
# Identity
PROJECT_NAME: "BusinessBlueprint"
ECOSYSTEM_NAME: "TriadBlue"
PRIMARY_DOMAIN: "businessblueprint.io"
TAGLINE: "AI-Powered Digital Intelligence Platform"
GITHUB_REPO: "https://github.com/user/repo"

# Dates
CURRENT_DATE: "November 12, 2025"
CURRENT_TIME: "10:50 PM"

# Team
OWNER_NAME: "Dean"
ARCHITECT_NAME: "Rune"
AGENT_NAME: "Axel"
ASSISTANT_NAME: "Lumen"

# Workflow
SYNC_TIME_1: "11:59 AM"
SYNC_TIME_2: "11:59 PM"
UPDATE_FREQUENCY: "Twice daily"

# Tech Stack
TECH_STACK: "React 18, TypeScript, Node.js, PostgreSQL"
FRONTEND_STACK: "React 18, TypeScript, Wouter, Tailwind CSS"
BACKEND_STACK: "Node.js, Express.js, TypeScript"
DATABASE_STACK: "PostgreSQL with Drizzle ORM"
DEPLOYMENT_PLATFORM: "Replit"
```

### Platform Variables (Multi-Platform Projects)

```yaml
PLATFORMS:
  - name: "BusinessBlueprint"
    code: "BB"
    domain: "businessblueprint.io"
    description: "AI-driven digital intelligence platform"
    status: "~65% complete, production ready"
    
  - name: "HostsBlue"
    code: "HB"
    domain: "hostsblue.com"
    description: "Hosting, domains, and AI site builder"
    status: "~5% complete"
```

### Brand Variables (Brand Pack)

```yaml
# Colors
PRIMARY_COLOR: "#0000FF"
ACCENT_COLOR: "#FF6B00"
BRAND_BLACK: "#09080E"

# Typography
TYPOGRAPHY_RULES: "Archivo family, 24pt, 2pt blur..."
GRADIENT_DEFINITION: "315° (EEFBFF → 6EA6FF → 0000FF)"

# Assets
LOGO_FILE: "BBlueprint Main Header Logo_1762489845362.png"
FAVICON_FILE: "Blueprint_Favicon_1762489845363.png"
LOGO_LOCATION: "attached_assets/"
```

---

## 🔄 What Changed from TriadBlue Docs

### Removed (Project-Specific Content)

- Hardcoded "TriadBlue" everywhere → Replaced with `{{ECOSYSTEM_NAME}}`
- Hardcoded "#0000FF" blue → Replaced with `{{PRIMARY_COLOR}}`
- Specific platform names → Replaced with `{{PLATFORMS[]}}` array
- Team member names → Replaced with `{{OWNER_NAME}}`, etc.
- Navigation menus → Moved to brand pack (project-specific)

### Consolidated (Redundancies)

- Sync rules → Single source in REPLIT_TEMPLATE
- GitHub policy → Single source in README_TEMPLATE
- Navigation → Single source in STANDARDS_TEMPLATE (brand pack)

### Modularized (Optional Content)

- PRESCRIPTION_SYSTEM.md → Optional module (only for projects with prescription logic)
- PWA features → Optional module (only for projects building mobile apps)
- Third-party integrations → Optional modules (Synup, Vendasta, etc.)

---

## 🎨 Brand Pack Concept

**What is a Brand Pack?**

A brand pack contains all visual/design standards for a specific project:

```
docs/brand_pack/
├── STANDARDS.md          # Design system (navigation, logos, icons)
├── _constants.md         # Brand constants (colors, fonts, gradients)
├── logo_assets/         # Actual logo image files
└── icon_assets/         # Icon image files
```

**Why separate from governance docs?**

- **Governance** (README, replit, ARCHITECTURE) = universal workflow rules
- **Brand Pack** = project-specific visuals
- Clean separation means you can swap brand packs without touching governance

**Example:**

Same governance rules, different brand packs:
- TriadBlue project → Blue/orange branding
- GreenTech project → Green/white branding
- FinanceApp project → Purple/gold branding

---

## 📚 Documentation Hierarchy

```
Project Root
├── README.md                    [From README_TEMPLATE]
├── replit.md                    [From REPLIT_TEMPLATE]
├── STATUS_REPORT.md             [From STATUS_REPORT_TEMPLATE]
├── docs/
│   ├── ARCHITECTURE.md          [From ARCHITECTURE_TEMPLATE]
│   └── brand_pack/
│       ├── STANDARDS.md         [From STANDARDS_TEMPLATE]
│       ├── _constants.md        [From CONSTANTS_TEMPLATE]
│       ├── logo_assets/
│       └── icon_assets/
└── .github/
    └── ISSUE_TEMPLATE/
        ├── platform1-task.md    [Generated per ISSUE_TEMPLATE_GUIDE]
        ├── platform2-task.md
        ├── bug-report.md
        └── feature-request.md
```

---

## ⚠️ Important Notes

### DO NOT Edit Templates Directly

Templates in this folder are the **master copies**.

**Correct workflow:**
1. Copy template to new project
2. Run variable substitution
3. Edit generated file if needed
4. Leave template unchanged

**Why?** Templates should stay generic for reuse across projects.

### Variables Must Match Schema

All `{{VARIABLES}}` in templates must be defined in `PROJECT_METADATA_SCHEMA.md`.

**If you add a new variable:**
1. Add to PROJECT_METADATA_SCHEMA.md first
2. Then use in templates
3. Update ONBOARDING_GUIDE.md with new variable

### Test Generated Docs

After generating documentation for a new project:

- [ ] All variables replaced (no `{{}}` left)
- [ ] Links between docs work
- [ ] Brand pack created with actual assets
- [ ] GitHub issue templates generated
- [ ] Test creating an issue on GitHub
- [ ] Agent can successfully read and understand docs

---

## 🤝 Contributing

If you improve these templates:

1. **Test improvements** on a real project first
2. **Update relevant guides** (ONBOARDING_GUIDE, ISSUE_TEMPLATE_GUIDE)
3. **Document new variables** in PROJECT_METADATA_SCHEMA
4. **Keep templates generic** (no project-specific content)

---

## 📞 Support

For questions about using this template system:

1. Read `ONBOARDING_GUIDE.md` thoroughly
2. Check `PROJECT_METADATA_SCHEMA.md` for variable definitions
3. Review example TriadBlue docs in parent directory
4. Consult ISSUE_TEMPLATE_GUIDE for GitHub setup

---

## 🔖 Version History

- **v1.0** (November 2025) - Initial template system extracted from TriadBlue project

---

**Summary:** This folder contains everything needed to set up professional, consistent documentation for new projects. Start with ONBOARDING_GUIDE.md for detailed instructions.
