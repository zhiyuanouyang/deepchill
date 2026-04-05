
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Breadcrumb from '@/app/components/Breadcrumb';
import AppCard from '@/app/components/AppCard';
import JsonLd, { buildBreadcrumbSchema } from '@/app/components/seo/JsonLd';
import { CATEGORIES } from '@/app/data/categories';
import { APPS_CATALOG } from '@/app/data/apps';
import { BLOG_POSTS } from '@/app/data/blog';
import { generateCategoryMetadata, SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';

interface Props {
    params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
    return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const cat = CATEGORIES.find((c) => c.slug === category);
    if (!cat) return { title: 'Category Not Found' };
    return generateCategoryMetadata(cat);
}

export default async function CategoryPage({ params }: Props) {
    const { category: categorySlug } = await params;
    const cat = CATEGORIES.find((c) => c.slug === categorySlug);
    if (!cat) notFound();

    const categoryProducts = APPS_CATALOG.filter((a) => cat.productSlugs.includes(a.slug));
    const categoryPosts = BLOG_POSTS.filter((p) => cat.blogSlugs.includes(p.slug));
    const otherCategories = CATEGORIES.filter((c) => c.slug !== cat.slug);

    const breadcrumbItems = [
        { label: 'Categories', href: '/products' },
        { label: cat.name },
    ];

    const breadcrumbSchema = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_CONFIG.domain },
        { name: 'Products', url: buildCanonicalUrl('/products') },
        { name: cat.name, url: buildCanonicalUrl(`/categories/${cat.slug}`) },
    ]);

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="noise-overlay" aria-hidden="true" />
            <JsonLd schema={breadcrumbSchema} />
            <Navbar />

            <main className="pt-28 pb-20">
                <div className="container-xl">
                    <Breadcrumb items={breadcrumbItems} className="mb-8" />

                    {/* Header */}
                    <div className="mb-16 relative">
                        <div className="absolute -top-10 -left-10 text-[160px] opacity-5 select-none pointer-events-none" aria-hidden="true">
                            {cat.emoji}
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-5xl" aria-hidden="true">{cat.emoji}</span>
                                <div>
                                    <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-1">Category</p>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                        {cat.name}
                                    </h1>
                                </div>
                            </div>
                            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mb-6">
                                {cat.longDescription}
                            </p>

                            {/* Keywords */}
                            <div className="flex flex-wrap gap-2">
                                {cat.keywords.map((keyword) => (
                                    <span key={keyword} className="glass rounded-xl px-3 py-1.5 text-slate-400 text-xs border border-white/5">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products in this category */}
                    {categoryProducts.length > 0 && (
                        <section className="mb-20" aria-labelledby="category-products-heading">
                            <div className="flex items-center justify-between mb-8">
                                <h2 id="category-products-heading" className="text-2xl font-bold text-white">
                                    {cat.name} Tools
                                </h2>
                                <Link href="/products" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                                    View all products →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryProducts.map((app) => (
                                    <AppCard key={app.id} app={app} showFullCta />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Related Articles */}
                    {categoryPosts.length > 0 && (
                        <section className="mb-20" aria-labelledby="category-articles-heading">
                            <div className="flex items-center justify-between mb-8">
                                <h2 id="category-articles-heading" className="text-2xl font-bold text-white">
                                    {cat.name} Guides
                                </h2>
                                <Link href="/blog" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                                    View all articles →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categoryPosts.map((post) => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="glass rounded-2xl p-6 flex flex-col hover:border-indigo-500/30 transition-all hover:-translate-y-1 group"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
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
                        </section>
                    )}

                    {/* Other categories */}
                    <section aria-labelledby="other-categories-heading">
                        <div className="divider mb-12" />
                        <h2 id="other-categories-heading" className="text-2xl font-bold text-white mb-8">
                            Explore Other Categories
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {otherCategories.map((c) => (
                                <Link
                                    key={c.slug}
                                    href={`/categories/${c.slug}`}
                                    className="glass rounded-2xl p-6 flex items-start gap-5 hover:border-indigo-500/30 transition-all hover:-translate-y-1 group"
                                >
                                    <span className="text-4xl flex-shrink-0">{c.emoji}</span>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                                            {c.name}
                                        </h3>
                                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                            {c.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
