-- Grounding Truth Schema for Products in Supabase Postgres
-- Matches the Product data model: domain, name, description, logo_url, total_bid,
-- most recent bid info (recent_bid_price, recent_bid_time), total_clicks, category_tags.

create table if not exists public.products (
  id text primary key,
  domain text not null,
  name text not null,
  tagline text,
  description text not null,
  logo_url text,
  website_url text not null,
  repo_url text,
  category text not null,
  pricing text not null default 'Free',
  category_tags text[] not null default '{}',
  total_bid numeric(10, 2) not null default 0.00,
  recent_bid_price numeric(10, 2) not null default 0.00,
  recent_bid_time timestamptz not null default now(),
  total_clicks integer not null default 0,
  upvotes integer not null default 0,
  maker_name text not null default 'Anonymous',
  maker_handle text,
  maker_avatar text,
  dofollow_approved boolean not null default false,
  stars_count integer,
  features text[],
  target_audience text,
  launch_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance Indexes
create index if not exists idx_products_trending 
  on public.products (total_bid desc, total_clicks desc, recent_bid_time desc);

create index if not exists idx_products_newest 
  on public.products (recent_bid_time desc);

create index if not exists idx_products_category_tags 
  on public.products using gin (category_tags);

create index if not exists idx_products_category 
  on public.products (category);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;

-- RLS Policies: Public read access
create policy "Allow public read access to products"
  on public.products
  for select
  using (true);

-- RLS Policies: Authenticated users can insert products
create policy "Allow authenticated users to insert products"
  on public.products
  for insert
  with check (auth.role() = 'authenticated');

-- RLS Policies: Authenticated owners can update their products
create policy "Allow users to update own products"
  on public.products
  for update
  using (auth.uid() is not null);

/*
  =============================================================================
  PARTIAL INFORMATION QUERY EXAMPLES FOR SUPABASE CLIENT
  =============================================================================

  1. Trending Projects:
  const { data: trendingProjects, error } = await supabase
    .from('products')
    .select('id, name, domain, tagline, description, logo_url, website_url, total_bid, total_clicks, category_tags, category, pricing, maker_name, maker_handle, dofollow_approved, stars_count')
    .order('total_bid', { ascending: false })
    .order('total_clicks', { ascending: false })
    .range(0, 5);

  2. Newest Releases:
  const { data: newestReleases, error } = await supabase
    .from('products')
    .select('id, name, domain, tagline, description, logo_url, website_url, recent_bid_price, recent_bid_time, total_clicks, launch_date')
    .order('recent_bid_time', { ascending: false })
    .range(0, 5);
*/
