-- Add Mappedin indoor map URL to buildings table.
-- This allows admins to configure an indoor map per-building via the Building form.
-- The URL is only set for buildings that have a Mappedin indoor map available.
alter table buildings
  add column if not exists mappedin_url text default null;
