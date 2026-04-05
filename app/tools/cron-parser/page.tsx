import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import CronParserClient from './CronParserClient';

export const metadata: Metadata = {
    title: 'Cron Expression Parser — Human-Readable Schedule Viewer | Deepchill',
    description: 'Instantly decode any cron expression into plain English. See the next 5 run times, pick a timezone, use the interactive builder, and share via URL. Free, no ads.',
    keywords: 'cron parser, cron expression, cron schedule viewer, cron job explained, quartz cron, online cron tester, cron next run time',
    alternates: { canonical: buildCanonicalUrl('/tools/cron-parser') },
    openGraph: {
        title: 'Cron Expression Parser — Free Online Cron Schedule Viewer | Deepchill',
        description: 'Decode any cron expression into plain English instantly. See next 5 execution times, timezone selector, and interactive builder.',
        url: buildCanonicalUrl('/tools/cron-parser'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cron Parser | Deepchill',
        description: 'Decode cron expressions instantly. See next run times, use the visual builder.',
        site: SITE_CONFIG.twitterHandle,
    },
};

export default function CronParserPage() {
    return <CronParserClient />;
}
