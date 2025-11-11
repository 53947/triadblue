# Design Guidelines: Centralized Task Management & Documentation Hub

## Design Approach

**Selected Approach**: Design System Hybrid (Linear + Notion + GitHub-inspired)

**Justification**: This is an information-dense productivity dashboard requiring exceptional clarity, scanability, and efficient workflows. Linear's clean task management aesthetics combined with Notion's organizational patterns and GitHub's activity feed design provide the perfect foundation for a unified command center.

**Core Principles**:
- Information hierarchy over decoration
- Fast scanability with clear visual groupings
- Consistent patterns for rapid learning
- Dense information without clutter

---

## Typography

**Font Stack**:
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for API keys, code snippets, GitHub commits)

**Hierarchy**:
- Page titles: text-2xl, font-semibold
- Section headers: text-lg, font-semibold
- Card titles/Project names: text-base, font-medium
- Body text: text-sm, font-normal
- Metadata/timestamps: text-xs, font-normal
- Code/API keys: text-xs, font-mono

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16**

**Grid Structure**:
- Main container: max-w-7xl mx-auto px-4
- Two-column dashboard: 256px fixed sidebar + flex-1 main content (lg:grid-cols-[256px_1fr])
- Three-column detail view: 256px sidebar + flex-1 content + 320px right panel when needed
- Mobile: Single column stack

**Vertical Rhythm**: py-4 for cards, py-8 for sections, py-12 for page padding

---

## Component Library

### Navigation & Structure

**Sidebar (256px fixed)**:
- Logo/brand at top (h-16)
- Main navigation sections with icons
- Project list with color indicators
- User profile and settings at bottom
- Collapsed mobile menu (hamburger)

**Top Bar**:
- Breadcrumb navigation
- Search bar (grows to fill available space)
- Quick actions (+ New Task button)
- Notification bell
- User avatar with dropdown

### Dashboard Components

**Unified Feed (Main Content Area)**:
- Infinite scroll feed with grouped items by date ("Today", "Yesterday", "This Week")
- Three feed item types with distinct layouts:
  1. **Task Card**: Project badge, task title, description preview, metadata row (assignee, due date, source icon)
  2. **Conversation Extract**: Agent icon, conversation snippet, extracted action items (bulleted), "View full conversation" link
  3. **GitHub Activity**: Commit hash (mono), commit message, file changes indicator, author avatar, timestamp

**Filter Bar**:
- Horizontal pill buttons for quick filters (All, Tasks, Conversations, GitHub)
- Dropdown filters (Project, Status, Priority, Date range)
- Active filter tags with X to remove

**Project Cards (Grid View on Projects Page)**:
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Card content: Project icon/color, name, description, stats row (X tasks, last updated), API key status indicator, "Manage" button

### Forms & Inputs

**API Key Generation**:
- Project selector dropdown
- Permission checkboxes in a grid (Read Tasks, Write Tasks, View Conversations, etc.)
- Generate button
- Display generated key in mono font with copy button
- Warning text about key security

**Task Creation Modal**:
- Overlay modal (max-w-2xl)
- Fields: Project selector, Task title (text-lg input), Description (textarea), Priority dropdown, Due date picker
- Action buttons: Cancel (secondary) and Create Task (primary)

**Conversation Logger**:
- Chat-style interface with agent/user message bubbles
- Extract Action Items button at bottom
- Extracted items appear in highlighted cards with checkbox and "Add to Tasks" action

### Data Display

**Status Badges**:
- Rounded pill shape (px-2 py-1, text-xs, rounded-full)
- Border style variants for different states

**Project Indicators**:
- Small colored dots or squares (w-2 h-2 rounded-full) next to project names
- Consistent color per project throughout interface

**GitHub Activity Details**:
- Commit diff preview (+ green lines, - red lines in mono font)
- File tree with expand/collapse
- Inline code snippets in mono font

### Empty States & Loading

**Empty Feed**:
- Centered icon (w-16 h-16)
- Headline (text-lg)
- Description text
- Primary CTA button

**Loading Skeleton**:
- Animated pulse on card placeholders
- Match actual card dimensions

---

## Icons

**Library**: Heroicons (via CDN)
- Navigation: outline style
- Inline actions: solid style (16px)
- Project types: mini style with color fills

**Key Icons**:
- Tasks: CheckCircle
- Conversations: ChatBubbleLeft
- GitHub: CodeBracket
- Settings: Cog
- Add: Plus
- Filter: FunnelIcon

---

## Images

**No hero section needed** - This is a utility dashboard, not a marketing page.

**Only Images Required**:
- User avatars (32px circular in feed, 40px in header)
- Project logos/icons (24px in feed, 48px in project cards)
- Agent profile images (32px circular in conversation logs)

Use placeholder services or icon-based fallbacks for missing images.

---

## Accessibility

- All interactive elements have visible focus states (ring-2)
- Form inputs have associated labels (not just placeholders)
- Status indicators use icons + text (not color alone)
- Keyboard navigation for all actions (Tab, Enter, Escape)
- ARIA labels on icon-only buttons
- Sufficient contrast on all text

---

## Responsive Behavior

**Mobile (< 768px)**:
- Sidebar converts to overlay drawer
- Feed items stack vertically
- Hide secondary metadata, show on tap/expand
- Sticky top bar with hamburger menu

**Tablet (768px - 1024px)**:
- Collapsible sidebar (icon-only mode)
- Two-column project grid
- Full feed cards

**Desktop (> 1024px)**:
- Full sidebar visible
- Three-column project grid
- Side panel for task details (slide-over)