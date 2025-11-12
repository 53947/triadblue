# GitHub Issue Template Generation Guide

## Purpose

This guide explains how to generate platform-specific issue templates for your project based on the platforms defined in your project metadata.

---

## Template Structure

GitHub issue templates live in `.github/ISSUE_TEMPLATE/` and use YAML front matter.

**Standard Structure:**

```yaml
---
name: Platform Name Task
about: Task for Platform Name (domain.com) platform
title: '[CODE] '
labels: 'platform-label, enhancement'
assignees: ''
---

## Platform
Platform Name (domain.com)

## Description
<!-- Clear description of what needs to be built/fixed -->

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Technical Notes
<!-- Any technical details, dependencies, or considerations -->

## Priority
<!-- High / Medium / Low -->

## Related Features
<!-- Link to related issues or features -->
```

---

## Generation Process

### Step 1: Extract Platform Data

From your `PROJECT_METADATA_SCHEMA.md`, extract:

```yaml
PLATFORMS:
  - name: "BusinessBlueprint"
    code: "BB"
    domain: "businessblueprint.io"
    labels: ["business-blueprint", "enhancement"]
    
  - name: "HostsBlue"
    code: "HB"
    domain: "hostsblue.com"
    labels: ["hosts-blue", "enhancement"]
```

### Step 2: Create Template File Per Platform

For each platform, create:  
`.github/ISSUE_TEMPLATE/{platform-code-lowercase}-task.md`

**Examples:**
- `.github/ISSUE_TEMPLATE/bb-task.md`
- `.github/ISSUE_TEMPLATE/hb-task.md`
- `.github/ISSUE_TEMPLATE/sb-task.md`

### Step 3: Populate Template Variables

Replace these variables in the template:

| Variable | Source | Example |
|----------|--------|---------|
| `{{PLATFORM_NAME}}` | PLATFORMS[].name | "BusinessBlueprint" |
| `{{PLATFORM_CODE}}` | PLATFORMS[].code | "BB" |
| `{{PLATFORM_DOMAIN}}` | PLATFORMS[].domain | "businessblueprint.io" |
| `{{PLATFORM_LABELS}}` | PLATFORMS[].labels | "business-blueprint, enhancement" |

---

## Example: BusinessBlueprint Template

**File:** `.github/ISSUE_TEMPLATE/bb-task.md`

```yaml
---
name: BusinessBlueprint Task
about: Task for BusinessBlueprint (businessblueprint.io) platform
title: '[BB] '
labels: 'business-blueprint, enhancement'
assignees: ''
---

## Platform
BusinessBlueprint (businessblueprint.io)

## Description
<!-- Clear description of what needs to be built/fixed -->

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Technical Notes
<!-- Any technical details, dependencies, or considerations -->

## Priority
<!-- High / Medium / Low -->

## Related Features
<!-- Link to related issues or features -->
```

---

## Example: HostsBlue Template

**File:** `.github/ISSUE_TEMPLATE/hb-task.md`

```yaml
---
name: HostsBlue Task
about: Task for HostsBlue (hostsblue.com) platform
title: '[HB] '
labels: 'hosts-blue, enhancement'
assignees: ''
---

## Platform
HostsBlue (hostsblue.com)

## Description
<!-- Clear description of what needs to be built/fixed -->

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Technical Notes
<!-- Any technical details, dependencies, or considerations -->

## Priority
<!-- High / Medium / Low -->

## Related Features
<!-- Link to related issues or features -->
```

---

## Automation Script (Optional)

If your dashboard supports scripting, you can automate template generation:

```javascript
// Example: Node.js script to generate issue templates

const fs = require('fs');
const yaml = require('js-yaml');

// Load project metadata
const metadata = yaml.load(fs.readFileSync('PROJECT_METADATA_SCHEMA.yaml', 'utf8'));

// Template string
const templateString = `---
name: {{PLATFORM_NAME}} Task
about: Task for {{PLATFORM_NAME}} ({{PLATFORM_DOMAIN}}) platform
title: '[{{PLATFORM_CODE}}] '
labels: '{{PLATFORM_LABELS}}'
assignees: ''
---

## Platform
{{PLATFORM_NAME}} ({{PLATFORM_DOMAIN}})

## Description
<!-- Clear description of what needs to be built/fixed -->

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Technical Notes
<!-- Any technical details, dependencies, or considerations -->

## Priority
<!-- High / Medium / Low -->

## Related Features
<!-- Link to related issues or features -->
`;

// Generate templates for each platform
metadata.PLATFORMS.forEach(platform => {
  let template = templateString
    .replace(/{{PLATFORM_NAME}}/g, platform.name)
    .replace(/{{PLATFORM_CODE}}/g, platform.code)
    .replace(/{{PLATFORM_DOMAIN}}/g, platform.domain)
    .replace(/{{PLATFORM_LABELS}}/g, platform.labels.join(', '));
  
  const filename = `.github/ISSUE_TEMPLATE/${platform.code.toLowerCase()}-task.md`;
  fs.writeFileSync(filename, template);
  console.log(`Created ${filename}`);
});
```

---

## Additional Template Types (Optional)

Beyond platform-specific templates, you may want:

### Bug Report Template

**File:** `.github/ISSUE_TEMPLATE/bug-report.md`

```yaml
---
name: Bug Report
about: Report a bug or issue
title: '[BUG] '
labels: 'bug'
assignees: ''
---

## Bug Description
<!-- Clear description of what the bug is -->

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
<!-- What you expected to happen -->

## Actual Behavior
<!-- What actually happened -->

## Screenshots
<!-- If applicable, add screenshots -->

## Environment
- Platform: [e.g., BusinessBlueprint]
- Browser: [e.g., Chrome 120]
- Device: [e.g., Desktop, iPhone 14]

## Additional Context
<!-- Any other context about the problem -->
```

### Feature Request Template

**File:** `.github/ISSUE_TEMPLATE/feature-request.md`

```yaml
---
name: Feature Request
about: Suggest a new feature
title: '[FEATURE] '
labels: 'enhancement, feature-request'
assignees: ''
---

## Feature Description
<!-- Clear description of the feature -->

## Problem This Solves
<!-- What problem does this feature address? -->

## Proposed Solution
<!-- How should this feature work? -->

## Alternatives Considered
<!-- Other solutions you've thought about -->

## Additional Context
<!-- Mockups, diagrams, or other context -->
```

---

## Label Strategy

Define consistent labels across all templates:

**Platform Labels:**
- `business-blueprint`
- `hosts-blue`
- `swipes-blue`

**Type Labels:**
- `enhancement` - New feature or improvement
- `bug` - Something isn't working
- `documentation` - Documentation updates
- `critical-priority` - Urgent, must fix ASAP
- `high-priority` - Important, fix soon
- `low-priority` - Nice to have

**Status Labels:**
- `in-progress`
- `needs-review`
- `blocked`

---

## Testing Templates

After generating templates:

1. Visit `{{GITHUB_REPO}}/issues/new/choose`
2. Verify all templates appear
3. Test creating an issue with each template
4. Confirm labels and title prefixes work correctly

---

## Maintenance

**When to update templates:**
- New platform added to ecosystem
- Issue workflow changes
- Label strategy updates
- Team structure changes

**Best practices:**
- Keep templates simple and focused
- Use clear, non-technical language in descriptions
- Provide examples in comments
- Review templates quarterly

---

## Summary Checklist

- [ ] Extract platform data from PROJECT_METADATA_SCHEMA
- [ ] Create `.github/ISSUE_TEMPLATE/` directory
- [ ] Generate one template per platform
- [ ] Add optional bug-report and feature-request templates
- [ ] Define label strategy in GitHub repository
- [ ] Test all templates by creating sample issues
- [ ] Document template usage for team
- [ ] Schedule quarterly template review

---

**Version:** 1.0  
**Last Updated:** {{CURRENT_DATE}}  
**Author:** Architect ({{ARCHITECT_NAME}})
