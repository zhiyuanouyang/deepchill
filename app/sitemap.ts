
import type { MetadataRoute } from 'next';
import { APPS_CATALOG } from '@/app/data/apps';
import { BLOG_POSTS } from '@/app/data/blog';
import { CATEGORIES } from '@/app/data/categories';

const BASE_URL = 'https://deepchill.app';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date().toISOString();

    // Static / core pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/products`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        // Developer tools hub
        {
            url: `${BASE_URL}/tools`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.88,
        },
        // Individual developer tools
        ...['json-formatter', 'text-diff', 'url-encoder', 'base64', 'timestamp', 'cron-parser', 'jwt', 'regex'].map((slug) => ({
            url: `${BASE_URL}/tools/${slug}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.85,
        })),
    ];


    // Dynamic product pages
    const productPages: MetadataRoute.Sitemap = APPS_CATALOG
        .filter((app) => !app.comingSoon)
        .map((app) => ({
            url: `${BASE_URL}/products/${app.slug}`,
            lastModified: app.publishedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.85,
        }));

    // Dynamic blog pages
    const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt ?? post.publishedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    // Dynamic category pages
    const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
        url: `${BASE_URL}/categories/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
    }));

    return [...staticPages, ...productPages, ...blogPages, ...categoryPages];
}
