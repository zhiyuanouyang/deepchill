import { NextRequest, NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { getAiClient } from '@/lib/gemini';
import { ProductCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES: ProductCategory[] = [
  'DevTools',
  'AI & Machine Learning',
  'Productivity',
  'Design & Creative',
  'Open Source Infrastructure',
  'SaaS & Analytics',
  'Security & Privacy',
  'Developer Utilities',
];

function cleanHtmlText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMetaTag(html: string, nameOrProp: string): string | null {
  const regex = new RegExp(
    `<meta\\s+[^>]*(?:name|property)=["']${nameOrProp}["'][^>]*content=["']([^"']*)["']`,
    'i'
  );
  const match = html.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Also check reversed order: content="..." name="..."
  const reverseRegex = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProp}["']`,
    'i'
  );
  const revMatch = html.match(reverseRegex);
  return revMatch && revMatch[1] ? revMatch[1].trim() : null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match && match[1] ? match[1].trim() : null;
}

function extractFavicon(html: string, baseUrl: string): string | null {
  const iconRegex = /<link\s+[^>]*rel=["'](?:shortcut\s+)?icon|apple-touch-icon["'][^>]*href=["']([^"']*)["']/i;
  const match = html.match(iconRegex);
  if (match && match[1]) {
    const rawHref = match[1].trim();
    try {
      return new URL(rawHref, baseUrl).toString();
    } catch {
      return null;
    }
  }
  return null;
}

function guessCategory(text: string): ProductCategory {
  const lower = text.toLowerCase();
  if (/\b(ai|llm|gpt|ml)\b/i.test(lower) || lower.includes('machine learning') || lower.includes('artificial intelligence')) {
    return 'AI & Machine Learning';
  }
  if (lower.includes('security') || lower.includes('privacy') || lower.includes('auth') || lower.includes('encryption') || lower.includes('compliance')) {
    return 'Security & Privacy';
  }
  if (lower.includes('database') || lower.includes('postgres') || lower.includes('infra') || lower.includes('cloud') || lower.includes('backend') || lower.includes('open source') || lower.includes('kubernetes') || lower.includes('docker')) {
    return 'Open Source Infrastructure';
  }
  if (lower.includes('productivity') || lower.includes('task') || lower.includes('calendar') || lower.includes('schedul') || lower.includes('booking') || lower.includes('notes') || lower.includes('workflow') || lower.includes('meeting')) {
    return 'Productivity';
  }
  if (lower.includes('design') || /\b(ui\/ux|ux|figma|canvas)\b/i.test(lower) || lower.includes('user interface') || lower.includes('creative')) {
    return 'Design & Creative';
  }
  if (lower.includes('analytics') || lower.includes('metrics') || lower.includes('dashboard') || lower.includes('crm') || lower.includes('b2b') || lower.includes('revenue')) {
    return 'SaaS & Analytics';
  }
  if (lower.includes('utility') || lower.includes('converter') || lower.includes('generator') || lower.includes('formatter')) {
    return 'Developer Utilities';
  }
  return 'DevTools';
}

function cleanProjectName(rawTitle: string, domain: string): string {
  if (!rawTitle) {
    const parts = domain.split('.');
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  // Remove common suffixes like " - The Best...", " | Homepage", " · Email for developers", etc.
  const cleaned = rawTitle
    .split(/[-–—:|·•]/)[0]
    .trim()
    .replace(/(Official Site|Home|Landing Page)$/i, '')
    .trim();

  return cleaned || domain;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let rawUrl = (body.url || '').trim();

    if (!rawUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = `https://${rawUrl}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: 'Please enter a valid URL' }, { status: 400 });
    }

    const domain = parsedUrl.hostname.replace(/^www\./, '');
    const cleanUrl = parsedUrl.toString();

    // Default icon URL fallback using high-res Google Favicon / Unavatar
    const defaultIconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const unavatarIconUrl = `https://unavatar.io/${domain}?fallback=${encodeURIComponent(defaultIconUrl)}`;

    let scrapedHtml = '';
    let scrapedTitle = '';
    let scrapedDesc = '';
    let scrapedIcon = '';

    // Attempt scraping the website directly with a 4-second timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(cleanUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 DeepchillBot/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        scrapedHtml = text.slice(0, 120000); // Read first 120kb
        scrapedTitle = extractTitle(scrapedHtml) || '';
        scrapedDesc =
          extractMetaTag(scrapedHtml, 'og:description') ||
          extractMetaTag(scrapedHtml, 'description') ||
          extractMetaTag(scrapedHtml, 'twitter:description') ||
          '';
        const foundFavicon = extractFavicon(scrapedHtml, cleanUrl);
        if (foundFavicon) {
          scrapedIcon = foundFavicon;
        }
      }
    } catch (scrapeErr) {
      console.warn(`Scraping warning for ${cleanUrl}:`, scrapeErr);
    }

    const bodySnippet = cleanHtmlText(scrapedHtml).slice(0, 2500);
    const chosenIcon = scrapedIcon || unavatarIconUrl;

    // AI Generation with Gemini
    const ai = getAiClient();

    if (!ai) {
      // Fallback heuristics when AI is not configured
      const fallbackName = cleanProjectName(scrapedTitle, domain);
      const fallbackTagline = scrapedDesc
        ? scrapedDesc.slice(0, 75).trim()
        : `${fallbackName} — High performance software for modern developers`;
      const fallbackDesc = scrapedDesc || `${fallbackName} provides a modern suite of features built for developers and creators.`;
      const fallbackCat = guessCategory(`${scrapedTitle} ${scrapedDesc} ${domain}`);

      return NextResponse.json({
        success: true,
        source: 'heuristic',
        metadata: {
          url: cleanUrl,
          domain,
          name: fallbackName,
          tagline: fallbackTagline,
          description: fallbackDesc,
          category: fallbackCat,
          iconUrl: chosenIcon,
        },
      });
    }

    const prompt = `You are an expert product directory editor. Analyze this web application / developer project and extract high-quality metadata for our directory.

Project URL: ${cleanUrl}
Domain: ${domain}
Page Title: ${scrapedTitle || '(none)'}
Meta Description: ${scrapedDesc || '(none)'}
Page Content Extract: ${bodySnippet || '(none)'}

Your task:
1. "name": The clean, official brand or project name (e.g. "Supabase", "Linear", "Tailwind CSS", "Resend"). Keep it concise.
2. "tagline": A crisp, punchy 1-sentence value proposition under 75 characters (e.g. "The open-source Firebase alternative with Postgres"). Do not use exclamation marks or hype words.
3. "description": A clear, informative 2-3 sentence overview describing what it does, key developer features, and who it is for.
4. "category": You MUST choose exactly ONE from this list:
   - "DevTools"
   - "AI & Machine Learning"
   - "Productivity"
   - "Design & Creative"
   - "Open Source Infrastructure"
   - "SaaS & Analytics"
   - "Security & Privacy"
   - "Developer Utilities"
5. "iconUrl": Suggested icon/logo image URL. If you know a stable logo URL for this project or see a valid one, provide it; otherwise return "${chosenIcon}".`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              tagline: { type: Type.STRING },
              description: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: VALID_CATEGORIES,
              },
              iconUrl: { type: Type.STRING },
            },
            required: ['name', 'tagline', 'description', 'category'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');

      const finalName = parsed.name?.trim() || cleanProjectName(scrapedTitle, domain);
      const finalTagline =
        parsed.tagline?.trim() ||
        scrapedDesc?.slice(0, 75).trim() ||
        `${finalName} — Modern developer platform`;
      const finalDesc =
        parsed.description?.trim() ||
        scrapedDesc ||
        `${finalName} is an innovative tool built to streamline development workflows.`;
      const finalCategory: ProductCategory = VALID_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : guessCategory(`${finalName} ${finalTagline} ${domain}`);
      const finalIcon = parsed.iconUrl && parsed.iconUrl.startsWith('http') ? parsed.iconUrl : chosenIcon;

      return NextResponse.json({
        success: true,
        source: 'ai',
        metadata: {
          url: cleanUrl,
          domain,
          name: finalName,
          tagline: finalTagline,
          description: finalDesc,
          category: finalCategory,
          iconUrl: finalIcon,
        },
      });
    } catch (aiErr) {
      console.warn('Gemini generation notice, falling back to heuristics:', aiErr);
      const fallbackName = cleanProjectName(scrapedTitle, domain);
      const fallbackTagline = scrapedDesc
        ? scrapedDesc.slice(0, 75).trim()
        : `${fallbackName} — High performance software for modern developers`;
      const fallbackDesc = scrapedDesc || `${fallbackName} provides modern software solutions for developers.`;
      const fallbackCat = guessCategory(`${scrapedTitle} ${scrapedDesc} ${domain}`);

      return NextResponse.json({
        success: true,
        source: 'fallback',
        metadata: {
          url: cleanUrl,
          domain,
          name: fallbackName,
          tagline: fallbackTagline,
          description: fallbackDesc,
          category: fallbackCat,
          iconUrl: chosenIcon,
        },
      });
    }
  } catch (err: unknown) {
    console.error('Error in /api/ai/extract-metadata:', err);
    return NextResponse.json(
      {
        error: 'Failed to extract metadata',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
