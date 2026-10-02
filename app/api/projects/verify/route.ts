import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { extractDomain } from '@/lib/utils';
import { INITIAL_PRODUCTS } from '@/data/initial-products';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface VerifyRequestBody {
  projectId?: string;
}

/**
 * Normalizes host to support subdomain-level verification while stripping standard www.
 */
function getTargetHost(rawUrlOrDomain: string): string {
  if (!rawUrlOrDomain) return '';
  try {
    const trimmed = rawUrlOrDomain.trim();
    const hasProto = /^https?:\/\//i.test(trimmed);
    const parsed = new URL(hasProto ? trimmed : `https://${trimmed}`);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return extractDomain(rawUrlOrDomain);
  }
}

/**
 * Checks verification status for a specific project.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId query parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ownerships')
      .select('id, user_id, project_id, domain, verified_at, created_at')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        verified: false,
        ownership: null,
      });
    }

    return NextResponse.json({
      verified: true,
      ownership: data,
    });
  } catch (err: unknown) {
    console.error('Error in GET /api/projects/verify:', err);
    return NextResponse.json({ verified: false, ownership: null });
  }
}

/**
 * Verifies domain ownership via file upload token check (similar to Google Search Console).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as VerifyRequestBody;
    const { projectId } = body;

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid projectId is required for domain verification.' },
        { status: 400 }
      );
    }

    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'You must be signed in to verify and claim domain ownership.',
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    // 2. Fetch project details
    let projectUrl = '';
    let projectName = '';
    let domainCandidate = '';

    const { data: dbProject, error: projError } = await supabase
      .from('projects')
      .select('id, name, url, domain, user_id')
      .eq('id', projectId)
      .maybeSingle();

    if (!projError && dbProject) {
      projectUrl = dbProject.url || '';
      projectName = dbProject.name || '';
      domainCandidate = dbProject.domain || '';
    } else {
      // Fallback to INITIAL_PRODUCTS for mock / demo projects
      const mockProject = INITIAL_PRODUCTS.find((p: Product) => p.id === projectId);
      if (mockProject) {
        projectUrl = mockProject.websiteUrl || '';
        projectName = mockProject.name || '';
        domainCandidate = mockProject.domain || '';
      }
    }

    if (!projectUrl && !domainCandidate) {
      return NextResponse.json(
        {
          success: false,
          error: `Project with ID "${projectId}" was not found or has no website URL configured.`,
        },
        { status: 404 }
      );
    }

    // 3. Extract exact host / subdomain
    const targetHost = getTargetHost(domainCandidate || projectUrl);
    if (!targetHost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to determine a valid domain or subdomain from the project website URL.',
        },
        { status: 400 }
      );
    }

    // 4. Expected token content
    const expectedToken = projectId;
    const expectedCodeKey = `deepchill-verification-code=${projectId}`;

    // 5. Build candidate URLs to check (supporting subdomain, https, http, and standard locations)
    const candidateUrls = [
      `https://${targetHost}/deepchill-verify.txt`,
      `https://${targetHost}/deepchill-verification.txt`,
      `https://${targetHost}/.well-known/deepchill-verify.txt`,
      `http://${targetHost}/deepchill-verify.txt`,
    ];

    let verified = false;
    let verifiedUrl = '';
    const diagnosticErrors: string[] = [];

    for (const testUrl of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(testUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; DeepchillDomainVerifier/1.0; +https://deepchill.dev)',
            Accept: 'text/plain, text/html, */*',
            'Cache-Control': 'no-cache',
          },
          redirect: 'follow',
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          // Read up to 8KB of content
          const text = await res.text();
          const cleanText = text.slice(0, 8192).trim();

          // Check if file contains the expected token or formatted code
          if (
            cleanText.includes(expectedToken) ||
            cleanText.includes(expectedCodeKey) ||
            cleanText.replace(/\s+/g, '').includes(expectedToken)
          ) {
            verified = true;
            verifiedUrl = testUrl;
            break;
          } else {
            diagnosticErrors.push(
              `File was found at ${testUrl}, but did not contain the expected verification token (${expectedCodeKey}).`
            );
          }
        } else {
          diagnosticErrors.push(
            `Checked ${testUrl} — HTTP status: ${res.status} ${res.statusText || ''}`
          );
        }
      } catch (fetchErr: unknown) {
        const msg = fetchErr instanceof Error ? fetchErr.message : 'Connection failed';
        diagnosticErrors.push(`Failed to reach ${testUrl}: ${msg}`);
      }
    }

    if (!verified) {
      const primaryError =
        diagnosticErrors.find((d) => d.includes('did not contain')) ||
        diagnosticErrors[0] ||
        `Verification file deepchill-verify.txt could not be found at https://${targetHost}/deepchill-verify.txt.`;

      return NextResponse.json(
        {
          success: false,
          error: primaryError,
          diagnostics: diagnosticErrors,
          targetHost,
          expectedFile: 'deepchill-verify.txt',
          expectedContent: expectedCodeKey,
        },
        { status: 422 }
      );
    }

    // 6. Record verified ownership in public.ownerships table
    let tablePersisted = true;
    let persistenceNotice = '';

    const { error: insertError } = await supabase.from('ownerships').upsert(
      {
        user_id: user.id,
        project_id: projectId,
        domain: targetHost,
        verification_token: expectedCodeKey,
        verified_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,project_id' }
    );

    if (insertError) {
      console.warn('Notice: ownerships table insert returned error:', insertError.message);
      tablePersisted = false;
      persistenceNotice =
        'Domain verified! Please ensure the ownerships table is created in Supabase using the migration SQL file.';
    }

    // If project in DB doesn't have user_id assigned, claim it
    if (dbProject && !dbProject.user_id) {
      try {
        await supabase
          .from('projects')
          .update({ user_id: user.id })
          .eq('id', projectId);
      } catch {
        // Ignore optional claim error
      }
    }

    return NextResponse.json({
      success: true,
      message: `Domain ownership of ${targetHost} has been verified successfully!`,
      verifiedUrl,
      domain: targetHost,
      projectName,
      verifiedAt: new Date().toISOString(),
      userId: user.id,
      tablePersisted,
      persistenceNotice,
    });
  } catch (err: unknown) {
    console.error('Unexpected error in POST /api/projects/verify:', err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Internal server error while verifying domain ownership.',
      },
      { status: 500 }
    );
  }
}
