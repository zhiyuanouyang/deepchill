-- =============================================================================
-- Migration: 20260928020000_revert_projects_columns_and_drop_products_view.sql
-- Description:
--   1. Drop public.products view (use projects table as single source of truth)
--   2. Drop rich metadata columns added to public.projects to ensure table has
--      strictly only the core columns:
--      (id, url, name, tagline, discription, description, icon_url, user_id, category, created_at, updated_at)
-- =============================================================================

-- 1. Drop products view
drop view if exists public.products cascade;

-- 2. Drop extra metadata columns from public.projects
alter table public.projects
  drop column if exists domain,
  drop column if exists repo_url,
  drop column if exists pricing,
  drop column if exists tags,
  drop column if exists maker_name,
  drop column if exists maker_handle,
  drop column if exists logo_url,
  drop column if exists upvotes;
