import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { JoinedProjectRow, mapRowToNewestProduct } from '@/lib/project-mapper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const supabase = await createClient();

    let query = supabase
      .from('projects')
      .select(`
        id,
        url,
        name,
        tagline,
        discription,
        description,
        icon_url,
        user_id,
        category,
        created_at,
        updated_at,
        total_bids ( price ),
        total_clicks ( count ),
        bids ( id, price, created_at )
      `)
      .order('created_at', { referencedTable: 'bids', ascending: false, nullsFirst: false })
      .limit(limit);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const products = ((data || []) as JoinedProjectRow[]).map(mapRowToNewestProduct);

    return NextResponse.json({ products });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
