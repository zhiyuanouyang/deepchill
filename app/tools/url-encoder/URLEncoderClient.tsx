'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import CopyButton from '@/app/components/tools/CopyButton';
import ClearButton from '@/app/components/tools/ClearButton';
import KeyboardShortcutsHint from '@/app/components/tools/KeyboardShortcutsHint';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';

const STORAGE_KEY = 'dc_url_input';
type Mode = 'encode' | 'decode';

function process(value: string, mode: Mode): { output: string; error: string | null } {
    if (!value) return { output: '', error: null };
    try {
        const output = mode === 'encode' ? encodeURIComponent(value) : decodeURIComponent(value);
        return { output, error: null };
    } catch (e: unknown) {
        return { output: '', error: (e as Error).message };
    }
}

const SHORTCUTS = [
    { keys: ['⌘', 'Shift', 'E'], description: 'Switch to Encode' },
    { keys: ['⌘', 'Shift', 'D'], description: 'Switch to Decode' },
    { keys: ['Esc'], description: 'Clear' },
];

const SPECIAL_CHARS = [
    { char: ' ', encoded: '%20' }, { char: '!', encoded: '%21' }, { char: '"', encoded: '%22' },
    { char: '#', encoded: '%23' }, { char: '$', encoded: '%24' }, { char: '&', encoded: '%26' },
    { char: "'", encoded: '%27' }, { char: '(', encoded: '%28' }, { char: ')', encoded: '%29' },
    { char: '*', encoded: '%2A' }, { char: '+', encoded: '%2B' }, { char: ',', encoded: '%2C' },
    { char: '/', encoded: '%2F' }, { char: ':', encoded: '%3A' }, { char: ';', encoded: '%3B' },
    { char: '=', encoded: '%3D' }, { char: '?', encoded: '%3F' }, { char: '@', encoded: '%40' },
    { char: '[', encoded: '%5B' }, { char: ']', encoded: '%5D' },
];

const FAQS = [
    { question: 'What is URL encoding?', answer: 'URL encoding (also called percent-encoding) converts characters that are not allowed in URLs into a safe format using a % sign followed by two hex digits. For example, a space becomes %20.' },
    { question: 'When do I need to URL encode?', answer: 'When passing special characters in query strings, form data, or path segments. For example, if a parameter contains an & it must be encoded as %26 to avoid being parsed as a parameter separator.' },
    { question: 'What is the difference between encodeURI and encodeURIComponent?', answer: 'encodeURI encodes a full URL and preserves characters like /, ?, and &. encodeURIComponent encodes everything including / and & and is meant for encoding individual query parameter values.' },
    { question: 'Is my text sent to a server?', answer: 'No. All encoding and decoding uses the browser\'s native encodeURIComponent / decodeURIComponent functions. Nothing is transmitted anywhere.' },
];

export default function URLEncoderClient() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>('encode');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const v = params.get('input');
        if (v) { try { setInput(decodeURIComponent(v)); } catch { /**/ } }
        else { const s = localStorage.getItem(STORAGE_KEY); if (s) setInput(s); }
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const { output: o, error: e } = process(input, mode);
            setOutput(o); setError(e);
            if (input) localStorage.setItem(STORAGE_KEY, input); else localStorage.removeItem(STORAGE_KEY);
            try {
                const url = new URL(window.location.href);
                if (input) url.searchParams.set('input', encodeURIComponent(input)); else url.searchParams.delete('input');
                window.history.replaceState(null, '', url.toString());
            } catch { /**/ }
        }, 60);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [input, mode]);

    const handleClear = useCallback(() => {
        setInput(''); setOutput(''); setError(null);
        localStorage.removeItem(STORAGE_KEY);
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey;
            if (mod && e.shiftKey && e.key === 'E') { e.preventDefault(); setMode('encode'); }
            if (mod && e.shiftKey && e.key === 'D') { e.preventDefault(); setMode('decode'); }
            if (e.key === 'Escape') handleClear();
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [handleClear]);

    const swap = useCallback(() => {
        setInput(output);
        setMode(m => m === 'encode' ? 'decode' : 'encode');
    }, [output]);

    return (
        <div className="container-lg">
            <ToolHeader
                title="URL Encoder / Decoder"
                description="Encode special characters for safe use in URLs, or decode percent-encoded strings back to plain text. Instant, browser-only."
            />

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-4 p-1 bg-white/4 rounded-xl w-fit border border-white/8">
                {(['encode', 'decode'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        aria-pressed={mode === m}
                        id={`url-mode-${m}`}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${mode === m ? 'bg-green-600 text-white shadow-md shadow-green-900/40' : 'text-slate-400 hover:text-white hover:bg-white/6'}`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Editor */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {mode === 'encode' ? 'Plain Text' : 'Encoded URL'}
                        </span>
                        <ClearButton onClear={handleClear} id="url-btn-clear" />
                    </div>
                    <textarea
                        ref={inputRef}
                        id="url-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === 'encode' ? 'Paste plain text or URL here...\nhttps://example.com/search?q=hello world' : 'Paste encoded URL here...\nhttps%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world'}
                        spellCheck={false}
                        aria-label="URL input"
                        className="h-52 bg-white/3 border border-white/10 focus:border-green-500/40 rounded-xl text-slate-300 text-sm font-mono resize-none p-4 outline-none placeholder:text-slate-700 leading-relaxed transition-colors"
                    />
                    {error && (
                        <p role="alert" className="text-xs text-red-400 flex items-start gap-1.5 px-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                            </svg>
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {mode === 'encode' ? 'Encoded URL' : 'Plain Text'}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={swap}
                                disabled={!output}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Swap input and output"
                                id="url-btn-swap"
                            >
                                ⇄ Swap
                            </button>
                            <CopyButton getValue={() => output} label="Copy" id="url-btn-copy" />
                        </div>
                    </div>
                    <div className="relative h-52 rounded-xl border border-white/10 bg-white/3 overflow-auto p-4">
                        {output ? (
                            <pre className="text-sm font-mono text-green-300 whitespace-pre-wrap break-all leading-relaxed">
                                <code>{output}</code>
                            </pre>
                        ) : (
                            <span className="text-slate-700 text-sm">{mode === 'encode' ? 'Encoded output...' : 'Decoded output...'}</span>
                        )}
                    </div>
                </div>
            </div>

            <KeyboardShortcutsHint shortcuts={SHORTCUTS} />

            {/* Quick reference */}
            <div className="mt-6 rounded-xl border border-white/8 bg-white/2 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/8">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Common Encodings</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-10 gap-px bg-white/5">
                    {SPECIAL_CHARS.map(({ char, encoded }) => (
                        <button
                            key={char}
                            onClick={() => setInput(i => i + char)}
                            className="flex flex-col items-center gap-0.5 px-2 py-2.5 bg-slate-950/60 hover:bg-indigo-500/10 text-center transition-colors group"
                            aria-label={`Insert ${char}`}
                            title={`Click to insert "${char}" → ${encoded}`}
                        >
                            <span className="text-sm font-mono text-white group-hover:text-indigo-300">{char === ' ' ? '␣' : char}</span>
                            <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400">{encoded}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="divider my-12" />

            <SEOSection
                toolName="URL Encoder / Decoder"
                what="URL encoding (percent-encoding) converts characters that are not safe in URLs into a format that can be transmitted without ambiguity. Each unsafe character is replaced with a % sign followed by two hexadecimal digits representing the character's byte value in UTF-8."
                why="Deepchill's URL Encoder/Decoder is instantaneous, runs locally in your browser, and includes a handy reference table of common character encodings. Unlike urlencoder.org it requires no page reload and preserves your input across sessions."
                useCases={[
                    { title: 'Encoding query parameters', description: 'Safely encode values like spaces, ampersands, and equals signs before appending to URLs.' },
                    { title: 'Decoding API responses', description: 'Decode percent-encoded URIs returned by APIs or web servers.' },
                    { title: 'Form data encoding', description: 'Understand how browsers encode form submission data before POST requests.' },
                    { title: 'Debugging redirect chains', description: 'Decode multi-layered encoded URLs to trace where redirects lead.' },
                ]}
                example={{
                    input: 'https://example.com/search?q=hello world&lang=en',
                    output: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den',
                    label: 'Full URL encoding example',
                }}
            />

            <div className="divider my-12" />
            <FAQSection faqs={FAQS} toolName="URL Encoder / Decoder" pageUrl="https://deepchill.app/tools/url-encoder" />
            <div className="divider my-12" />
            <RelatedTools currentSlug="url-encoder" />
        </div>
    );
}
