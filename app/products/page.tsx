
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Breadcrumb from '@/app/components/Breadcrumb';
import AppCard from '@/app/components/AppCard';
import JsonLd, { buildItemListSchema, buildBreadcrumbSchema } from '@/app/components/seo/JsonLd';
import { APPS_CATALOG } from '@/app/data/apps';
import { CATEGORIES } from '@/app/data/categories';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';

export const metadata: Metadata = {
    title: 'All AI Products — Deepchill Product Directory',
    description:
        'Browse the complete Deepchill product directory. Discover AI-powered tools for software engineers including technical interview prep, resume building, and career growth.',
    keywords: [
        'AI software engineer tools',
        'technical interview prep products',
        'developer productivity tools',
        'AI SaaS directory',
        'software engineering career tools',
    ],
    alternates: { canonical: buildCanonicalUrl('/products') },
    openGraph: {
        title: 'All AI Products — Deepchill Product Directory',
        description: 'Discover AI-powered tools built to accelerate software engineering careers.',
        url: buildCanonicalUrl('/products'),
        type: 'website',
    },
};

export default function ProductsPage() {
    const activeApps = APPS_CATALOG.filter((a) => !a.comingSoon);
    const comingSoonApps = APPS_CATALOG.filter((a) => a.comingSoon);

    const breadcrumbItems = [{ label: 'Products' }];

    const itemListSchema = buildItemListSchema(
        activeApps.map((app) => ({
            name: app.name,
            url: buildCanonicalUrl(`/products/${app.slug}`),
            description: app.description,
        }))
    );

    const breadcrumbSchema = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_CONFIG.domain },
        { name: 'Products', url: buildCanonicalUrl('/products') },
    ]);

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="noise-overlay" aria-hidden="true" />
            <JsonLd schema={itemListSchema} />
            <JsonLd schema={breadcrumbSchema} />
            <Navbar />

            <main className="pt-28 pb-20">
                <div className="container-xl">
                    {/* Breadcrumb */}
                    <Breadcrumb items={breadcrumbItems} className="mb-8" />

                    {/* Page Header */}
                    <div className="mb-16">
                        <div className="absolute top-24 right-0 w-[500px] h-[500px] bg-indigo-500/8 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
                        <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Product Directory</p>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
                            AI tools built for{' '}
                            <span className="gradient-text">software engineers</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                            Every Deepchill product is purpose-built for software engineers at every stage of their career — from landing the first job to reaching Staff Engineer.
                        </p>
                    </div>

                    {/* Category Filter Nav */}
                    <nav className="flex flex-wrap gap-3 mb-12" aria-label="Filter by category">
                        <Link
                            href="/products"
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white border border-indigo-500/50"
                        >
                            All Products ({APPS_CATALOG.length})
                        </Link>
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/categories/${cat.slug}`}
                                className="px-4 py-2 rounded-xl text-sm font-medium glass text-slate-400 hover:text-white hover:border-indigo-500/30 transition-all"
                            >
                                {cat.emoji} {cat.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Active Products Grid */}
                    {activeApps.length > 0 && (
                        <section aria-labelledby="active-products-heading">
                            <h2 id="active-products-heading" className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                                Available Now
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                {activeApps.map((app) => (
                                    <AppCard key={app.id} app={app} showFullCta />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Coming Soon */}
                    {comingSoonApps.length > 0 && (
                        <section aria-labelledby="coming-soon-heading">
                            <div className="divider mb-12" />
                            <h2 id="coming-soon-heading" className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                Coming Soon
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {comingSoonApps.map((app) => (
                                    <AppCard key={app.id} app={app} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Bottom internal link block */}
                    <div className="divider my-16" />
                    <div className="glass rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-3">Looking for something specific?</h2>
                        <p className="text-slate-400 mb-6">
                            Browse by category to find the right AI tool for your goal.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {CATEGORIES.map((cat) => (
                                <Link key={cat.slug} href={`/categories/${cat.slug}`} className="btn-secondary text-sm py-2 px-4">
                                    {cat.emoji} {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
