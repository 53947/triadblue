# Project Metadata Schema

This file defines all variables that must be populated when setting up a new project from these templates.

## Core Project Identity

```yaml
PROJECT_NAME: "BusinessBlueprint"  # Main project/product name
ECOSYSTEM_NAME: "TriadBlue"        # Parent ecosystem/company name
PRIMARY_DOMAIN: "businessblueprint.io"
TAGLINE: "AI-Powered Digital Intelligence Platform"
```

## Platform Roster

```yaml
PLATFORMS:
  - name: "BusinessBlueprint"
    domain: "businessblueprint.io"
    code: "BB"
    description: "AI-driven digital intelligence and marketing blueprint platform"
    
  - name: "HostsBlue"
    domain: "hostsblue.com"
    code: "HB"
    description: "Hosting, domains, and AI site builder services"
    
  - name: "SwipesBlue"
    domain: "swipesblue.com"
    code: "SB"
    description: "Payment gateway for all ecosystem products"
```

## Team Roles

```yaml
ROLES:
  - role: "Owner"
    name: "Dean"
    responsibilities: "Final approvals, business decisions, feature requests"
    authority: "Highest authority"
    
  - role: "Architect"
    name: "Rune"
    responsibilities: "Reviews PRs, validates standards, manages dependencies"
    authority: "Merge approval"
    
  - role: "Agent"
    name: "Axel"
    responsibilities: "Builds features, fixes bugs, deploys code"
    authority: "Implementation"
    
  - role: "Assistant"
    name: "Lumen"
    responsibilities: "Organizes docs, updates copy, maintains content"
    authority: "Content management"
```

## Workflow Configuration

```yaml
SYNC_TIMES:
  - "11:59 AM"  # Mid-day sync
  - "11:59 PM"  # End-of-day sync

GITHUB_REPO: "https://github.com/53947/The_Blue_Link"

DOCUMENTATION_UPDATE_FREQUENCY: "Twice daily"
```

## Brand Pack Reference

```yaml
BRAND_PACK_PATH: "docs/brand_pack/"  # Where brand-specific files live

# Required files in brand pack:
# - STANDARDS.md (design & branding standards)
# - _constants.md (colors, fonts, values)
# - logo_assets/ (actual logo files)
# - icon_assets/ (icon files)
```

## Optional Modules

```yaml
OPTIONAL_MODULES:
  prescription_system: true   # Include PRESCRIPTION_SYSTEM.md?
  pwa_support: false          # Include PWA documentation?
  synup_integration: false    # Include third-party integration docs?
  
# Set to true/false based on project needs
```

## Development Stack

```yaml
TECH_STACK:
  frontend: "React 18, TypeScript, Wouter, Tailwind CSS, Shadcn/ui"
  backend: "Node.js, Express.js, TypeScript"
  database: "PostgreSQL with Drizzle ORM"
  auth: "RS256 JWT"
  deployment: "Replit"
```

## Usage Notes

When setting up a new project dashboard:

1. **Copy this schema** and fill in actual values for your project
2. **Run template substitution** on all `*_TEMPLATE.md` files using these values
3. **Copy brand pack** (STANDARDS.md + _constants.md) to the specified path
4. **Enable optional modules** by including/excluding those documentation files
5. **Generate issue templates** using ISSUE_TEMPLATE_GUIDE.md instructions
