import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import TextDiffClient from './TextDiffClient';

export const metadata: Metadata = {
    title: 'Text Diff Checker — Compare Two Texts Online Free | Deepchill',
    description: 'Compare two versions of text side-by-side and see exactly what changed, line by line. Free, instant, no server required. Great for code, documents, and configs.',
    keywords: 'text diff, diff checker, compare text online, text comparison tool, line diff, find differences in text, diff tool free',
    alternates: { canonical: buildCanonicalUrl('/tools/text-diff') },
    openGraph: {
        title: 'Text Diff Checker | Deepchill',
        description: 'Compare two texts side-by-side. Instant line-by-line diff, free, no server.',
        url: buildCanonicalUrl('/tools/text-diff'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Text Diff Checker | Deepchill',
        description: 'Instant line-by-line text comparison. Free, no sign-up.',
        site: SITE_CONFIG.twitterHandle,
    },
};

export default function TextDiffPage() {
    return <TextDiffClient />;
}
