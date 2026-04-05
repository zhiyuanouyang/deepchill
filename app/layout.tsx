
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SITE_CONFIG } from '@/app/lib/seo';
import JsonLd, { buildWebSiteSchema, buildOrganizationSchema } from '@/app/components/seo/JsonLd';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.domain),
    title: {
        default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
        template: `%s | ${SITE_CONFIG.name}`,
    },
    verification: {
        google: "0mofi5a7aVyB1bOoCwm-kD8c7DG2D4cCX6Yc6roXY40",
    },
    description: SITE_CONFIG.description,
    keywords: [
        'AI tools for software engineers',
        'technical interview preparation',
        'AI SaaS tools',
        'software engineer career tools',
        'interview prep platform',
        'AI-powered developer tools',
    ],
    authors: [{ name: 'Deepchill', url: SITE_CONFIG.domain }],
    creator: 'Deepchill',
    publisher: 'Deepchill',
    alternates: { canonical: SITE_CONFIG.domain },
    openGraph: {
        type: 'website',
        locale: SITE_CONFIG.locale,
        url: SITE_CONFIG.domain,
        siteName: SITE_CONFIG.name,
        title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
        description: SITE_CONFIG.description,
        images: [
            {
                url: `${SITE_CONFIG.domain}/og-default.png`,
                width: 1200,
                height: 630,
                alt: 'Deepchill — AI-Powered SaaS Tools',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
        description: SITE_CONFIG.description,
        site: SITE_CONFIG.twitterHandle,
        images: [`${SITE_CONFIG.domain}/og-default.png`],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    other: {
        'google-adsense-account': 'ca-pub-3805318800428171',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="antialiased">
                <JsonLd schema={buildWebSiteSchema()} />
                <JsonLd schema={buildOrganizationSchema()} />
                {children}
            </body>
        </html>
    );
}
