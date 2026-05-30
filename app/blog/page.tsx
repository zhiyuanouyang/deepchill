
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Breadcrumb from '@/app/components/Breadcrumb';
import JsonLd, { buildBreadcrumbSchema } from '@/app/components/seo/JsonLd';
import { BLOG_POSTS } from '@/app/data/blog';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';

export const metadata: Metadata = {
    title: 'Interview Prep & AI Tools Blog — Expert Guides | Deepchill',
    description:
        'Expert guides on technical interview preparation, system design, AI tools for software engineers, and career growth. Written by the Deepchill team.',
    keywords: [
        'software engineer interview prep blog',
        'system design interview guide',
        'AI tools for developers blog',
        'technical interview tips',
        'FAANG interview preparation articles',
        'coding interview strategies',
    ],
    alternates: { canonical: buildCanonicalUrl('/blog') },
    openGraph: {
        title: 'Interview Prep & AI Tools Blog — Deepchill',
        description: 'Expert guides for software engineers: interview prep, AI tools, and career growth.',
        url: buildCanonicalUrl('/blog'),
        type: 'website',
    },
};

const CATEGORIES_MAP: Record<string, string> = {
    'Interview Prep': '🎯',
    'AI Tools': '🤖',
    'Career Growth': '🚀',
    'System Design': '🏗️',
};

export default function BlogPage() {
    const breadcrumbItems = [{ label: 'Blog' }];

    const breadcrumbSchema = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_CONFIG.domain },
        { name: 'Blog', url: buildCanonicalUrl('/blog') },
    ]);

    const byCategory = BLOG_POSTS.reduce<Record<string, typeof BLOG_POSTS>>((acc, post) => {
        if (!acc[post.category]) acc[post.category] = [];
        acc[post.category].push(post);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="noise-overlay" aria-hidden="true" />
            <JsonLd schema={breadcrumbSchema} />
            <Navbar />

            <main className="pt-28 pb-20">
                <div className="container-xl">
                    <Breadcrumb items={breadcrumbItems} className="mb-8" />

                    {/* Header */}
                    <div className="mb-16 max-w-3xl">
                        <p className="text-rose-400 text-sm font-semibold uppercase tracking-widest mb-3">Resource Hub</p>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
                            Guides for software engineers who want to{' '}
                            <span className="gradient-text">level up</span>
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            In-depth articles on technical interview preparation, system design, AI tools, and engineering career growth — written by practitioners.
                        </p>
                    </div>

                    {/* Featured post */}
                    {BLOG_POSTS[0] && (
                        <section className="mb-16" aria-labelledby="featured-post-heading">
                            <h2 id="featured-post-heading" className="sr-only">Featured Article</h2>
                            <Link
                                href={`/blog/${BLOG_POSTS[0].slug}`}
                                className="block glass rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all hover:-translate-y-1 group"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    <div className="relative h-64 lg:h-auto bg-gradient-to-br from-indigo-900/60 to-slate-900 overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30">
                                            {CATEGORIES_MAP[BLOG_POSTS[0].category] ?? '📝'}
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-950/80 to-transparent" />
                                    </div>
                                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-5">
                                            <span className="tag">{BLOG_POSTS[0].category}</span>
                                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                                Featured
                                            </span>
                                            <span className="text-slate-500 text-xs">{BLOG_POSTS[0].readingTime} min read</span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-snug group-hover:text-indigo-300 transition-colors">
                                            {BLOG_POSTS[0].title}
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed mb-6 line-clamp-3">
                                            {BLOG_POSTS[0].excerpt}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {BLOG_POSTS[0].tags.slice(0, 4).map((tag) => (
                                                <span key={tag} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="text-indigo-400 font-semibold flex items-center gap-2">
                                            Read the full guide
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </section>
                    )}

                    {/* Posts by category */}
                    {Object.entries(byCategory).map(([category, posts]) => (
                        <section key={category} className="mb-16" aria-labelledby={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                            <h2
                                id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-2xl font-bold text-white mb-8 flex items-center gap-3"
                            >
                                <span>{CATEGORIES_MAP[category] ?? '📝'}</span>
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map((post) => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="glass rounded-2xl p-6 flex flex-col hover:border-indigo-500/30 transition-all hover:-translate-y-1 group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="tag">{post.category}</span>
                                            <span className="text-slate-600 text-xs">{post.readingTime} min</span>
                                        </div>
                                        <h3 className="text-base font-bold text-white mb-3 leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2 flex-1">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {post.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 border border-slate-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1 text-indigo-400 text-sm font-medium mt-auto">
                                            Read article
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
