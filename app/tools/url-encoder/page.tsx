import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import URLEncoderClient from './URLEncoderClient';

export const metadata: Metadata = {
    title: 'URL Encoder / Decoder — Free Online Percent Encoding Tool | Deepchill',
    description: 'Encode and decode URLs, query strings, and special characters instantly. Uses encodeURIComponent. No server, no ads, with a quick-reference character table.',
    keywords: 'url encoder, url decoder, percent encoding, encode url online, decode url, encodeURIComponent, url encoding tool free',
    alternates: { canonical: buildCanonicalUrl('/tools/url-encoder') },
    openGraph: {
        title: 'URL Encoder / Decoder | Deepchill',
        description: 'Encode and decode URLs instantly. Free, browser-only, with character reference table.',
        url: buildCanonicalUrl('/tools/url-encoder'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'URL Encoder / Decoder | Deepchill',
        description: 'Free URL encoding and decoding with character reference table.',
        site: SITE_CONFIG.twitterHandle,
    },
};

export default function URLEncoderPage() {
    return <URLEncoderClient />;
}
