# TriadBlue LINKBlue Integration Panel - Replit Builder Agent Prompt

## Project Overview
Build LINKBlue, the operational nerve center that connects and integrates three distinct platforms: BusinessBlueprint.io (local business growth SaaS), SwipesBlue.com (payment gateway), and HostsBlue.com (web services). LINKBlue serves as the master dashboard for monitoring, managing, and orchestrating the entire TriadBlue ecosystem.

## Core Purpose
LINKBlue is the "link" that chains together all three Blue platforms. It provides:
- Unified cross-platform visibility
- Global integration monitoring
- Consolidated analytics across all three businesses
- Master navigation to each platform's individual admin
- Client 360° view (see everything about a client across all platforms)

## Logo & Branding
- Logo: Chain link symbol (provided - LINKBlue_Logo.png)
- Represents connection between the three platforms
- Color scheme: TriadBlue brand colors (blue primary)

## Core Requirements

### 1. GLOBAL INTEGRATION DASHBOARD

**System Health Overview**
- Three platform status cards:
  - **BusinessBlueprint.io**
    - Status: Online/Degraded/Offline
    - Active clients count
    - API response time
    - Last sync timestamp
    - Critical alerts
  - **SwipesBlue.com**
    - Status: Online/Degraded/Offline
    - Transaction processing status
    - Payment success rate (last 24h)
    - API response time
    - Failed transaction alerts
  - **HostsBlue.com**
    - Status: Online/Degraded/Offline
    - Active hosting accounts
    - Server uptime
    - Resource utilization
    - Critical alerts

**Integration Status Matrix**
- Visual diagram showing connections between platforms:
  - BB ↔ SwipesBlue (payment processing)
  - BB ↔ HostsBlue (website hosting for clients)
  - SwipesBlue ↔ HostsBlue (hosting payment processing)
  - All ↔ LINKBlue (central integration layer)
- Connection health indicators (green/yellow/red)
- Last successful sync timestamps
- Error logs per connection
- Retry queue status

**Real-Time Activity Feed**
- Live stream of cross-platform events:
  - New client signup (BB)
  - Payment processed (SwipesBlue)
  - Website deployed (HostsBlue)
  - Integration sync completed
  - System alerts and warnings
- Filterable by platform, event type, severity
- Click to drill into event details

### 2. UNIFIED CLIENT VIEW (360° PERSPECTIVE)

**Client Search & Selection**
- Global search across all three platforms
- Search by:
  - Client ID (universal across platforms)
  - Company name
  - Email
  - Domain name
  - Phone number
- Search results show which platforms the client is active on

**Client Profile (Consolidated View)**
When a client is selected, show all their activity across the ecosystem:

**BusinessBlueprint.io Activity**
- Account status and subscription tier
- Active apps/bundles
- Assessment scores and history
- Prescription implementation status
- Last login and engagement metrics
- Monthly recurring revenue from BB

**SwipesBlue.com Activity**
- All transactions (from BB subscription + any other charges)
- Payment methods on file
- Transaction history (successful, failed, refunded)
- Total transaction volume
- Average transaction value
- Failed payment history and resolution status
- Merchant account status (if client uses Swipes for their business)

**HostsBlue.com Activity**
- Hosted websites/domains
- Hosting plan details
- Server resources used (storage, bandwidth)
- SSL certificate status
- Uptime statistics
- Backup status
- Hosting costs/billing

**Cross-Platform Insights**
- Customer lifetime value (CLV) across all three platforms
- Total revenue contribution
- Platform engagement score
- Risk indicators (payment failures, low engagement, support tickets)
- Upsell opportunities (e.g., BB client not using Hosts yet)

### 3. CONSOLIDATED ANALYTICS

**Revenue Dashboard**
- **Total Revenue Across All Platforms**
  - Daily/Weekly/Monthly/Yearly views
  - Revenue breakdown by platform
  - Revenue trends over time
  - Revenue forecasting

- **Platform-Specific Revenue**
  - BusinessBlueprint: MRR, ARR, ARPU
  - SwipesBlue: Transaction fees, processing volume
  - HostsBlue: Hosting subscriptions, overage charges

- **Client Value Analysis**
  - Top clients by total revenue (all platforms)
  - Client segments by platform usage
  - Cross-platform adoption rates
  - Average revenue per client across ecosystem

**Platform Metrics Summary**

**BusinessBlueprint Metrics**
- Total active clients
- Churn rate
- New signups (this month)
- Trial conversion rate
- App adoption rates
- Assessment completion rate
- Prescription implementation rate

**SwipesBlue Metrics**
- Total transaction volume
- Number of transactions
- Average transaction value
- Payment success rate
- Failed payment rate
- Processing fees collected
- Active merchant accounts (if applicable)

**HostsBlue Metrics**
- Total hosted websites
- Total domains managed
- Server uptime percentage
- Average resource utilization
- Storage used vs. available
- Bandwidth consumption
- SSL certificates active/expiring

**Cross-Platform Metrics**
- Clients using 1 platform only
- Clients using 2 platforms
- Clients using all 3 platforms (full ecosystem)
- Platform adoption journey (which platform do clients start with?)
- Cross-sell success rate

### 4. MASTER NAVIGATION HUB

**Quick Access Panel**
- One-click navigation to each platform's admin:
  - "Open BusinessBlueprint Admin" → businessblueprint.io/admin
  - "Open SwipesBlue Admin" → swipesblue.com/admin
  - "Open HostsBlue Admin" → hostsblue.com/admin

**ConsoleBlue Access**
- Link to ConsoleBlue (the build center)
- Shows: "Build & Deploy Tools"
- Separate from LINKBlue (different purpose)

**Context-Aware Links**
- When viewing a specific client, show quick actions:
  - "View in BB Admin"
  - "View Swipes Transactions"
  - "View Hosting Details"

### 5. INTEGRATION MANAGEMENT

**API Connection Manager**
- Configure API credentials for each platform
- Test connections
- View API usage and rate limits
- Webhook management
- Integration logs and debugging

**Data Sync Configuration**
- Set sync frequency for cross-platform data
- Map fields between platforms
- Conflict resolution rules
- Sync history and error logs

**Webhook Event Monitor**
- All webhooks from all platforms
- Event payload viewer
- Retry failed webhooks
- Webhook endpoint configuration

### 6. ALERTS & NOTIFICATIONS

**Alert Dashboard**
- Critical alerts (requires immediate attention)
- Warnings (monitor closely)
- Info (general updates)

**Alert Types**
- Platform outages or degraded performance
- Integration sync failures
- Payment processing issues
- High churn risk clients
- Revenue anomalies
- Security alerts (failed login attempts, suspicious activity)

**Notification Configuration**
- Set alert thresholds
- Choose notification channels (email, SMS, in-app)
- Alert routing rules
- Escalation policies

### 7. GLOBAL SETTINGS & ADMINISTRATION

**Platform Configuration**
- LINKBlue branding and settings
- Global user management (cross-platform admin users)
- API key management for all platforms
- Integration tokens and secrets

**Audit Log**
- All administrative actions across LINKBlue
- User activity tracking
- Security events
- Data access logs
- Export audit logs for compliance

**System Maintenance**
- Schedule maintenance windows
- Broadcast system notifications to all platforms
- Emergency shutdown procedures
- Backup and disaster recovery

### 8. REPORTING & EXPORTS

**Pre-Built Reports**
- Executive Summary (all platforms at a glance)
- Revenue Report (consolidated)
- Client Health Report (engagement, retention, churn risk)
- Integration Status Report
- Platform Performance Report

**Custom Report Builder**
- Select metrics from any platform
- Combine data across platforms
- Schedule automated reports
- Export to PDF, Excel, CSV
- Share reports with stakeholders

**Data Warehouse**
- Historical data across all platforms
- Data retention policies
- Archive old data
- Restore archived data
- Export raw data for analysis

## Technical Requirements

### Architecture
- **Backend**: RESTful API or GraphQL to aggregate data from all three platforms
- **Authentication**: Secure admin login (separate from platform logins)
- **Database**: Centralized database for LINKBlue-specific data (dashboards, alerts, user preferences)
- **Caching**: Redis or similar for fast dashboard loading
- **Real-time**: WebSocket support for live activity feed

### Platform Integration
- **API Integrations**:
  - BusinessBlueprint.io API (client data, assessments, subscriptions)
  - SwipesBlue.com API (transactions, payment methods, merchant accounts)
  - HostsBlue.com API (hosting accounts, domains, server metrics)
- **Webhook Receivers**:
  - Listen for events from all three platforms
  - Process and display in real-time feed
  - Trigger alerts based on event patterns

### Security
- Role-based access control (Super Admin only initially)
- Encrypted API communications
- Audit logging for all actions
- Two-factor authentication
- IP whitelisting capability
- Session management and timeout

### Performance
- Dashboard loads in <2 seconds
- Real-time feed updates with minimal latency
- Handle data from 1000+ clients across platforms
- Efficient API calls with rate limiting
- Background jobs for heavy data processing

### Data Synchronization
- **Client ID Mapping**: Universal client ID used across all platforms
- **Sync Frequency**: Configurable (real-time, hourly, daily)
- **Conflict Resolution**: Last-write-wins or manual review
- **Data Validation**: Ensure data consistency across platforms

## Navigation Structure

```
TriadBlue.com/linkblue
│
├── Dashboard (Global Overview)
│   ├── System Health
│   ├── Integration Status
│   └── Real-Time Activity Feed
│
├── Clients (360° View)
│   ├── Search Clients
│   ├── Client Profile
│   │   ├── BusinessBlueprint Activity
│   │   ├── SwipesBlue Transactions
│   │   ├── HostsBlue Services
│   │   └── Cross-Platform Insights
│   └── Client Segments
│
├── Analytics
│   ├── Revenue Dashboard
│   ├── Platform Metrics
│   ├── Cross-Platform Insights
│   └── Custom Reports
│
├── Platforms (Quick Access)
│   ├── BusinessBlueprint Admin →
│   ├── SwipesBlue Admin →
│   ├── HostsBlue Admin →
│   └── ConsoleBlue (Build Center) →
│
├── Integrations
│   ├── API Connections
│   ├── Data Sync Settings
│   ├── Webhooks
│   └── Integration Logs
│
├── Alerts
│   ├── Active Alerts
│   ├── Alert History
│   └── Notification Settings
│
└── Settings
    ├── LINKBlue Configuration
    ├── User Management
    ├── Audit Log
    └── System Maintenance
```

## Priority Development Phases

### Phase 1 - MVP (Core Integration)
- Global dashboard with platform health
- Basic client 360° view
- Master navigation to platform admins
- Integration status monitoring
- Alert system for critical issues

### Phase 2 - Analytics & Insights
- Consolidated revenue dashboard
- Cross-platform analytics
- Custom reporting
- Historical data trending

### Phase 3 - Advanced Features
- Real-time activity feed
- Advanced alert rules
- Data warehouse and exports
- Automated cross-platform workflows

## Key Differentiators from Platform Admins

**LINKBlue is NOT:**
- A replacement for BusinessBlueprint admin
- A replacement for SwipesBlue admin
- A replacement for HostsBlue admin

**LINKBlue IS:**
- The oversight layer above all three
- The integration connector between platforms
- The consolidated analytics engine
- The master command center for the entire ecosystem

## Success Criteria
- Can monitor health of all three platforms at a glance
- Can view any client's complete ecosystem engagement
- Provides consolidated revenue and analytics
- Alerts proactively for integration issues
- Serves as mission control for TriadBlue operations
- Enables data-driven decisions across the entire business

## Notes for Replit Builder Agent
- This is a mission-critical operations tool
- Uptime and reliability are paramount
- Real-time data accuracy is essential
- Clean, professional UI (executive-level dashboard)
- Build with scalability in mind (10x client growth)
- Include comprehensive error handling
- API integrations must be robust and fault-tolerant
- Use environment variables for all API keys and secrets
- Implement retry logic for failed API calls
- Cache frequently accessed data
- Log all integration errors for debugging
- Build mobile-responsive (CEO needs to check on phone)
- Dark mode support
- Export capabilities for all reports
- Secure by default (least privilege access)

## Visual Design Notes
- Use the chain link logo prominently
- Three-platform color coding (BB, Swipes, Hosts distinct but harmonious)
- Integration flow visualizations (diagrams showing connections)
- Real-time status indicators (green/yellow/red)
- Clean, modern, professional aesthetic
- Data visualization for analytics (charts, graphs)
- Minimalist design to reduce cognitive load
- Responsive grid layouts

## Example Use Cases

**Use Case 1: Morning Health Check**
- Admin logs into LINKBlue
- Sees all three platforms are green (healthy)
- Checks overnight activity feed for any issues
- Reviews revenue dashboard for yesterday's performance
- Notices SwipesBlue has 2 failed transactions
- Clicks into alerts to investigate and resolve

**Use Case 2: Client Investigation**
- Support ticket from client about a failed payment
- Admin searches client in LINKBlue
- Sees client 360° view:
  - Active BB subscription
  - Failed payment in SwipesBlue (expired card)
  - Hosting active in HostsBlue
- Clicks "View Swipes Transactions" to see details
- Resolves payment issue
- Checks if hosting is at risk due to payment failure

**Use Case 3: Executive Reporting**
- End of month revenue review
- Generates "Executive Summary" report
- Shows consolidated revenue across all platforms
- Highlights cross-platform adoption rate increased 15%
- Identifies clients using only 1 platform (upsell opportunity)
- Exports PDF for investor update

**Use Case 4: Integration Troubleshooting**
- Alert: BB → Swipes integration sync failed
- Admin opens Integration Manager
- Views error log: API rate limit exceeded
- Adjusts sync frequency
- Manually retries failed syncs
- Monitors integration status returns to green
