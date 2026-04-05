
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';

export const metadata: Metadata = {
    title: `Privacy Policy | ${SITE_CONFIG.name}`,
    description:
        'Deepchill.app is a static portfolio and app gallery. We do not collect any personal data on this website.',
    alternates: { canonical: buildCanonicalUrl('/privacy') },
    openGraph: {
        title: `Privacy Policy | ${SITE_CONFIG.name}`,
        url: buildCanonicalUrl('/privacy'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    robots: { index: true, follow: true },
};

const LAST_UPDATED = 'April 5, 2026';

export default function PrivacyPage() {
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
                            'radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
            </div>

            <div className="container-lg section-padding" style={{ position: 'relative', zIndex: 1 }}>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 text-sm transition-colors mb-10"
                    id="privacy-back-home"
                >
                    ← Back to home
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <span className="tag mb-4 inline-block">Legal</span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
                </div>

                <div className="divider mb-12" />

                {/* Content */}
                <article className="prose-dark max-w-none">
                    <p>
                        Welcome to <strong>Deepchill</strong> (&quot;we&quot;, &quot;us&quot;, or
                        &quot;our&quot;). This Privacy Policy describes our practices for{' '}
                        <strong>deepchill.app</strong> — a static portfolio website and app gallery
                        — and clarifies how it differs from the individual applications we host.
                    </p>

                    <h2>1. This Website Does Not Collect Personal Data</h2>
                    <p>
                        <strong>deepchill.app</strong> is a read-only gallery and introduction
                        website. We do <strong>not</strong>:
                    </p>
                    <ul>
                        <li>Collect your name, email address, or any account information</li>
                        <li>Use cookies or tracking pixels</li>
                        <li>Run analytics or advertising scripts on this domain</li>
                        <li>Store any data about your visit</li>
                    </ul>
                    <p>
                        Simply browsing <strong>deepchill.app</strong> leaves no personal data with
                        us.
                    </p>

                    <h2>2. Hosted Applications on Subdomains</h2>
                    <p>
                        Some apps linked from this gallery are hosted on subdomains (e.g.,{' '}
                        <em>*.deepchill.app</em>) or separate domains. These are independent
                        products that may:
                    </p>
                    <ul>
                        <li>Require account creation and collect personal information</li>
                        <li>Use cookies, local storage, or third-party analytics</li>
                        <li>Have their own Terms of Service and Privacy Policies</li>
                    </ul>
                    <p>
                        Please review the privacy policy of each individual application before
                        using it. We are not responsible for the data practices of those apps,
                        even when they share the <em>deepchill.app</em> domain.
                    </p>

                    <h2>3. Infrastructure</h2>
                    <p>
                        This website is hosted on <strong>Vercel</strong>. Vercel may log
                        standard server-level information (such as IP addresses and request
                        timestamps) as part of normal infrastructure operations. This data is
                        handled according to{' '}
                        <a
                            href="https://vercel.com/legal/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#818cf8' }}
                        >
                            Vercel&apos;s Privacy Policy
                        </a>
                        . We do not have access to or control over this infrastructure-level data.
                    </p>

                    <h2>4. Children&apos;s Privacy</h2>
                    <p>
                        This website is not directed to children under 13. Because we collect no
                        personal data, there is no risk of inadvertently collecting information
                        from minors on <strong>deepchill.app</strong>.
                    </p>

                    <h2>5. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. Changes will be
                        reflected by updating the &quot;Last updated&quot; date above. As this
                        site collects no data, updates are unlikely to affect you directly.
                    </p>

                    <h2>6. Contact</h2>
                    <p>
                        If you have questions about this Privacy Policy or the applications listed
                        on this site, please reach out through the developer&apos;s personal
                        website:{' '}
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
                        href="/terms"
                        className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                        id="privacy-link-terms"
                    >
                        Read our Terms of Service →
                    </Link>
                    <Link
                        href="/about"
                        className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                        id="privacy-link-about"
                    >
                        About the developer
                    </Link>
                </div>
            </div>
        </main>
    );
}
