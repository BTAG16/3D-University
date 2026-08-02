# Multi-Tenancy Implementation Plan

> Branch: `multi-tenant`
> Status: Not yet implemented — this document defines the full roadmap.
> Last updated: 2026-07-07

---

## Current State

Both `single-tenant` and `multi-tenant` branches are currently identical in code. The database schema already supports multiple universities via `university_id` scoping, but the frontend has no meaningful distinction between the two deployment models. This document defines exactly what needs to change to make `multi-tenant` a proper multi-tenant SaaS platform.

---

## What Multi-Tenancy Means Here

| | Single-Tenant | Multi-Tenant |
|---|---|---|
| Universities | 1 (pre-seeded) | Unlimited |
| Signup | Disabled or invite-only | Open — each signup creates a university |
| Admins per university | 1 | Many (via invite) |
| Super admin | Optional | Required (manages all tenants) |
| Public map URL | `/map` (fixed) | `/map?uni=<id>` (per-university) |
| Billing | Flat | Per-university (future) |

---

## Phase 1 — Foundation (Security & Auth)

### 1.1 Fix Hardcoded Super Admin Email

**File:** `src/AdminAuthContext.jsx`

**Problem:** `rumeighoraye@gmail.com` is hardcoded on line ~375. Only this address can ever receive the super admin secret key.

**Fix:**
- Add `VITE_SUPER_ADMIN_EMAIL` to `.env`
- Replace hardcoded string with `import.meta.env.VITE_SUPER_ADMIN_EMAIL`
- Add validation on app start to throw if the env var is missing

```js
// Before
email: 'rumeighoraye@gmail.com',

// After
email: import.meta.env.VITE_SUPER_ADMIN_EMAIL,
```

**Also needed in `.env.example`:**
```
VITE_SUPER_ADMIN_EMAIL=your-superadmin@email.com
```

---

### 1.2 Supabase Row-Level Security (RLS) Policies

**Problem:** All authorization is client-side only. A malicious actor with a valid session token can call the Supabase API directly and modify any university's data by passing arbitrary IDs.

**Fix:** Enable RLS on all tables and add the following policies in Supabase SQL editor:

```sql
-- Universities: admins can only read/update their own
CREATE POLICY "admin_read_own_university"
  ON universities FOR SELECT
  USING (
    id IN (SELECT university_id FROM admins WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "admin_update_own_university"
  ON universities FOR UPDATE
  USING (
    id IN (SELECT university_id FROM admins WHERE id = auth.uid())
  );

-- Buildings: scoped to admin's university
CREATE POLICY "admin_manage_own_buildings"
  ON buildings FOR ALL
  USING (
    university_id IN (SELECT university_id FROM admins WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Rooms: scoped to admin's university
CREATE POLICY "admin_manage_own_rooms"
  ON rooms FOR ALL
  USING (
    university_id IN (SELECT university_id FROM admins WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Admins: can only read their own record (except super admin)
CREATE POLICY "admin_read_own_record"
  ON admins FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_super_admin = true)
  );
```

---

### 1.3 Client-Side Ownership Verification (Defense-in-Depth)

**File:** `src/lib/dbService.js`

**Problem:** `updateBuilding(buildingId, updates)` and `deleteBuilding(buildingId)` accept any `buildingId` with no check that it belongs to the logged-in admin's university.

**Fix:** Before any mutation, fetch the resource and verify `university_id` matches the session:

```js
// Example for updateBuilding
async updateBuilding(buildingId, updates) {
  const { data: building } = await supabase
    .from('buildings')
    .select('university_id')
    .eq('id', buildingId)
    .single()

  if (building.university_id !== this.getCurrentUniversityId()) {
    return { success: false, error: 'Unauthorized' }
  }

  // proceed with update
}
```

---

### 1.4 Route-Level Guard on Admin Dashboard

**File:** `src/App.jsx`

**Problem:** `/admin/dashboard` has no route-level protection — the guard is inside `AdminDashboard.jsx`, so unauthenticated users momentarily render the component before being redirected.

**Fix:** Add a `<ProtectedRoute>` wrapper:

```jsx
function ProtectedRoute({ children }) {
  const { adminSession, loading } = useAdminAuth()
  if (loading) return <PageLoader />
  if (!adminSession) return <Navigate to="/admin/login" replace />
  return children
}

// In router:
<Route path="/admin/dashboard" element={
  <ProtectedRoute><AdminDashboard /></ProtectedRoute>
} />
```

---

## Phase 2 — Multi-Admin Per University

### 2.1 Invite Co-Admin Flow

**Problem:** There is no way for an admin to invite another admin to manage their university. Signup always creates a NEW university, so there's no way to add a second admin to an existing one.

**New feature: Admin Settings → "Team" tab**

**Database:** Add an `admin_invites` table:
```sql
CREATE TABLE admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Frontend flow:**
1. Admin goes to Settings → Team
2. Enters email address → system emails an invite link `/admin/accept-invite?token=<uuid>`
3. Invitee clicks link → lands on a registration page pre-filled with the university (no university creation step)
4. Invitee sets password → new `admins` row created with the same `university_id`
5. Both admins can now manage the same university

**Files to create/modify:**
- `src/components/AdminSettings.jsx` — add "Team" tab with invite form + list of current admins
- `src/pages/AcceptInvite.jsx` — new page for invite acceptance
- `src/lib/dbService.js` — `createInvite()`, `getInvite(token)`, `acceptInvite(token, password)`
- `src/lib/authService.js` — `registerWithInvite(token, email, password)`
- `src/App.jsx` — add `/admin/accept-invite` route

---

### 2.2 Admin List in Settings

In AdminSettings, under a new "Team" tab:
- List all admins for the current university
- Show their email, join date, last login
- Allow the primary admin to remove co-admins (but not themselves)
- Show pending invites with option to revoke

---

## Phase 3 — Signup & Onboarding

### 3.1 Current Signup (Single-Tenant Pattern)

`src/lib/authService.js` always does:
```js
// Creates a brand new university for every signup
INSERT INTO universities (name, city, admin_email) VALUES (...)
```

This is correct for multi-tenant (each new customer gets their own university). **Keep this flow.**

### 3.2 What Needs to Change

- After signup, show an **onboarding wizard** (not just dump them into the empty dashboard):
  1. Step 1: Confirm university name and details
  2. Step 2: Add your first building (with map pin)
  3. Step 3: Invite co-admins (optional)
  4. Step 4: Copy your public map link

- **File to create:** `src/components/OnboardingWizard.jsx`
- **Trigger:** Show when `buildings.length === 0` on first dashboard load

### 3.3 University Slug / Subdomain (Future)

For proper multi-tenant UX, each university should have a URL-friendly slug:
- `kampus.app/map/university-of-lagos` instead of `kampus.app/map?uni=<uuid>`
- Add `slug` column to `universities` table
- Generate on signup from university name
- Redirect old `?uni=` URLs to slug URLs

---

## Phase 4 — Super Admin Hardening

### 4.1 Persistent Super Admin Role

**Problem:** Super admin access is entirely session-based with a one-time key. There's no persistent super admin user — each login requires a new key sent to the hardcoded email.

**Fix options (pick one):**

**Option A (Simple):** Keep one-time key system but store super admin email in env var (see Phase 1.1). This is the minimal fix.

**Option B (Proper):** Add `is_super_admin` flag to the `admins` table and allow super admins to log in through the normal auth flow with an additional verification step (TOTP/email OTP). Remove the one-time key system.

```sql
ALTER TABLE admins ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
```

### 4.2 Super Admin Dashboard Enhancements

**File:** `src/SuperAdminDashboard.jsx`

Current super admin can see all universities. Add:
- **Usage metrics per university** — building count, room count, last activity
- **Suspend/unsuspend university** — `is_active` flag on universities table; suspended universities' public maps show a maintenance page
- **Impersonate admin** — "View as" button that lets super admin see the dashboard as a specific admin (read-only)
- **Audit log** — table of all mutations (who changed what, when) per university

### 4.3 Per-University Feature Flags (Future/Billing)

```sql
CREATE TABLE university_features (
  university_id UUID REFERENCES universities(id),
  feature TEXT NOT NULL, -- 'timetable', 'indoor_nav', 'embed', 'fpv_tour'
  enabled BOOLEAN DEFAULT true,
  PRIMARY KEY (university_id, feature)
);
```

This enables per-tenant feature toggles for future billing tiers.

---

## Phase 5 — Data Isolation Audit

### 5.1 Public Map

**File:** `src/PublicMap.jsx`

- Currently requires `?uni=<uuid>` param — correct
- If no `uni` param: shows error or redirects — verify this is graceful
- Ensure the search function (`dbService.searchBuildings`) always requires `universityId` — currently has optional parameter which could accidentally expose cross-tenant data

### 5.2 Embed Map

**File:** `src/EmbedMap.jsx`

- Verify embed always reads `universityId` from URL param
- Add iframe CSP headers recommendation in embed docs

### 5.3 Demo Map

**File:** `src/DemoMap.jsx`

- Demo map uses `sessionStorage` — fully isolated, no DB reads for buildings
- Rooms in demo use `demoRoomsData.js` — hardcoded, no DB exposure
- No changes needed for multi-tenancy

---

## Implementation Order (Priority)

| Priority | Task | Effort | Risk |
|---|---|---|---|
| 🔴 P0 | RLS policies in Supabase | Low (SQL only) | High if skipped |
| 🔴 P0 | Fix hardcoded super admin email | Trivial | Security |
| 🟠 P1 | ProtectedRoute wrapper | Small | Low |
| 🟠 P1 | Client-side ownership check in dbService | Medium | Low |
| 🟡 P2 | Multi-admin invite system | Large | Medium |
| 🟡 P2 | Onboarding wizard | Medium | Low |
| 🟢 P3 | Super admin hardening | Large | Low |
| 🟢 P3 | University slug/subdomain | Large | Medium |
| ⚪ P4 | Per-university feature flags | Medium | Low |
| ⚪ P4 | Billing integration | XL | High |

---

## Files Summary

| File | Change Type | Phase |
|---|---|---|
| `src/AdminAuthContext.jsx` | Edit — env var for super admin email | 1.1 |
| `src/lib/dbService.js` | Edit — ownership checks on mutations | 1.3 |
| `src/App.jsx` | Edit — ProtectedRoute wrapper | 1.4 |
| `src/components/AdminSettings.jsx` | Edit — add Team tab | 2.1 |
| `src/pages/AcceptInvite.jsx` | New — invite acceptance page | 2.1 |
| `src/lib/authService.js` | Edit — registerWithInvite() | 2.1 |
| `src/components/OnboardingWizard.jsx` | New — post-signup onboarding | 3.2 |
| `src/SuperAdminDashboard.jsx` | Edit — usage metrics, suspend, impersonate | 4.2 |
| `supabase/migrations/` | New — RLS policies, invites table, slug column | 1.2, 2.1, 3.3 |
| `.env` / `.env.example` | Edit — VITE_SUPER_ADMIN_EMAIL | 1.1 |
