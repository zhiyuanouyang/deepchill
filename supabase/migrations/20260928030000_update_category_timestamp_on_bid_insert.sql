-- =============================================================================
-- Migration: 20260928030000_update_category_timestamp_on_bid_insert.sql
-- Description:
--   1. Add index on public.categories (updated_at desc) for performance.
--   2. Create trigger function on_bid_created_update_category_timestamp() to
--      update the updated_at timestamp of public.categories whenever a new
--      bid is inserted for a project associated with that category.
--   3. Create trigger on_bid_created_update_category_timestamp on public.bids.
--   4. Backfill existing categories.updated_at from the latest bid of associated projects.
-- =============================================================================

-- 1. Index on categories(updated_at desc) to optimize sorting categories by updated_at
create index if not exists idx_categories_updated_at
  on public.categories (updated_at desc);

-- 2. Trigger function to update category updated_at when a new bid is placed
create or replace function public.on_bid_created_update_category_timestamp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_category text;
begin
  -- Retrieve the category of the project associated with this bid
  select category into v_category
  from public.projects
  where id = new.project_id;

  -- If the project has a category specified, update updated_at of the corresponding category
  if v_category is not null and v_category <> '' then
    update public.categories
    set updated_at = now()
    where display_name = v_category
       or lower(display_name) = lower(v_category)
       or id::text = v_category;
  end if;

  return new;
end;
$$;

-- Grant execution permissions
grant execute on function public.on_bid_created_update_category_timestamp() to anon, authenticated;

-- 3. Bind trigger to public.bids on INSERT
drop trigger if exists on_bid_created_update_category_timestamp on public.bids;
create trigger on_bid_created_update_category_timestamp
  after insert on public.bids
  for each row execute function public.on_bid_created_update_category_timestamp();

-- 4. Backfill existing categories.updated_at based on latest bid timestamp of projects in that category
update public.categories c
set updated_at = sub.latest_bid_time
from (
  select p.category, max(b.created_at) as latest_bid_time
  from public.bids b
  join public.projects p on p.id = b.project_id
  where p.category is not null and p.category <> ''
  group by p.category
) sub
where (
  c.display_name = sub.category
  or lower(c.display_name) = lower(sub.category)
  or c.id::text = sub.category
);
