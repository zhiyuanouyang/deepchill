
import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';

export const metadata: Metadata = {
    title: `About | ${SITE_CONFIG.name}`,
    description:
        'Meet the developer behind Deepchill — an indie studio building AI tools, games, and fintech products crafted by one person for everyone.',
    alternates: { canonical: buildCanonicalUrl('/about') },
    openGraph: {
        title: `About | ${SITE_CONFIG.name}`,
        description:
            'Meet the developer behind Deepchill — an indie studio building AI tools, games, and fintech products crafted by one person for everyone.',
        url: buildCanonicalUrl('/about'),
        siteName: SITE_CONFIG.name,
        images: [{ url: SITE_CONFIG.defaultOgImage, width: 1200, height: 630 }],
        type: 'website',
    },
};

const SKILLS = [
    { label: 'Full-Stack Development', icon: '⚡' },
    { label: 'AI & Machine Learning', icon: '🤖' },
    { label: 'Product Design', icon: '🎨' },
    { label: 'System Architecture', icon: '🏗️' },
    { label: 'Cloud & DevOps', icon: '☁️' },
    { label: 'Mobile Development', icon: '📱' },
];

const PRODUCTS_BUILT = [
    {
        name: 'InterviewGPT',
        desc: 'AI-powered technical interview preparation — coding, system design, SQL, and behavioral.',
        href: '/products/interviewgpt',
        tag: 'AI Tools',
        accent: 'from-indigo-500 to-violet-600',
    },
];

export default function AboutPage() {
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
                            'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                />
            </div>

            <div className="container-lg section-padding" style={{ position: 'relative', zIndex: 1 }}>
                {/* Back nav */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 text-sm transition-colors mb-10"
                    id="about-back-home"
                >
                    ← Back to home
                </Link>

                {/* Hero */}
                <div className="text-center mb-20">
                    <span className="tag mb-4 inline-block">The Developer</span>
                    <h1
                        className="text-5xl md:text-6xl font-black tracking-tight mb-6"
                        style={{ lineHeight: 1.1 }}
                    >
                        Built by one person,{' '}
                        <span className="gradient-text">shipped for everyone.</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Deepchill is an indie studio run solo — obsessing over craft, shipping
                        real products, and doing it all from scratch.
                    </p>
                </div>

                {/* Developer card */}
                <div
                    className="glass-strong rounded-2xl p-8 md:p-12 mb-16 animate-fade-in-up"
                    style={{ maxWidth: '720px', margin: '0 auto 4rem' }}
                >
                    {/* Avatar */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div
                            style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: '50%',
                                flexShrink: 0,
                                background: 'linear-gradient(135deg, #6366f1, #f43f5e)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                color: 'white',
                                boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                            }}
                        >
                            ZO
                        </div>

                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-white mb-1">Zhiyuan Ouyang</h2>
                            <p className="text-indigo-400 font-medium mb-4 text-sm">
                                Founder &amp; Solo Developer · Deepchill
                            </p>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                I&apos;m a full-stack developer and product builder obsessed with
                                turning ideas into polished, real-world products. I built Deepchill
                                as a playground for ambitious side projects — from AI interview
                                tools to games and fintech experiments.
                            </p>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Every product on this platform is designed, developed, and
                                maintained by me — one engineer, one studio, zero shortcuts.
                            </p>

                            <a
                                href="https://zhiyuanouyang.vercel.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary text-sm py-2.5 px-5 w-fit"
                                id="about-personal-website"
                            >
                                Visit Personal Website →
                            </a>
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <section className="mb-20" style={{ maxWidth: '720px', margin: '0 auto 5rem' }}>
                    <h2 className="text-xl font-bold text-slate-200 mb-6 text-center">
                        What I Work With
                    </h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '0.75rem',
                        }}
                    >
                        {SKILLS.map((s) => (
                            <div
                                key={s.label}
                                className="glass rounded-xl px-4 py-3 flex items-center gap-3"
                                style={{ transition: 'border-color 0.2s' }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
                                <span className="text-slate-300 text-sm font-medium">
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Products */}
                <section style={{ maxWidth: '720px', margin: '0 auto 5rem' }}>
                    <h2 className="text-xl font-bold text-slate-200 mb-6 text-center">
                        Products I&apos;ve Shipped
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {PRODUCTS_BUILT.map((p) => (
                            <Link
                                key={p.name}
                                href={p.href}
                                className="glass rounded-xl p-5 flex items-start gap-4 hover:border-indigo-500/40 transition-all group"
                                style={{ textDecoration: 'none' }}
                            >
                                <div
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '10px',
                                        background: `linear-gradient(135deg, var(--tw-gradient-from, #6366f1), var(--tw-gradient-to, #7c3aed))`,
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                    }}
                                    className={`bg-gradient-to-br ${p.accent}`}
                                >
                                    🚀
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-semibold">{p.name}</span>
                                        <span className="tag">{p.tag}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {p.desc}
                                    </p>
                                </div>
                                <span className="text-slate-600 group-hover:text-indigo-400 transition-colors ml-auto text-lg">
                                    →
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <div
                    className="glass rounded-2xl p-10 text-center"
                    style={{ maxWidth: '720px', margin: '0 auto' }}
                >
                    <h2 className="text-2xl font-bold text-white mb-3">Want to connect?</h2>
                    <p className="text-slate-400 mb-6">
                        Check out my personal site for more projects, writing, and contact info.
                    </p>
                    <a
                        href="https://zhiyuanouyang.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        id="about-cta-personal-site"
                    >
                        zhiyuanouyang.vercel.app →
                    </a>
                </div>
            </div>
        </main>
    );
}
