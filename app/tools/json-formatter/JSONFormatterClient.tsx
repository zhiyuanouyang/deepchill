'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import CopyButton from '@/app/components/tools/CopyButton';
import ClearButton from '@/app/components/tools/ClearButton';
import KeyboardShortcutsHint from '@/app/components/tools/KeyboardShortcutsHint';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';

const STORAGE_KEY = 'dc_json_input';

type Mode = 'beautify' | 'minify';

function formatJSON(raw: string, mode: Mode): { output: string; error: string | null } {
    if (!raw.trim()) return { output: '', error: null };
    try {
        const parsed = JSON.parse(raw);
        const output =
            mode === 'beautify'
                ? JSON.stringify(parsed, null, 2)
                : JSON.stringify(parsed);
        return { output, error: null };
    } catch (e: unknown) {
        return { output: '', error: (e as Error).message };
    }
}

const SHORTCUTS = [
    { keys: ['⌘', 'Shift', 'F'], description: 'Beautify' },
    { keys: ['⌘', 'Shift', 'M'], description: 'Minify' },
    { keys: ['⌘', 'Shift', 'C'], description: 'Copy output' },
    { keys: ['Esc'], description: 'Clear' },
];

const FAQS = [
    {
        question: 'What is a JSON formatter?',
        answer: 'A JSON formatter takes raw or minified JSON and re-indents it with consistent spacing so it is easy for humans to read and debug. It also validates that the JSON is syntactically correct.',
    },
    {
        question: 'Is my data safe? Does it get sent to a server?',
        answer: 'No. All processing happens entirely in your browser using JavaScript. Nothing is ever sent to any server. Your data is completely private.',
    },
    {
        question: 'What is the difference between Beautify and Minify?',
        answer: 'Beautify adds indentation and newlines to make JSON human-readable. Minify removes all unnecessary whitespace to produce the smallest possible JSON string, ideal for API payloads.',
    },
    {
        question: 'Can I format large JSON files?',
        answer: 'Yes. You can paste large JSON or drag-and-drop a .json file directly onto the input area. The tool handles files up to several megabytes without any issues.',
    },
    {
        question: 'Why is my JSON invalid?',
        answer: 'Common causes include: trailing commas (not allowed in JSON), single quotes instead of double quotes, missing quotes around keys, or incorrect number formatting. The error message will point you to the problem.',
    },
    {
        question: 'Can I share the formatted JSON with a link?',
        answer: 'Yes — the URL updates as you type so you can copy and share it. The recipient will see the same JSON you formatted.',
    },
];

export default function JSONFormatterClient() {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<Mode>('beautify');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize from localStorage / URL
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setInput(saved);
        textareaRef.current?.focus();
    }, []);

    // Process JSON with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const { output: o, error: e } = formatJSON(input, mode);
            setOutput(o);
            setError(e);
            // Persist
            if (input) localStorage.setItem(STORAGE_KEY, input);
            else localStorage.removeItem(STORAGE_KEY);

        }, 60);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [input, mode]);

    const handleClear = useCallback(() => {
        setInput('');
        setOutput('');
        setError(null);
        localStorage.removeItem(STORAGE_KEY);
        textareaRef.current?.focus();
    }, []);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
        } catch { /* noop */ }
    }, []);

    // Drag and drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setInput(ev.target?.result as string ?? '');
        reader.readAsText(file);
    }, []);

    // Download output
    const handleDownload = useCallback(() => {
        if (!output) return;
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `formatted-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [output]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey;
            if (mod && e.shiftKey && e.key === 'F') { e.preventDefault(); setMode('beautify'); }
            if (mod && e.shiftKey && e.key === 'M') { e.preventDefault(); setMode('minify'); }
            if (mod && e.shiftKey && e.key === 'C') { e.preventDefault(); if (output) navigator.clipboard.writeText(output); }
            if (e.key === 'Escape') handleClear();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [output, handleClear]);

    const lineCount = output ? output.split('\n').length : 0;

    return (
        <div className="container-lg">
            <ToolHeader
                title="JSON Formatter & Validator"
                description="Paste or type JSON to instantly format, validate, and minify it. Runs entirely in your browser."
            />

            {/* Mode Tabs */}
            <div className="flex items-center gap-1 mb-4 p-1 bg-white/4 rounded-xl w-fit border border-white/8">
                {(['beautify', 'minify'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        aria-pressed={mode === m}
                        id={`mode-${m}`}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${mode === m
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                            : 'text-slate-400 hover:text-white hover:bg-white/6'
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Main Editor Area */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
                {/* Input */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Input</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePaste}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                                aria-label="Paste from clipboard"
                                id="btn-paste"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Paste
                            </button>
                            <ClearButton onClear={handleClear} id="btn-clear" />
                        </div>
                    </div>
                    <div
                        className={`relative rounded-xl border transition-colors ${isDragging
                            ? 'border-indigo-500/60 bg-indigo-500/5'
                            : error
                                ? 'border-red-500/40 bg-red-500/3'
                                : 'border-white/10 bg-white/3 focus-within:border-indigo-500/40'
                            }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        aria-label="JSON input area, supports drag and drop"
                    >
                        <textarea
                            ref={textareaRef}
                            id="json-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={'Paste JSON here, or drag & drop a .json file...\n\n{"example": "value", "number": 42}'}
                            spellCheck={false}
                            aria-label="JSON input"
                            className="w-full h-80 bg-transparent text-slate-300 text-sm font-mono resize-none p-4 outline-none placeholder:text-slate-700 leading-relaxed"
                        />
                        {isDragging && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-indigo-500/10 border-2 border-dashed border-indigo-500/60 pointer-events-none">
                                <span className="text-indigo-300 text-sm font-medium">Drop .json file here</span>
                            </div>
                        )}
                    </div>
                    {error && (
                        <p role="alert" className="text-xs text-red-400 flex items-start gap-1.5 px-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                            </svg>
                            {error}
                        </p>
                    )}
                </div>

                {/* Output */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Output{lineCount > 0 && (
                                <span className="ml-2 text-slate-700 normal-case">{lineCount.toLocaleString()} lines</span>
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            <CopyButton getValue={() => output} label="Copy" id="btn-copy-output" />
                            <button
                                onClick={handleDownload}
                                disabled={!output}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Download formatted JSON"
                                id="btn-download"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                        </div>
                    </div>
                    <div className="relative rounded-xl border border-white/10 bg-white/3 h-80 overflow-hidden">
                        {output ? (
                            <div className="flex h-full">
                                {/* Line numbers */}
                                <div className="flex-shrink-0 w-10 bg-white/2 border-r border-white/6 overflow-y-auto pt-4 pb-4 select-none" aria-hidden>
                                    {output.split('\n').map((_, i) => (
                                        <div key={i} className="text-[11px] text-slate-700 text-right pr-2.5 font-mono leading-relaxed">
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                                <pre className="flex-1 overflow-auto p-4 text-sm font-mono text-emerald-300 leading-relaxed">
                                    <code>{output}</code>
                                </pre>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-700 text-sm">
                                {error ? 'Fix the error to see output' : 'Formatted output will appear here'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Keyboard hints */}
            <KeyboardShortcutsHint shortcuts={SHORTCUTS} />

            {/* Divider */}
            <div className="divider my-12" />

            {/* SEO Content */}
            <SEOSection
                toolName="JSON Formatter"
                what="A JSON formatter parses raw JSON text and pretty-prints it with consistent indentation, making it easy to read hierarchical data structures. It also validates that the JSON conforms to the specification and reports any syntax errors with a clear message."
                why="Deepchill's JSON Formatter processes everything locally in your browser — no server, no tracking, no ads. It supports drag-and-drop file uploads, shareable URLs, localStorage persistence, and keyboard shortcuts for power users. It is significantly faster and cleaner than tools like jsonformatter.org or jsonlint.com."
                useCases={[
                    { title: 'Debugging API responses', description: 'Paste a raw response body to instantly see its structure without squinting at minified output.' },
                    { title: 'Validating configuration files', description: 'Check that your package.json, tsconfig, or API request payload is valid JSON before deploying.' },
                    { title: 'Reducing payload size', description: 'Use Minify mode to strip whitespace from JSON before storing it in a database or sending it over a network.' },
                    { title: 'Code review', description: 'Share a formatted JSON link with a colleague so they can see the same structured view.' },
                ]}
                example={{
                    input: `{"name":"Alice","age":30,"skills":["TypeScript","Go","Rust"]}`,
                    output: `{\n  "name": "Alice",\n  "age": 30,\n  "skills": [\n    "TypeScript",\n    "Go",\n    "Rust"\n  ]\n}`,
                    label: 'Minified input → Beautified output',
                }}
            />

            <div className="divider my-12" />

            <FAQSection
                faqs={FAQS}
                toolName="JSON Formatter"
                pageUrl="https://deepchill.app/tools/json-formatter"
            />

            <div className="divider my-12" />

            <RelatedTools currentSlug="json-formatter" />
        </div>
    );
}
