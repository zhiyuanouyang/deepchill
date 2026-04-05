
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';

export const metadata: Metadata = {
    title: `Terms of Service | ${SITE_CONFIG.name}`,
    description:
        'Read the Terms of Service for Deepchill products and services. Understand your rights and responsibilities when using our platform.',
    alternates: { canonical: buildCanonicalUrl('/terms') },
    openGraph: {
        title: `Terms of Service | ${SITE_CONFIG.name}`,
        url: buildCanonicalUrl('/terms'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    robots: { index: true, follow: true },
};

const LAST_UPDATED = 'April 5, 2026';

export default function TermsPage() {
    return (
        <main className="min-h-screen" style={{ background: 'var(--background)' }}>
            {/* Ambient glow */}
            <div
                aria-hidden
                style={{
                    position: 'fixed',
                    inset: 0,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '70vw',
                        height: '60vh',
                        background:
                            'radial-gradient(ellipse, rgba(244,63,94,0.08) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
            </div>

            <div className="container-lg section-padding" style={{ position: 'relative', zIndex: 1 }}>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 text-sm transition-colors mb-10"
                    id="terms-back-home"
                >
                    ← Back to home
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <span className="tag mb-4 inline-block">Legal</span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
                </div>

                <div className="divider mb-12" />

                {/* Content */}
                <article className="prose-dark max-w-none">
                    <p>
                        Please read these Terms of Service (&quot;Terms&quot;) carefully before
                        using <strong>deepchill.app</strong> and any of its products or services
                        (collectively, the &quot;Service&quot;) operated by{' '}
                        <strong>Deepchill</strong> (&quot;we&quot;, &quot;us&quot;, or
                        &quot;our&quot;). By accessing or using the Service, you agree to be bound
                        by these Terms. If you do not agree, you may not use the Service.
                    </p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By creating an account or using any part of the Service, you confirm that
                        you are at least 13 years old and that you have read, understood, and agree
                        to these Terms. If you are using the Service on behalf of an organization,
                        you represent that you have authority to bind that organization to these
                        Terms.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        Deepchill is an indie studio that develops and hosts software products
                        including, but not limited to, AI-powered tools, productivity utilities,
                        games, and financial tools. Specific features and availability may vary by
                        product.
                    </p>

                    <h2>3. User Accounts</h2>
                    <p>
                        Some features of the Service require account registration. You are
                        responsible for:
                    </p>
                    <ul>
                        <li>Maintaining the confidentiality of your account credentials</li>
                        <li>All activities that occur under your account</li>
                        <li>Notifying us immediately of any unauthorized use</li>
                    </ul>
                    <p>
                        We reserve the right to terminate accounts that violate these Terms or that
                        have been inactive for an extended period.
                    </p>

                    <h2>4. Acceptable Use</h2>
                    <p>You agree not to use the Service to:</p>
                    <ul>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe the intellectual property rights of others</li>
                        <li>Transmit harmful, offensive, or illegal content</li>
                        <li>
                            Attempt to gain unauthorized access to our systems or other users&apos;
                            accounts
                        </li>
                        <li>
                            Scrape, crawl, or use automated tools to extract data without our
                            express written consent
                        </li>
                        <li>
                            Reverse engineer, decompile, or disassemble any part of the Service
                        </li>
                        <li>
                            Use the Service in a way that could damage, disable, or impair it
                        </li>
                    </ul>

                    <h2>5. Intellectual Property</h2>
                    <p>
                        All content, software, and materials on the Service — including text,
                        graphics, logos, and code — are owned by or licensed to Deepchill and are
                        protected by applicable intellectual property laws. You may not copy,
                        reproduce, modify, distribute, or create derivative works without our
                        explicit written permission.
                    </p>

                    <h2>6. Subscriptions and Payments</h2>
                    <p>
                        Some products may offer paid plans or subscriptions. By subscribing, you
                        agree to pay all applicable fees. Fees are non-refundable unless otherwise
                        stated. We reserve the right to change pricing with reasonable notice. Your
                        continued use after a price change constitutes acceptance of the new fees.
                    </p>

                    <h2>7. Third-Party Links and Services</h2>
                    <p>
                        The Service may contain links to third-party websites or integrate
                        third-party services. We are not responsible for the content, privacy
                        practices, or availability of those services. Accessing third-party
                        resources is at your own risk.
                    </p>

                    <h2>8. Disclaimer of Warranties</h2>
                    <p>
                        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
                        WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT
                        THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER
                        HARMFUL COMPONENTS.
                    </p>

                    <h2>9. Limitation of Liability</h2>
                    <p>
                        TO THE FULLEST EXTENT PERMITTED BY LAW, DEEPCHILL SHALL NOT BE LIABLE FOR
                        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
                        ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED
                        THE AMOUNT YOU PAID US IN THE 12 MONTHS PRIOR TO THE CLAIM.
                    </p>

                    <h2>10. Indemnification</h2>
                    <p>
                        You agree to indemnify and hold harmless Deepchill and its developer from
                        any claims, losses, or damages (including legal fees) arising from your use
                        of the Service, your violation of these Terms, or your infringement of any
                        third-party rights.
                    </p>

                    <h2>11. Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate your access to the Service at
                        any time, with or without notice, for any reason including violation of
                        these Terms. Upon termination, all licenses granted to you will immediately
                        cease.
                    </p>

                    <h2>12. Changes to Terms</h2>
                    <p>
                        We may update these Terms from time to time. We will notify you of material
                        changes by updating the &quot;Last updated&quot; date. Your continued use
                        of the Service after changes become effective constitutes your acceptance of
                        the revised Terms.
                    </p>

                    <h2>13. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws
                        of the State of California, USA, without regard to its conflict of law
                        provisions.
                    </p>

                    <h2>14. Contact</h2>
                    <p>
                        For any questions about these Terms, please contact us through the
                        developer&apos;s personal website:{' '}
                        <a
                            href="https://zhiyuanouyang.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#818cf8' }}
                        >
                            zhiyuanouyang.vercel.app
                        </a>
                        .
                    </p>
                </article>

                <div className="divider mt-16 mb-10" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                        href="/privacy"
                        className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                        id="terms-link-privacy"
                    >
                        Read our Privacy Policy →
                    </Link>
                    <Link
                        href="/about"
                        className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                        id="terms-link-about"
                    >
                        About the developer
                    </Link>
                </div>
            </div>
        </main>
    );
}
