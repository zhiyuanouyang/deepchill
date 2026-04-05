
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import AppCard from '@/app/components/AppCard';
import JsonLd, { buildWebSiteSchema, buildOrganizationSchema } from '@/app/components/seo/JsonLd';
import { APPS_CATALOG } from '@/app/data/apps';
import { BLOG_POSTS } from '@/app/data/blog';
import { CATEGORIES } from '@/app/data/categories';
import { SITE_CONFIG } from '@/app/lib/seo';

export const metadata: Metadata = {
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description:
        'Deepchill is an indie studio shipping products across AI, games, finance, and more. One developer. Many ideas. All built with care.',
    alternates: { canonical: SITE_CONFIG.domain },
    keywords: [
        'indie software studio',
        'AI apps',
        'indie game developer',
        'fintech tools',
        'productivity utilities',
        'consumer web apps',
        'deepchill products',
    ],
    openGraph: {
        title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
        description:
            'Deepchill is an indie studio shipping products across AI, games, finance, and more — crafted by one person, shipped for everyone.',
        url: SITE_CONFIG.domain,
        type: 'website',
    },
};

const PILLARS = [
    { emoji: '🤖', label: 'AI & Automation' },
    { emoji: '🎮', label: 'Games' },
    { emoji: '💰', label: 'Finance' },
    { emoji: '⚡', label: 'Productivity' },
];

export default function HomePage() {
    const featuredApps = APPS_CATALOG.filter((a) => !a.comingSoon).slice(0, 3);
    const recentPosts = BLOG_POSTS.slice(0, 3);

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="noise-overlay" aria-hidden="true" />

            <JsonLd schema={buildWebSiteSchema()} />
            <JsonLd schema={buildOrganizationSchema()} />

            <Navbar />

            <main>
                {/* ── Hero ────────────────────────────────────────────────── */}
                <section className="relative min-h-[90vh] flex items-center" aria-labelledby="hero-heading">
                    {/* Ambient glows */}
                    <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" aria-hidden="true" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/8 blur-[130px] rounded-full pointer-events-none" aria-hidden="true" />

                    <div className="container-xl pt-32 pb-20 relative z-10">
                        <div className="max-w-4xl">
                            {/* Eyebrow */}
                            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-indigo-500/20">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-sm text-slate-300 font-medium">🛠 Built by one. Made for everyone.</span>
                            </div>

                            {/* Headline */}
                            <h1
                                id="hero-heading"
                                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
                            >
                                Products that{' '}
                                <span className="gradient-text">solve real problems</span>{' '}
                                across every{' '}
                                <span className="gradient-text-cool">category</span>
                            </h1>

                            <p className="text-xl text-slate-400 leading-relaxed mb-6 max-w-2xl">
                                Deepchill is a solo indie studio shipping tools across AI, games, finance, and
                                everyday utilities. Every product is built with taste, purpose, and genuine care.
                            </p>

                            {/* Domain pills */}
                            <div className="flex flex-wrap gap-2 mb-10">
                                {PILLARS.map((p) => (
                                    <div
                                        key={p.label}
                                        className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-sm text-slate-300 border border-white/8"
                                    >
                                        <span>{p.emoji}</span>
                                        <span>{p.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/products"
                                    className="btn-primary text-base py-4 px-8"
                                    id="hero-cta-primary"
                                >
                                    Explore all products
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/blog"
                                    className="btn-secondary text-base py-4 px-8"
                                    id="hero-cta-secondary"
                                >
                                    Read the blog
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Featured Products ───────────────────────────────────── */}
                <section className="section-padding" aria-labelledby="products-heading">
                    <div className="container-xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                            <div>
                                <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-2">Our Products</p>
                                <h2 id="products-heading" className="text-3xl md:text-4xl font-bold text-white">
                                    What we've built
                                </h2>
                            </div>
                            <Link href="/products" className="btn-secondary text-sm py-2.5 px-5 whitespace-nowrap" id="view-all-products-link">
                                View all products →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredApps.map((app) => (
                                <AppCard key={app.id} app={app} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Category Showcase ───────────────────────────────────── */}
                <section className="section-padding bg-slate-900/30" aria-labelledby="categories-heading">
                    <div className="container-xl">
                        <div className="text-center mb-12">
                            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-2">Browse by Category</p>
                            <h2 id="categories-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Find the right kind of tool for you
                            </h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">
                                Whether you want to supercharge your workflow with AI, unwind with a game, manage your
                                money, or just get something done faster — there's something here for you.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/categories/${cat.slug}`}
                                    className="glass rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 group"
                                    id={`category-card-${cat.slug}`}
                                >
                                    <div className="text-4xl mb-4">{cat.emoji}</div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                        {cat.description}
                                    </p>
                                    <div className="flex items-center gap-1 text-indigo-400 text-sm font-medium">
                                        Explore
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Blog Teaser ─────────────────────────────────────────── */}
                <section className="section-padding" aria-labelledby="blog-heading">
                    <div className="container-xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                            <div>
                                <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-2">From the Studio</p>
                                <h2 id="blog-heading" className="text-3xl md:text-4xl font-bold text-white">
                                    Insights &amp; deep dives
                                </h2>
                            </div>
                            <Link href="/blog" className="btn-secondary text-sm py-2.5 px-5 whitespace-nowrap" id="view-all-blog-link">
                                Read all articles →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recentPosts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="glass rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 group flex flex-col"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="tag">{post.category}</span>
                                        <span className="text-slate-600 text-xs">{post.readingTime} min read</span>
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-3 leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2 flex-1">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-1 text-indigo-400 text-sm font-medium mt-auto">
                                        Read article
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Bottom CTA ──────────────────────────────────────────── */}
                <section className="section-padding" aria-labelledby="bottom-cta-heading">
                    <div className="container-lg">
                        <div className="relative glass rounded-3xl p-12 text-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-violet-500/10 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="text-5xl mb-6">🛠</div>
                                <h2 id="bottom-cta-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    One developer. Many ideas. All shipped.
                                </h2>
                                <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                                    Every product in this studio was built by a single person with one goal: make
                                    something genuinely useful. Browse the full portfolio and find your next favourite tool.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/products"
                                        className="btn-primary text-base py-4 px-8"
                                        id="bottom-cta-button"
                                    >
                                        Browse all products
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                    <Link href="/blog" className="btn-secondary text-base py-4 px-8" id="bottom-cta-blog-link">
                                        Read the blog
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
