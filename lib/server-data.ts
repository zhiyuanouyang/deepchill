import { createClient } from '@/supabase/server';
import {
  JoinedProjectRow,
  mapRowToProduct,
  mapRowToTrendingProduct,
  mapRowToNewestProduct,
} from '@/lib/project-mapper';
import { Product, TrendingProduct, NewestReleaseProduct, Category } from '@/lib/types';

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
