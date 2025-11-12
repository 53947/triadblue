# {{ECOSYSTEM_NAME}} Ecosystem - Technical Architecture

> **Version:** 2.0  
> **Last Updated:** {{CURRENT_DATE}}  
> **Architecture Decision Date:** {{CURRENT_DATE}}

---

## 🏗️ Executive Summary

The {{ECOSYSTEM_NAME}} ecosystem consists of **{{PLATFORM_COUNT}} standalone, independently marketable** platforms:

{{#each PLATFORMS}}
{{@index}}. **{{name}} ({{domain}})** - {{description}}
{{/each}}

**Critical Design Principle:** Each platform operates independently but shares authentication (SSO) and payment processing.

---

## 📐 Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  {{ECOSYSTEM_NAME}} ECOSYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
{{#each PLATFORMS}}
│  ┌──────────────────┐
│  │  {{name}}        │
│  │  {{domain}}      │
│  │                  │
│  │  {{description}} │
│  └────────┬─────────┘
{{/each}}
│           │                                                      │
│           └──────────────────────────────────────────           │
│                              │                                  │
│                 ┌────────────▼──────────────┐                   │
│                 │   Unified SSO             │                   │
│                 │   JWT Token Exchange      │                   │
│                 └───────────────────────────┘                   │
│                                                                 │
│           ┌─────────────────────────────────────────┐          │
│           │  Payment Flow (ALL Platforms)           │          │
│           │                                         │          │
│           │  Any Platform → Payment Processor      │          │
│           │  ↓                                      │          │
│           │  Payment Gateway                       │          │
│           │  ↓                                      │          │
│           │  Success → Invoice + Return to Origin  │          │
│           └─────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Platform Breakdown

{{#each PLATFORMS}}
### {{@index}}. {{name}} ({{domain}})

**Status:** {{status}}  
**Deployment:** {{deployment_status}}  
**Database:** {{database}}

**Core Features:**
{{#each features}}
- {{this}}
{{/each}}

**Tech Stack:**
{{tech_stack}}

---

{{/each}}

## 🔐 Authentication & Single Sign-On (SSO)

### Current State
**{{auth_approach}}**

{{auth_description}}

### SSO Implementation (If Applicable)

```
┌─────────────────────────────────────────────────────────────┐
│                  Central Auth Service                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User Login → Generate JWT Token                     │  │
│  │  ↓                                                    │  │
│  │  Token signed with {{AUTH_METHOD}}                   │  │
│  │  ↓                                                    │  │
│  │  Token valid across all platforms                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💳 Payment Processing Architecture

### Universal Payment Flow

**Critical Rule:** {{PAYMENT_PROCESSOR_NAME}} processes ALL payments across the entire ecosystem

```
┌──────────────────────────────────────────────────────────────┐
│                    Payment Request Flow                      │
└──────────────────────────────────────────────────────────────┘

1. User initiates purchase on ANY platform
                         ↓
2. Platform creates payment request to {{PAYMENT_PROCESSOR_NAME}} API
                         ↓
3. {{PAYMENT_PROCESSOR_NAME}} generates checkout session
                         ↓
4. User redirected to checkout page
                         ↓
5. User completes payment
                         ↓
6. Redirect back to origin platform
                         ↓
7. Origin platform verifies payment
                         ↓
8. Origin platform fulfills order
```

---

## 🚀 Deployment Strategy

### Current Deployments

{{#each PLATFORMS}}
**{{name}}:**
- Deployment: {{deployment}}
- Domain: {{domain}}
- Database: {{database}}

{{/each}}

### Database Strategy

**{{DATABASE_STRATEGY}}**

{{database_strategy_description}}

### Environment Variables

**Shared Across All Platforms:**
{{#each SHARED_ENV_VARS}}
- `{{this}}`
{{/each}}

**Platform-Specific:**
{{#each PLATFORMS}}
- {{name}}: {{#each env_vars}}`{{this}}`{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

---

## 📊 Tech Stack Summary

**Frontend:**
{{FRONTEND_STACK}}

**Backend:**
{{BACKEND_STACK}}

**Database:**
{{DATABASE_STACK}}

**Authentication:**
{{AUTH_STACK}}

**Deployment:**
{{DEPLOYMENT_PLATFORM}}

---

## 🔄 Version History

- **v2.0** ({{CURRENT_DATE}}) - Template-based architecture documentation
- **v1.0** - Initial architecture definition

---

## 📚 Related Documentation

- [Collaboration Guide](../replit.md)
- [Brand Standards](brand_pack/STANDARDS.md)
- [System Constants](brand_pack/_constants.md)
- [Status Report](../STATUS_REPORT.md)
