
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
    title: `${SITE_CONFIG.name} — AI-Powered SaaS Tools for Software Engineers`,
    description:
        'Deepchill is your hub for AI-powered SaaS tools: technical interview prep, resume building, and more. Discover tools that accelerate software engineering careers.',
    alternates: { canonical: SITE_CONFIG.domain },
    keywords: [
        'AI tools for software engineers',
        'technical interview preparation platform',
        'AI SaaS tools developers',
        'software engineering career tools',
        'interview prep AI',
        'FAANG interview practice',
    ],
    openGraph: {
        title: `${SITE_CONFIG.name} — AI-Powered SaaS Tools for Software Engineers`,
        description:
            'Discover AI-powered tools that help software engineers ace interviews, build better resumes, and grow their careers.',
        url: SITE_CONFIG.domain,
        type: 'website',
    },
};

const STATS = [
    { value: '10K+', label: 'Engineers Helped' },
    { value: '50K+', label: 'Interviews Practiced' },
    { value: '95%', label: 'Satisfaction Rate' },
    { value: '4.9★', label: 'Average Rating' },
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
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/6 blur-[130px] rounded-full pointer-events-none" aria-hidden="true" />

                    <div className="container-xl pt-32 pb-20 relative z-10">
                        <div className="max-w-4xl">
                            {/* Eyebrow */}
                            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-indigo-500/20">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-sm text-slate-300 font-medium">AI-Powered Tools — Built for Engineers</span>
                            </div>

                            {/* Headline */}
                            <h1
                                id="hero-heading"
                                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
                            >
                                The AI toolkit for{' '}
                                <span className="gradient-text">software engineers</span>{' '}
                                who want to{' '}
                                <span className="gradient-text-cool">win</span>
                            </h1>

                            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
                                Deepchill builds AI-powered tools that help engineers ace technical interviews, craft standout resumes, and accelerate their careers. Discover your next edge.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-16">
                                <a
                                    href="https://interviewgpt.deepchill.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary text-base py-4 px-8"
                                    id="hero-cta-primary"
                                >
                                    Start Free with InterviewGPT
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                                <Link
                                    href="/products"
                                    className="btn-secondary text-base py-4 px-8"
                                    id="hero-cta-secondary"
                                >
                                    Explore All Products
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {STATS.map((stat) => (
                                    <div key={stat.label} className="text-center sm:text-left">
                                        <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                                        <div className="text-slate-500 text-sm">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Featured Products ───────────────────────────────────── */}
                <section className="section-padding" aria-labelledby="products-heading">
                    <div className="container-xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                            <div>
                                <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-2">Featured Tools</p>
                                <h2 id="products-heading" className="text-3xl md:text-4xl font-bold text-white">
                                    AI tools built for your career
                                </h2>
                            </div>
                            <Link href="/products" className="btn-secondary text-sm py-2.5 px-5 whitespace-nowrap">
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
                                Find tools for your specific needs
                            </h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">
                                Whether you're preparing for a technical interview, building your resume, or growing your career — we have dedicated AI tools for every goal.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/categories/${cat.slug}`}
                                    className="glass rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 group"
                                >
                                    <div className="text-4xl mb-4">{cat.emoji}</div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                        {cat.description}
                                    </p>
                                    <div className="flex items-center gap-1 text-indigo-400 text-sm font-medium">
                                        Explore {cat.name}
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
                                <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-2">Knowledge Base</p>
                                <h2 id="blog-heading" className="text-3xl md:text-4xl font-bold text-white">
                                    Expert interview prep guides
                                </h2>
                            </div>
                            <Link href="/blog" className="btn-secondary text-sm py-2.5 px-5 whitespace-nowrap">
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
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-rose-500/10 pointer-events-none" />
                            <div className="relative z-10">
                                <h2 id="bottom-cta-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    Ready to ace your next technical interview?
                                </h2>
                                <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                                    Join thousands of engineers who use InterviewGPT to practice coding, system design, and behavioral interviews with real-time AI feedback.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="https://interviewgpt.deepchill.app"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary text-base py-4 px-8"
                                        id="bottom-cta-button"
                                    >
                                        Start for Free — No Credit Card Required
                                    </a>
                                    <Link href="/products/interviewgpt" className="btn-secondary text-base py-4 px-8">
                                        Learn More
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
