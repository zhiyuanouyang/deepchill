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
  total_bids?: { price: number } | Array<{ price: number }> | null;
  total_clicks?: { count: number } | Array<{ count: number }> | null;
  bids?: Array<{ id: string; price: number; created_at: string }> | null;
}

export function extractTotalBid(row: JoinedProjectRow): number {
  if (Array.isArray(row.total_bids)) {
    return row.total_bids[0]?.price ?? 0;
  }
  return row.total_bids?.price ?? 0;
}

export function extractTotalClicks(row: JoinedProjectRow): number {
  if (Array.isArray(row.total_clicks)) {
    return row.total_clicks[0]?.count ?? 0;
  }
  return row.total_clicks?.count ?? 0;
}

export function extractMostRecentBid(row: JoinedProjectRow): MostRecentBidInfo {
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
    hasBid: false,
  };
}

export function mapRowToProduct(row: JoinedProjectRow): Product {
  const totalBid = extractTotalBid(row);
  const totalClicks = extractTotalClicks(row);
  const mostRecentBid = extractMostRecentBid(row);
  const domain = extractDomain(row.url || '');
  const category = (row.category || 'DevTools') as ProductCategory;
  const desc = row.description || row.discription || '';

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
    latestBidTime: mostRecentBid.hasBid ? mostRecentBid.bidTime : null,
    hasBid: mostRecentBid.hasBid,
    featured: totalBid >= 200,
    launchDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    dofollowApproved: true,
    totalPaid: totalBid,
    paidAt: mostRecentBid.bidTime,
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
  };
}
