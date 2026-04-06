
// Server component — renders structured data JSON-LD scripts inline
// Supports: WebSite, Organization, SoftwareApplication, BlogPosting, BreadcrumbList, ItemList

interface JsonLdProps {
    schema: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ schema }: JsonLdProps) {
    const data = Array.isArray(schema)
        ? { '@context': 'https://schema.org', '@graph': schema }
        : schema;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
        />
    );
}

// ─── Schema Builders ──────────────────────────────────────────────────────────

export function buildWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Deepchill',
        url: 'https://deepchill.app',
        description:
            'Deepchill is an indie studio that builds products across AI, games, finance, and more — crafted by one person, shipped for everyone.',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://deepchill.app/products?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

export function buildOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Deepchill',
        url: 'https://deepchill.app',
        logo: 'https://deepchill.app/logo.png',
        sameAs: ['https://twitter.com/deepchillapp'],
        description:
            'Deepchill is an indie studio building products across AI, games, finance, and everyday utilities — crafted by one person, shipped for everyone.',
    };
}

export function buildSoftwareApplicationSchema(app: {
    name: string;
    description: string;
    url: string;
    category: string;
    features: string[];
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: app.name,
        description: app.description,
        url: app.url,
        applicationCategory: app.category,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free trial available',
        },
        featureList: app.features.join(', '),
        operatingSystem: 'Web',
        provider: {
            '@type': 'Organization',
            name: 'Deepchill',
            url: 'https://deepchill.app',
        },
    };
}

export function buildBlogPostingSchema(post: {
    title: string;
    excerpt: string;
    slug: string;
    publishedAt: string;
    updatedAt?: string;
    tags: string[];
    authorName: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        url: `https://deepchill.app/blog/${post.slug}`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        keywords: post.tags.join(', '),
        author: {
            '@type': 'Organization',
            name: post.authorName,
            url: 'https://deepchill.app',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Deepchill',
            url: 'https://deepchill.app',
            logo: {
                '@type': 'ImageObject',
                url: 'https://deepchill.app/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://deepchill.app/blog/${post.slug}`,
        },
    };
}

export function buildBreadcrumbSchema(
    items: { name: string; url: string }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function buildItemListSchema(
    items: { name: string; url: string; description: string }[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: item.url,
            description: item.description,
        })),
    };
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}
