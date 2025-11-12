# {{PROJECT_NAME}} Standards & Design System  
**Version 2.0 — {{CURRENT_DATE}}**

---

## 📘 Overview
All {{PROJECT_NAME}} brands share one visual and interaction system.  
No developer may deviate from these rules without explicit approval.

---

## 🎨 Branding
Refer to `_constants.md` for canonical colors and typography.

### Official Logo
- **Main Header Logo:** {{LOGO_FILE}}
  - {{LOGO_DESCRIPTION}}
  - Used in navigation header and all main branding
- **Favicon:** {{FAVICON_FILE}}
- **Location:** {{LOGO_LOCATION}}
- **Implementation:** See `{{LOGO_COMPONENT_PATH}}`

### Typography
{{TYPOGRAPHY_RULES}}

**Gradient:** {{GRADIENT_DEFINITION}}  
**Black:** {{BRAND_BLACK}}  

---

## 🗂️ Navigation

### Main Header (OFFICIAL STANDARD - NO CHANGES WITHOUT OWNER APPROVAL)
**⚠️ As of {{CURRENT_DATE}}, this is the UNCHANGEABLE navigation structure:**

{{#each NAVIGATION_SECTIONS}}
{{@index}}. **{{name}}** - {{description}}
{{/each}}

**Plus:** Login button (far right)

### {{PROJECT_NAME}} Apps
{{APP_NAMING_CONVENTION}}

---

## 🧩 Icons and Imagery
- Vector SVG only (no raster text images)  
- Standard stroke weights across brands  
- Consistent shadow direction ({{SHADOW_DIRECTION}})  
- Approved iconography: {{APPROVED_ICONS}}

### Official Brand Icons (LOCKED - DO NOT CHANGE)
**⚠️ These brand icons are the official visual identity:**

{{#each BRAND_ICONS}}
{{@index}}. **{{name}}** - {{description}}
{{/each}}

**Implementation:** {{BRAND_ICONS_PATH}}

**Usage Rules:**
- Import from {{BRAND_ICONS_IMPORT_PATH}}
- Default size: {{BRAND_ICONS_DEFAULT_SIZE}}
- Can add custom className for positioning/spacing
- Icons are SVG React components for sharp rendering at any size
- Do NOT modify SVG paths without owner approval

---

## 🧠 Terminology
{{#each TERMINOLOGY}}
- "{{term}}" refers to {{definition}}  
{{/each}}

---

## ⚙️ Technical
- No `/assets/*` custom routes.  
- `.gitignore` must retain `dist`.  
- All constants import from `_constants.md`.  
- Update STATUS_REPORT.md {{UPDATE_FREQUENCY}}.  

---

## 📎 File Reference
- `_constants.md` → Visual system  
- `../ARCHITECTURE.md` → Platform structure  
- `../replit.md` → Workflow rules  
