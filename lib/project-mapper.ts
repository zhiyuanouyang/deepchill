import {
  Product,
  TrendingProduct,
  NewestReleaseProduct,
  ProductCategory,
  PricingModel,
  MostRecentBidInfo,
} from '@/lib/types';
import { extractDomain } from '@/lib/utils';

export interface JoinedProjectRow {
  id: string;
  url: string;
  name: string;
  tagline: string | null;
  discription: string | null;
  description?: string | null;
  icon_url: string | null;
  user_id: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  // Nested join fields (from direct table joins)
  total_bids?: { price: number } | Array<{ price: number }> | null;
  total_clicks?: { count: number } | Array<{ count: number }> | null;
  bids?: Array<{ id: string; price: number; created_at: string }> | null;
  // Flat view fields (from trending_projects and newest_projects views)
  total_bid_price?: number | null;
  total_clicks_count?: number | null;
  latest_bid_time?: string | null;
  latest_bid_price?: number | null;
}

export function extractTotalBid(row: JoinedProjectRow): number {
  if (typeof row.total_bid_price === 'number') {
    return row.total_bid_price;
  }
  if (Array.isArray(row.total_bids)) {
    return row.total_bids[0]?.price ?? 0;
  }
  return row.total_bids?.price ?? 0;
}

export function extractTotalClicks(row: JoinedProjectRow): number {
  if (typeof row.total_clicks_count === 'number') {
    return row.total_clicks_count;
  }
  if (Array.isArray(row.total_clicks)) {
    return row.total_clicks[0]?.count ?? 0;
  }
  return row.total_clicks?.count ?? 0;
}

export function extractMostRecentBid(row: JoinedProjectRow): MostRecentBidInfo {
  // If view provides a latest bid timestamp
  if (row.latest_bid_time) {
    return {
      bidPrice: typeof row.latest_bid_price === 'number' ? row.latest_bid_price : (extractTotalBid(row) || 0),
      bidTime: row.latest_bid_time,
      hasBid: true,
    };
  }

  // If table join provides bids array
  const bids = row.bids || [];
  if (bids.length > 0) {
    const sorted = [...bids].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return {
      bidPrice: sorted[0].price,
      bidTime: sorted[0].created_at,
      hasBid: true,
    };
  }

  const total = extractTotalBid(row);
  return {
    bidPrice: total,
    bidTime: row.created_at || new Date().toISOString(),
    hasBid: total > 0,
  };
}

export function mapRowToProduct(row: JoinedProjectRow): Product {
  const totalBid = extractTotalBid(row);
  const totalClicks = extractTotalClicks(row);
  const mostRecentBid = extractMostRecentBid(row);
  const domain = extractDomain(row.url || '');
  const category = (row.category || 'DevTools') as ProductCategory;
  const desc = row.description || row.discription || '';
  const latestBidTime = row.latest_bid_time || (mostRecentBid.hasBid ? mostRecentBid.bidTime : null);

  return {
    id: row.id,
    domain,
    name: row.name,
    tagline: row.tagline || '',
    description: desc,
    websiteUrl: row.url,
    category,
    pricing: 'Open Source',
    tags: [category, 'Indie'],
    categoryTags: [category, 'Indie'],
    makerName: 'Anonymous Maker',
    logoUrl: row.icon_url || undefined,
    upvotes: 0,
    clicks: totalClicks,
    totalClicks,
    totalBid,
    mostRecentBid,
    latestBidTime,
    hasBid: Boolean(row.latest_bid_time || mostRecentBid.hasBid),
    featured: totalBid >= 200,
    launchDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    dofollowApproved: true,
    totalPaid: totalBid,
    paidAt: latestBidTime || mostRecentBid.bidTime,
  };
}

export function mapRowToTrendingProduct(row: JoinedProjectRow): TrendingProduct {
  const product = mapRowToProduct(row);
  return {
    id: product.id,
    name: product.name,
    domain: product.domain,
    tagline: product.tagline,
    description: product.description,
    logoUrl: product.logoUrl,
    websiteUrl: product.websiteUrl,
    totalBid: product.totalBid,
    totalClicks: product.totalClicks,
    categoryTags: product.categoryTags,
    category: product.category,
    pricing: product.pricing,
    makerName: product.makerName,
    makerHandle: product.makerHandle,
    dofollowApproved: product.dofollowApproved,
    starsCount: product.starsCount,
    latestBidTime: product.latestBidTime,
    hasBid: product.hasBid,
    mostRecentBid: product.mostRecentBid,
    launchDate: product.launchDate,
  };
}

export function mapRowToNewestProduct(row: JoinedProjectRow): NewestReleaseProduct {
  const product = mapRowToProduct(row);
  return {
    id: product.id,
    name: product.name,
    domain: product.domain,
    tagline: product.tagline,
    description: product.description,
    logoUrl: product.logoUrl,
    websiteUrl: product.websiteUrl,
    mostRecentBid: product.mostRecentBid,
    totalClicks: product.totalClicks,
    launchDate: product.launchDate,
    latestBidTime: product.latestBidTime,
    hasBid: product.hasBid,
    totalBid: product.totalBid,
    category: product.category,
  };
}
