-- =============================================================================
-- Migration: 20260928010000_add_category_count_and_products_view.sql
-- Description:
--   1. Add count column to categories table
--   2. Add increment_category_count RPC function (supports both name and uuid)
--   3. Add trigger to auto-increment category count on project insertion
--   4. Add sync_category_counts() utility function
--   5. Ensure standard categories exist and sync initial counts
-- =============================================================================

-- 1. Add count column to categories
alter table public.categories
  add column if not exists count integer not null default 0 check (count >= 0);

-- Index on categories display_name and count for fast queries
create index if not exists idx_categories_count
  on public.categories (count desc);

-- 2. RPC: increment_category_count(category_name text)
create or replace function public.increment_category_count(category_name text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_count integer;
begin
  update public.categories
  set
    count = public.categories.count + 1,
    updated_at = now()
  where display_name = category_name or id::text = category_name
  returning count into v_new_count;

  return coalesce(v_new_count, 0);
end;
$$;

-- 3. RPC: increment_category_count(category_id uuid)
create or replace function public.increment_category_count(category_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_count integer;
begin
  update public.categories
  set
    count = public.categories.count + 1,
    updated_at = now()
  where id = category_id
  returning count into v_new_count;

  return coalesce(v_new_count, 0);
end;
$$;

-- Grant permissions for RPC functions
grant execute on function public.increment_category_count(text) to anon, authenticated;
grant execute on function public.increment_category_count(uuid) to anon, authenticated;

-- 4. Trigger: automatically increment category count when project is created
create or replace function public.on_project_created_update_category_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.category is not null and new.category <> '' then
    update public.categories
    set
      count = public.categories.count + 1,
      updated_at = now()
    where display_name = new.category or id::text = new.category;
  end if;
  return new;
end;
$$;

drop trigger if exists on_project_created_update_category_count on public.projects;
create trigger on_project_created_update_category_count
  after insert on public.projects
  for each row execute function public.on_project_created_update_category_count();

-- 5. Helper: sync_category_counts() to recalculate counts from actual projects
create or replace function public.sync_category_counts()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.categories c
  set
    count = coalesce(
      (
        select count(*)
        from public.projects p
        where p.category = c.display_name
           or p.category = c.id::text
      ),
      0
    ),
    updated_at = now();
end;
$$;

grant execute on function public.sync_category_counts() to anon, authenticated;

-- 6. Ensure common categories used across the app exist
insert into public.categories (display_name, descriptions)
values
  ('DevTools', 'Developer tools, compilers, CLIs, libraries, and dev platforms'),
  ('Open Source Infrastructure', 'Cloud platforms, self-hosted services, and infrastructure'),
  ('SaaS & Analytics', 'Software as a service, metric trackers, analytics, and business insights'),
  ('Developer Utilities', 'Useful utilities, regex testers, converters, and dev helpers')
on conflict (display_name) do nothing;

-- 7. Initial sync of counts
select public.sync_category_counts();
