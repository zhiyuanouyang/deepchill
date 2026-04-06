
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/_next/', '/blog/'],
            },
            {
                // Prevent AI scrapers from bypassing robots
                userAgent: 'GPTBot',
                disallow: '/',
            },
            {
                userAgent: 'CCBot',
                disallow: '/',
            },
        ],
        sitemap: 'https://deepchill.app/sitemap.xml',
        host: 'https://deepchill.app',
    };
}
