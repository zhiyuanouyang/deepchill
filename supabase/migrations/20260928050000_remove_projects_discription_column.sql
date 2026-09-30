-- =============================================================================
-- Migration: 20260928050000_remove_projects_discription_column.sql
-- Description:
--   1. Drop dependent views (trending_projects, newest_projects)
--   2. Drop expression on description if it was a generated column
--   3. Drop the redundant discription column from public.projects
--   4. Recreate trending_projects and newest_projects views using only description
-- =============================================================================

-- 1. Drop dependent views first so column can be safely dropped
drop view if exists public.trending_projects cascade;
drop view if exists public.newest_projects cascade;

-- 2. If description was defined as a generated column, convert it to a regular column
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'description'
      and is_generated = 'ALWAYS'
  ) then
    alter table public.projects alter column description drop expression;
  end if;
end $$;

-- 3. Drop the redundant typo column
alter table public.projects
  drop column if exists discription cascade;

-- 4. Recreate trending_projects view without discription
create or replace view public.trending_projects as
select
  p.id,
  p.url,
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

-- 5. Recreate newest_projects view without discription
create or replace view public.newest_projects as
select
  p.id,
  p.url,
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
