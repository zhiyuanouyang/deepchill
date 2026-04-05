import type { Metadata } from 'next';
import { SITE_CONFIG, buildCanonicalUrl } from '@/app/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Free Developer Tools — JSON, Cron, JWT, Regex, Base64 & More | Deepchill',
    description: 'Fast, free, ad-free developer tools that run entirely in your browser. JSON formatter, cron parser, JWT decoder, regex tester, text diff, URL encoder, Base64, and Unix timestamp tools.',
    keywords: 'developer tools, json formatter, cron parser, jwt decoder, regex tester, text diff, url encoder, base64 decoder, unix timestamp converter, free online tools',
    alternates: { canonical: buildCanonicalUrl('/tools') },
    openGraph: {
        title: 'Free Developer Tools | Deepchill',
        description: 'Fast, free, ad-free developer tools that run entirely in your browser.',
        url: buildCanonicalUrl('/tools'),
        siteName: SITE_CONFIG.name,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Developer Tools | Deepchill',
        description: 'Fast, free, ad-free developer tools that run entirely in your browser.',
        site: SITE_CONFIG.twitterHandle,
    },
};

const TOOLS = [
    {
        name: 'JSON Formatter',
        slug: 'json-formatter',
        description: 'Format, validate, and minify JSON instantly with syntax highlighting and error detection.',
        icon: '{ }',
        color: 'from-amber-500/20 to-orange-500/10',
        border: 'border-amber-500/25',
        iconColor: 'text-amber-400',
        tags: ['Format', 'Validate', 'Minify'],
    },
    {
        name: 'Cron Parser',
        slug: 'cron-parser',
        description: 'Decode any cron expression into plain English. See the next 5 run times, use the visual builder, and switch timezones.',
        icon: '⏰',
        color: 'from-violet-500/20 to-purple-500/10',
        border: 'border-violet-500/25',
        iconColor: 'text-violet-400',
        tags: ['Schedule', 'Next runs', 'Builder'],
    },
    {
        name: 'JWT Decoder & Encoder',
        slug: 'jwt',
        description: 'Decode JWT tokens instantly — view header, payload, signature. Encode new tokens with HMAC signing.',
        icon: '🔑',
        color: 'from-emerald-500/20 to-teal-500/10',
        border: 'border-emerald-500/25',
        iconColor: 'text-emerald-400',
        tags: ['Decode', 'Encode', 'Verify'],
    },
    {
        name: 'Regex Tester',
        slug: 'regex',
        description: 'Test regular expressions with live match highlighting, capture group visualization, and replace mode.',
        icon: '.*',
        color: 'from-rose-500/20 to-pink-500/10',
        border: 'border-rose-500/25',
        iconColor: 'text-rose-400',
        tags: ['Match', 'Groups', 'Replace'],
    },
    {
        name: 'Text Diff',
        slug: 'text-diff',
        description: 'Compare two blocks of text side-by-side and see exactly what changed, line by line.',
        icon: '↔',
        color: 'from-blue-500/20 to-cyan-500/10',
        border: 'border-blue-500/25',
        iconColor: 'text-blue-400',
        tags: ['Line Diff', 'Side-by-side', 'Export'],
    },
    {
        name: 'URL Encoder / Decoder',
        slug: 'url-encoder',
        description: 'Encode special characters for safe URLs or decode percent-encoded strings instantly.',
        icon: '%',
        color: 'from-green-500/20 to-emerald-500/10',
        border: 'border-green-500/25',
        iconColor: 'text-green-400',
        tags: ['Encode', 'Decode', 'Live'],
    },
    {
        name: 'Base64 Tool',
        slug: 'base64',
        description: 'Encode and decode text or files to/from Base64. Supports binary file uploads.',
        icon: '64',
        color: 'from-purple-500/20 to-violet-500/10',
        border: 'border-purple-500/25',
        iconColor: 'text-purple-400',
        tags: ['Encode', 'Decode', 'Files'],
    },
    {
        name: 'Timestamp Converter',
        slug: 'timestamp',
        description: 'Convert Unix timestamps to human-readable dates and back. Shows local, UTC, and relative time.',
        icon: '⏱',
        color: 'from-rose-500/20 to-pink-500/10',
        border: 'border-rose-500/25',
        iconColor: 'text-rose-400',
        tags: ['Unix', 'UTC', 'Relative'],
    },
];

export default function ToolsHubPage() {
    return (
        <div className="container-lg">
            {/* Hero */}
            <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-5">
                    Free · Instant · No Sign-up
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                    Developer Tools That{' '}
                    <span className="gradient-text">Just Work</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                    Fast, ad-free, browser-only tools built for developers who value their time.
                    No accounts, no servers, no nonsense.
                </p>
            </div>

            {/* Tools Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
                {TOOLS.map((tool) => (
                    <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className={`group relative flex flex-col p-6 rounded-2xl bg-gradient-to-br ${tool.color} border ${tool.border} hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 transition-all duration-200`}
                        aria-label={`Open ${tool.name}`}
                    >
                        {/* Icon */}
                        <div className={`text-3xl font-mono font-bold ${tool.iconColor} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                            {tool.icon}
                        </div>

                        <h2 className="text-lg font-bold text-white mb-2">{tool.name}</h2>
                        <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">{tool.description}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                            {tool.tags.map((tag) => (
                                <span key={tag} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/8 text-slate-400 border border-white/10">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tool.iconColor} group-hover:gap-2.5 transition-all`}>
                            Open Tool
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Value props */}
            <div className="divider mb-12" />
            <div className="grid sm:grid-cols-3 gap-8 mb-16 text-center">
                {[
                    { icon: '⚡', title: 'Instant Processing', body: 'Everything happens in your browser as you type. Zero latency, zero server round-trips.' },
                    { icon: '🔒', title: 'Private by Design', body: 'Your data never leaves your device. No logging, no analytics on your input.' },
                    { icon: '✦', title: 'Zero Clutter', body: 'No ads, no pop-ups, no cookie banners. Just the tool you came for.' },
                ].map((vp) => (
                    <div key={vp.title} className="flex flex-col items-center gap-3">
                        <span className="text-3xl">{vp.icon}</span>
                        <h3 className="text-base font-bold text-white">{vp.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{vp.body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
