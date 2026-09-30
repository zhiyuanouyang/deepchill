import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { extractDomain, validateWebsiteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get('url');
    const rawDomain = searchParams.get('domain');

    let domain = '';

    if (rawUrl) {
      const validation = validateWebsiteUrl(rawUrl);
      if (!validation.isValid || !validation.domain) {
        return NextResponse.json({
          isValid: false,
          error: validation.error || 'Invalid website URL format',
          domain: null,
          exists: false,
        });
      }
      domain = validation.domain;
    } else if (rawDomain) {
      domain = extractDomain(rawDomain);
      if (!domain) {
        return NextResponse.json({
          isValid: false,
          error: 'Please enter a valid domain (e.g. example.com)',
          domain: null,
          exists: false,
        });
      }
    } else {
      return NextResponse.json(
        { error: 'A url or domain query parameter is required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Try querying projects table by domain column
    let exists = false;
    let existingProject: { id: string; name: string } | null = null;

    const { data: projectByDomain, error: domainColError } = await supabase
      .from('projects')
      .select('id, name, domain')
      .ilike('domain', domain)
      .limit(1)
      .maybeSingle();

    if (!domainColError && projectByDomain) {
      exists = true;
      existingProject = { id: projectByDomain.id, name: projectByDomain.name };
    } else {
      // 2. Fallback in case domain column doesn't exist yet (error 42703) or is null on older rows
      const { data: allProjects, error: fetchErr } = await supabase
        .from('projects')
        .select('id, name, url');

      if (!fetchErr && allProjects) {
        const found = allProjects.find((p) => extractDomain(p.url) === domain);
        if (found) {
          exists = true;
          existingProject = { id: found.id, name: found.name };
        }
      }
    }

    return NextResponse.json({
      isValid: true,
      domain,
      exists,
      project: existingProject,
    });
  } catch (err: unknown) {
    console.error('Error in GET /api/projects/check-domain:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
