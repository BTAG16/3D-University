# Multi-Tenant Hardening Plan

Status as of 2026-08-02. Branch: `multi-tenant` (pushed to `origin/multi-tenant`, up to commit `dc53749`). `main` and `single-tenant` are untouched — see "Branch model" below before doing anything.

## Goal

Get the multi-tenant SaaS platform (shared infra, universities onboard as tenants) fully stabilized before onboarding real customers. First pilot partner: University of Dunaújváros (already a live row in the DB).

## Branch model

- `main` — active general development.
- `multi-tenant` — the SaaS platform: shared infra, tenant isolation, MFA-gated onboarding. **All work in this plan happens here.**
- `single-tenant` — sold/handed off to one university, who owns the whole deployment; auth only needs to serve a single admin. Leave untouched.
- `staging` — untouched, frozen at the same old fork point as `single-tenant`.

`multi-tenant` was a day behind `main` and was merged up before this work started; both are now current as of `dc53749`.

## Done this pass

### Security (RLS / database)
- Dropped wide-open `admins`/`universities` INSERT policies (`with_check: true` for anyone) — were letting any signed-up user self-escalate to super admin or hijack any university's admin role. Confirmed unused by any real client path before removing.
- `super_admin_keys` had RLS disabled and a self-defeating INSERT policy — anyone could mint and immediately redeem their own OTP with no email access, a full super-admin auth bypass. OTP generation/verification moved server-side into `request-super-admin-key` / `verify-super-admin-key` edge functions (service role only).
- `universities.admin_email` was readable by any anonymous visitor via the public map's `select('*')` **and** directly via the raw REST API (`GET /rest/v1/universities?select=admin_email`) — confirmed live, was exposing the real University of Dunaújváros contact email. Fixed with `REVOKE`/`GRANT` at the column level (app-level column exclusion alone wasn't enough — Postgres table-level grants override column-level revokes, so the fix has to revoke the table-level grant first, then re-grant the safe columns).
- `rooms_with_building` view changed to `SECURITY INVOKER` (Supabase linter finding, `0010_security_definer_view`). Not an active leak — underlying tables are already fully public — but closes a future footgun if their RLS is ever tightened.
- All of the above verified live via direct `curl` calls against the production REST API (not just read from policy diffs) — self-service escalation attempts on `admins`/`universities`/`super_admin_keys` all now return `401` with RLS violation errors.

### Auth
- **Mandatory TOTP MFA for tenant admins**, using Supabase's native MFA (not a custom email-OTP hack): enrollment (QR + manual secret) is forced right after registration, and every login requires a 6-digit code step-up. Enforced via the session's Authenticator Assurance Level (AAL) — `AdminAuthContext`'s `loadAdminSession` won't grant a session until AAL2. New routes: `/admin/mfa-setup`, `/admin/mfa-challenge`.
  - Verified live end-to-end (real browser, real Supabase project): registration → enrollment → dashboard, and logout → login → challenge → dashboard, both clean.
  - Caught and fixed two real bugs only visible under live testing: Supabase's `qr_code` is a ready-to-use `data:` URI (needs `<img src>`, not `dangerouslySetInnerHTML`), and `listFactors()` hides unverified factors from the typed arrays (only `all` has them), which broke re-enrollment after a page reload.
- **Super admin login previously never established a real Supabase Auth session** — it was pure client-side React state ("logged in" with no real `auth.uid()`). This meant `delete-admin-auth` (and any future edge function requiring a real bearer token) would silently 401 regardless of a valid-looking super-admin session. Fixed: `verify-super-admin-key` now mints a real session via `admin.auth.admin.generateLink()` (service role), and the client redeems it via `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })` before granting the UI session.
- Fixed a StrictMode double-invoke bug that was sending two OTP emails per super-admin login request (`useState` guard doesn't survive React 18's dev-mode double effect invocation; switched to `useRef`).

### Stability
- **App-wide blank-page crash**: zero error boundaries existed anywhere in the app. A WebGL init failure in any Mapbox instance (disabled hardware acceleration, corporate lockdowns, privacy-hardened browsers, headless browsers — not just a testing artifact) unmounted the *entire* React tree back to an empty `<div id="root">`, not just the map widget. Found via live mobile-viewport testing of the Landing page. Added a reusable `ErrorBoundary` component and wrapped every `MapComponent` usage: `PublicMap`, `EmbedMap`, `DemoMap`, and `SuperAdminDashboard`'s Global Map tab.
- **Super Admin Dashboard's Universities/Analytics/Global Map tabs went blank** — a direct regression from the `admin_email` fix above. This dashboard's "super admin" session runs under the Postgres `anon` role (see previous point — no real auth existed until the fix above), and its `loadData()` did `select('*')` on `universities`, which now fails under `anon`'s reduced grant. The error was silently swallowed (early return, no user-facing message). Fixed with an explicit column list.
- Redesigned `SuperAdminDashboard`'s "Global Map" tab to use the shared `MapComponent` (same chip/stem/dot marker styling as the public map) instead of raw `mapboxgl` with plain circle markers — consistent look, dark-mode support, and it now reuses the existing university-detail modal on marker click. (Note: an earlier attempt in this session redesigned a *different*, orphaned `SuperAdminMap.jsx` standalone page that turned out to have no route registered anywhere — that file was deleted; the dashboard's inline tab was the one that actually needed it.)

## Known architectural gotcha (read before touching super-admin code)

Anything done "as super admin" in this app runs under the Postgres **`anon`** role unless it goes through the real Supabase Auth session established at login (now fixed, see above). If something in `SuperAdminDashboard.jsx` goes blank after a future RLS/grant change, check whether it's doing `select('*')` on a table where `anon`'s privileges just got tightened — that's almost certainly why.

## Testing notes

- Headless Chromium (via the gstack `/browse` skill) **cannot initialize WebGL** — Mapbox will always throw in that environment. This is expected, not a bug. Verify map-containing pages via DOM content / console errors / layout, not actual canvas rendering.
- A lightweight Node TOTP generator (RFC 6238, no dependencies) was used to compute valid 6-digit codes from a known base32 secret for testing MFA without a physical authenticator app — useful again if MFA needs re-testing.

## Still open — pick up here in the next session

1. **Full responsive/functional audit** — only spot-checked so far (mobile viewport only): Landing, Admin login/register, Admin dashboard (logged in), Super Admin login, Public Map. Still need:
   - Tablet (768×1024) and desktop (1280×720) passes for all of the above.
   - Super Admin Dashboard itself (Overview/Universities/Analytics/Global Map tabs, university detail modal, delete-university flow) — requires a real OTP email round-trip to test live since there's no way to self-serve the super-admin login.
   - `AdminMfaSetup`/`AdminMfaChallenge` on tablet/desktop.
   - Form validation edge cases (empty fields, invalid email formats, password requirements) across Admin/SuperAdmin login and register.
   - `EmbedMap` actually embedded in a real iframe on a third-party-style test page (not just the direct route).
2. **Verify the super-admin real-session fix live** — the `generateLink`/`verifyOtp` change (commit `dc53749`) was verified by code review + successful build only, not a full live browser round-trip, since that requires checking the real super-admin inbox for the OTP code. Worth doing once, including confirming "Delete University" actually succeeds now (it should have been failing before this fix — untested whether it was, and unconfirmed it now works).
3. **Test data cleanup** — "Test University QA" and "Test University Login QA" are real rows in the live production database from this session's MFA testing (deliberately left in place at the time). Should be deleted via the super-admin dashboard once a real session is confirmed working, or directly via SQL.
4. **Database password rotation** — the DB password was pasted in plaintext into chat mid-session (needed for `supabase db push`). User was advised to rotate it via Supabase Dashboard → Project Settings → Database. Unconfirmed whether this happened.
5. **Bundle size** — build warns on a 2.6MB main chunk (704KB gzipped). Not addressed this pass; candidate for code-splitting (`manualChunks` / dynamic imports) if load time becomes a concern before onboarding more tenants.

## Reference: files touched this pass

- `supabase/migrations/20260802000000_harden_multi_tenancy_rls.sql` — drop open INSERT policies, lock down `super_admin_keys`.
- `supabase/migrations/20260802010000_revoke_anon_admin_email_column.sql` — first (ineffective) admin_email attempt.
- `supabase/migrations/20260802020000_fix_anon_admin_email_column_revoke.sql` — the actual fix (revoke table-level, re-grant column-level).
- `supabase/migrations/20260802030000_rooms_with_building_security_invoker.sql` — view fix.
- `supabase/functions/request-super-admin-key/`, `supabase/functions/verify-super-admin-key/` — replace `send-super-admin-key` (deleted).
- `src/lib/authService.js`, `src/AdminAuthContext.jsx` — MFA methods, AAL gating, real super-admin session.
- `src/AdminMfaSetup.jsx`, `src/AdminMfaChallenge.jsx` — new MFA routes.
- `src/AdminLogin.jsx`, `src/AdminRegister.jsx`, `src/App.jsx` — MFA routing.
- `src/SuperAdminLogin.jsx` — StrictMode double-send fix.
- `src/components/ErrorBoundary.jsx` — new, wraps every map instance (`PublicMap.jsx`, `EmbedMap.jsx`, `DemoMap.jsx`, `SuperAdminDashboard.jsx`).
- `src/SuperAdminDashboard.jsx` — Global Map tab redesign, `admin_email` query regression fix.
- `src/lib/dbService.js` — `getUniversityPublic`/`getAllUniversitiesPublic` (safe public columns), used by `PublicMap.jsx`/`EmbedMap.jsx`.
