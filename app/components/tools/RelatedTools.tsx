interface Tool {
    name: string;
    href: string;
    description: string;
    icon: string;
}

interface RelatedToolsProps {
    currentSlug: string;
}

const ALL_TOOLS: Tool[] = [
    { name: 'JSON Formatter', href: '/tools/json-formatter', description: 'Format & validate JSON', icon: '{ }' },
    { name: 'Text Diff', href: '/tools/text-diff', description: 'Compare two texts', icon: '↔' },
    { name: 'URL Encoder', href: '/tools/url-encoder', description: 'Encode & decode URLs', icon: '%' },
    { name: 'Base64 Tool', href: '/tools/base64', description: 'Encode & decode Base64', icon: '64' },
    { name: 'Timestamp', href: '/tools/timestamp', description: 'Convert Unix timestamps', icon: '⏱' },
    { name: 'Cron Parser', href: '/tools/cron-parser', description: 'Parse & explain cron expressions', icon: '⏰' },
    { name: 'JWT Tool', href: '/tools/jwt', description: 'Decode & encode JWTs', icon: '🔑' },
    { name: 'Regex Tester', href: '/tools/regex', description: 'Test & debug regex patterns', icon: '.*' },
];

export default function RelatedTools({ currentSlug }: RelatedToolsProps) {
    const related = ALL_TOOLS.filter((t) => !t.href.endsWith(currentSlug));

    return (
        <section aria-labelledby="related-tools-heading">
            <h2 id="related-tools-heading" className="text-base font-semibold text-slate-400 mb-4 uppercase tracking-wider text-xs">
                More Free Developer Tools
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map((tool) => (
                    <a
                        key={tool.href}
                        href={tool.href}
                        className="group flex flex-col gap-2 p-3.5 rounded-xl bg-white/3 border border-white/8 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200"
                        aria-label={`Go to ${tool.name}`}
                    >
                        <span className="text-lg font-mono text-slate-500 group-hover:text-indigo-400 transition-colors">
                            {tool.icon}
                        </span>
                        <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                            {tool.name}
                        </span>
                        <span className="text-[11px] text-slate-600 leading-snug">{tool.description}</span>
                    </a>
                ))}
            </div>
        </section>
    );
}
