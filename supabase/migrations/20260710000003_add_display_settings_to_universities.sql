-- Add display/UX settings columns to universities table.
-- accent_color: brand colour shown on the public map.
-- timezone: used for event display formatting.
-- map_center_lat/lng: admin-configured default map viewport center.
alter table universities
  add column if not exists accent_color    text             default null,
  add column if not exists timezone        text             default 'UTC',
  add column if not exists map_center_lat  double precision default null,
  add column if not exists map_center_lng  double precision default null;
