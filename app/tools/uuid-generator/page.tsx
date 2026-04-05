import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import UUIDGeneratorClient from './UUIDGeneratorClient';

const CANONICAL = buildCanonicalUrl('/tools/uuid-generator');

export const metadata: Metadata = {
    title: 'UUID Generator — Free Online UUID v4 / v1 / v7 Tool | Deepchill',
    description:
        'Generate cryptographically secure UUIDs instantly in your browser. UUID v4, v1, v7 — bulk generate up to 1,000, export to JSON/CSV/TXT, custom formats, no ads, no sign-up.',
    keywords:
        'uuid generator, generate uuid, uuid v4 generator, random uuid, guid generator, bulk uuid generator, uuid online, uuid v7, uuid v1, uuid tool',
    alternates: { canonical: CANONICAL },
    openGraph: {
        title: 'UUID Generator — Free Online UUID v4 / v1 / v7 Tool | Deepchill',
        description:
            'Generate cryptographically secure UUIDs instantly in your browser. UUID v4, v1, v7 — bulk generate up to 1,000, export to JSON/CSV/TXT.',
        url: CANONICAL,
        siteName: SITE_CONFIG.name,
        type: 'website',
        locale: SITE_CONFIG.locale,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'UUID Generator | Deepchill',
        description:
            'Free, instant UUID generator. v4 random, v1 timestamp, v7 sortable. Bulk export, custom formats, keyboard shortcuts.',
        site: SITE_CONFIG.twitterHandle,
    },
    robots: { index: true, follow: true },
};

export default function UUIDGeneratorPage() {
    return <UUIDGeneratorClient />;
}
