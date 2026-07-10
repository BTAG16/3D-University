-- Add settings columns to universities table.
-- welcome_message: shown as a modal on the public map for first-time visitors.
-- analytics_enabled / cookies_enabled: consent toggles configured by the admin.
alter table universities
  add column if not exists welcome_message   text    default null,
  add column if not exists analytics_enabled boolean default true,
  add column if not exists cookies_enabled   boolean default true;
