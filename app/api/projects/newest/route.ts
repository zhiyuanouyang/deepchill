import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { JoinedProjectRow, mapRowToNewestProduct } from '@/lib/project-mapper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '15', 10));
    const offsetParam = searchParams.get('offset');
    const offset = offsetParam !== null ? Math.max(0, parseInt(offsetParam, 10)) : (page - 1) * limit;
    const q = searchParams.get('q');

    const supabase = await createClient();

    let query = supabase
      .from('newest_projects')
      .select('*', { count: 'exact' });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(`name.ilike.${term},description.ilike.${term},url.ilike.${term}`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const products = ((data || []) as JoinedProjectRow[]).map(mapRowToNewestProduct);

    return NextResponse.json({
      products,
      total: count ?? products.length,
      page,
      limit,
      offset,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
