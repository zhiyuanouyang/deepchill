
import type { Metadata } from 'next';
import { WebApp } from '@/app/types';
import { BlogPost } from '@/app/data/blog';
import { Category } from '@/app/data/categories';

export const SITE_CONFIG = {
    name: 'Deepchill',
    domain: 'https://deepchill.app',
    tagline: 'A Studio for Ambitious Products',
    description:
        'Deepchill is an indie studio that builds products across AI, games, finance, and more — crafted by one person, shipped for everyone. Discover what we\'ve made.',
    twitterHandle: '@deepchillapp',
    locale: 'en_US',
    defaultOgImage: 'https://deepchill.app/og-default.png',
};

export function buildCanonicalUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_CONFIG.domain}${cleanPath}`;
}

export function generateProductMetadata(app: WebApp): Metadata {
    const title = `${app.name} — ${app.tagline} | Deepchill`;
    const description = app.description;
    const canonical = buildCanonicalUrl(`/products/${app.slug}`);
    const ogImage = app.imageUrl || SITE_CONFIG.defaultOgImage;

    return {
        title,
        description,
        keywords: app.keywords.join(', '),
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: SITE_CONFIG.name,
            images: [{ url: ogImage, width: 1200, height: 630, alt: app.name }],
            type: 'website',
            locale: SITE_CONFIG.locale,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            site: SITE_CONFIG.twitterHandle,
            images: [ogImage],
        },
        robots: { index: true, follow: true },
    };
}

export function generateBlogMetadata(post: BlogPost): Metadata {
    const title = `${post.title} | Deepchill Blog`;
    const description = post.excerpt;
    const canonical = buildCanonicalUrl(`/blog/${post.slug}`);
    const ogImage = SITE_CONFIG.defaultOgImage;

    return {
        title,
        description,
        keywords: post.tags.join(', '),
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: SITE_CONFIG.name,
            images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
            type: 'article',
            publishedTime: post.publishedAt,
            locale: SITE_CONFIG.locale,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            site: SITE_CONFIG.twitterHandle,
            images: [ogImage],
        },
        robots: { index: true, follow: true },
    };
}

export function generateCategoryMetadata(cat: Category): Metadata {
    const title = `${cat.name} Tools & Resources | Deepchill`;
    const description = cat.description;
    const canonical = buildCanonicalUrl(`/categories/${cat.slug}`);

    return {
        title,
        description,
        keywords: cat.keywords.join(', '),
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: SITE_CONFIG.name,
            images: [{ url: SITE_CONFIG.defaultOgImage, width: 1200, height: 630, alt: cat.name }],
            type: 'website',
            locale: SITE_CONFIG.locale,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            site: SITE_CONFIG.twitterHandle,
            images: [SITE_CONFIG.defaultOgImage],
        },
        robots: { index: true, follow: true },
    };
}
