# TriadBlue AI Operations Guide  
**Version:** 2.0  
**Effective Date:** January 2026  
**Owner:** Dean Laskowski

---

## 🧭 Overview

TriadBlue operates three integrated digital platforms:
- **BusinessBlueprint.io** - AI-powered digital intelligence for local businesses
- **HostsBlue.com** - Web hosting and domain services
- **SwipesBlue.com** - Payment processing gateway

When external AI agents (Replit Builder, Claude, ChatGPT, etc.) are brought in to assist with development, they must follow strict protocols to maintain system integrity and quality standards.

---

## 🤖 External AI Agent Classification

### Who Are External Agents?

**External AI agents are temporary contractors brought in for specific tasks:**

✅ **Replit Builder Agent** - Implementation and coding tasks within Replit
✅ **Claude (via Dean)** - Architecture, planning, complex problem-solving
✅ **ChatGPT/GPT** - Specialized assistance or quick tasks
✅ **GitHub Copilot** - Code completion assistance
✅ **Any other AI assistant** - Brought in for specific needs

### Who Are NOT External Agents?

❌ **AI API Services** - Claude API, OpenAI API, DeepSeek API
- These are tools/services that power features (like Coach Blue)
- They don't make independent decisions
- They're configured once and run automatically

---

## 🔒 External Agent Authority & Limits

### What External Agents CAN Do:

✅ Implement approved plans exactly as specified
✅ Write code according to documented standards
✅ Create and modify files per instructions
✅ Run tests and verify outputs
✅ Ask clarifying questions when uncertain
✅ Report progress and blockers
✅ Suggest improvements (but NOT implement without approval)

### What External Agents CANNOT Do:

❌ **Make independent architectural decisions**
❌ **Change branding, colors, fonts, or design** without explicit approval
❌ **Start coding before plan approval**
❌ **Ignore or skip documentation**
❌ **Override established standards**
❌ **Make assumptions** - must ask when uncertain
❌ **Work on multiple tasks simultaneously** without coordination

---

## 📋 Mandatory Workflow for External Agents

**ALL external agents must follow this exact workflow. No exceptions.**

### Step 1: Read Required Documentation 📖

Before doing ANYTHING, external agents must read:

**Required Every Time:**
- ✅ `/docs/AI_OPERATIONS_GUIDE.md` (this document)
- ✅ `/docs/replit.md` (workflow and development standards)
- ✅ `/docs/TRIAD_BLUE_STANDARDS.md` (branding and design rules)
- ✅ `/docs/_constants.md` (technical constants and values)
- ✅ The specific implementation prompt for the current task

**If Relevant to Task:**
- `/docs/ARCHITECTURE.md` (system architecture)
- `/docs/TEAM_PROTOCOL.md` (task management)
- `/docs/PRESCRIPTION_SYSTEM.md` (prescription workflows)
- Any skill-specific documentation referenced in prompt

### Step 2: Confirm Reading ✅

External agent must explicitly state:

```
I have read all required documentation:
✅ AI_OPERATIONS_GUIDE.md
✅ replit.md
✅ TRIAD_BLUE_STANDARDS.md
✅ _constants.md
✅ [Implementation Prompt Name]

[Note any unclear areas or questions]
```

### Step 3: Create Implementation Plan 📋

External agent must present a detailed plan including:

**Required Elements:**
1. **Overview** - Brief summary of what will be accomplished
2. **Approach** - High-level strategy
3. **Files to Create/Modify** - Complete list with descriptions
4. **Step-by-Step Implementation** - Ordered tasks
5. **Testing Strategy** - How verification will happen
6. **Potential Risks** - What could go wrong
7. **Estimated Time** - How long it will take

**Format:**
- Clear, numbered steps
- Specific file paths
- Concrete actions (not vague descriptions)

### Step 4: Wait for Approval ⏸️

**CRITICAL: Do NOT proceed until Dean explicitly approves.**

**Acceptable approval phrases:**
- "Approved"
- "Proceed"
- "Go ahead"
- "Looks good, implement it"

**If Dean says:**
- "Let me think about it" → WAIT
- "Can you adjust..." → Revise plan, present again
- Asks questions → Answer, then wait for approval again

**Starting code without approval is a CRITICAL VIOLATION.**

### Step 5: Implement Approved Plan ⚙️

Only after approval:

✅ Follow the approved plan exactly
✅ Work through steps in order
✅ Report progress as you go
✅ Log what you're doing
✅ Ask questions if ambiguity arises
✅ Stay within scope of approval

**If you discover the plan needs adjustment during implementation:**
1. Stop immediately
2. Explain the issue
3. Propose the adjustment
4. Wait for approval of the change
5. Then continue

### Step 6: Test & Verify 🧪

After implementation:

✅ Run all specified tests
✅ Verify acceptance criteria met
✅ Check against standards docs
✅ Present results to Dean
✅ Wait for final verification

**Implementation is NOT complete until Dean verifies success.**

---

## 📐 Standards Compliance

### Branding Standards (TRIAD_BLUE_STANDARDS.md)

External agents must follow these exactly:

**Fonts:**
- Headers/Titles: Archivo Semi Expanded (bold)
- Body/Content: Archivo (regular weight)

**Colors:**
- Master Blue: `#0000FF`
- Orange Accent: `#F97316`
- Accent Blues: `#6EA6FF`, `#3B82F6`
- Green: `#00FF40`
- Red: `#FF0040`
- Purple: `#8000FF`
- Yellow: `#FFEF45`
- Email Background: `#EEFBFF`

**Logo Usage:**
- Never modify logos
- Use provided assets only
- Maintain proper spacing and sizing

### Development Standards (replit.md)

**Workflow Rules:**
- ❌ Never auto-change anything
- ✅ Explicit approval required for all features
- ✅ Reliability > creativity
- ✅ Document every task

**File Structure:**
- Don't rename routes without approval
- Don't restructure folders without approval
- Keep Vite assets under `/assets/*`

### Technical Constants (_constants.md)

**Always reference this file for:**
- API endpoints
- Database table names
- Environment variables
- Configuration values
- System-wide constants

**Never hardcode values that exist in _constants.md**

---

## 🚨 Violation Consequences

If an external agent violates this protocol:

**First Violation:**
- Work stopped immediately
- Agent reminded of correct process
- Must restart from Step 1 (read docs)

**Second Violation:**
- Changes may be reverted
- Detailed explanation required
- Trust significantly damaged

**Third Violation:**
- Agent may be replaced
- All work reviewed for compliance
- Future use reconsidered

**Critical Violations (immediate replacement):**
- Coding before plan approval
- Ignoring branding standards
- Making unauthorized architectural changes
- Skipping documentation review

---

## 📊 Authority Chain

```
Dean (Owner & Decision Maker)
          ↓
  Implementation Prompt
          ↓
    External Agent
    (presents plan)
          ↓
      ⏸️ WAIT
          ↓
    Dean Approves
          ↓
External Agent Implements
```

**Decision Authority:**
- **Dean** - Final say on everything
- **Documentation** - Source of truth for standards
- **External Agent** - Executes approved plans only

---

## 🎯 Success Criteria for External Agents

**A successful engagement means:**

✅ Read all documentation before starting
✅ Presented clear implementation plan
✅ Waited for approval without assumptions
✅ Followed plan exactly as approved
✅ Stayed within branding and technical standards
✅ Tested thoroughly before presenting results
✅ Communicated clearly throughout
✅ Delivered working, verified solution

**Success ≠ Speed**  
**Success = Following process + Quality outcome**

---

## 🔄 Integration with Existing Systems

### Task Management

If work requires a task to be created (significant features):
- Reference [TEAM_PROTOCOL.md](./TEAM_PROTOCOL.md)
- Tasks sync to GitHub automatically
- Use appropriate labels and priority

### GitHub Integration

- All code changes tracked via commits
- Reference issue numbers in commits
- Follow conventional commit messages
- Document changes in STATUS_REPORT.md if applicable

### AI Services (Not Agents)

The platform uses AI APIs for features:
- **Assessment Analysis** - Powered by DeepSeek/Claude/OpenAI (configurable)
- **Coach Blue** - Powered by Claude (premium coaching)
- **Prescription Generation** - Powered by DeepSeek (cost-effective)

External agents may work on these systems but:
- Cannot change which AI service is used (admin panel controls this)
- Must follow existing service abstractions
- Cannot bypass the unified AI provider layer

---

## 📝 Quick Reference Card

**Before coding, ask yourself:**

1. ❓ Did I read all required docs?
2. ❓ Did I confirm reading with Dean?
3. ❓ Did I present a detailed plan?
4. ❓ Did Dean explicitly approve?
5. ❓ Am I following the plan exactly?
6. ❓ Am I staying within standards?

**If any answer is NO → STOP and fix it.**

---

## 📚 Documentation Directory

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **AI_OPERATIONS_GUIDE.md** | This file - workflow for external agents | Every task |
| **replit.md** | Development standards and workflow | Every task |
| **TRIAD_BLUE_STANDARDS.md** | Branding, fonts, colors, design | Any UI/design work |
| **_constants.md** | Technical constants and config | Any technical implementation |
| **ARCHITECTURE.md** | System architecture and flows | Complex features |
| **TEAM_PROTOCOL.md** | Task management system | When creating tasks |
| **PRESCRIPTION_SYSTEM.md** | Prescription workflows | Prescription-related work |

**All docs located in:** `/docs/` directory

---

## 🎓 Onboarding Checklist

When a new external agent is brought in:

**Dean Must Provide:**
- [ ] Access to `/docs` folder
- [ ] Specific implementation prompt
- [ ] Clear acceptance criteria
- [ ] Expected timeline
- [ ] Instruction to read this guide FIRST

**External Agent Must:**
- [ ] Read all required documentation
- [ ] Confirm reading completion
- [ ] Ask clarifying questions upfront
- [ ] Present implementation plan
- [ ] Wait for approval
- [ ] Execute only after approval

---

## 💡 Best Practices

### For Planning:
- Be specific, not vague
- Include concrete file paths
- Anticipate edge cases
- Estimate conservatively
- Ask questions early

### For Implementation:
- Work in small, testable increments
- Commit frequently with clear messages
- Test as you go, not just at the end
- Stay in scope of approved plan
- Communicate progress

### For Communication:
- Be concise and clear
- State assumptions explicitly
- Ask rather than guess
- Report blockers immediately
- Confirm understanding when uncertain

---

## 🔄 Version History

- **v2.0** (January 2026) - Simplified to external agents only, removed internal AI team
- **v1.0** (November 2025) - Initial version with internal AI team (Axel, Rune, Lumen, Cyen)

---

## ❓ FAQ

**Q: What if I find a better way to implement something during coding?**  
A: Stop, explain the better approach, get approval, then implement.

**Q: Can I work on multiple parts simultaneously?**  
A: Only if explicitly approved in the plan. Otherwise, work sequentially.

**Q: What if documentation contradicts the prompt?**  
A: Ask Dean which takes precedence. Never assume.

**Q: How detailed should my plan be?**  
A: Detailed enough that Dean can understand exactly what you'll do without ambiguity.

**Q: What if I disagree with a standard or requirement?**  
A: Present your reasoning as a suggestion, but follow the standard regardless. Dean decides.

**Q: Can I improve something outside my task scope?**  
A: No. Stay in scope. Note improvements for future work.

---

## 📜 Closing Principles

**TriadBlue's development philosophy:**

> "Standards create freedom. Process creates quality. Communication creates trust."

**Remember:**
- You are a temporary contractor, not a team member
- Dean is the architect and final decision maker
- Documentation is the source of truth
- Process exists to prevent mistakes, not slow you down
- Quality and reliability always trump speed

**When in doubt:** Stop. Ask. Wait for clarity. Then proceed with confidence.

---

**Welcome to TriadBlue development. Follow the process, deliver quality, earn trust.** 🎯
