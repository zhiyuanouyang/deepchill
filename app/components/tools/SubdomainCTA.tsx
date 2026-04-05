interface SubdomainCTAProps {
    headline: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    features?: string[];
}

export default function SubdomainCTA({
    headline,
    description,
    ctaLabel,
    ctaHref,
    features = [],
}: SubdomainCTAProps) {
    return (
        <aside
            aria-label="Advanced version"
            className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-6"
        >
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Icon */}
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 text-xl">
                    ✦
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400 mb-0.5">
                        Advanced Version Available
                    </p>
                    <h3 className="text-base font-semibold text-white mb-1">{headline}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                    {features.length > 0 && (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                            {features.map((f, i) => (
                                <li key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* CTA */}
                <a
                    href={ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/25 border border-indigo-500/35 text-indigo-300 text-sm font-semibold hover:bg-indigo-600/40 hover:text-white hover:border-indigo-500/60 transition-all duration-200 group"
                    aria-label={ctaLabel}
                    id="subdomain-cta-link"
                >
                    {ctaLabel}
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            </div>
        </aside>
    );
}
