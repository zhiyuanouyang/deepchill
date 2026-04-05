
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Breadcrumb from '@/app/components/Breadcrumb';
import JsonLd, { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '@/app/components/seo/JsonLd';
import { APPS_CATALOG } from '@/app/data/apps';
import { BLOG_POSTS } from '@/app/data/blog';
import { generateProductMetadata, SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return APPS_CATALOG.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const app = APPS_CATALOG.find((a) => a.slug === slug);
    if (!app) return { title: 'Product Not Found' };
    return generateProductMetadata(app);
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const app = APPS_CATALOG.find((a) => a.slug === slug);
    if (!app) notFound();

    const relatedPosts = BLOG_POSTS.filter((p) => p.relatedProductSlug === app.slug).slice(0, 3);

    const breadcrumbItems = [
        { label: 'Products', href: '/products' },
        { label: app.name },
    ];

    const softwareSchema = buildSoftwareApplicationSchema({
        name: app.name,
        description: app.description,
        url: buildCanonicalUrl(`/products/${app.slug}`),
        category: app.category,
        features: app.features,
    });

    const breadcrumbSchema = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_CONFIG.domain },
        { name: 'Products', url: buildCanonicalUrl('/products') },
        { name: app.name, url: buildCanonicalUrl(`/products/${app.slug}`) },
    ]);

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="noise-overlay" aria-hidden="true" />
            <JsonLd schema={softwareSchema} />
            <JsonLd schema={breadcrumbSchema} />
            <Navbar />

            <main>
                {/* ── Hero ─────────────────────────────────────────────── */}
                <section className="relative pt-28 pb-20" aria-labelledby="product-heading">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/8 blur-[130px] rounded-full pointer-events-none" aria-hidden="true" />
                    <div className="container-xl relative z-10">
                        <Breadcrumb items={breadcrumbItems} className="mb-8" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Left: Content */}
                            <div>
                                {/* Badges */}
                                <div className="flex items-center gap-3 mb-6">
                                    {app.isNew && (
                                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                            New Release
                                        </span>
                                    )}
                                    {app.comingSoon && (
                                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                            Coming Soon
                                        </span>
                                    )}
                                    <span className="tag">{app.category}</span>
                                </div>

                                {/* App identity */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {app.icon.startsWith('http') || app.icon.startsWith('/') ? (
                                            <img src={app.icon} alt={`${app.name} icon`} className="w-full h-full object-cover p-2" />
                                        ) : (
                                            <span className="text-3xl">{app.icon}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h1 id="product-heading" className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                            {app.name}
                                        </h1>
                                    </div>
                                </div>

                                <p className="text-2xl text-indigo-300 font-medium mb-6 leading-snug">
                                    {app.tagline}
                                </p>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    {app.description}
                                </p>

                                {/* CTAs */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {app.comingSoon ? (
                                        <button className="btn-secondary text-base py-4 px-8 cursor-default opacity-60" disabled>
                                            Coming Soon — Stay Tuned
                                        </button>
                                    ) : (
                                        <>
                                            <a
                                                href={app.launchUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-primary text-base py-4 px-8"
                                                id={`launch-${app.slug}`}
                                            >
                                                Launch {app.name}
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                            <a href={app.launchUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-base py-4 px-8">
                                                Try Free →
                                            </a>
                                        </>
                                    )}
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mt-6">
                                    {app.tags.map((tag) => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Screenshot */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 blur-3xl rounded-3xl" />
                                <img
                                    src={app.imageUrl}
                                    alt={`${app.name} — screenshot`}
                                    className="relative rounded-2xl w-full shadow-2xl shadow-indigo-500/20 border border-white/10"
                                    width={800}
                                    height={450}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Long Description ─────────────────────────────────── */}
                <section className="section-padding bg-slate-900/30" aria-labelledby="about-heading">
                    <div className="container-lg">
                        <h2 id="about-heading" className="text-3xl font-bold text-white mb-8">About {app.name}</h2>
                        <div className="prose-dark">
                            {app.longDescription.trim().split('\n\n').map((paragraph, i) => (
                                <p key={i}>{paragraph.trim()}</p>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Key Features ─────────────────────────────────────── */}
                <section className="section-padding" aria-labelledby="features-heading">
                    <div className="container-lg">
                        <h2 id="features-heading" className="text-3xl font-bold text-white mb-10">
                            Key Features
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {app.features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="glass rounded-xl p-5 flex items-start gap-4 hover:border-indigo-500/30 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{feature}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Keywords / SEO block ─────────────────────────────── */}
                <section className="section-padding bg-slate-900/30" aria-labelledby="use-cases-heading">
                    <div className="container-lg">
                        <h2 id="use-cases-heading" className="text-3xl font-bold text-white mb-6">
                            What people use {app.name} for
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {app.keywords.map((keyword) => (
                                <span
                                    key={keyword}
                                    className="glass rounded-xl px-4 py-2 text-slate-300 text-sm border border-white/5 hover:border-indigo-500/30 transition-all"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Related Articles ─────────────────────────────────── */}
                {relatedPosts.length > 0 && (
                    <section className="section-padding" aria-labelledby="related-articles-heading">
                        <div className="container-lg">
                            <h2 id="related-articles-heading" className="text-3xl font-bold text-white mb-10">
                                Related Guides
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map((post) => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="glass rounded-2xl p-6 hover:border-indigo-500/30 transition-all hover:-translate-y-1 group"
                                    >
                                        <span className="tag mb-3 inline-block">{post.category}</span>
                                        <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-500 text-xs">{post.readingTime} min read</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Bottom CTA ───────────────────────────────────────── */}
                {!app.comingSoon && (
                    <section className="section-padding" aria-labelledby="product-cta-heading">
                        <div className="container-lg">
                            <div className="relative glass rounded-3xl p-12 text-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-rose-500/10 pointer-events-none" />
                                <div className="relative z-10">
                                    <h2 id="product-cta-heading" className="text-3xl font-bold text-white mb-4">
                                        Ready to try {app.name}?
                                    </h2>
                                    <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                        {app.tagline}. Start free today — no credit card required.
                                    </p>
                                    <a
                                        href={app.launchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary text-base py-4 px-10"
                                        id={`cta-launch-${app.slug}`}
                                    >
                                        Get Started with {app.name} →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
