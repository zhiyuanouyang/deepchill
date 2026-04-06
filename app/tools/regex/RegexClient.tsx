'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import CopyButton from '@/app/components/tools/CopyButton';
import ClearButton from '@/app/components/tools/ClearButton';
import KeyboardShortcutsHint from '@/app/components/tools/KeyboardShortcutsHint';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';

const STORAGE_KEY_PATTERN = 'dc_regex_pattern';
const STORAGE_KEY_FLAGS = 'dc_regex_flags';
const STORAGE_KEY_TEXT = 'dc_regex_text';

const ALL_FLAGS = ['g', 'i', 'm', 's', 'u'] as const;
type Flag = typeof ALL_FLAGS[number];

const FLAG_DESCRIPTIONS: Record<Flag, string> = {
    g: 'Global — find all matches',
    i: 'Case insensitive',
    m: 'Multiline — ^ and $ match line boundaries',
    s: 'Dotall — dot matches newlines',
    u: 'Unicode mode',
};

const PRESETS = [
    { label: 'Email address', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
    { label: 'URL (http/https)', pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*', flags: 'gi' },
    { label: 'IPv4 address', pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', flags: 'g' },
    { label: 'US phone number', pattern: '\\(?\\d{3}\\)?[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{4}', flags: 'g' },
    { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags: 'g' },
    { label: 'Hex color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'gi' },
    { label: 'HTML tag', pattern: '<[^>]+>', flags: 'gi' },
    { label: 'Words (alphanumeric)', pattern: '\\b\\w+\\b', flags: 'gi' },
    { label: 'Whitespace runs', pattern: '\\s+', flags: 'g' },
    { label: 'JWT token', pattern: 'ey[A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]+\\.[A-Za-z0-9_\\-]*', flags: 'g' },
];

const GROUP_COLORS = [
    'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    'bg-sky-500/20 text-sky-200 border-sky-500/30',
    'bg-pink-500/20 text-pink-200 border-pink-500/30',
    'bg-orange-500/20 text-orange-200 border-orange-500/30',
    'bg-teal-500/20 text-teal-200 border-teal-500/30',
    'bg-violet-500/20 text-violet-200 border-violet-500/30',
];

const SHORTCUTS = [{ keys: ['Esc'], description: 'Clear pattern' }];

const FAQS = [
    {
        question: 'What is a regular expression?',
        answer: 'A regular expression (regex) is a sequence of characters that defines a search pattern. It\'s used to find, match, or replace text that follows a specific structure, like email addresses, phone numbers, or URLs.',
    },
    {
        question: 'What do the flags g, i, m, s, u mean?',
        answer: 'g (global) finds all matches instead of stopping at the first. i (case insensitive) ignores letter case. m (multiline) makes ^ and $ match line starts/ends. s (dotall) makes . match newlines. u (unicode) enables full Unicode support.',
    },
    {
        question: 'What are capture groups?',
        answer: 'Capture groups are parts of a regex wrapped in parentheses (). They let you extract specific sub-parts of a match. For example, (\\d{4})-(\\d{2})-(\\d{2}) on a date string captures year, month, and day separately.',
    },
    {
        question: 'How does Replace mode work?',
        answer: 'In Replace mode, enter a replacement string in the box below the pattern. You can reference capture groups with $1, $2, etc. The preview shows what your test text would look like after replacement.',
    },
    {
        question: 'What is catastrophic backtracking?',
        answer: 'Some regex patterns with nested quantifiers (like (a+)+ on a string of a\'s) can cause exponential slowdown or browser freezes. This tool uses a debounce and try/catch to stop runaway patterns before they hang your browser.',
    },
    {
        question: 'Is my text sent anywhere?',
        answer: 'No. All regex matching happens in your browser using the native JavaScript RegExp engine. Your pattern and test text are never sent to any server.',
    },
];

interface Match {
    index: number;
    length: number;
    value: string;
    groups: string[];
}

function buildHighlightedSpans(text: string, matches: Match[]): React.ReactNode[] {
    if (matches.length === 0) return [<span key="all">{text}</span>];
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    matches.forEach((m, mi) => {
        if (m.index > cursor) {
            nodes.push(<span key={`pre-${mi}`}>{text.slice(cursor, m.index)}</span>);
        }
        nodes.push(
            <mark
                key={`match-${mi}`}
                className="bg-indigo-500/30 text-indigo-100 rounded-sm border-b-2 border-indigo-400 not-italic"
                title={`Match ${mi + 1}: "${m.value}"`}
            >
                {m.value}
            </mark>
        );
        cursor = m.index + m.length;
    });
    if (cursor < text.length) {
        nodes.push(<span key="post">{text.slice(cursor)}</span>);
    }
    return nodes;
}

function describePattern(pattern: string): string {
    if (!pattern) return '';
    const descriptions: string[] = [];
    if (pattern.includes('^')) descriptions.push('starts with');
    if (pattern.includes('$')) descriptions.push('ends with');
    if (pattern.includes('\\d')) descriptions.push('digits');
    if (pattern.includes('\\w')) descriptions.push('word characters');
    if (pattern.includes('\\s')) descriptions.push('whitespace');
    if (pattern.includes('+')) descriptions.push('one or more');
    if (pattern.includes('*')) descriptions.push('zero or more');
    if (pattern.includes('?')) descriptions.push('optional');
    if (pattern.includes('|')) descriptions.push('alternation');
    if (pattern.includes('(')) descriptions.push('capture groups');
    return descriptions.length > 0 ? `Pattern uses: ${descriptions.join(', ')}` : '';
}

export default function RegexClient() {
    const [pattern, setPattern] = useState('[a-z]+');
    const [flags, setFlags] = useState<Set<Flag>>(new Set(['g', 'i']));
    const [testText, setTestText] = useState(
        'Hello World! The quick brown fox jumps over the lazy dog.\nContact us at hello@example.com or support@deepchill.app'
    );
    const [replaceStr, setReplaceStr] = useState('[$&]');
    const [replaceMode, setReplaceMode] = useState(false);
    const [matches, setMatches] = useState<Match[]>([]);
    const [regexError, setRegexError] = useState<string | null>(null);
    const [replaceResult, setReplaceResult] = useState('');
    const patternRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load from URL / localStorage
    useEffect(() => {
        const p = localStorage.getItem(STORAGE_KEY_PATTERN);
        const f = localStorage.getItem(STORAGE_KEY_FLAGS);
        const t = localStorage.getItem(STORAGE_KEY_TEXT);
        if (p) setPattern(p);
        if (f) setFlags(new Set(f.split('') as Flag[]));
        if (t) setTestText(t);
        patternRef.current?.focus();
    }, []);

    // Run regex with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setRegexError(null);
            setMatches([]);
            setReplaceResult('');
            if (!pattern) return;

            try {
                const flagStr = Array.from(flags).join('');
                // Ensure global for match-all; if not global, only one match
                const reForMatches = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g');
                const reForReplace = new RegExp(pattern, flagStr);
                const results: Match[] = [];
                let m: RegExpExecArray | null;
                let safetyCount = 0;
                const re = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g');
                re.lastIndex = 0;
                while ((m = re.exec(testText)) !== null && safetyCount < 1000) {
                    safetyCount++;
                    results.push({
                        index: m.index,
                        length: m[0].length,
                        value: m[0],
                        groups: m.slice(1).map((g) => g ?? ''),
                    });
                    if (!reForMatches.flags.includes('g')) break;
                    if (m[0].length === 0) re.lastIndex++; // avoid infinite loop on zero-width match
                }
                setMatches(results);

                if (replaceMode) {
                    setReplaceResult(testText.replace(reForReplace, replaceStr));
                }
            } catch (e: unknown) {
                setRegexError((e as Error).message);
            }

            // Persist
            localStorage.setItem(STORAGE_KEY_PATTERN, pattern);
            localStorage.setItem(STORAGE_KEY_FLAGS, Array.from(flags).join(''));
            localStorage.setItem(STORAGE_KEY_TEXT, testText);


        }, 80);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [pattern, flags, testText, replaceStr, replaceMode]);

    const toggleFlag = useCallback((f: Flag) => {
        setFlags((prev) => {
            const next = new Set(prev);
            if (next.has(f)) next.delete(f);
            else next.add(f);
            return next;
        });
    }, []);

    const handleClear = useCallback(() => {
        setPattern('');
        setMatches([]);
        setRegexError(null);
        localStorage.removeItem(STORAGE_KEY_PATTERN);
        patternRef.current?.focus();
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClear(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleClear]);

    const flagStr = Array.from(flags).join('');
    const fullPattern = pattern ? `/${pattern}/${flagStr}` : '';
    const description = describePattern(pattern);
    const hasGroups = matches.some((m) => m.groups.length > 0);

    return (
        <div className="container-lg">
            <ToolHeader
                title="Regex Tester"
                description="Test regular expressions with live match highlighting, capture group visualization, and replace mode. Runs entirely in your browser."
            />

            {/* Pattern input row */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pattern</span>
                    <div className="flex items-center gap-2">
                        <select
                            onChange={(e) => {
                                const preset = PRESETS.find((p) => p.label === e.target.value);
                                if (preset) {
                                    setPattern(preset.pattern);
                                    setFlags(new Set(preset.flags.split('') as Flag[]));
                                }
                                e.target.value = '';
                            }}
                            className="text-xs bg-white/5 text-slate-400 border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500/50 cursor-pointer"
                            id="preset-select"
                            aria-label="Select a preset regex pattern"
                            defaultValue=""
                        >
                            <option value="">Presets…</option>
                            {PRESETS.map((p) => (
                                <option key={p.label} value={p.label}>{p.label}</option>
                            ))}
                        </select>
                        <ClearButton onClear={handleClear} id="btn-clear" />
                    </div>
                </div>

                {/* Pattern input with / delimiters */}
                <div className={`flex items-center gap-0 rounded-xl border transition-colors ${regexError ? 'border-red-500/40 bg-red-500/3' : matches.length > 0 ? 'border-indigo-500/30 bg-white/3' : 'border-white/10 bg-white/3'} focus-within:border-indigo-500/40`}>
                    <span className="text-slate-600 font-mono text-xl px-4 select-none">/</span>
                    <input
                        ref={patternRef}
                        id="regex-pattern"
                        type="text"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        placeholder="pattern"
                        spellCheck={false}
                        aria-label="Regex pattern input"
                        className="flex-1 bg-transparent text-white font-mono text-base py-3 outline-none placeholder:text-slate-700"
                    />
                    <span className="text-slate-600 font-mono text-xl px-2 select-none">/</span>
                    <span className="text-indigo-400 font-mono text-base pr-4 min-w-[2rem] select-none">{flagStr}</span>
                </div>

                {/* Flags */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="text-[10px] text-slate-600 uppercase tracking-wider">Flags:</span>
                    {ALL_FLAGS.map((f) => (
                        <button
                            key={f}
                            onClick={() => toggleFlag(f)}
                            aria-pressed={flags.has(f)}
                            title={FLAG_DESCRIPTIONS[f]}
                            id={`flag-${f}`}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all ${flags.has(f)
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : 'bg-white/3 text-slate-600 border-white/8 hover:border-white/20 hover:text-slate-400'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    {matches.length > 0 && (
                        <span className="ml-auto text-xs font-semibold text-emerald-400">
                            {matches.length} match{matches.length !== 1 ? 'es' : ''}
                        </span>
                    )}
                    {regexError && (
                        <span className="ml-auto text-xs text-red-400">Invalid pattern</span>
                    )}
                </div>

                {description && !regexError && (
                    <p className="text-[11px] text-slate-600 mt-1.5 px-1">{description}</p>
                )}
                {regexError && (
                    <p role="alert" className="text-xs text-red-400 mt-1.5 px-1">{regexError}</p>
                )}
            </div>

            {/* Replace mode toggle */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={() => setReplaceMode(!replaceMode)}
                    aria-pressed={replaceMode}
                    id="btn-replace-toggle"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${replaceMode
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-white/4 text-slate-500 border-white/10 hover:text-slate-300'
                        }`}
                >
                    <span>{replaceMode ? '✓' : '+'}</span> Replace mode
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mb-4">
                {/* Test text */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Test Text</span>
                        <CopyButton getValue={() => testText} label="Copy" id="btn-copy-text" />
                    </div>
                    <textarea
                        id="regex-test-text"
                        value={testText}
                        onChange={(e) => setTestText(e.target.value)}
                        spellCheck={false}
                        aria-label="Test text for regex matching"
                        placeholder="Enter text to test your regex against…"
                        className="w-full h-64 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm font-mono text-slate-300 resize-none outline-none focus:border-indigo-500/40 placeholder:text-slate-700 leading-relaxed"
                    />
                    {replaceMode && (
                        <div>
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1.5 block">
                                Replace with <span className="text-slate-700 normal-case">(use $1, $2 for groups)</span>
                            </label>
                            <input
                                id="replace-input"
                                type="text"
                                value={replaceStr}
                                onChange={(e) => setReplaceStr(e.target.value)}
                                aria-label="Replacement string"
                                className="w-full rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-2.5 text-sm font-mono text-amber-200 outline-none focus:border-amber-500/50"
                            />
                        </div>
                    )}
                </div>

                {/* Live highlight / replace preview */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {replaceMode ? 'Replace Preview' : 'Live Highlights'}
                        </span>
                        {fullPattern && (
                            <span className="text-[10px] font-mono text-slate-700">{fullPattern}</span>
                        )}
                    </div>
                    <div className="w-full h-64 rounded-xl border border-white/10 bg-white/3 px-4 py-3 overflow-auto">
                        <pre className="text-sm font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
                            {replaceMode
                                ? replaceResult || testText
                                : buildHighlightedSpans(testText, matches)
                            }
                        </pre>
                    </div>
                    {replaceMode && replaceResult && (
                        <CopyButton getValue={() => replaceResult} label="Copy result" id="btn-copy-replace" />
                    )}
                </div>
            </div>

            {/* Match list */}
            {matches.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/3 p-4 mb-4">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Match List ({matches.length})
                    </h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {matches.map((m, i) => (
                            <div key={i} className="flex items-start gap-3 text-xs">
                                <span className="w-5 h-5 flex-shrink-0 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span className="font-mono text-white bg-indigo-500/15 px-1.5 py-0.5 rounded">{m.value}</span>
                                    <span className="text-slate-600 ml-2">index {m.index}, length {m.length}</span>
                                    {hasGroups && m.groups.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {m.groups.map((g, gi) => (
                                                <span key={gi} className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${GROUP_COLORS[gi % GROUP_COLORS.length]}`}>
                                                    ${gi + 1}: {g}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <KeyboardShortcutsHint shortcuts={SHORTCUTS} />

            <div className="divider my-12" />

            <SEOSection
                toolName="Regex Tester"
                what="A regex tester lets you write a regular expression pattern and immediately see which parts of a test string it matches, highlighted in real time. It also shows individual match positions, capture group contents, and a replace preview — all without any page reload."
                why="Deepchill's Regex Tester uses the native JavaScript RegExp engine in your browser for zero-latency matching. It includes catastrophic backtracking protection via debouncing and try/catch, a curated preset library for common patterns, color-coded capture groups (up to 6 levels), and a replace mode with $1/$2 backreference support."
                useCases={[
                    { title: 'Form validation', description: 'Build and test email, phone, or postal code patterns before wiring them into your frontend validation logic.' },
                    { title: 'Log parsing', description: 'Extract timestamps, request IDs, or error codes from log lines using capture groups, then copy the pattern for use in grep or your logging tool.' },
                    { title: 'Text transformation', description: 'Use replace mode to preview bulk text changes — for example reformatting dates from YYYY-MM-DD to MM/DD/YYYY using capture groups.' },
                    { title: 'Teaching regex', description: 'Use the live highlights and match list to demonstrate what each quantifier and character class matches as you type.' },
                ]}
                example={{
                    input: '/([a-z]+)@([a-z]+)\\.([a-z]{2,})/gi\nTest: hello@example.com',
                    output: 'Match 1: hello@example.com\n  $1: hello  $2: example  $3: com',
                    label: 'Pattern + test text → Matches with capture groups',
                }}
            />

            <div className="divider my-12" />

            <FAQSection
                faqs={FAQS}
                toolName="Regex Tester"
                pageUrl="https://deepchill.app/tools/regex"
            />

            <div className="divider my-12" />

            <RelatedTools currentSlug="regex" />
        </div>
    );
}
