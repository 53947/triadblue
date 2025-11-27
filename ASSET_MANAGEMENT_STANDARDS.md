# Asset Management Standards - TriadBlue Ecosystem

## MANDATORY REQUIREMENT FOR ALL AGENTS

**This is not optional.** When building any application or website within the TriadBlue ecosystem, you **MUST** implement a complete asset upload interface from the beginning. This is a standard deliverable, not a "nice-to-have" feature.

---

## Why This Matters

Every TriadBlue application needs:
- **Favicon** (browser tab icon) that the user can update without editing code
- **Company logos** for headers, widgets, and branding elements
- **Centralized asset management** accessible through the dashboard

Static files in code are not acceptable. Users must be able to upload and manage these assets through a UI.

---

## What You MUST Build

### 1. Asset Upload Interface (Dashboard Page)

**Requirements:**
- Dedicated "Asset Management" or "Settings" page in the authenticated dashboard
- Upload form for **favicon** (ICO, PNG, SVG, WEBP formats)
- Upload form for **company logos** (PNG, SVG, WEBP formats)
- File validation: max 2MB per file, whitelisted formats only
- Live preview of uploaded assets before saving
- Ability to replace/delete existing assets
- Clear visual indicators showing which assets are currently active

**UI Components:**
- File input with drag-and-drop support
- Image preview thumbnails
- "Upload" and "Set as Active" buttons
- Delete/replace controls
- Success/error toast notifications

---

### 2. Backend API & Storage

**Database Schema:**
```typescript
// Add to shared/schema.ts
import { sql } from "drizzle-orm";

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }), // Nullable for global assets
  type: varchar("type", { length: 50 }).notNull(), // 'favicon', 'logo', 'image'
  filename: varchar("filename", { length: 255 }).notNull(), // Server-generated UUID-based filename
  originalFilename: varchar("original_filename", { length: 255 }).notNull(), // Original user-provided name
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(), // in bytes
  isActive: boolean("is_active").notNull().default(false),
  uploadedById: varchar("uploaded_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
}, (table) => ({
  // Ensure only one active asset per type+project (coalesce handles global assets)
  uniqueActiveAsset: sql`create unique index if not exists "assets_unique_active_idx" on ${table} ("type", coalesce("project_id",'00000000-0000-0000-0000-000000000000')) where "is_active" = true`,
  // Indexes for filtering and audit
  typeIdx: sql`create index if not exists "assets_type_idx" on ${table} ("type", "uploaded_at" desc)`,
  uploadedByIdx: sql`create index if not exists "assets_uploaded_by_idx" on ${table} ("uploaded_by_id", "uploaded_at" desc)`,
}));
```

**Storage:**
- Store files in `/uploads` directory (or Replit App Storage for production scale)
- Track metadata in PostgreSQL database
- Serve files via Express static route: `app.use('/uploads', express.static('uploads'))`

**API Endpoints:**
```
POST   /api/assets          - Upload new asset (multipart/form-data)
GET    /api/assets          - List all assets (with type filtering)
GET    /api/assets/:id      - Get specific asset metadata
PATCH  /api/assets/:id      - Set asset as active
DELETE /api/assets/:id      - Delete asset
GET    /uploads/:filename   - Serve asset file (static route)
```

**File Upload Middleware:**
- Use `multer` for handling multipart/form-data
- Validate file types: `['image/png', 'image/svg+xml', 'image/x-icon', 'image/webp']`
- Enforce size limit: 2MB maximum
- Generate safe filenames (prevent path traversal)
- Require authentication for all asset operations

---

### 3. Comprehensive Favicon Implementation for Global Visibility

**CRITICAL: Favicons must work globally** - not just in the browser, but also in:
- Search engines (Google requires 48×48+ for search results)
- Social media (Facebook, Twitter, LinkedIn previews)
- Mobile devices (iOS, Android home screens)
- Browser tabs and bookmarks across all browsers

#### Step 1: HTML Head Setup (index.html)

Add multiple favicon sizes and social media meta tags to `client/index.html`:

```html
<!-- Favicon - Multiple sizes for global visibility -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/favicon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
<link rel="shortcut icon" href="/favicon.png" />

<!-- Open Graph / Social Media (will be converted to absolute URL by boot script) -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Your App Name" />
<meta property="og:description" content="Your app description" />
<meta property="og:image" content="/favicon.png" data-need-absolute />
<meta property="og:url" content="" data-need-absolute-url />

<!-- Twitter Card (will be converted to absolute URL by boot script) -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="Your App Name" />
<meta name="twitter:description" content="Your app description" />
<meta name="twitter:image" content="/favicon.png" data-need-absolute />
```

**Why multiple sizes?**
- 16×16 and 32×32: Browser tabs
- 48×48+: Google search results (required)
- 180×180: iOS home screen icons
- 192×192: Android home screen icons

#### Step 2: Boot Script for Absolute URLs

Add this script to `<body>` in `index.html` (before `<div id="root">`):

```html
<script>
  (function() {
    // Theme initialization
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme || "dark";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
    
    // Convert relative URLs to absolute for social media crawlers
    const baseUrl = window.location.origin;
    const currentUrl = window.location.href;
    
    const metasNeedingAbsolute = document.querySelectorAll('[data-need-absolute]');
    metasNeedingAbsolute.forEach(function(meta) {
      if (meta.content && meta.content.startsWith('/')) {
        meta.content = baseUrl + meta.content;
      }
    });
    
    const urlMetas = document.querySelectorAll('[data-need-absolute-url]');
    urlMetas.forEach(function(meta) {
      meta.content = currentUrl;
    });
  })();
</script>
```

**Why this matters:**
- Social media crawlers (Facebook, Twitter, LinkedIn) need absolute URLs
- This runs immediately before React loads
- Converts `/favicon.png` → `https://yourdomain.com/favicon.png`

#### Step 3: Enhanced DynamicFavicon Component

```typescript
// client/src/components/dynamic-favicon.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@shared/schema";
import { checkAuth } from "@/lib/auth";

export function DynamicFavicon() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth().then(setIsAuthenticated);
  }, []);

  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const activeFavicon = assets.find(
    (asset) => asset.type === "favicon" && asset.isActive
  );

  useEffect(() => {
    const relativeFaviconUrl = activeFavicon 
      ? `/uploads/${activeFavicon.filename}`
      : "/favicon.png";
    const absoluteFaviconUrl = window.location.origin + relativeFaviconUrl;
    const mimeType = activeFavicon?.mimeType || "image/png";

    // Update ALL favicon link tags
    const iconSelectors = [
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='apple-touch-icon']"
    ];

    iconSelectors.forEach(selector => {
      const links = document.querySelectorAll<HTMLLinkElement>(selector);
      links.forEach(link => {
        link.href = relativeFaviconUrl;
        link.type = mimeType;
      });
    });

    // Update social media meta tags with ABSOLUTE URLs
    const ogImage = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
    if (ogImage) {
      ogImage.content = absoluteFaviconUrl;
    }

    const twitterImage = document.querySelector<HTMLMetaElement>("meta[name='twitter:image']");
    if (twitterImage) {
      twitterImage.content = absoluteFaviconUrl;
    }
  }, [activeFavicon]);

  return null;
}
```

**Key improvements:**
- Updates ALL favicon links (icon, shortcut, apple-touch-icon)
- Uses absolute URLs for social media meta tags
- Handles custom uploaded favicons seamlessly
- Maintains fallback to `/favicon.png`

#### Step 4: Default Favicon

Place a default `favicon.png` (at least 48×48 pixels, ideally 512×512) in `client/public/` directory.

**Requirements:**
- Square format (1:1 aspect ratio)
- PNG format recommended (best compatibility)
- Minimum 48×48 pixels (for Google search results)
- Recommended: 512×512 pixels (scales well for all sizes)

**Key Points:**
- Default fallback is `/favicon.png` (stored in `client/public/`)
- Set `type` attribute to match file MIME type (`image/png`, `image/svg+xml`, `image/x-icon`)
- Only fetch assets API when authenticated to avoid 401 errors on public pages
- Social media crawlers get absolute URLs for proper previews
```

---

### 4. Logo Integration in Headers/Widgets

**Requirements:**
- Header logo component must fetch from API, not hardcoded imports
- Support fallback to default logo if none uploaded
- Auto-refresh when new logo is set as active

**Implementation Pattern:**
```typescript
// Fetch active logo
const { data: activeLogo } = useQuery({
  queryKey: ['/api/assets', { type: 'logo', active: true }],
});

// Render with fallback
<img 
  src={activeLogo?.filename ? `/uploads/${activeLogo.filename}` : '/default-logo.svg'} 
  alt="Company Logo"
/>
```

---

## Acceptance Criteria

Before considering the project complete, verify:

- [ ] Asset Management page exists in dashboard with upload forms
- [ ] User can upload favicon and see it in browser tab immediately
- [ ] User can upload company logo and see it in header/widgets
- [ ] File validation prevents invalid formats and oversized files
- [ ] Preview functionality works before confirming upload
- [ ] Delete/replace operations work correctly
- [ ] No hardcoded image imports for favicon or primary logos
- [ ] API endpoints are authenticated (require login)
- [ ] Success/error feedback is clear to the user
- [ ] Documentation explains the upload workflow

---

## Security Checklist

- [ ] File type whitelist enforced (no arbitrary uploads)
- [ ] File size limit enforced (max 2MB)
- [ ] Filename sanitization prevents path traversal
- [ ] All asset operations require authentication
- [ ] MIME type validation (don't trust file extensions alone)
- [ ] Uploaded files served with proper Content-Type headers

---

## Documentation Requirements

Every project MUST include this in its README or ONBOARDING guide:

```markdown
## Asset Management

This application includes a built-in Asset Management system accessible from the dashboard.

**Upload Favicon:**
1. Navigate to Settings → Asset Management
2. Click "Upload Favicon"
3. Select an ICO, PNG, or SVG file (max 2MB)
4. Preview and confirm
5. Favicon updates immediately in browser tabs

**Upload Company Logo:**
1. Navigate to Settings → Asset Management  
2. Click "Upload Logo"
3. Select a PNG or SVG file (max 2MB)
4. Set as active to display in header
5. Logo updates across the application

**File Storage:**
- Assets stored in `/uploads` directory
- Metadata tracked in PostgreSQL `assets` table
- Served via `/uploads/:filename` route
```

---

## Quick Start Checklist for Agents

When starting a new TriadBlue project:

1. **Database Schema** - Add `assets` table to `shared/schema.ts`
2. **Storage Layer** - Add asset CRUD methods to `server/storage.ts`
3. **Install Multer** - Run `packager_tool install nodejs multer @types/multer`
4. **API Routes** - Implement upload/list/delete endpoints in `server/routes.ts`
5. **Create `/uploads`** - Make directory and configure static serving
6. **Dashboard UI** - Build Asset Management page with upload forms
7. **Dynamic Favicon** - Implement injection based on active asset
8. **Test Everything** - Upload, preview, activate, delete, and verify display

---

## Examples & Templates

Refer to **BlueLink** as the reference implementation:
- `shared/schema.ts` - Assets table definition
- `server/storage.ts` - Asset CRUD operations
- `server/routes.ts` - Upload API with multer
- `client/src/pages/asset-management.tsx` - Upload UI
- `client/src/components/dynamic-favicon.tsx` - Dynamic favicon injection component
- `client/public/favicon.png` - Default favicon (white background for dark browser themes)

---

## Non-Compliance

Projects without asset upload functionality will be considered **incomplete** and must be updated before delivery. This is not negotiable for TriadBlue ecosystem apps.

---

**Remember:** Users should never have to edit code to change a favicon or logo. Build the interface from day one.
