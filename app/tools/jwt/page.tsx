import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import JWTClient from './JWTClient';

export const metadata: Metadata = {
    title: 'JWT Decoder & Encoder — Inspect, Decode & Sign JSON Web Tokens | Deepchill',
    description: 'Decode JWT tokens instantly — view header, payload, and signature in color-coded panels. Check expiry, sign new tokens with HMAC, and share via URL. Free, runs in your browser.',
    keywords: 'jwt decoder, jwt debugger, jwt encode decode, json web token, jwt viewer, jwt expiry, jwt signature verify, hs256, hs384, hs512',
    alternates: { canonical: buildCanonicalUrl('/tools/jwt') },
    openGraph: {
        title: 'JWT Decoder & Encoder — Free Online JWT Tool | Deepchill',
        description: 'Decode, inspect, and encode JWT tokens instantly in your browser. Color-coded sections, expiry timer, HMAC signing.',
        url: buildCanonicalUrl('/tools/jwt'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'JWT Decoder & Encoder | Deepchill',
        description: 'Decode and encode JWT tokens instantly. Expiry timer, HMAC signing, shareable links.',
        site: SITE_CONFIG.twitterHandle,
    },
};

export default function JWTPage() {
    return <JWTClient />;
}
