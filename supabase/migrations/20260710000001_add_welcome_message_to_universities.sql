-- Add welcome_message to universities table.
-- Displayed as a modal on the public map for first-time visitors.
alter table universities
  add column if not exists welcome_message text default null;
