import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import RegexClient from './RegexClient';

export const metadata: Metadata = {
    title: 'Regex Tester & Debugger — Live Match Highlighting | Deepchill',
    description: 'Test regular expressions with live match highlighting, capture group visualization, and replace mode. Supports all JS regex flags. Free, runs entirely in your browser.',
    keywords: 'regex tester, regex debugger, regex match tool, regular expression tester, regex online, regex capture groups, regex replace, javascript regex',
    alternates: { canonical: buildCanonicalUrl('/tools/regex') },
    openGraph: {
        title: 'Regex Tester & Debugger — Free Online Regex Tool | Deepchill',
        description: 'Live regex match highlighting, capture group visualization, replace mode, and flag toggles. Free, instant, no ads.',
        url: buildCanonicalUrl('/tools/regex'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Regex Tester | Deepchill',
        description: 'Test and debug regex patterns with live match highlighting and capture group visualization.',
        site: SITE_CONFIG.twitterHandle,
    },
};

export default function RegexPage() {
    return <RegexClient />;
}
