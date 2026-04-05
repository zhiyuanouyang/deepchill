import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import Base64Client from './Base64Client';

export const metadata: Metadata = {
    title: 'Base64 Encoder / Decoder — Free Online Tool | Deepchill',
    description: 'Encode text or binary files to Base64, or decode Base64 strings. Supports UTF-8, binary files, and download. No server, no ads, completely private.',
    keywords: 'base64 encoder, base64 decoder, base64 online tool, encode to base64, decode base64, base64 file encoder, atob btoa tool',
    alternates: { canonical: buildCanonicalUrl('/tools/base64') },
    openGraph: {
        title: 'Base64 Encoder / Decoder | Deepchill',
        description: 'Encode and decode Base64 — text and binary files. Free, browser-only.',
        url: buildCanonicalUrl('/tools/base64'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Base64 Encoder / Decoder | Deepchill',
        description: 'Free Base64 encoding and decoding with file support.',
        site: SITE_CONFIG.twitterHandle,
    },
};

export default function Base64Page() {
    return <Base64Client />;
}
