import Link from 'next/link';

interface ToolHeaderProps {
    title: string;
    description: string;
    badge?: string;
}

export default function ToolHeader({ title, description, badge = 'Free · No Sign-up · No Ads' }: ToolHeaderProps) {
    return (
        <div className="mb-6">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-4">
                <ol
                    className="flex items-center gap-1.5 text-xs flex-wrap"
                    itemScope
                    itemType="https://schema.org/BreadcrumbList"
                >
                    <li
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        <Link
                            href="/"
                            itemProp="item"
                            className="flex items-center gap-1 text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span itemProp="name" className="sr-only">Home</span>
                        </Link>
                        <meta itemProp="position" content="1" />
                    </li>

                    <li className="text-slate-700" aria-hidden>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </li>

                    <li
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        <Link
                            href="/tools"
                            itemProp="item"
                            className="text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                            <span itemProp="name">Tools</span>
                        </Link>
                        <meta itemProp="position" content="2" />
                    </li>

                    <li className="text-slate-700" aria-hidden>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </li>

                    <li
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        <span itemProp="name" className="text-slate-300 font-medium">{title}</span>
                        <meta itemProp="position" content="3" />
                    </li>
                </ol>
            </nav>

            <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>
                {badge && (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">{description}</p>
        </div>
    );
}
