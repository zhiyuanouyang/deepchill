interface ToolHeaderProps {
    title: string;
    description: string;
    badge?: string;
}

export default function ToolHeader({ title, description, badge = 'Free · No Sign-up · No Ads' }: ToolHeaderProps) {
    return (
        <div className="mb-6">
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
