-- =============================================================================
-- Remove tagline column from projects table
-- =============================================================================
-- The tagline field is being removed from the product data model.
-- The description field will serve as the primary text content for projects.

-- 1. Drop and recreate views that reference tagline
drop view if exists public.trending_projects;
drop view if exists public.newest_projects;

-- 2. Drop the tagline column from projects
alter table public.projects drop column if exists tagline;

-- 3. Recreate trending_projects view without tagline
create or replace view public.trending_projects as
select
  p.id,
  p.url,
  p.domain,
  p.name,
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

-- 4. Recreate newest_projects view without tagline
create or replace view public.newest_projects as
select
  p.id,
  p.url,
  p.domain,
  p.name,
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

-- 5. Re-grant view access
grant select on public.trending_projects to anon, authenticated;
grant select on public.newest_projects to anon, authenticated;
