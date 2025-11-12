# 🎛️ {{PROJECT_NAME}} System Constants (Single Source of Truth)

> This file defines every brand, color, typography, and structural constant for the {{PROJECT_NAME}} project.  
> All other documents reference this file. No color, font, or mapping values may be re-defined elsewhere.

---

## 1️⃣ Identity & Casing

- Brand name: **{{ECOSYSTEM_NAME}}**
- Products: {{#each PRODUCTS}}**{{this}}**{{#unless @last}}, {{/unless}}{{/each}}
- App labels and URLs: {{APP_CASING_RULE}}

---

## 2️⃣ Core Colors

| Token | Hex | Usage |
|---|---|---|
| **{{PROJECT_CODE}}.primary** | `{{PRIMARY_COLOR}}` | Core ecosystem color |
| **{{PROJECT_CODE}}.black** | `{{BRAND_BLACK}}` | Standard black (text, outlines) |
| **{{PROJECT_CODE}}.accent** | `{{ACCENT_COLOR}}` | Primary accent color |
{{#each ADDITIONAL_COLORS}}
| **{{name}}** | `{{hex}}` | {{usage}} |
{{/each}}

---

## 3️⃣ {{PROJECT_NAME}} Gradient

- **Direction:** {{GRADIENT_DIRECTION}}  
- **Stops:**
{{#each GRADIENT_STOPS}}
  - {{position}}: `{{color}}`
{{/each}}

---

## 4️⃣ App/Platform Colors

> Label format: {{APP_LABEL_FORMAT}}

| App | Base | Accent | Notes |
|------|------------------|------------------|-------|
{{#each APP_COLORS}}
| **{{app}}** | `{{base}}` | `{{accent}}` | {{notes}} |
{{/each}}

---

## 5️⃣ Typography & Shadows

| Element | Font | Size | Color | Shadow |
|----------|------|------|--------|---------|
{{#each TYPOGRAPHY}}
| {{element}} | {{font}} | {{size}} | `{{color}}` | {{shadow}} |
{{/each}}

---

## 6️⃣ Navigation Rules

{{#each NAVIGATION_RULES}}
- **{{key}}** → {{value}}
{{/each}}

---

## 7️⃣ White-Label Policy

- Never expose or reference external vendors in public materials.  
- Internal references use: **"Base Plan Provider"** or **"Platform API Source."**

---

## 8️⃣ Canonical Technical Rules

| Rule | Directive |
|------|------------|
| Routing | 🚫 Do **not** create `/assets/*` routes — reserved by Vite |
| .gitignore | Must exclude `.env`, `.env.*`, `node_modules/`; must **not** exclude `dist/` |
| Color order | {{COLOR_ORDER_RULE}} |
| Currency format | `$99/mo`, `$299/mo`, etc. |
| Apps | {{APP_URL_CASING}} in UI and URLs |

---

## 🔖 Version Control

- This file supersedes any conflicting values elsewhere.  
- Update this file **first**, then commit references.  
- **Last updated:** {{CURRENT_DATE}}
