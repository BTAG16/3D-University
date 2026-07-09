# Supabase Setup

## 1. Create a project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Choose a name, set a strong database password, and pick a region close to your users
4. Wait ~2 minutes for provisioning

## 2. Get your API keys

1. Go to **Project Settings → API**
2. Copy **Project URL** → `VITE_SUPABASE_URL`
3. Copy **anon / public** key → `VITE_SUPABASE_ANON_KEY`

Add both to your `.env` file.

## 3. Run the database schema

Open the [SQL Editor](https://supabase.com/dashboard/project/_/sql) in your project and run the following:

```sql
-- Universities
create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  logo_url text,
  accent_color text default '#0EA5E9',
  welcome_message text,
  map_center_lat numeric,
  map_center_lng numeric,
  timezone text default 'UTC',
  analytics_enabled boolean default true,
  cookies_enabled boolean default true,
  public_link_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Admins
create table public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  university_id uuid references public.universities(id) on delete cascade,
  is_super_admin boolean default false,
  created_at timestamptz default now()
);

-- Buildings
create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  coordinates jsonb not null,
  category text,
  description text,
  facilities text[] default '{}',
  departments text[] default '{}',
  hours text,
  is_admin_building boolean default false,
  mappedin_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Rooms
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  room_number text,
  type text,
  description text,
  capacity integer,
  is_office boolean default false,
  schedule jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Super admin one-time keys
create table public.super_admin_keys (
  id uuid primary key default gen_random_uuid(),
  secret_key text not null,
  expires_at timestamptz not null,
  used boolean default false,
  used_at timestamptz,
  created_at timestamptz default now()
);
```

## 4. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
alter table public.universities enable row level security;
alter table public.admins enable row level security;
alter table public.buildings enable row level security;
alter table public.rooms enable row level security;
alter table public.super_admin_keys enable row level security;

-- Universities: admins can read/write their own university
create policy "Admins can view their university"
  on public.universities for select
  using (id in (select university_id from public.admins where id = auth.uid()));

create policy "Admins can update their university"
  on public.universities for update
  using (id in (select university_id from public.admins where id = auth.uid()));

-- Universities: public read for map pages
create policy "Public can read universities"
  on public.universities for select
  using (true);

-- Buildings: public read
create policy "Public can read buildings"
  on public.buildings for select
  using (true);

-- Buildings: admins can manage their university's buildings
create policy "Admins can manage their buildings"
  on public.buildings for all
  using (university_id in (select university_id from public.admins where id = auth.uid()));

-- Rooms: public read
create policy "Public can read rooms"
  on public.rooms for select
  using (true);

-- Rooms: admins can manage their rooms
create policy "Admins can manage their rooms"
  on public.rooms for all
  using (university_id in (select university_id from public.admins where id = auth.uid()));

-- Admins: can read own record
create policy "Admins can read own record"
  on public.admins for select
  using (id = auth.uid());

-- Super admin keys: service role only (managed via edge function)
create policy "Super admin keys are service-role only"
  on public.super_admin_keys for all
  using (false);
```

## 5. Create the events table

Run in the SQL Editor:

```sql
-- Events (live updates on public map)
create table public.events (
  id            uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  building_id   uuid references public.buildings(id) on delete set null,
  title         text not null,
  description   text,
  category      text default 'social',
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  is_published  boolean default true,
  created_at    timestamptz default now()
);

alter table public.events enable row level security;

create policy "Public can read published events"
  on public.events for select
  using (is_published = true);

create policy "Admins can manage their events"
  on public.events for all
  using (university_id in (select university_id from public.admins where id = auth.uid()));
```

Then enable Realtime for the table: **Database → Replication** → enable replication for `events`.

## 6. Configure Auth

1. Go to **Authentication → Settings**
2. Set **Site URL** to your deployed URL (e.g. `https://your-app.vercel.app`)
3. Add the same URL to **Redirect URLs**
4. Under **Email**, enable **Confirm email** if you want users to verify their email

## 6. Deploy the Edge Function

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-super-admin-key
```

Set the function's secrets:

```bash
npx supabase secrets set RESEND_API_KEY=re_your-key
npx supabase secrets set RESEND_FROM_EMAIL="Campus Explorer <noreply@your-domain.com>"
```

## 7. Create your super admin record

After deploying, create a super admin account:

1. Go to **Authentication → Users** in Supabase dashboard
2. Click **Add user** → set email and password
3. Copy the user's UUID
4. Run in SQL Editor:

```sql
insert into public.admins (id, email, is_super_admin)
values ('YOUR_USER_UUID', 'your-email@example.com', true);
```
