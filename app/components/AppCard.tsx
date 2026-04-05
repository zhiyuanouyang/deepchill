
import Link from 'next/link';
import { WebApp } from '@/app/types';

interface AppCardProps {
    app: WebApp;
    showFullCta?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({ app, showFullCta = false }) => {
    return (
        <article className="group glass rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 border-white/5 hover:border-indigo-500/30 flex flex-col">
            {/* Image */}
            <div className="relative h-52 overflow-hidden flex-shrink-0">
                <img
                    src={app.imageUrl}
                    alt={`${app.name} — ${app.tagline}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    width={800}
                    height={450}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {app.isNew && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                            New
                        </span>
                    )}
                    {app.comingSoon && (
                        <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                            Coming Soon
                        </span>
                    )}
                </div>

                {/* App identity */}
                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                    <div className="w-9 h-9 glass rounded-xl flex items-center justify-center shadow-lg border-white/20 overflow-hidden flex-shrink-0">
                        {app.icon.startsWith('http') || app.icon.startsWith('/') ? (
                            <img src={app.icon} alt="" className="w-full h-full object-cover p-1.5" />
                        ) : (
                            app.icon
                        )}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white leading-tight">{app.name}</h3>
                        <p className="text-[10px] text-indigo-300 font-medium tracking-wide uppercase">{app.category}</p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                    {app.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {app.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* CTAs */}
                {app.comingSoon ? (
                    <div className="flex items-center justify-center py-3 rounded-xl bg-white/3 text-slate-500 text-sm font-medium border border-white/5">
                        Notify me when available
                    </div>
                ) : showFullCta ? (
                    <div className="flex flex-col gap-2">
                        {/* Internal SEO link */}
                        <Link
                            href={`/products/${app.slug}`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all border border-white/5"
                        >
                            Learn More
                        </Link>
                        {/* External product link */}
                        <a
                            href={app.launchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-sm py-2.5 w-full"
                        >
                            Launch App
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                ) : (
                    <Link
                        href={`/products/${app.slug}`}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all border border-white/5 group/btn"
                    >
                        View Product
                        <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                )}
            </div>
        </article>
    );
};

export default AppCard;
