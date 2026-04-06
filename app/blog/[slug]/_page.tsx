
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Breadcrumb from '@/app/components/Breadcrumb';
import JsonLd, { buildBlogPostingSchema, buildBreadcrumbSchema } from '@/app/components/seo/JsonLd';
import { BLOG_POSTS } from '@/app/data/blog';
import { APPS_CATALOG } from '@/app/data/apps';
import { generateBlogMetadata, SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (!post) return { title: 'Article Not Found' };
    return generateBlogMetadata(post);
}

// Simple markdown-to-HTML renderer for basic constructs
function renderContent(content: string): string {
    return content
        .trim()
        // h2
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        // h3
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        // bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // unordered list lines => wrap later
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // table rows
        .replace(/^\|(.+)\|$/gm, (_, row) => {
            const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean);
            const tag = cells.every((c: string) => /^[-:]+$/.test(c)) ? null : 'td';
            if (!tag) return '';
            return `<tr>${cells.map((c: string) => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
        })
        // paragraphs — lines not starting with HTML tags get wrapped
        .split('\n\n')
        .map((block) => {
            const trimmed = block.trim();
            if (!trimmed) return '';
            if (trimmed.startsWith('<')) return trimmed;
            return `<p>${trimmed.replace(/\n/g, ' ')}</p>`;
        })
        .join('\n');
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    if (!post) notFound();

    const relatedProduct = post.relatedProductSlug
        ? APPS_CATALOG.find((a) => a.slug === post.relatedProductSlug)
        : null;

    const otherPosts = BLOG_POSTS.filter(
        (p) => p.slug !== post.slug && p.category === post.category
    ).slice(0, 3);

    const breadcrumbItems = [
        { label: 'Blog', href: '/blog' },
        { label: post.title },
    ];

    const blogSchema = buildBlogPostingSchema({
        title: post.title,
        excerpt: post.excerpt,
        slug: post.slug,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        tags: post.tags,
        authorName: post.author.name,
    });

    const breadcrumbSchema = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_CONFIG.domain },
        { name: 'Blog', url: buildCanonicalUrl('/blog') },
        { name: post.title, url: buildCanonicalUrl(`/blog/${post.slug}`) },
    ]);

    const htmlContent = renderContent(post.content);

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="noise-overlay" aria-hidden="true" />
            <JsonLd schema={blogSchema} />
            <JsonLd schema={breadcrumbSchema} />
            <Navbar />

            <main className="pt-28 pb-20">
                <div className="container-xl">
                    <Breadcrumb items={breadcrumbItems} className="mb-8" />

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
                        {/* ── Article Column ──────────────────────────── */}
                        <article itemScope itemType="https://schema.org/BlogPosting">
                            {/* Meta */}
                            <div className="flex items-center gap-3 mb-6 flex-wrap">
                                <span className="tag">{post.category}</span>
                                <span className="text-slate-500 text-sm">{post.readingTime} min read</span>
                                <time
                                    dateTime={post.publishedAt}
                                    className="text-slate-500 text-sm"
                                    itemProp="datePublished"
                                >
                                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </time>
                            </div>

                            {/* Title */}
                            <h1
                                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight"
                                itemProp="headline"
                            >
                                {post.title}
                            </h1>

                            {/* Excerpt */}
                            <p className="text-xl text-slate-400 leading-relaxed mb-8 pb-8 border-b border-white/5" itemProp="description">
                                {post.excerpt}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-10">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>

                            {/* Body */}
                            <div
                                className="prose-dark"
                                itemProp="articleBody"
                                dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />

                            {/* Author */}
                            <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                                    aria-hidden="true"
                                >
                                    {post.author.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white font-semibold" itemProp="author">{post.author.name}</p>
                                    <p className="text-slate-500 text-sm">{post.author.title} · Deepchill</p>
                                </div>
                            </div>

                            {/* Related posts */}
                            {otherPosts.length > 0 && (
                                <aside className="mt-16" aria-labelledby="related-articles">
                                    <h2 id="related-articles" className="text-2xl font-bold text-white mb-6">Related Articles</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {otherPosts.map((p) => (
                                            <Link
                                                key={p.slug}
                                                href={`/blog/${p.slug}`}
                                                className="glass rounded-xl p-4 hover:border-indigo-500/30 transition-all group"
                                            >
                                                <span className="tag mb-2 inline-block">{p.category}</span>
                                                <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                                                    {p.title}
                                                </p>
                                                <p className="text-xs text-slate-600 mt-2">{p.readingTime} min read</p>
                                            </Link>
                                        ))}
                                    </div>
                                </aside>
                            )}
                        </article>

                        {/* ── Sidebar ──────────────────────────────────── */}
                        <aside className="lg:sticky lg:top-28 h-fit space-y-6">
                            {/* Product CTA */}
                            {relatedProduct && !relatedProduct.comingSoon && (
                                <div className="glass rounded-2xl p-6">
                                    <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">Recommended Tool</p>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 glass rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={relatedProduct.icon} alt={relatedProduct.name} className="w-full h-full object-cover p-1.5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">{relatedProduct.name}</p>
                                            <p className="text-indigo-300 text-xs">{relatedProduct.category}</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-5 leading-relaxed">{relatedProduct.tagline}</p>
                                    <a
                                        href={relatedProduct.launchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary text-sm py-2.5 w-full"
                                        id={`sidebar-cta-${relatedProduct.slug}`}
                                    >
                                        Try {relatedProduct.name} Free →
                                    </a>
                                    <Link href={`/products/${relatedProduct.slug}`} className="block text-center text-slate-500 hover:text-indigo-400 text-xs mt-3 transition-colors">
                                        Learn more about {relatedProduct.name}
                                    </Link>
                                </div>
                            )}

                            {/* All posts */}
                            <div className="glass rounded-2xl p-6">
                                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">More Articles</p>
                                <div className="space-y-3">
                                    {BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 5).map((p) => (
                                        <Link
                                            key={p.slug}
                                            href={`/blog/${p.slug}`}
                                            className="block text-slate-400 hover:text-indigo-400 text-sm transition-colors line-clamp-2 py-1 border-b border-white/5 last:border-0"
                                        >
                                            {p.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Category links */}
                            <div className="glass rounded-2xl p-6">
                                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">Browse Categories</p>
                                <div className="space-y-2">
                                    <Link href="/categories/interview-prep" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 text-sm transition-colors py-1">
                                        🎯 Interview Prep
                                    </Link>
                                    <Link href="/categories/ai-tools" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 text-sm transition-colors py-1">
                                        🤖 AI Tools
                                    </Link>
                                    <Link href="/categories/career-growth" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 text-sm transition-colors py-1">
                                        🚀 Career Growth
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
