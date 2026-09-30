import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { JoinedProjectRow, mapRowToProduct } from '@/lib/project-mapper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const sort = searchParams.get('sort') || 'trending';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const supabase = await createClient();

    const tableName = sort === 'newest' ? 'newest_projects' : 'trending_projects';
    let query = supabase.from(tableName).select('*');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (q && q.trim()) {
      query = query.or(
        `name.ilike.%${q.trim()}%,tagline.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,url.ilike.%${q.trim()}%`
      );
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const products = ((data || []) as JoinedProjectRow[]).map(mapRowToProduct);

    return NextResponse.json({ products });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      websiteUrl,
      tagline,
      description,
      category = 'DevTools',
      logoUrl,
      icon_url,
      biddingAmount = 50,
    } = body;

    if (!name || !websiteUrl || !tagline || !description) {
      return NextResponse.json(
        { error: 'Name, websiteUrl, tagline, and description are required.' },
        { status: 400 }
      );
    }

    const effectiveIcon = (icon_url || logoUrl || '').trim() || null;

    const supabase = await createClient();

    // Check if user is authenticated to associate user_id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Insert into projects table (core columns only)
    const { data: newProject, error: insertError } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        url: websiteUrl.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        icon_url: effectiveIcon,
        category,
        user_id: user?.id || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    const projectId = newProject.id;

    // 2. Insert initial bid if biddingAmount > 0
    if (biddingAmount && Number(biddingAmount) > 0) {
      const { error: bidError } = await supabase.from('bids').insert({
        project_id: projectId,
        price: Number(biddingAmount),
      });

      if (bidError) {
        console.warn('Initial bid insertion notice:', bidError.message);
      }
    }

    // 3. Call increment_category_count RPC explicitly
    let updatedCategoryCount = null;
    try {
      const { data: countData } = await supabase.rpc('increment_category_count', {
        category_name: category,
      });
      updatedCategoryCount = countData;
    } catch (rpcErr) {
      console.warn('RPC increment_category_count notice:', rpcErr);
    }

    // 4. Fetch the full joined record to return
    const { data: fullProject } = await supabase
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
      `)
      .eq('id', projectId)
      .single();

    const product = fullProject ? mapRowToProduct(fullProject as JoinedProjectRow) : newProject;

    return NextResponse.json({
      success: true,
      product,
      categoryCount: updatedCategoryCount,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
