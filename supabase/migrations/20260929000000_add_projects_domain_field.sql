-- =============================================================================
-- Migration: 20260929000000_add_projects_domain_field.sql
-- Description:
--   1. Add domain column to public.projects table
--   2. Backfill existing projects.domain from public.projects.url
--   3. Create index idx_projects_domain on public.projects (domain)
--   4. Add trigger to auto-derive domain from url when domain is null or on insert/update
--   5. Update trending_projects and newest_projects views to include p.domain
-- =============================================================================

-- 1. Add domain column to projects table
alter table public.projects
  add column if not exists domain text;

-- 2. Backfill existing projects.domain from url
update public.projects
set domain = lower(
  regexp_replace(
    regexp_replace(
      split_part(
        split_part(
          regexp_replace(url, '^https?://', '', 'i'),
          '/', 1
        ),
        '?', 1
      ),
      '^www\.', '', 'i'
    ),
    ':[0-9]+$', ''
  )
)
where (domain is null or domain = '') and url is not null;

-- 3. Add index for domain field
create index if not exists idx_projects_domain
  on public.projects (domain);

-- 4. Create trigger function to ensure domain is always derived from url if omitted
create or replace function public.derive_project_domain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.url is not null and (new.domain is null or new.domain = '') then
    new.domain := lower(
      regexp_replace(
        regexp_replace(
          split_part(
            split_part(
              regexp_replace(new.url, '^https?://', '', 'i'),
              '/', 1
            ),
            '?', 1
          ),
          '^www\.', '', 'i'
        ),
        ':[0-9]+$', ''
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_projects_derive_domain on public.projects;
create trigger trg_projects_derive_domain
  before insert or update of url on public.projects
  for each row execute function public.derive_project_domain();

-- 5. Drop existing views first so column ordering/addition is permitted by Postgres
drop view if exists public.trending_projects cascade;
drop view if exists public.newest_projects cascade;

-- 6. Recreate trending_projects view to include domain
create or replace view public.trending_projects as
select
  p.id,
  p.url,
  p.domain,
  p.name,
  p.tagline,
  p.description,
  p.icon_url,
  p.user_id,
  p.category,
  p.created_at,
  p.updated_at,
  coalesce(tb.price, 0) as total_bid_price,
  coalesce(tc.count, 0) as total_clicks_count,
  lb.created_at as latest_bid_time,
  coalesce(lb.price, 0) as latest_bid_price
from public.projects p
left join public.total_bids tb on tb.project_id = p.id
left join public.total_clicks tc on tc.project_id = p.id
left join lateral (
  select b.created_at, b.price
  from public.bids b
  where b.project_id = p.id
  order by b.created_at desc
  limit 1
) lb on true
order by
  coalesce(tb.price, 0) desc,
  coalesce(tc.count, 0) desc,
  lb.created_at desc nulls last,
  p.created_at desc;

-- 7. Recreate newest_projects view to include domain
create or replace view public.newest_projects as
select
  p.id,
  p.url,
  p.domain,
  p.name,
  p.tagline,
  p.description,
  p.icon_url,
  p.user_id,
  p.category,
  p.created_at,
  p.updated_at,
  coalesce(tb.price, 0) as total_bid_price,
  coalesce(tc.count, 0) as total_clicks_count,
  lb.created_at as latest_bid_time,
  coalesce(lb.price, 0) as latest_bid_price
from public.projects p
left join public.total_bids tb on tb.project_id = p.id
left join public.total_clicks tc on tc.project_id = p.id
left join lateral (
  select b.created_at, b.price
  from public.bids b
  where b.project_id = p.id
  order by b.created_at desc
  limit 1
) lb on true
order by
  lb.created_at desc nulls last,
  p.created_at desc;

-- 8. Ensure permissions on views
grant select on public.trending_projects to anon, authenticated;
grant select on public.newest_projects to anon, authenticated;
