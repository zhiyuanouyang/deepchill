
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';

export const metadata: Metadata = {
    title: `Privacy Policy | ${SITE_CONFIG.name}`,
    description:
        'Learn how Deepchill collects, uses, and protects your personal information when you use our products and services.',
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
                        &quot;our&quot;). This Privacy Policy explains how we collect, use,
                        disclose, and safeguard your information when you visit{' '}
                        <strong>deepchill.app</strong> and use any of our products or services
                        (collectively, the &quot;Service&quot;). Please read this policy carefully.
                        If you disagree with its terms, please discontinue use of the Service.
                    </p>

                    <h2>1. Information We Collect</h2>
                    <h3>Information You Provide</h3>
                    <p>
                        We may collect personal information that you voluntarily provide, such as
                        your email address when creating an account, subscribing to our newsletter,
                        or contacting us for support.
                    </p>

                    <h3>Automatically Collected Information</h3>
                    <p>
                        When you visit our site, we may automatically collect certain information
                        about your device and usage, including:
                    </p>
                    <ul>
                        <li>IP address and general location data (country/region level)</li>
                        <li>Browser type and operating system</li>
                        <li>Pages visited and time spent on each page</li>
                        <li>Referring URLs</li>
                        <li>Device identifiers</li>
                    </ul>

                    <h3>Cookies and Tracking Technologies</h3>
                    <p>
                        We use cookies and similar tracking technologies to enhance your experience,
                        analyze usage patterns, and serve relevant content. You can instruct your
                        browser to refuse all cookies; however, some features of the Service may
                        not function properly.
                    </p>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide, operate, and maintain the Service</li>
                        <li>Improve and personalize your experience</li>
                        <li>Respond to comments, questions, and support requests</li>
                        <li>Send you technical notices, updates, and promotional communications</li>
                        <li>Monitor and analyze usage and trends</li>
                        <li>Detect, prevent, and address technical issues or fraud</li>
                        <li>Comply with legal obligations</li>
                    </ul>

                    <h2>3. Third-Party Services</h2>
                    <p>
                        We may use third-party services that collect, monitor, and analyze data.
                        These include:
                    </p>
                    <ul>
                        <li>
                            <strong>Google Analytics</strong> — for website usage analytics
                        </li>
                        <li>
                            <strong>Google AdSense</strong> — for advertising; Google may use
                            cookies to serve ads based on your prior visits
                        </li>
                        <li>
                            <strong>Vercel</strong> — for hosting and edge networking
                        </li>
                        <li>
                            <strong>Supabase</strong> — for database and authentication services
                        </li>
                    </ul>
                    <p>
                        These third parties have their own privacy policies governing how they
                        handle your data. We are not responsible for their practices.
                    </p>

                    <h2>4. Data Sharing and Disclosure</h2>
                    <p>
                        We do not sell your personal information. We may share information only in
                        the following circumstances:
                    </p>
                    <ul>
                        <li>
                            <strong>Service Providers:</strong> With third parties that help us
                            operate the Service (e.g., hosting, analytics)
                        </li>
                        <li>
                            <strong>Legal Requirements:</strong> When required by law or to protect
                            the rights and safety of our users or the public
                        </li>
                        <li>
                            <strong>Business Transfers:</strong> In connection with a merger,
                            acquisition, or sale of assets
                        </li>
                    </ul>

                    <h2>5. Data Retention</h2>
                    <p>
                        We retain personal information for as long as necessary to provide the
                        Service and fulfill the purposes described in this policy, unless a longer
                        retention period is required or permitted by law.
                    </p>

                    <h2>6. Security</h2>
                    <p>
                        We implement commercially reasonable security measures to protect your
                        information. However, no method of transmission over the internet or
                        electronic storage is 100% secure. We cannot guarantee absolute security.
                    </p>

                    <h2>7. Your Rights</h2>
                    <p>
                        Depending on your jurisdiction, you may have the right to access, correct,
                        or delete your personal information. To exercise these rights, please
                        contact us via our{' '}
                        <a
                            href="https://zhiyuanouyang.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#818cf8' }}
                        >
                            personal website
                        </a>
                        .
                    </p>

                    <h2>8. Children&apos;s Privacy</h2>
                    <p>
                        Our Service is not directed to children under 13. We do not knowingly
                        collect personal information from children. If we discover that a child
                        under 13 has provided us personal information, we will promptly delete it.
                    </p>

                    <h2>9. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of
                        significant changes by updating the &quot;Last updated&quot; date at the
                        top of this page. Your continued use of the Service after any changes
                        constitutes acceptance of the updated policy.
                    </p>

                    <h2>10. Contact Us</h2>
                    <p>
                        If you have questions or concerns about this Privacy Policy, please reach
                        out through the developer&apos;s personal website:{' '}
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
