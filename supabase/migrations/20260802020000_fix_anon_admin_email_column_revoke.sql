-- The previous migration (20260802010000) revoked column-level SELECT on
-- admin_email from anon, but that had no effect: Supabase's default schema
-- privileges grant anon a *table-level* SELECT on public.universities
-- (GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated),
-- and in Postgres a table-level grant already encompasses every column —
-- revoking a column-level privilege that was never separately granted does
-- nothing while the table-level grant still stands. Confirmed live: direct
-- REST calls could still read admin_email after the first migration.
--
-- Correct fix: revoke the table-level SELECT entirely, then re-grant
-- column-level SELECT on every column except admin_email. The existing RLS
-- policy ("Universities are viewable by everyone", qual: true) still applies
-- as the row filter — this only restricts which columns are visible.
revoke select on public.universities from anon;

grant select (
  id, name, city, created_at, logo_url, welcome_message,
  analytics_enabled, cookies_enabled, accent_color, timezone,
  map_center_lat, map_center_lng
) on public.universities to anon;

-- Privilege changes don't always trigger PostgREST's automatic schema-cache
-- refresh the way table/column DDL does — force it explicitly.
notify pgrst, 'reload config';
