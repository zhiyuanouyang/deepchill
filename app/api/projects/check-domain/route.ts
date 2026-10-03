import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { extractDomain, validateWebsiteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractMetaTag(html: string, propertyName: string): string {
  const regex1 = new RegExp(
    `<meta\\s+[^>]*(?:property|name)=["']${propertyName}["'][^>]*content=["']([^"']*)["']`,
    'i'
  );
  const match1 = html.match(regex1);
  if (match1 && match1[1]) {
    return decodeHtmlEntities(match1[1].trim());
  }

  const regex2 = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${propertyName}["']`,
    'i'
  );
  const match2 = html.match(regex2);
  if (match2 && match2[1]) {
    return decodeHtmlEntities(match2[1].trim());
  }

  return '';
}

function extractJsonLd(html: string): { name: string; description: string } {
  let name = '';
  let description = '';

  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const items: any[] = [];

      const collectItems = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) {
          obj.forEach(collectItems);
          return;
        }
        items.push(obj);
        if (obj['@graph'] && Array.isArray(obj['@graph'])) {
          obj['@graph'].forEach(collectItems);
        }
        if (obj.mainEntity) {
          collectItems(obj.mainEntity);
        }
      };

      collectItems(parsed);

      // Prioritize primary types: WebSite, SoftwareApplication, WebApplication, Product, Organization
      const typeRank = (type: any): number => {
        if (typeof type !== 'string') return 0;
        const lower = type.toLowerCase();
        if (
          lower.includes('website') ||
          lower.includes('softwareapplication') ||
          lower.includes('webapplication') ||
          lower.includes('product')
        )
          return 3;
        if (lower.includes('organization') || lower.includes('corporation')) return 2;
        return 1;
      };

      items.sort((a, b) => typeRank(b['@type']) - typeRank(a['@type']));

      for (const item of items) {
        if (!name && typeof item.name === 'string' && item.name.trim()) {
          name = decodeHtmlEntities(item.name.trim());
        }
        if (!description && typeof item.description === 'string' && item.description.trim()) {
          description = decodeHtmlEntities(item.description.trim());
        }
      }
    } catch {
      // Ignore invalid or unparseable JSON
    }
  }

  return { name, description };
}

function extractH1(html: string): string {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match || !match[1]) return '';

  const clean = match[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const decoded = decodeHtmlEntities(clean);
  if (decoded.length > 100) {
    const sentenceEnd = decoded.search(/[.!?](\s|$)/);
    if (sentenceEnd > 10 && sentenceEnd <= 100) {
      return decoded.slice(0, sentenceEnd + 1).trim();
    }
    return decoded.slice(0, 97).trim() + '...';
  }

  return decoded;
}

/**
 * Lightweight metadata extraction:
 * - Fetches initial chunk of the webpage (up to 48KB or until </h1> is reached)
 * - Extracts JSON-LD as source of truth for name and description (higher priority than OG metadata)
 * - Falls back to og:site_name and og:description if JSON-LD is missing
 */
async function getLightweightMetadata(domain: string, targetUrl?: string | null) {
  const defaultIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const cleanUrl = targetUrl && /^https?:\/\//i.test(targetUrl) ? targetUrl : `https://${domain}`;

  let name = '';
  let description = '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 DeepchillBot/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeoutId);

    if (res.ok && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let html = '';
      let bytesRead = 0;
      const maxBytes = 49152; // 48KB max - enough to capture <head>, JSON-LD, and hero <h1> in <body>

      while (bytesRead < maxBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesRead += value.length;
        html += decoder.decode(value, { stream: true });
        if (html.toLowerCase().includes('</h1>')) {
          controller.abort();
          break;
        }
      }

      // 1. JSON-LD extraction (source of truth for name & description)
      const jsonLd = extractJsonLd(html);

      // 2. Open Graph tags extraction
      const ogSiteName = extractMetaTag(html, 'og:site_name');
      const ogDescription = extractMetaTag(html, 'og:description');

      // 3. Name: JSON-LD takes higher priority than OG metadata
      name = jsonLd.name || ogSiteName;

      // 4. Description: JSON-LD takes higher priority than OG metadata
      description = jsonLd.description || ogDescription;
    }
  } catch {
    // If fetching fails or times out, leave fields blank
  }

  return {
    name,
    description,
    iconUrl: defaultIcon,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get('url');
    const rawDomain = searchParams.get('domain');

    let domain = '';
    let validatedUrl = '';

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
      validatedUrl = validation.cleanOrigin || rawUrl;
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
      validatedUrl = `https://${domain}`;
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

    // 3. If domain is valid and does NOT exist in database, fetch lightweight suggestions
    let suggested = null;
    if (!exists) {
      suggested = await getLightweightMetadata(domain, validatedUrl);
    }

    return NextResponse.json({
      isValid: true,
      domain,
      exists,
      project: existingProject,
      suggested,
    });
  } catch (err: unknown) {
    console.error('Error in GET /api/projects/check-domain:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
