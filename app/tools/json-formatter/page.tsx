import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import JSONFormatterClient from './JSONFormatterClient';

export const metadata: Metadata = {
    title: 'JSON Formatter, Validator & Minifier — Free Online Tool | Deepchill',
    description: 'Instantly format, validate, and minify JSON in your browser. No ads, no account required, no data sent to servers. Supports drag-and-drop, shareable links, and dark mode.',
    keywords: 'json formatter, json validator, json beautifier, json minifier, format json online, pretty print json, validate json, json lint',
    alternates: { canonical: buildCanonicalUrl('/tools/json-formatter') },
    openGraph: {
        title: 'JSON Formatter & Validator — Free Online Tool | Deepchill',
        description: 'Format, validate, and minify JSON instantly in your browser. No server, no ads.',
        url: buildCanonicalUrl('/tools/json-formatter'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'JSON Formatter & Validator | Deepchill',
        description: 'Format, validate, and minify JSON instantly. Free, fast, no ads.',
        site: SITE_CONFIG.twitterHandle,
    },
};

export default function JSONFormatterPage() {
    return <JSONFormatterClient />;
}
