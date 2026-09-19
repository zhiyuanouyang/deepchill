export type ProductCategory =
  | 'DevTools'
  | 'AI & Machine Learning'
  | 'Productivity'
  | 'Design & Creative'
  | 'Open Source Infrastructure'
  | 'SaaS & Analytics'
  | 'Security & Privacy'
  | 'Developer Utilities';

export type PricingModel = 'Free' | 'Freemium' | 'Open Source' | 'Paid';

export interface MostRecentBidInfo {
  bidPrice: number;
  bidTime: string;
}

export interface Product {
  id: string;
  domain: string;
  name: string;
  description: string;
  tagline?: string;
  logoUrl?: string;
  totalBid: number;
  mostRecentBid: MostRecentBidInfo;
  totalClicks: number;
  categoryTags: string[];

  // Supporting directory & maker metadata
  websiteUrl: string;
  repoUrl?: string;
  category: ProductCategory;
  pricing: PricingModel;
  tags: string[];
  makerName: string;
  makerHandle?: string;
  makerAvatar?: string;
  upvotes: number;
  clicks?: number;
  features?: string[];
  targetAudience?: string;
  faq?: Array<{ question: string; answer: string }>;
  featured?: boolean;
  launchDate: string;
  badgeCode?: string;
  starsCount?: number;
  dofollowApproved?: boolean;

  // Backward-compatibility aliases
  totalPaid?: number;
  paidAt?: string;
}

/**
 * Partial projection for "Trending Projects" UI showcase.
 * In Supabase: SELECT id, name, domain, tagline, description, logo_url, website_url, total_bid, total_clicks, category_tags, category, pricing, maker_name, maker_handle, dofollow_approved, stars_count
 */
export interface TrendingProduct {
  id: string;
  name: string;
  domain: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  websiteUrl: string;
  totalBid: number;
  totalClicks: number;
  categoryTags: string[];
  category: ProductCategory;
  pricing: PricingModel;
  makerName: string;
  makerHandle?: string;
  dofollowApproved?: boolean;
  starsCount?: number;
}

/**
 * Partial projection for "Newest Releases" sidebar UI feed.
 * In Supabase: SELECT id, name, domain, tagline, description, logo_url, website_url, recent_bid_price, recent_bid_time, total_clicks, launch_date
 */
export interface NewestReleaseProduct {
  id: string;
  name: string;
  domain: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  websiteUrl: string;
  mostRecentBid: MostRecentBidInfo;
  totalClicks: number;
  launchDate?: string;
}

/**
 * Grounding truth Postgres row schema in Supabase
 */
export interface ProductRow {
  id: string;
  domain: string;
  name: string;
  tagline: string | null;
  description: string;
  logo_url: string | null;
  website_url: string;
  repo_url: string | null;
  category: ProductCategory;
  pricing: PricingModel;
  category_tags: string[];
  total_bid: number;
  recent_bid_price: number;
  recent_bid_time: string;
  total_clicks: number;
  upvotes: number;
  maker_name: string;
  maker_handle: string | null;
  dofollow_approved: boolean;
  stars_count: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Helper to project full Product into TrendingProduct partial
 */
export function toTrendingProduct(product: Product): TrendingProduct {
  return {
    id: product.id,
    name: product.name,
    domain: product.domain,
    tagline: product.tagline,
    description: product.description,
    logoUrl: product.logoUrl,
    websiteUrl: product.websiteUrl,
    totalBid: product.totalBid ?? product.totalPaid ?? 0,
    totalClicks: product.totalClicks ?? product.clicks ?? 0,
    categoryTags: product.categoryTags ?? [product.category, ...product.tags],
    category: product.category,
    pricing: product.pricing,
    makerName: product.makerName,
    makerHandle: product.makerHandle,
    dofollowApproved: product.dofollowApproved,
    starsCount: product.starsCount,
  };
}

/**
 * Helper to project full Product into NewestReleaseProduct partial
 */
export function toNewestReleaseProduct(product: Product): NewestReleaseProduct {
  return {
    id: product.id,
    name: product.name,
    domain: product.domain,
    tagline: product.tagline,
    description: product.description,
    logoUrl: product.logoUrl,
    websiteUrl: product.websiteUrl,
    mostRecentBid: product.mostRecentBid ?? {
      bidPrice: product.totalPaid ?? 0,
      bidTime: product.paidAt ?? product.launchDate,
    },
    totalClicks: product.totalClicks ?? product.clicks ?? 0,
    launchDate: product.launchDate,
  };
}


export interface AiAskResponse {
  answer: string;
  recommendedProductIds: string[];
  keyTakeaways: string[];
  searchTags: string[];
}

export interface EnhanceSubmissionResponse {
  polishedTagline: string;
  suggestedTags: string[];
  seoAdvice: string;
  suggestedFeatures?: string[];
  targetAudience?: string;
}
