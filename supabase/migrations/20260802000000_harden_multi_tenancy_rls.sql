-- Harden multi-tenancy RLS: close open self-service escalation paths found
-- during pre-onboarding security audit.
--
-- 1. admins INSERT was `with_check: true` for role public — anyone with a
--    self-service Supabase auth account could insert their own admins row
--    with is_super_admin=true and/or an arbitrary university_id, bypassing
--    the register-admin edge function entirely (full cross-tenant takeover
--    or platform-wide super-admin escalation). Nothing in the client depends
--    on this policy: registration always goes through register-admin, which
--    uses the service_role key and bypasses RLS regardless.
drop policy if exists "Allow admin creation during registration" on public.admins;

-- 2. universities INSERT was `with_check: true` for role public — same
--    issue, and also unused by any client code path (createUniversity in
--    dbService.js is dead code; the real creation path is the
--    register-admin edge function, which uses service_role).
drop policy if exists "Anyone can create a university" on public.universities;

-- 3. super_admin_keys had RLS disabled entirely, so the policies below were
--    dead and default table grants applied unconditionally. Even with RLS
--    on, the anon_can_insert_keys policy (with_check: true) let anyone
--    insert their own OTP code and immediately "verify" it themselves — a
--    complete super-admin auth bypass requiring no access to the admin's
--    inbox at all. OTP generation/verification has been moved server-side
--    into the request-super-admin-key / verify-super-admin-key edge
--    functions (service role), so the client no longer needs any direct
--    access to this table.
alter table public.super_admin_keys enable row level security;

drop policy if exists "anon_can_insert_keys" on public.super_admin_keys;
drop policy if exists "anon_can_select_valid_keys" on public.super_admin_keys;
drop policy if exists "anon_can_update_to_used" on public.super_admin_keys;
-- service_role_all_access is left in place — only the edge functions (using
-- the service role key) can touch this table now.
