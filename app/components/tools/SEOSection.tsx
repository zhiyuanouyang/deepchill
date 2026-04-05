interface UseCase {
    title: string;
    description: string;
}

interface SEOSectionProps {
    toolName: string;
    what: string;
    why: string;
    useCases: UseCase[];
    example?: {
        input: string;
        output: string;
        label?: string;
    };
}

export default function SEOSection({ toolName, what, why, useCases, example }: SEOSectionProps) {
    return (
        <section aria-label={`About ${toolName}`} className="prose-dark max-w-none">
            <h2>What is a {toolName}?</h2>
            <p>{what}</p>

            <h2>Why use Deepchill&apos;s {toolName}?</h2>
            <p>{why}</p>

            <h2>Common Use Cases</h2>
            <ul>
                {useCases.map((uc, i) => (
                    <li key={i}>
                        <strong>{uc.title}:</strong> {uc.description}
                    </li>
                ))}
            </ul>

            {example && (
                <>
                    <h2>Example</h2>
                    <p>{example.label ?? 'Input → Output'}</p>
                    <div className="grid sm:grid-cols-2 gap-4 not-prose mt-3 mb-6">
                        <div>
                            <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Input</p>
                            <pre className="bg-slate-900/60 border border-white/8 text-slate-300 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
                                <code>{example.input}</code>
                            </pre>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Output</p>
                            <pre className="bg-slate-900/60 border border-white/8 text-emerald-300 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
                                <code>{example.output}</code>
                            </pre>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
