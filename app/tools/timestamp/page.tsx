import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import TimestampClient from './TimestampClient';

export const metadata: Metadata = {
    title: 'Unix Timestamp Converter — Epoch to Date & Date to Epoch | Deepchill',
    description: 'Convert Unix timestamps to human-readable dates and back. Shows UTC, local time, ISO 8601, and relative time. Detects seconds vs milliseconds automatically.',
    keywords: 'unix timestamp converter, epoch converter, timestamp to date, date to timestamp, epoch time, unix time converter, milliseconds to date',
    alternates: { canonical: buildCanonicalUrl('/tools/timestamp') },
    openGraph: {
        title: 'Unix Timestamp Converter | Deepchill',
        description: 'Convert timestamps to dates and back. Free, instant, shows UTC, local, ISO, and relative time.',
        url: buildCanonicalUrl('/tools/timestamp'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Unix Timestamp Converter | Deepchill',
        description: 'Epoch to date and date to epoch. Auto-detects seconds vs milliseconds.',
        site: SITE_CONFIG.twitterHandle,
    },
};

export default function TimestampPage() {
    return <TimestampClient />;
}
