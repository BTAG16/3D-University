-- Enable Supabase realtime for universities and buildings tables.
-- This allows admin dashboards on multiple devices to receive live updates
-- when settings or building data are changed from any device.

alter table universities replica identity full;
alter table buildings  replica identity full;

-- Add tables to the realtime publication (idempotent via DO block)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'universities'
  ) then
    alter publication supabase_realtime add table universities;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'buildings'
  ) then
    alter publication supabase_realtime add table buildings;
  end if;
end $$;
