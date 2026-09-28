-- =============================================================================
-- Grounding Truth Schema for DeepChill on Supabase Postgres
-- =============================================================================
--
-- Tables:
--   1. categories   (id, display_name, descriptions)
--   2. profiles     (id, uid, display_name, email)
--   3. projects     (id, url, name, tagline, discription, icon_url, user_id, category)
--   4. bids         (id, project_id, price, created_at)
--   5. total_clicks (project_id, count)
--   6. total_bids   (project_id, count)
-- =============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. CATEGORIES TABLE
-- =============================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  descriptions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_categories_display_name
  on public.categories (display_name);

alter table public.categories enable row level security;

create policy "Allow public read access to categories"
  on public.categories
  for select
  to public
  using (true);

create policy "Allow authenticated users to insert categories"
  on public.categories
  for insert
  to authenticated
  with check (true);

-- =============================================================================
-- 2. PROFILES TABLE
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_uid
  on public.profiles (uid);

create index if not exists idx_profiles_email
  on public.profiles (email);

alter table public.profiles enable row level security;

create policy "Allow public read access to profiles"
  on public.profiles
  for select
  to public
  using (true);

create policy "Allow users to insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = uid);

create policy "Allow users to update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = uid)
  with check ((select auth.uid()) = uid);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (uid, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (uid) do update
  set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- 3. PROJECTS TABLE
-- =============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  name text not null,
  tagline text,
  discription text,
  description text generated always as (discription) stored,
  icon_url text,
  user_id uuid references auth.users(id) on delete set null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id
  on public.projects (user_id);

create index if not exists idx_projects_category
  on public.projects (category);

create index if not exists idx_projects_created_at
  on public.projects (created_at desc);

alter table public.projects enable row level security;

create policy "Allow public read access to projects"
  on public.projects
  for select
  to public
  using (true);

create policy "Allow authenticated users to create projects"
  on public.projects
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Allow users to update own projects"
  on public.projects
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Allow users to delete own projects"
  on public.projects
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- =============================================================================
-- 4. BIDS TABLE
-- =============================================================================
create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  price integer not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_bids_project_id
  on public.bids (project_id);

create index if not exists idx_bids_project_price
  on public.bids (project_id, price desc);

create index if not exists idx_bids_created_at
  on public.bids (created_at desc);

alter table public.bids enable row level security;

create policy "Allow public read access to bids"
  on public.bids
  for select
  to public
  using (true);

create policy "Allow authenticated users to place bids"
  on public.bids
  for insert
  to authenticated
  with check (price > 0);

-- =============================================================================
-- 5. TOTAL_CLICKS TABLE
-- =============================================================================
create table if not exists public.total_clicks (
  project_id uuid primary key references public.projects(id) on delete cascade,
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.total_clicks enable row level security;

create policy "Allow public read access to total_clicks"
  on public.total_clicks
  for select
  to public
  using (true);

create or replace function public.increment_project_clicks(p_project_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_count integer;
begin
  insert into public.total_clicks (project_id, count, updated_at)
  values (p_project_id, 1, now())
  on conflict (project_id)
  do update set
    count = public.total_clicks.count + 1,
    updated_at = now()
  returning count into v_new_count;

  return v_new_count;
end;
$$;

-- =============================================================================
-- 6. TOTAL_BIDS TABLE
-- =============================================================================
create table if not exists public.total_bids (
  project_id uuid primary key references public.projects(id) on delete cascade,
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.total_bids enable row level security;

create policy "Allow public read access to total_bids"
  on public.total_bids
  for select
  to public
  using (true);

-- =============================================================================
-- AUTOMATION & COUNTER TRIGGERS
-- =============================================================================

create or replace function public.initialize_project_counters()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.total_clicks (project_id, count)
  values (new.id, 0)
  on conflict (project_id) do nothing;

  insert into public.total_bids (project_id, count)
  values (new.id, 0)
  on conflict (project_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_project_created_init_counters on public.projects;
create trigger on_project_created_init_counters
  after insert on public.projects
  for each row execute function public.initialize_project_counters();

create or replace function public.update_total_bids_on_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.total_bids (project_id, count, updated_at)
  values (new.project_id, 1, now())
  on conflict (project_id)
  do update set
    count = public.total_bids.count + 1,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_bid_created_update_total on public.bids;
create trigger on_bid_created_update_total
  after insert on public.bids
  for each row execute function public.update_total_bids_on_insert();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ROLE PRIVILEGES (Supabase Data API Access)
-- =============================================================================
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant insert, update on public.profiles to authenticated;
grant insert on public.bids to authenticated;
grant execute on function public.increment_project_clicks(uuid) to anon, authenticated;
