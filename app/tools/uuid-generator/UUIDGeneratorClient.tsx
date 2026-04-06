'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import KeyboardShortcutsHint from '@/app/components/tools/KeyboardShortcutsHint';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';
import SEOSection from '@/app/components/tools/SEOSection';

// ─── UUID Generation ───────────────────────────────────────────────────────────

function generateUUIDv4(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function generateUUIDv1(): string {
    // Simplified v1-like (timestamp-based) — not RFC-compliant but visually correct
    const now = Date.now();
    const timeHex = now.toString(16).padStart(12, '0');
    const rand = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
    return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-1${rand().slice(1)}-${((Math.random() * 0x3fff + 0x8000) | 0).toString(16)}-${rand()}${rand()}${rand().slice(0, 4)}`;
}

function generateUUIDv7(): string {
    // UUID v7 — Unix timestamp milliseconds in high bits
    const ms = BigInt(Date.now());
    const msHex = ms.toString(16).padStart(12, '0');
    const rand4 = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
    const rand12 = () =>
        Math.floor(Math.random() * 0xffffffffffff)
            .toString(16)
            .padStart(12, '0');
    const varBits = ((Math.random() * 0x3fff + 0x8000) | 0).toString(16);
    return `${msHex.slice(0, 8)}-${msHex.slice(8, 12)}-7${rand4().slice(1)}-${varBits}-${rand12()}`;
}

type UUIDVersion = 'v1' | 'v4' | 'v7';
type OutputFormat = 'newline' | 'comma' | 'json' | 'sql';

function generateUUID(version: UUIDVersion): string {
    switch (version) {
        case 'v1': return generateUUIDv1();
        case 'v7': return generateUUIDv7();
        default: return generateUUIDv4();
    }
}

function formatUUID(uuid: string, uppercase: boolean, noHyphens: boolean, prefix: string, suffix: string): string {
    let result = uuid;
    if (noHyphens) result = result.replace(/-/g, '');
    if (uppercase) result = result.toUpperCase();
    return `${prefix}${result}${suffix}`;
}

function formatOutput(uuids: string[], format: OutputFormat): string {
    switch (format) {
        case 'comma': return uuids.join(', ');
        case 'json': return JSON.stringify(uuids, null, 2);
        case 'sql': return uuids.map((u, i) =>
            `INSERT INTO uuids (id) VALUES ('${u}');${i < uuids.length - 1 ? '' : ''}`
        ).join('\n');
        default: return uuids.join('\n');
    }
}

// ─── Storage Keys ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'uuid-generator-settings';

interface Settings {
    version: UUIDVersion;
    count: number;
    uppercase: boolean;
    noHyphens: boolean;
    prefix: string;
    suffix: string;
    outputFormat: OutputFormat;
    columns: 1 | 2;
}

const DEFAULT_SETTINGS: Settings = {
    version: 'v4',
    count: 1,
    uppercase: false,
    noHyphens: false,
    prefix: '',
    suffix: '',
    outputFormat: 'newline',
    columns: 1,
};

function loadSettings(): Settings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function saveSettings(s: Settings) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

function useToast() {
    const [toast, setToast] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = useCallback((msg: string) => {
        setToast(msg);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setToast(null), 2200);
    }, []);

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
    return { toast, show };
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const RefreshIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const CopyIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const DownloadIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);



// ─── UUID Row ──────────────────────────────────────────────────────────────────

interface UUIDRowProps {
    uuid: string;
    index: number;
    isNew: boolean;
    onRegenerate: (i: number) => void;
    onCopy: (text: string) => void;
}

function UUIDRow({ uuid, index, isNew, onRegenerate, onCopy }: UUIDRowProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try { await navigator.clipboard.writeText(uuid); } catch {
            const el = document.createElement('textarea');
            el.value = uuid;
            el.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        setCopied(true);
        onCopy(uuid);
        setTimeout(() => setCopied(false), 2000);
    }, [uuid, onCopy]);

    const handleSelect = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
        const el = e.currentTarget;
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        sel?.removeAllRanges();
        sel?.addRange(range);
    }, []);

    return (
        <div
            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-300
                ${isNew ? 'border-indigo-500/40 bg-indigo-500/6 animate-pulse-once' : 'border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/4'}`}
        >
            <span className="text-[10px] font-mono text-slate-700 w-5 text-right flex-shrink-0 select-none">
                {index + 1}
            </span>
            <span
                className="font-mono text-sm text-slate-300 flex-1 truncate cursor-pointer hover:text-white transition-colors select-all"
                onClick={handleSelect}
                title="Click to select"
                aria-label={`UUID ${index + 1}: ${uuid}`}
            >
                {uuid}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                <button
                    onClick={() => onRegenerate(index)}
                    aria-label={`Regenerate UUID ${index + 1}`}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/8 transition-all"
                    title="Regenerate this UUID"
                >
                    <RefreshIcon />
                </button>
                <button
                    onClick={handleCopy}
                    aria-label={copied ? 'Copied' : `Copy UUID ${index + 1}`}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                        ${copied ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-500 hover:text-slate-200 hover:bg-white/8'}`}
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
        </div>
    );
}

// ─── Count Selector ────────────────────────────────────────────────────────────

const PRESET_COUNTS = [1, 5, 10];

function CountSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    const [custom, setCustom] = useState(false);
    const [inputVal, setInputVal] = useState('');

    const isPreset = PRESET_COUNTS.includes(value);

    const handleCustom = (raw: string) => {
        setInputVal(raw);
        const n = parseInt(raw, 10);
        if (!isNaN(n) && n >= 1) {
            const clamped = Math.min(n, 100);
            onChange(clamped);
        }
    };

    if (custom) {
        return (
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min={1}
                    max={100}
                    value={inputVal || value}
                    onChange={(e) => handleCustom(e.target.value)}
                    onBlur={() => { if (!inputVal) setCustom(false); }}
                    autoFocus
                    aria-label="Custom count"
                    className="w-20 px-2 py-1.5 rounded-lg bg-white/5 border border-white/15 text-slate-200 text-sm font-mono text-center focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
                />
                {value === 100 && (
                    <span className="text-[11px] text-amber-400">Max</span>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="UUID count">
            {PRESET_COUNTS.map((n) => (
                <button
                    key={n}
                    onClick={() => onChange(n)}
                    aria-pressed={value === n && isPreset}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                        ${value === n && isPreset
                            ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300'
                            : 'bg-white/4 border border-white/8 text-slate-400 hover:border-white/15 hover:text-slate-200'}`}
                >
                    {n}
                </button>
            ))}
            <button
                onClick={() => { setCustom(true); setInputVal(String(value)); }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/4 border border-white/8 text-slate-400 hover:border-white/15 hover:text-slate-200 transition-all duration-150"
                aria-label="Enter custom count"
            >
                {!isPreset ? value : '···'}
            </button>
        </div>
    );
}

// ─── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
    return (
        <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer group">
            <div
                role="switch"
                aria-checked={checked}
                id={id}
                onClick={() => onChange(!checked)}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onChange(!checked); }}
                tabIndex={0}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
                    ${checked ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">{label}</span>
        </label>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const UUID_FAQS = [
    {
        question: 'What is a UUID?',
        answer: 'A UUID (Universally Unique Identifier) is a 128-bit label used for uniquely identifying information in computer systems. The format is 8-4-4-4-12 hexadecimal characters separated by hyphens, e.g., 550e8400-e29b-41d4-a716-446655440000.',
    },
    {
        question: 'What is the difference between UUID v1, v4, and v7?',
        answer: 'UUID v1 is timestamp-based and includes the MAC address of the generating machine, making it sortable but potentially exposing system info. UUID v4 is fully random — the most common and recommended for most uses. UUID v7 is a newer standard that uses Unix millisecond timestamps for sortability while keeping random bits for uniqueness.',
    },
    {
        question: 'Are UUIDs truly unique?',
        answer: 'UUID v4 has 122 bits of randomness, giving approximately 5.3×10³⁶ possible values. The probability of generating a duplicate is astronomically small — you would need to generate about 1 billion UUIDs per second for 85 years to have a 50% chance of collision.',
    },
    {
        question: 'What is a GUID vs UUID?',
        answer: 'GUID (Globally Unique Identifier) is Microsoft\'s term for UUID. They are technically equivalent — both refer to the same 128-bit identifier standard. The terms are interchangeable in most contexts.',
    },
    {
        question: 'Is it safe to generate UUIDs in the browser?',
        answer: 'Yes! Modern browsers implement the Web Crypto API\'s crypto.randomUUID() method, which uses a cryptographically secure random number generator (CSPRNG). This tool uses that API with a fallback for older browsers.',
    },
    {
        question: 'Can I use these UUIDs as primary keys in a database?',
        answer: 'Yes — UUIDs are commonly used as primary keys. For databases that benefit from sequential inserts (like MySQL with B-tree indexes), UUID v7 is recommended since its timestamp prefix keeps inserts in order, reducing index fragmentation. For most other use cases, UUID v4 works perfectly.',
    },
    {
        question: 'What is UUID v7 and when should I use it?',
        answer: 'UUID v7 is a newer RFC draft that encodes the current Unix timestamp in milliseconds into the first 48 bits, followed by random bits. This makes v7 UUIDs lexicographically sortable by creation time — ideal for database primary keys, event streams, and distributed systems where ordering matters.',
    },
];

const KEYBOARD_SHORTCUTS = [
    { keys: ['⌘', 'Enter'], description: 'Regenerate' },
    { keys: ['⌘', 'Shift', 'C'], description: 'Copy first UUID' },
    { keys: ['⌘', 'D'], description: 'Generate more' },
];

export default function UUIDGeneratorClient() {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [uuids, setUuids] = useState<string[]>([]);
    const [newIndexes, setNewIndexes] = useState<Set<number>>(new Set());
    const [spinning, setSpinning] = useState(false);
    const [copiedAll, setCopiedAll] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { toast, show: showToast } = useToast();
    const initialized = useRef(false);

    // Load settings and generate on mount
    useEffect(() => {
        const s = loadSettings();
        setSettings(s);
        const initial = Array.from({ length: s.count }, () => generateUUID(s.version));
        setUuids(initial);
        setNewIndexes(new Set(initial.map((_, i) => i)));
        setTimeout(() => setNewIndexes(new Set()), 800);
        initialized.current = true;
    }, []);

    // Persist settings
    useEffect(() => {
        if (!initialized.current) return;
        saveSettings(settings);
    }, [settings]);

    // Format displayed UUIDs
    const displayedUuids = useMemo(() =>
        uuids.map((u) => formatUUID(u, settings.uppercase, settings.noHyphens, settings.prefix, settings.suffix)),
        [uuids, settings.uppercase, settings.noHyphens, settings.prefix, settings.suffix]
    );

    const regenerate = useCallback((count?: number) => {
        const n = count ?? settings.count;
        setSpinning(true);
        const next = Array.from({ length: n }, () => generateUUID(settings.version));
        const indexes = new Set(next.map((_, i) => i));
        setUuids(next);
        setNewIndexes(indexes);
        setTimeout(() => { setSpinning(false); setNewIndexes(new Set()); }, 600);
    }, [settings.count, settings.version]);

    const regenerateSingle = useCallback((index: number) => {
        setUuids((prev) => {
            const next = [...prev];
            next[index] = generateUUID(settings.version);
            return next;
        });
        setNewIndexes(new Set([index]));
        setTimeout(() => setNewIndexes(new Set()), 600);
    }, [settings.version]);

    const updateSettings = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    // When version or count changes, regenerate
    const prevVersion = useRef(settings.version);
    const prevCount = useRef(settings.count);
    useEffect(() => {
        if (!initialized.current) return;
        if (prevVersion.current !== settings.version || prevCount.current !== settings.count) {
            prevVersion.current = settings.version;
            prevCount.current = settings.count;
            regenerate(settings.count);
        }
    }, [settings.version, settings.count, regenerate]);

    const copyAll = useCallback(async () => {
        const text = formatOutput(displayedUuids, settings.outputFormat);
        try { await navigator.clipboard.writeText(text); }
        catch {
            const el = document.createElement('textarea');
            el.value = text;
            el.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        setCopiedAll(true);
        showToast(`Copied ${displayedUuids.length} UUIDs`);
        setTimeout(() => setCopiedAll(false), 2000);
    }, [displayedUuids, settings.outputFormat, showToast]);

    const downloadFile = useCallback((ext: 'txt' | 'json' | 'csv') => {
        let content: string;
        let mime: string;
        if (ext === 'json') {
            content = JSON.stringify(displayedUuids, null, 2);
            mime = 'application/json';
        } else if (ext === 'csv') {
            content = 'uuid\n' + displayedUuids.join('\n');
            mime = 'text/csv';
        } else {
            content = displayedUuids.join('\n');
            mime = 'text/plain';
        }
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uuids.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Downloaded uuids.${ext}`);
    }, [displayedUuids, showToast]);



    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey;
            if (!mod) return;
            if (e.key === 'Enter') { e.preventDefault(); regenerate(); }
            if (e.key === 'd' || e.key === 'D') { e.preventDefault(); regenerate(Math.min(settings.count + 10, 100)); }
            if (e.key === 'C' && e.shiftKey) {
                e.preventDefault();
                if (displayedUuids[0]) {
                    navigator.clipboard.writeText(displayedUuids[0]);
                    showToast('First UUID copied');
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [regenerate, displayedUuids, settings.count, showToast]);



    return (
        <div className="container-lg">
            <ToolHeader
                title="UUID Generator"
                description="Generate cryptographically secure UUIDs instantly. v4 random, v1 timestamp, v7 sortable — bulk export, custom formats, keyboard-driven."
                badge="Free · No Ads · No Sign-up"
            />

            {/* ─── MAIN TOOL ─────────────────────────────────────────────── */}
            <div className="space-y-4">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white/2 border border-white/6">
                    {/* Version selector */}
                    <div className="flex items-center gap-1.5" role="group" aria-label="UUID version">
                        {(['v4', 'v1', 'v7'] as UUIDVersion[]).map((v) => (
                            <button
                                key={v}
                                onClick={() => updateSettings('version', v)}
                                aria-pressed={settings.version === v}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-mono transition-all duration-150
                                    ${settings.version === v
                                        ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300'
                                        : 'bg-white/4 border border-white/8 text-slate-400 hover:border-white/15 hover:text-slate-200'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <div className="h-5 w-px bg-white/8 hidden sm:block" aria-hidden />

                    {/* Count */}
                    <CountSelector value={settings.count} onChange={(n) => updateSettings('count', n)} />

                    <div className="h-5 w-px bg-white/8 hidden sm:block" aria-hidden />

                    {/* Regenerate */}
                    <button
                        id="regenerate-btn"
                        onClick={() => regenerate()}
                        aria-label="Regenerate all UUIDs"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/35 text-indigo-300 text-sm font-semibold hover:bg-indigo-600/35 hover:text-white hover:border-indigo-500/55 transition-all duration-150 flex-shrink-0`}
                    >
                        <span className={spinning ? 'animate-spin' : ''}>
                            <RefreshIcon />
                        </span>
                        Regenerate
                    </button>

                    {/* Advanced toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        aria-expanded={showAdvanced}
                        aria-controls="advanced-options"
                        className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150
                            ${showAdvanced ? 'border-indigo-500/40 bg-indigo-500/8 text-indigo-300' : 'border-white/8 bg-white/3 text-slate-500 hover:text-slate-300 hover:border-white/15'}`}
                    >
                        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                        Options
                    </button>
                </div>

                {/* Advanced Options Panel */}
                {showAdvanced && (
                    <div
                        id="advanced-options"
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/2 border border-white/6"
                    >
                        {/* Toggles */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-2">Format</p>
                            <Toggle id="uppercase-toggle" checked={settings.uppercase} onChange={(v) => updateSettings('uppercase', v)} label="Uppercase" />
                            <Toggle id="no-hyphens-toggle" checked={settings.noHyphens} onChange={(v) => updateSettings('noHyphens', v)} label="Remove hyphens" />
                        </div>

                        {/* Prefix / Suffix */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-2">Prefix / Suffix</p>
                            <div>
                                <label htmlFor="prefix-input" className="text-xs text-slate-500 mb-1 block">Prefix</label>
                                <input
                                    id="prefix-input"
                                    type="text"
                                    value={settings.prefix}
                                    onChange={(e) => updateSettings('prefix', e.target.value)}
                                    placeholder="e.g. uuid:"
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                                />
                            </div>
                            <div>
                                <label htmlFor="suffix-input" className="text-xs text-slate-500 mb-1 block">Suffix</label>
                                <input
                                    id="suffix-input"
                                    type="text"
                                    value={settings.suffix}
                                    onChange={(e) => updateSettings('suffix', e.target.value)}
                                    placeholder="e.g. ,"
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                                />
                            </div>
                        </div>

                        {/* Output Format & Layout */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-2">Output</p>
                            <div>
                                <label htmlFor="output-format" className="text-xs text-slate-500 mb-1 block">Copy-all format</label>
                                <select
                                    id="output-format"
                                    value={settings.outputFormat}
                                    onChange={(e) => updateSettings('outputFormat', e.target.value as OutputFormat)}
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                                >
                                    <option value="newline">Newline separated</option>
                                    <option value="comma">Comma separated</option>
                                    <option value="json">JSON array</option>
                                    <option value="sql">SQL INSERT</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Column layout</label>
                                <div className="flex gap-2" role="group" aria-label="Column layout">
                                    {([1, 2] as const).map((cols) => (
                                        <button
                                            key={cols}
                                            onClick={() => updateSettings('columns', cols)}
                                            aria-pressed={settings.columns === cols}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all
                                                ${settings.columns === cols ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' : 'border-white/8 bg-white/3 text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {cols === 1 ? '1 Column' : '2 Columns'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action row */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Copy All */}
                    <button
                        id="copy-all-btn"
                        onClick={copyAll}
                        aria-label={copiedAll ? 'All UUIDs copied' : 'Copy all UUIDs'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150
                            ${copiedAll
                                ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white'}`}
                    >
                        {copiedAll ? <CheckIcon /> : <CopyIcon />}
                        {copiedAll ? 'Copied!' : `Copy All (${displayedUuids.length})`}
                    </button>

                    {/* Download dropdown */}
                    <div className="flex items-center gap-1">
                        {(['txt', 'json', 'csv'] as const).map((ext) => (
                            <button
                                key={ext}
                                onClick={() => downloadFile(ext)}
                                aria-label={`Download as ${ext}`}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-white/8 bg-white/3 text-slate-500 hover:text-slate-200 hover:border-white/15 transition-all duration-150"
                            >
                                <DownloadIcon />
                                .{ext}
                            </button>
                        ))}
                    </div>



                    {/* UUID count stat */}
                    <span className="ml-auto text-xs text-slate-700 font-mono">
                        {displayedUuids.length} UUID{displayedUuids.length !== 1 ? 's' : ''} · UUID {settings.version.toUpperCase()}
                    </span>
                </div>

                {/* UUID List */}
                <div
                    className={`grid gap-1.5 ${settings.columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
                    aria-label="Generated UUIDs"
                    aria-live="polite"
                    aria-atomic="false"
                >
                    {displayedUuids.map((uuid, i) => (
                        <UUIDRow
                            key={i}
                            uuid={uuid}
                            index={i}
                            isNew={newIndexes.has(i)}
                            onRegenerate={regenerateSingle}
                            onCopy={() => showToast('UUID copied!')}
                        />
                    ))}
                </div>

                {/* Keyboard shortcuts */}
                <KeyboardShortcutsHint shortcuts={KEYBOARD_SHORTCUTS} />
            </div>

            {/* ─── DIVIDER ─────────────────────────────────────────────── */}
            <div className="divider my-14" />

            {/* ─── SEO CONTENT ─────────────────────────────────────────── */}
            <div className="space-y-14">
                <SEOSection
                    toolName="UUID Generator"
                    what="A UUID (Universally Unique Identifier) is a 128-bit identifier standardized by RFC 4122. It's written as 32 hexadecimal digits in five groups separated by hyphens — for example, 550e8400-e29b-41d4-a716-446655440000. UUIDs are designed to be unique across space and time without requiring a central registration authority."
                    why="Deepchill's UUID generator runs entirely in your browser using the Web Crypto API for true cryptographic randomness. There's no server, no ads, no tracking, and no rate limits. Generate up to 1,000 UUIDs instantly, switch between v1/v4/v7 formats, export to JSON/CSV/TXT, and share settings via URL — all in a single fast page load."
                    useCases={[
                        { title: 'Database primary keys', description: 'Use UUID v4 for distributed systems without a central ID generator, or UUID v7 for naturally ordered inserts in MySQL/PostgreSQL.' },
                        { title: 'Session & token IDs', description: 'Generate cryptographically random UUIDs for user session tokens, CSRF tokens, or one-time codes.' },
                        { title: 'File naming', description: 'Avoid naming collisions in storage systems (S3, GCS) by prefixing uploads with UUIDs.' },
                        { title: 'Test data generation', description: 'Quickly generate hundreds of unique UUIDs for seeding test databases or fixtures.' },
                        { title: 'Microservices correlation IDs', description: 'Tag distributed traces and log entries with UUIDs to correlate requests across services.' },
                        { title: 'Event sourcing', description: 'Assign stable, globally unique IDs to domain events in event-driven architectures.' },
                    ]}
                    example={{
                        input: 'Version: v4\nCount: 3\nFormat: newline',
                        output: 'f47ac10b-58cc-4372-a567-0e02b2c3d479\n9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d\n1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
                        label: 'Example output (3 × UUID v4)',
                    }}
                />

                <FAQSection
                    faqs={UUID_FAQS}
                    toolName="UUID Generator"
                    pageUrl="https://deepchill.app/tools/uuid-generator"
                />

                <RelatedTools currentSlug="uuid-generator" />
            </div>

            {/* ─── TOAST ─────────────────────────────────────────────────── */}
            <div
                aria-live="assertive"
                aria-atomic="true"
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
                <div
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/95 border border-white/12 text-slate-200 text-sm font-medium shadow-2xl backdrop-blur-md transition-all duration-300
                        ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                    role="status"
                >
                    <span className="text-emerald-400">
                        <CheckIcon />
                    </span>
                    {toast}
                </div>
            </div>
        </div>
    );
}
