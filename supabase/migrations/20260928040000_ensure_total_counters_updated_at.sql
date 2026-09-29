-- =============================================================================
-- Migration: 20260928040000_ensure_total_counters_updated_at.sql
-- Description:
--   1. Ensure increment_project_clicks updates count and updated_at on total_clicks.
--   2. Ensure on_bid_created_update_total updates price and updated_at on total_bids.
--   3. Attach before update triggers to total_clicks and total_bids.
--   4. Sync existing total_bids and total_clicks for all projects in the database.
--   5. Create public.trending_projects view directly ordered by total bid price desc.
--   6. Create public.newest_projects view directly ordered by latest bids.created_at timestamp desc.
-- =============================================================================

-- 1. Ensure increment_project_clicks updates both count and updated_at
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

grant execute on function public.increment_project_clicks(uuid) to anon, authenticated;

-- 2. Attach before update trigger on total_clicks
drop trigger if exists set_total_clicks_updated_at on public.total_clicks;
create trigger set_total_clicks_updated_at
  before update on public.total_clicks
  for each row execute function public.set_updated_at();

-- 3. Ensure update_total_bids_on_insert updates both price and updated_at
create or replace function public.update_total_bids_on_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.total_bids (project_id, price, updated_at)
  values (new.project_id, new.price, now())
  on conflict (project_id)
  do update set
    price = public.total_bids.price + new.price,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_bid_created_update_total on public.bids;
create trigger on_bid_created_update_total
  after insert on public.bids
  for each row execute function public.update_total_bids_on_insert();

-- 4. Attach before update trigger on total_bids
drop trigger if exists set_total_bids_updated_at on public.total_bids;
create trigger set_total_bids_updated_at
  before update on public.total_bids
  for each row execute function public.set_updated_at();

-- 5. Backfill/recalculate total_bids and total_clicks for existing projects
insert into public.total_clicks (project_id, count, updated_at)
select id, 0, now()
from public.projects
on conflict (project_id) do nothing;

insert into public.total_bids (project_id, price, updated_at)
select
  p.id,
  coalesce(sum(b.price), 0)::integer as price,
  coalesce(max(b.created_at), now()) as updated_at
from public.projects p
left join public.bids b on b.project_id = p.id
group by p.id
on conflict (project_id) do update set
  price = excluded.price,
  updated_at = excluded.updated_at;

-- 6. Direct ordered view for Trending Projects (ordered by total bid price desc)
drop view if exists public.trending_projects cascade;
create or replace view public.trending_projects as
select
  p.id,
  p.url,
  p.name,
  p.tagline,
  p.discription,
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

-- 7. Direct ordered view for Newest Releases (ordered by latest bids.created_at timestamp desc)
drop view if exists public.newest_projects cascade;
create or replace view public.newest_projects as
select
  p.id,
  p.url,
  p.name,
  p.tagline,
  p.discription,
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

grant select on public.trending_projects to anon, authenticated;
grant select on public.newest_projects to anon, authenticated;
