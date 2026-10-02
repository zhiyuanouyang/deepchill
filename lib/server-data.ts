import { createClient } from '@/supabase/server';
import {
  JoinedProjectRow,
  mapRowToProduct,
  mapRowToTrendingProduct,
  mapRowToNewestProduct,
} from '@/lib/project-mapper';
import {
  Product,
  TrendingProduct,
  NewestReleaseProduct,
  Category,
  ProductCategory,
  CategoryCardOverview,
} from '@/lib/types';

export async function getTrendingProjects(
  category?: string,
  limit = 10,
  offset = 0
): Promise<{ products: TrendingProduct[]; total: number }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('trending_projects')
      .select('*', { count: 'exact' });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error || !data) {
      console.warn('Error fetching trending projects:', error);
      return { products: [], total: 0 };
    }

    return {
      products: (data as JoinedProjectRow[]).map(mapRowToTrendingProduct),
      total: count ?? data.length,
    };
  } catch (err) {
    console.warn('Failed to getTrendingProjects:', err);
    return { products: [], total: 0 };
  }
}

export async function getNewestProjects(
  category?: string,
  limit = 15,
  offset = 0
): Promise<{ products: NewestReleaseProduct[]; total: number }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('newest_projects')
      .select('*', { count: 'exact' });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error || !data) {
      console.warn('Error fetching newest projects:', error);
      return { products: [], total: 0 };
    }

    return {
      products: (data as JoinedProjectRow[]).map(mapRowToNewestProduct),
      total: count ?? data.length,
    };
  } catch (err) {
    console.warn('Failed to getNewestProjects:', err);
    return { products: [], total: 0 };
  }
}

export async function getAllProjects(
  category?: string,
  limit = 100
): Promise<Product[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('trending_projects')
      .select('*')
      .limit(limit);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn('Error fetching all projects:', error);
      return [];
    }

    return (data as JoinedProjectRow[]).map(mapRowToProduct);
  } catch (err) {
    console.warn('Failed to getAllProjects:', err);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, display_name, descriptions, count, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .order('count', { ascending: false })
      .order('display_name', { ascending: true });

    if (error || !categories) {
      console.warn('Error fetching categories:', error);
      return [];
    }

    return categories as Category[];
  } catch (err) {
    console.warn('Failed to getCategories:', err);
    return [];
  }
}

export async function getCategoryOverview(): Promise<CategoryCardOverview[]> {
  try {
    const supabase = await createClient();

    // 1. Fetch all categories ordered by updated_at descending
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, display_name, descriptions, count, updated_at')
      .order('updated_at', { ascending: false })
      .order('count', { ascending: false })
      .order('display_name', { ascending: true });

    if (catError || !categories) {
      console.warn('Error fetching categories overview:', catError);
      return [];
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

    if (projError || !rawProjects) {
      console.warn('Error fetching projects for category overview:', projError);
      return [];
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

    return overviewList;
  } catch (err) {
    console.warn('Failed to getCategoryOverview:', err);
    return [];
  }
}

