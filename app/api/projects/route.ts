import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { JoinedProjectRow, mapRowToProduct } from '@/lib/project-mapper';
import { extractDomain, validateWebsiteUrl } from '@/lib/utils';

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
      url,
      tagline,
      description,
      category = 'DevTools',
      logoUrl,
      icon_url,
      biddingAmount = 50,
    } = body;

    const rawUrl = (websiteUrl || url || '').trim();

    if (!name || !rawUrl || !tagline || !description) {
      return NextResponse.json(
        { error: 'Name, websiteUrl, tagline, and description are required.' },
        { status: 400 }
      );
    }

    // Syntax validation for input website URL
    const urlValidation = validateWebsiteUrl(rawUrl);
    if (!urlValidation.isValid || !urlValidation.domain) {
      return NextResponse.json(
        { error: urlValidation.error || 'Please enter a valid website link format.' },
        { status: 400 }
      );
    }

    const derivedDomain = urlValidation.domain;
    const effectiveIcon = (icon_url || logoUrl || '').trim() || null;

    const supabase = await createClient();

    // Check if domain already exists in projects table
    let domainExists = false;
    let existingProjectName = '';

    const { data: projectByDomain, error: domainColError } = await supabase
      .from('projects')
      .select('id, name, domain')
      .ilike('domain', derivedDomain)
      .limit(1)
      .maybeSingle();

    if (!domainColError && projectByDomain) {
      domainExists = true;
      existingProjectName = projectByDomain.name;
    } else {
      // Fallback: check all projects by extracting domain from url
      const { data: allProjects, error: fetchErr } = await supabase
        .from('projects')
        .select('id, name, url');

      if (!fetchErr && allProjects) {
        const found = allProjects.find((p) => extractDomain(p.url) === derivedDomain);
        if (found) {
          domainExists = true;
          existingProjectName = found.name;
        }
      }
    }

    if (domainExists) {
      return NextResponse.json(
        {
          error: `Domain "${derivedDomain}" has already been submitted${
            existingProjectName ? ` (${existingProjectName})` : ''
          }.`,
        },
        { status: 409 }
      );
    }

    // Check if user is authenticated to associate user_id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Insert into projects table with derived domain
    const projectInsertPayload: Record<string, unknown> = {
      name: name.trim(),
      url: rawUrl,
      domain: derivedDomain,
      tagline: tagline.trim(),
      description: description.trim(),
      icon_url: effectiveIcon,
      category,
      user_id: user?.id || null,
    };

    let { data: newProject, error: insertError } = await supabase
      .from('projects')
      .insert(projectInsertPayload)
      .select()
      .single();

    // Fallback if domain column is not yet present on remote DB
    if (insertError && insertError.code === '42703') {
      delete projectInsertPayload.domain;
      const retryResult = await supabase
        .from('projects')
        .insert(projectInsertPayload)
        .select()
        .single();
      newProject = retryResult.data;
      insertError = retryResult.error;
    }

    if (insertError || !newProject) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create project' },
        { status: 400 }
      );
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

    // 4. Fetch the full joined record to return (try with domain first, fallback if column missing)
    let fullProjectData: JoinedProjectRow | null = null;
    const { data: fullWithDomain, error: fullError } = await supabase
      .from('projects')
      .select(`
        id,
        url,
        domain,
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

    if (!fullError && fullWithDomain) {
      fullProjectData = fullWithDomain as unknown as JoinedProjectRow;
    } else {
      // Fallback without domain in select if column not yet added
      const { data: fullWithoutDomain } = await supabase
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
      if (fullWithoutDomain) {
        fullProjectData = {
          ...fullWithoutDomain,
          domain: derivedDomain,
        } as unknown as JoinedProjectRow;
      }
    }

    const product = fullProjectData
      ? mapRowToProduct(fullProjectData)
      : { ...newProject, domain: derivedDomain };

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
