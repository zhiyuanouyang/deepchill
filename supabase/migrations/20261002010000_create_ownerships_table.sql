-- =============================================================================
-- Migration: 20261002010000_create_ownerships_table.sql
-- Description:
--   1. Create public.ownerships table for domain ownership verification
--   2. Add foreign keys to auth.users and public.projects with cascade deletes
--   3. Add index on user_id to optimize fetching user owned projects
--   4. Add index on project_id and domain for verification lookup
--   5. Enable RLS and setup select, insert, and delete security policies
-- =============================================================================

create table if not exists public.ownerships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  domain text not null,
  verification_token text,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ownerships_user_project_unique unique (user_id, project_id)
);

-- Optimization indexes
-- 1. Index to optimize fetching projects owned by a specific user (requested)
create index if not exists idx_ownerships_user_id
  on public.ownerships (user_id);

-- 2. Index to optimize looking up verification status by project_id
create index if not exists idx_ownerships_project_id
  on public.ownerships (project_id);

-- 3. Index to optimize looking up verification status by domain or subdomain
create index if not exists idx_ownerships_domain
  on public.ownerships (domain);

-- Enable Row Level Security (RLS)
alter table public.ownerships enable row level security;

-- Policy 1: Allow public read access (so any visitor can verify project ownership)
create policy "Allow public read access to ownerships"
  on public.ownerships
  for select
  to public
  using (true);

-- Policy 2: Allow authenticated users to claim/verify domain ownership
create policy "Allow authenticated users to insert ownerships"
  on public.ownerships
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Policy 3: Allow users to delete/revoke their own domain ownership
create policy "Allow users to delete own ownerships"
  on public.ownerships
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Policy 4: Allow users to update their own ownership records
create policy "Allow users to update own ownerships"
  on public.ownerships
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Grant privileges
grant select on public.ownerships to anon, authenticated;
grant insert, update, delete on public.ownerships to authenticated;
