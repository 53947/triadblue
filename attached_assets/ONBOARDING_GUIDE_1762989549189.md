# New Agent Onboarding Guide

## Purpose

This guide explains how to use the template system to set up documentation for new projects in your dashboard.

---

## Quick Start (5 Steps)

### 1. Fill Out Project Metadata

Copy `PROJECT_METADATA_SCHEMA.md` and fill in all variables for your new project:
- Project name, domain, tagline
- Platform roster (if multi-platform)
- Team roles and names
- Sync times and workflow rules
- Brand pack location

### 2. Run Template Substitution

Replace all `{{VARIABLES}}` in the template files:

```bash
# Example using sed (or your dashboard's templating engine)
sed 's/{{PROJECT_NAME}}/YourProject/g' README_TEMPLATE.md > README.md
sed 's/{{ECOSYSTEM_NAME}}/YourEcosystem/g' REPLIT_TEMPLATE.md > replit.md
# ... repeat for all templates
```

### 3. Set Up Brand Pack

Create your brand-specific files:

```
docs/brand_pack/
├── STANDARDS.md          # Design & branding standards
├── _constants.md         # Brand constants (colors, fonts)
├── logo_assets/         # Logo files
└── icon_assets/         # Icon files
```

Use `STANDARDS_TEMPLATE.md` and `CONSTANTS_TEMPLATE.md` as starting points.

### 4. Include Optional Modules

Based on your project needs, include/exclude optional documentation:

**Always Include:**
- README.md (project overview)
- replit.md (collaboration & governance)
- ARCHITECTURE.md (technical structure)
- STATUS_REPORT.md (operational log)
- Brand pack (STANDARDS.md + _constants.md)

**Include If Needed:**
- PRESCRIPTION_SYSTEM.md (if project has AI prescription logic)
- PWA_GUIDE.md (if building Progressive Web Apps)
- INTEGRATION_GUIDES/ (for third-party API integrations)

### 5. Generate Issue Templates

Follow `ISSUE_TEMPLATE_GUIDE.md` to create platform-specific issue templates in `.github/ISSUE_TEMPLATE/`

---

## File Hierarchy Explained

### Universal Governance (Required for All Projects)

**README_TEMPLATE.md** → **README.md**
- Public-facing project summary
- Team roles & responsibilities
- High-level workflow
- GitHub sync rules

**REPLIT_TEMPLATE.md** → **replit.md**
- Behavioral rules ("Discuss First", explicit approval)
- Twice-daily sync mandate
- Documentation update requirements
- Communication policy

**ARCHITECTURE_TEMPLATE.md** → **ARCHITECTURE.md**
- Platform breakdown (if multi-platform)
- Technical stack
- Database architecture
- Deployment strategy
- Authentication approach (SSO, JWT, etc.)

**STATUS_REPORT_TEMPLATE.md** → **STATUS_REPORT.md**
- Rolling operational log
- Recent updates section (populated as work happens)
- Archive old entries to dated history files

### Brand-Specific Content (Project-Dependent)

**STANDARDS_TEMPLATE.md** → **docs/brand_pack/STANDARDS.md**
- Logo specifications
- Typography rules
- Icon assignments
- Navigation structure
- Terminology standards

**CONSTANTS_TEMPLATE.md** → **docs/brand_pack/_constants.md**
- Color hex codes
- Font families
- Gradient definitions
- App/platform color mappings
- Technical routing rules

### Optional Knowledge Modules

**PRESCRIPTION_SYSTEM.md** (include only if applicable)
- Domain-specific to projects with AI prescription logic
- Documents recommendation algorithms
- Not needed for standard CRUD apps

**PWA_GUIDE.md** (include if building mobile apps)
- Progressive Web App setup
- Service workers, manifests, offline support

---

## Template Variable Reference

### Core Variables (Used in All Templates)

| Variable | Example | Where Used |
|----------|---------|------------|
| `{{PROJECT_NAME}}` | "BusinessBlueprint" | All templates |
| `{{ECOSYSTEM_NAME}}` | "TriadBlue" | README, replit |
| `{{PRIMARY_DOMAIN}}` | "businessblueprint.io" | README, ARCHITECTURE |
| `{{TAGLINE}}` | "AI-Powered Platform" | README |
| `{{GITHUB_REPO}}` | "github.com/user/repo" | README, replit |

### Platform Variables (Multi-Platform Projects)

| Variable | Example | Where Used |
|----------|---------|------------|
| `{{PLATFORM_1_NAME}}` | "BusinessBlueprint" | ARCHITECTURE |
| `{{PLATFORM_1_CODE}}` | "BB" | Issue templates |
| `{{PLATFORM_2_NAME}}` | "HostsBlue" | ARCHITECTURE |
| `{{PLATFORM_2_CODE}}` | "HB" | Issue templates |

### Team Variables

| Variable | Example | Where Used |
|----------|---------|------------|
| `{{OWNER_NAME}}` | "Dean" | README, replit |
| `{{ARCHITECT_NAME}}` | "Rune" | README, replit |
| `{{AGENT_NAME}}` | "Axel" | README |
| `{{ASSISTANT_NAME}}` | "Lumen" | README |

### Workflow Variables

| Variable | Example | Where Used |
|----------|---------|------------|
| `{{SYNC_TIME_1}}` | "11:59 AM" | replit, README |
| `{{SYNC_TIME_2}}` | "11:59 PM" | replit, README |
| `{{UPDATE_FREQUENCY}}` | "Twice daily" | replit |

### Brand Variables

| Variable | Example | Where Used |
|----------|---------|------------|
| `{{PRIMARY_COLOR}}` | "#0000FF" | _constants |
| `{{ACCENT_COLOR}}` | "#FF6B00" | _constants |
| `{{BRAND_BLACK}}` | "#09080E" | _constants |
| `{{LOGO_PATH}}` | "@assets/logo.png" | STANDARDS |

---

## Consolidation Strategy (Reducing Redundancy)

The architect identified redundancies between documents. Here's how to consolidate:

### Sync Rules (Twice-Daily Updates)

**Primary Source:** `replit.md` (Section: "Twice-Daily STATUS_REPORT.md Updates")

**References in Other Files:**
- README.md: Link to replit.md → "See [Collaboration Guide](replit.md) for sync requirements"
- ARCHITECTURE.md: Omit sync rules entirely

**Result:** One source of truth, no conflicting information

### Navigation Structure

**Primary Source:** `brand_pack/STANDARDS.md` (Section: "Navigation")

**References in Other Files:**
- replit.md: Link to STANDARDS.md → "Navigation defined in [STANDARDS.md](docs/brand_pack/STANDARDS.md)"
- README.md: High-level mention only, no details

**Result:** Brand-specific navigation lives in brand pack, not governance docs

### Approval Workflow (Discuss First, No Auto-Changes)

**Primary Source:** `replit.md` (Section: "Core Workflow Rules")

**References in Other Files:**
- README.md: Summary only, link to replit.md for details

**Result:** Workflow rules centralized in replit.md

---

## Dashboard Integration Tips

### For Dashboard Developers

**Recommended Approach:**

1. **Store templates** in your dashboard's template library
2. **Create project setup wizard** that collects metadata
3. **Run substitution automatically** when new project is created
4. **Version control generated docs** in the project repo
5. **Provide editing interface** for STATUS_REPORT.md updates

**Template Engine Suggestions:**

- Mustache/Handlebars for `{{variable}}` substitution
- YAML front matter for metadata storage
- Markdown rendering for display in dashboard

**Example Workflow:**

```
User creates new project in dashboard
  ↓
Dashboard prompts for metadata (project name, platforms, team, etc.)
  ↓
Dashboard runs template substitution
  ↓
Generated docs committed to project repo
  ↓
Dashboard displays rendered docs in project overview
  ↓
Agents read docs when assigned to project
```

---

## Common Pitfalls

### ❌ Don't Mix Brand and Governance

**Wrong:** Putting TriadBlue color codes in replit.md

**Right:** Colors go in `brand_pack/_constants.md`, replit.md stays brand-neutral

### ❌ Don't Duplicate Policies

**Wrong:** Repeating "twice-daily sync" rule in README, replit.md, and ARCHITECTURE.md

**Right:** Define in replit.md, reference from other files

### ❌ Don't Include Optional Modules Everywhere

**Wrong:** Every project gets PRESCRIPTION_SYSTEM.md even if it doesn't use prescriptions

**Right:** Check metadata schema → include only if `prescription_system: true`

### ❌ Don't Hardcode Project Names in Templates

**Wrong:** Leaving "TriadBlue" in REPLIT_TEMPLATE.md

**Right:** Replace with `{{ECOSYSTEM_NAME}}` variable

---

## Validation Checklist

Before deploying a new project's documentation:

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Brand pack created with project-specific assets
- [ ] Optional modules included/excluded based on needs
- [ ] No redundant policies across multiple files
- [ ] Links between documents work correctly
- [ ] Issue templates generated for all platforms
- [ ] GitHub repo URL updated in all relevant files
- [ ] Team member names updated in roles section
- [ ] Sync times configured to match team's schedule

---

## Support

If you encounter issues with the template system:

1. Review `PROJECT_METADATA_SCHEMA.md` for missing variables
2. Check `ISSUE_TEMPLATE_GUIDE.md` for GitHub template generation
3. Refer to `STANDARDS_TEMPLATE.md` and `CONSTANTS_TEMPLATE.md` for brand pack structure
4. Consult original TriadBlue docs as reference implementation

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Author:** Architect (Rune)
