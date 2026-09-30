import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import {
  JoinedProjectRow,
  mapRowToProduct,
  mapRowToTrendingProduct,
  mapRowToNewestProduct,
} from '@/lib/project-mapper';
import { ProductCategory, TrendingProduct, NewestReleaseProduct, Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export interface CategoryCardOverview {
  id: string;
  name: ProductCategory;
  description: string;
  projectCount: number;
  primaryTopProjects: TrendingProduct[];
  secondaryRecentProjects: NewestReleaseProduct[];
  updatedAt?: string;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch all categories ordered by updated_at descending
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, display_name, descriptions, count, updated_at')
      .order('updated_at', { ascending: false })
      .order('count', { ascending: false })
      .order('display_name', { ascending: true });

    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 400 });
    }

    // 2. Fetch all projects with total_bids, total_clicks, and bids
    const { data: rawProjects, error: projError } = await supabase
      .from('projects')
      .select(`
        id,
        url,
        name,
        tagline,
        description,
        icon_url,
        user_id,
        category,
        created_at,
        updated_at,
        total_bids ( price ),
        total_clicks ( count ),
        bids ( id, price, created_at )
      `);

    if (projError) {
      return NextResponse.json({ error: projError.message }, { status: 400 });
    }

    // Group projects by category
    const projectsByCategory: Record<string, JoinedProjectRow[]> = {};
    for (const p of (rawProjects || []) as JoinedProjectRow[]) {
      const cat = p.category || 'DevTools';
      if (!projectsByCategory[cat]) {
        projectsByCategory[cat] = [];
      }
      projectsByCategory[cat].push(p);
    }

    // Build category card overview items
    const overviewList: CategoryCardOverview[] = (categories as Category[]).map((cat) => {
      const catProjects = projectsByCategory[cat.display_name] || [];

      // Top 3 by total bid price
      const sortedByBid: TrendingProduct[] = [...catProjects]
        .map((p) => mapRowToTrendingProduct(p))
        .sort((a, b) => {
          if (b.totalBid !== a.totalBid) return b.totalBid - a.totalBid;
          if (b.totalClicks !== a.totalClicks) return b.totalClicks - a.totalClicks;
          return 0;
        })
        .slice(0, 3);

      // Top 3 by most recent bid
      const sortedByRecent: NewestReleaseProduct[] = [...catProjects]
        .map((p) => mapRowToNewestProduct(p))
        .sort((a, b) => {
          const aTime = new Date(a.mostRecentBid?.bidTime || a.launchDate || '').getTime();
          const bTime = new Date(b.mostRecentBid?.bidTime || b.launchDate || '').getTime();
          if (bTime !== aTime) return bTime - aTime;
          return (b.mostRecentBid?.bidPrice ?? 0) - (a.mostRecentBid?.bidPrice ?? 0);
        })
        .slice(0, 3);

      return {
        id: cat.id,
        name: cat.display_name as ProductCategory,
        description: cat.descriptions || '',
        projectCount: cat.count || catProjects.length,
        primaryTopProjects: sortedByBid,
        secondaryRecentProjects: sortedByRecent,
        updatedAt: cat.updated_at,
      };
    });

    return NextResponse.json({ categories: overviewList });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
