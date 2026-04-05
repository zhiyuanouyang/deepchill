'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import CopyButton from '@/app/components/tools/CopyButton';
import ClearButton from '@/app/components/tools/ClearButton';
import KeyboardShortcutsHint from '@/app/components/tools/KeyboardShortcutsHint';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';
import SubdomainCTA from '@/app/components/tools/SubdomainCTA';

const STORAGE_KEY = 'dc_b64_input';
type Mode = 'encode' | 'decode';
type InputType = 'text' | 'file';

function encodeBase64(value: string): { output: string; error: string | null } {
    try {
        return { output: btoa(unescape(encodeURIComponent(value))), error: null };
    } catch (e: unknown) {
        return { output: '', error: (e as Error).message };
    }
}

function decodeBase64(value: string): { output: string; error: string | null } {
    try {
        return { output: decodeURIComponent(escape(atob(value.trim()))), error: null };
    } catch {
        return { output: '', error: 'Invalid Base64 string. Make sure it contains only valid Base64 characters.' };
    }
}

const SHORTCUTS = [
    { keys: ['⌘', 'Shift', 'E'], description: 'Encode' },
    { keys: ['⌘', 'Shift', 'D'], description: 'Decode' },
    { keys: ['Esc'], description: 'Clear' },
];

const FAQS = [
    { question: 'What is Base64 encoding?', answer: 'Base64 is a binary-to-text encoding scheme that represents binary data using a set of 64 printable ASCII characters (A–Z, a–z, 0–9, +, /). It is commonly used to embed binary content like images, files, and keys in text-based formats like JSON, XML, and HTTP.' },
    { question: 'Why does Base64 end in = or ==?', answer: 'Base64 encodes every 3 bytes of input into 4 characters. If the input length is not a multiple of 3, padding characters (=) are added to make the output length a multiple of 4.' },
    { question: 'Is Base64 the same as encryption?', answer: 'No. Base64 is encoding, not encryption. Anyone can decode a Base64 string without a key. It is used for data transport, not security.' },
    { question: 'Can I encode binary files?', answer: 'Yes. Use the "File" input mode to select any binary file. The tool will read it and produce the Base64 string. You can then copy it into your code or config.' },
    { question: 'Why is my decode failing?', answer: 'Common causes: extra whitespace, incorrect padding (missing = characters), or non-Base64 characters in the input. Make sure you are copying the complete Base64 string.' },
    { question: 'Is data sent anywhere?', answer: 'No. All encoding and decoding happens in your browser using the native btoa() and atob() APIs. Nothing is transmitted to any server.' },
];

export default function Base64Client() {
    const [mode, setMode] = useState<Mode>('encode');
    const [inputType, setInputType] = useState<InputType>('text');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
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
        if (inputType !== 'text') return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const { output: o, error: e } = mode === 'encode' ? encodeBase64(input) : decodeBase64(input);
            setOutput(o); setError(e);
            if (input) localStorage.setItem(STORAGE_KEY, input); else localStorage.removeItem(STORAGE_KEY);
            try {
                const url = new URL(window.location.href);
                if (input) url.searchParams.set('input', encodeURIComponent(input)); else url.searchParams.delete('input');
                window.history.replaceState(null, '', url.toString());
            } catch { /**/ }
        }, 60);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [input, mode, inputType]);

    const handleFile = useCallback((file: File) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const ab = ev.target?.result as ArrayBuffer;
            const bytes = new Uint8Array(ab);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            const b64 = btoa(binary);
            setOutput(b64); setError(null);
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const handleClear = useCallback(() => {
        setInput(''); setOutput(''); setError(null); setFileName(null);
        localStorage.removeItem(STORAGE_KEY);
        inputRef.current?.focus();
    }, []);

    const handleDownload = useCallback(() => {
        if (!output || mode !== 'decode') return;
        try {
            const binary = atob(output.trim());
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `decoded-${Date.now()}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { /**/ }
    }, [output, mode]);

    const swap = useCallback(() => {
        setInput(output);
        setMode(m => m === 'encode' ? 'decode' : 'encode');
    }, [output]);

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

    return (
        <div className="container-lg">
            <ToolHeader
                title="Base64 Encoder / Decoder"
                description="Encode text or binary files to Base64, or decode Base64 strings back. Entirely browser-based — nothing sent to any server."
            />

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Mode tabs */}
                <div className="flex items-center gap-1 p-1 bg-white/4 rounded-xl border border-white/8">
                    {(['encode', 'decode'] as const).map((m) => (
                        <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} id={`b64-mode-${m}`}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${mode === m ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40' : 'text-slate-400 hover:text-white hover:bg-white/6'}`}>
                            {m}
                        </button>
                    ))}
                </div>
                {/* Input type */}
                {mode === 'encode' && (
                    <div className="flex items-center gap-1 p-1 bg-white/4 rounded-xl border border-white/8">
                        {(['text', 'file'] as const).map((t) => (
                            <button key={t} onClick={() => setInputType(t)} aria-pressed={inputType === t} id={`b64-type-${t}`}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${inputType === t ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-white hover:bg-white/6'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Editor */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {mode === 'encode' ? (inputType === 'text' ? 'Plain Text' : 'File') : 'Base64 String'}
                        </span>
                        <ClearButton onClear={handleClear} id="b64-btn-clear" />
                    </div>

                    {mode === 'encode' && inputType === 'file' ? (
                        <label
                            htmlFor="b64-file-input"
                            className="flex flex-col items-center justify-center h-52 rounded-xl border-2 border-dashed border-white/15 bg-white/2 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer transition-all"
                            aria-label="Drop or select a file to encode to Base64"
                        >
                            <input
                                id="b64-file-input"
                                type="file"
                                className="sr-only"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                            />
                            <svg className="w-8 h-8 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            {fileName ? (
                                <span className="text-sm text-purple-300 font-medium">{fileName}</span>
                            ) : (
                                <>
                                    <span className="text-sm text-slate-400 font-medium">Drop any file here, or click to select</span>
                                    <span className="text-xs text-slate-600 mt-1">Images, PDFs, binaries — any file type</span>
                                </>
                            )}
                        </label>
                    ) : (
                        <textarea
                            ref={inputRef}
                            id="b64-text-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'encode' ? 'Enter text to encode to Base64...' : 'Paste Base64 string to decode...'}
                            spellCheck={false}
                            aria-label={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
                            className="h-52 bg-white/3 border border-white/10 focus:border-purple-500/40 rounded-xl text-slate-300 text-sm font-mono resize-none p-4 outline-none placeholder:text-slate-700 leading-relaxed transition-colors"
                        />
                    )}
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
                            {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                            {output && <span className="ml-2 text-slate-700">{output.length.toLocaleString()} chars</span>}
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={swap} disabled={!output}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Use output as input" id="b64-btn-swap">
                                ⇄ Swap
                            </button>
                            {mode === 'decode' && output && (
                                <button onClick={handleDownload}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                                    aria-label="Download decoded file" id="b64-btn-download">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </button>
                            )}
                            <CopyButton getValue={() => output} label="Copy" id="b64-btn-copy" />
                        </div>
                    </div>
                    <div className="h-52 rounded-xl border border-white/10 bg-white/3 overflow-auto p-4">
                        {output ? (
                            <pre className="text-sm font-mono text-purple-300 whitespace-pre-wrap break-all leading-relaxed">
                                <code>{output}</code>
                            </pre>
                        ) : (
                            <span className="text-slate-700 text-sm">{mode === 'encode' ? 'Base64 output...' : 'Decoded text...'}</span>
                        )}
                    </div>
                </div>
            </div>

            <KeyboardShortcutsHint shortcuts={SHORTCUTS} />
            <div className="divider my-12" />

            <SubdomainCTA
                headline="Working with tokens or secrets?"
                description="InterviewGPT can help you understand JWT tokens, API authentication patterns, and when to use Base64 vs encryption in your architecture."
                ctaLabel="Try InterviewGPT"
                ctaHref="https://interviewgpt.deepchill.app"
                features={['JWT token analysis', 'Auth pattern guidance', 'Security best practices']}
            />

            <div className="divider my-12" />

            <SEOSection
                toolName="Base64 Encoder / Decoder"
                what="Base64 is an encoding scheme that converts binary data into a string of 64 printable ASCII characters. It is widely used to embed images in CSS/HTML, encode authentication credentials in HTTP headers, encode file attachments in email (MIME), and store binary data in JSON or XML."
                why="Deepchill's Base64 tool supports both text and binary file encoding, handles UTF-8 correctly, and runs entirely in your browser. It is significantly faster and cleaner than base64decode.org and similar tools, with no ads and no uploading of your data."
                useCases={[
                    { title: 'Encoding images for CSS', description: 'Convert small images to base64 data URIs to embed them directly in stylesheets without HTTP requests.' },
                    { title: 'HTTP Basic Auth', description: 'Encode username:password pairs for the Authorization header in Basic authentication.' },
                    { title: 'JWT inspection', description: 'Decode the header and payload segments of a JWT token (they are base64url encoded) to inspect the claims.' },
                    { title: 'Email attachments', description: 'MIME email attachments are base64-encoded. Decode them to recover the original file.' },
                ]}
                example={{
                    input: 'Hello, World!',
                    output: 'SGVsbG8sIFdvcmxkIQ==',
                    label: 'Text → Base64 encoding',
                }}
            />

            <div className="divider my-12" />
            <FAQSection faqs={FAQS} toolName="Base64 Encoder / Decoder" pageUrl="https://deepchill.app/tools/base64" />
            <div className="divider my-12" />
            <RelatedTools currentSlug="base64" />
        </div>
    );
}
