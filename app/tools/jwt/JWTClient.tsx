'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ToolHeader from '@/app/components/tools/ToolHeader';
import CopyButton from '@/app/components/tools/CopyButton';
import ClearButton from '@/app/components/tools/ClearButton';
import KeyboardShortcutsHint from '@/app/components/tools/KeyboardShortcutsHint';
import SEOSection from '@/app/components/tools/SEOSection';
import FAQSection from '@/app/components/tools/FAQSection';
import RelatedTools from '@/app/components/tools/RelatedTools';

const STORAGE_KEY = 'dc_jwt_input';

type Mode = 'decode' | 'encode';
type Algorithm = 'HS256' | 'HS384' | 'HS512';

const FAQS = [
    {
        question: 'What is a JWT?',
        answer: 'A JSON Web Token (JWT) is a compact, URL-safe token format used to transmit claims between parties. It consists of three Base64url-encoded parts separated by dots: a header (algorithm/type), a payload (claims), and a signature.',
    },
    {
        question: 'Is it safe to paste my JWT here?',
        answer: 'Yes. All decoding and encoding happens 100% in your browser using built-in Web Crypto APIs. No token is ever sent to any server. For production secrets, always use your own trusted environment.',
    },
    {
        question: 'What does "expired" mean?',
        answer: 'If the JWT payload contains an "exp" claim (Unix timestamp), this tool compares it to the current time. If exp is in the past, the token is expired and most servers will reject it.',
    },
    {
        question: 'Can I verify the signature?',
        answer: 'For HMAC-signed JWTs (HS256/384/512), enter the signing secret in Encode mode to produce a verifiable token, or to check if a token\'s signature matches. RS256/ES256 (asymmetric) verification is not supported in this browser tool.',
    },
    {
        question: 'What is Base64url?',
        answer: 'Base64url is a variant of Base64 that uses "-" instead of "+" and "_" instead of "/" and omits padding "=". JWTs use Base64url to ensure the token is URL and cookie safe.',
    },
    {
        question: 'How do I create a JWT?',
        answer: 'Switch to Encode mode, enter your header JSON and payload JSON, choose an algorithm and enter your secret, then click Sign. The tool will produce a signed JWT you can use immediately.',
    },
];

const SHORTCUTS = [
    { keys: ['Esc'], description: 'Clear' },
];

// ── Base64url helpers ────────────────────────────────────────────────────────
function base64urlDecode(str: string): string {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    return atob(padded + padding);
}

function base64urlEncode(str: string): string {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlEncodeBuffer(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ── Decode ───────────────────────────────────────────────────────────────────
interface DecodedJWT {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
    raw: { header: string; payload: string; signature: string };
    error: null;
}
interface JWTError { error: string }

function decodeJWT(token: string): DecodedJWT | JWTError {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return { error: `Invalid JWT: expected 3 parts separated by ".", got ${parts.length}` };
    try {
        const header = JSON.parse(base64urlDecode(parts[0]));
        const payload = JSON.parse(base64urlDecode(parts[1]));
        return { header, payload, signature: parts[2], raw: { header: parts[0], payload: parts[1], signature: parts[2] }, error: null };
    } catch (e: unknown) {
        return { error: `Failed to decode: ${(e as Error).message}` };
    }
}

// ── Encode / Sign ────────────────────────────────────────────────────────────
async function signJWT(header: string, payload: string, secret: string, alg: Algorithm): Promise<string> {
    const algMap: Record<Algorithm, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyData,
        { name: 'HMAC', hash: algMap[alg] },
        false, ['sign']
    );
    const h = base64urlEncode(JSON.stringify(JSON.parse(header)));
    const p = base64urlEncode(JSON.stringify(JSON.parse(payload)));
    const signingInput = `${h}.${p}`;
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(signingInput));
    return `${signingInput}.${base64urlEncodeBuffer(sig)}`;
}

// ── Pretty JSON ──────────────────────────────────────────────────────────────
function prettyJSON(obj: unknown): string {
    return JSON.stringify(obj, null, 2);
}

function formatExpiry(exp: unknown): { label: string; isExpired: boolean; countdown: string } | null {
    if (typeof exp !== 'number') return null;
    const now = Math.floor(Date.now() / 1000);
    const isExpired = exp < now;
    const diff = Math.abs(exp - now);
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;
    const countdown = days > 0
        ? `${days}d ${hours}h ${mins}m`
        : hours > 0
            ? `${hours}h ${mins}m ${secs}s`
            : `${mins}m ${secs}s`;
    const date = new Date(exp * 1000).toLocaleString();
    return { label: date, isExpired, countdown };
}

export default function JWTClient() {
    const [mode, setMode] = useState<Mode>('decode');

    // Decode state
    const [token, setToken] = useState('');
    const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
    const [decodeError, setDecodeError] = useState<string | null>(null);
    const [secretVisible, setSecretVisible] = useState(false);
    const [expiry, setExpiry] = useState<ReturnType<typeof formatExpiry>>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Encode state
    const [encHeader, setEncHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
    const [encPayload, setEncPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
    const [encSecret, setEncSecret] = useState('your-256-bit-secret');
    const [encAlg, setEncAlg] = useState<Algorithm>('HS256');
    const [encResult, setEncResult] = useState('');
    const [encError, setEncError] = useState<string | null>(null);
    const [showSecret, setShowSecret] = useState(false);

    // Ticker for expiry countdown
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    // Load from URL / localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setToken(saved);
        textareaRef.current?.focus();
    }, []);

    // Decode on token change
    useEffect(() => {
        if (!token.trim()) {
            setDecoded(null);
            setDecodeError(null);
            setExpiry(null);
            return;
        }
        const result = decodeJWT(token);
        if (result.error) {
            setDecodeError(result.error);
            setDecoded(null);
            setExpiry(null);
        } else {
            setDecoded(result as DecodedJWT);
            setDecodeError(null);
        }
        if (token) localStorage.setItem(STORAGE_KEY, token);
        else localStorage.removeItem(STORAGE_KEY);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Update expiry countdown every second
    useEffect(() => {
        if (decoded) {
            setExpiry(formatExpiry(decoded.payload.exp));
        }
    }, [decoded, tick]);

    const handleClear = useCallback(() => {
        setToken('');
        setDecoded(null);
        setDecodeError(null);
        setExpiry(null);
        localStorage.removeItem(STORAGE_KEY);
        textareaRef.current?.focus();
    }, []);

    const handleSign = useCallback(async () => {
        setEncError(null);
        try {
            const jwt = await signJWT(encHeader, encPayload, encSecret, encAlg);
            setEncResult(jwt);
        } catch (e: unknown) {
            setEncError((e as Error).message);
            setEncResult('');
        }
    }, [encHeader, encPayload, encSecret, encAlg]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClear();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleClear]);

    const alg = decoded?.header?.alg as string | undefined;

    return (
        <div className="container-lg">
            <ToolHeader
                title="JWT Decoder & Encoder"
                description="Decode any JWT instantly — inspect header, payload, and expiry. Sign new tokens with HMAC in your browser."
            />

            {/* Mode Tabs */}
            <div className="flex items-center gap-1 mb-6 p-1 bg-white/4 rounded-xl w-fit border border-white/8">
                {(['decode', 'encode'] as const).map((m) => (
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

            {/* ── DECODE MODE ── */}
            {mode === 'decode' && (
                <>
                    {/* Token input */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">JWT Token</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={async () => {
                                        try { setToken(await navigator.clipboard.readText()); } catch { /* noop */ }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                                    id="btn-paste"
                                >Paste</button>
                                <ClearButton onClear={handleClear} id="btn-clear" />
                            </div>
                        </div>
                        <textarea
                            ref={textareaRef}
                            id="jwt-input"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your JWT here… eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            spellCheck={false}
                            aria-label="JWT token input"
                            className={`w-full h-28 rounded-xl border px-4 py-3 bg-white/3 text-slate-300 text-sm font-mono resize-none outline-none placeholder:text-slate-700 leading-relaxed transition-colors ${decodeError ? 'border-red-500/40' : decoded ? 'border-emerald-500/30' : 'border-white/10 focus:border-indigo-500/40'}`}
                        />
                        {decodeError && (
                            <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5 mt-1 px-1">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                                </svg>
                                {decodeError}
                            </p>
                        )}
                    </div>

                    {decoded && (
                        <div className="grid lg:grid-cols-3 gap-4 mb-4">
                            {/* Header panel */}
                            <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Header</span>
                                        {alg && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{alg}</span>
                                        )}
                                    </div>
                                    <CopyButton getValue={() => prettyJSON(decoded.header)} label="Copy" id="btn-copy-header" />
                                </div>
                                <pre className="text-xs font-mono text-indigo-200 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                                    {prettyJSON(decoded.header)}
                                </pre>
                            </div>

                            {/* Payload panel */}
                            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Payload</span>
                                    <CopyButton getValue={() => prettyJSON(decoded.payload)} label="Copy" id="btn-copy-payload" />
                                </div>
                                {expiry && (
                                    <div className={`flex items-center gap-1.5 text-xs mb-3 px-2 py-1 rounded-lg border ${expiry.isExpired ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'}`}>
                                        <span>{expiry.isExpired ? '⚠ Expired' : '✓ Valid'}</span>
                                        <span className="text-slate-500">·</span>
                                        <span>{expiry.isExpired ? `${expiry.countdown} ago` : `Expires in ${expiry.countdown}`}</span>
                                    </div>
                                )}
                                <pre className="text-xs font-mono text-emerald-200 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                                    {prettyJSON(decoded.payload)}
                                </pre>
                            </div>

                            {/* Signature panel */}
                            <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Signature</span>
                                    <CopyButton getValue={() => decoded.signature} label="Copy" id="btn-copy-sig" />
                                </div>
                                <p className="text-xs font-mono text-rose-200 leading-relaxed break-all">{decoded.signature}</p>
                                <div className="mt-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-[10px] text-slate-600 uppercase tracking-wider">Verify secret</label>
                                        <button onClick={() => setSecretVisible(!secretVisible)} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">{secretVisible ? 'hide' : 'show'}</button>
                                    </div>
                                    <input
                                        type={secretVisible ? 'text' : 'password'}
                                        placeholder="Enter secret to verify…"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-400 outline-none focus:border-rose-500/40"
                                        id="verify-secret-input"
                                        aria-label="Secret for signature verification"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── ENCODE MODE ── */}
            {mode === 'encode' && (
                <div className="grid lg:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                        {/* Header JSON */}
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Header JSON</label>
                            <textarea
                                id="enc-header"
                                value={encHeader}
                                onChange={(e) => setEncHeader(e.target.value)}
                                spellCheck={false}
                                rows={5}
                                aria-label="JWT header JSON"
                                className="w-full rounded-xl border border-indigo-500/25 bg-indigo-500/5 px-4 py-3 text-xs font-mono text-indigo-200 resize-none outline-none focus:border-indigo-500/50"
                            />
                        </div>
                        {/* Payload JSON */}
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Payload JSON</label>
                            <textarea
                                id="enc-payload"
                                value={encPayload}
                                onChange={(e) => setEncPayload(e.target.value)}
                                spellCheck={false}
                                rows={7}
                                aria-label="JWT payload JSON"
                                className="w-full rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-xs font-mono text-emerald-200 resize-none outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        {/* Secret + Algorithm */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Secret</label>
                                <div className="relative">
                                    <input
                                        id="enc-secret"
                                        type={showSecret ? 'text' : 'password'}
                                        value={encSecret}
                                        onChange={(e) => setEncSecret(e.target.value)}
                                        aria-label="HMAC signing secret"
                                        className="w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-xs font-mono text-slate-300 outline-none focus:border-indigo-500/40 pr-9"
                                    />
                                    <button
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                                        aria-label={showSecret ? 'Hide secret' : 'Reveal secret'}
                                    >
                                        {showSecret ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Algorithm</label>
                                <select
                                    id="enc-alg"
                                    value={encAlg}
                                    onChange={(e) => setEncAlg(e.target.value as Algorithm)}
                                    className="rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500/40 cursor-pointer"
                                    aria-label="Signing algorithm"
                                >
                                    <option>HS256</option>
                                    <option>HS384</option>
                                    <option>HS512</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleSign}
                            id="btn-sign"
                            className="w-full py-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-sm font-semibold hover:bg-indigo-600/50 hover:text-white transition-all"
                        >
                            Sign JWT →
                        </button>
                    </div>

                    {/* Result */}
                    <div className="rounded-xl border border-white/10 bg-white/3 p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Signed Token</span>
                            {encResult && <CopyButton getValue={() => encResult} label="Copy" id="btn-copy-token" />}
                        </div>
                        {encError && (
                            <p role="alert" className="text-xs text-red-400">{encError}</p>
                        )}
                        {encResult ? (
                            <p className="text-xs font-mono text-slate-300 break-all leading-relaxed">
                                <span className="text-indigo-300">{encResult.split('.')[0]}</span>
                                <span className="text-slate-600">.</span>
                                <span className="text-emerald-300">{encResult.split('.')[1]}</span>
                                <span className="text-slate-600">.</span>
                                <span className="text-rose-300">{encResult.split('.')[2]}</span>
                            </p>
                        ) : (
                            <div className="flex items-center justify-center flex-1 text-slate-700 text-sm">
                                Fill in the fields and click Sign JWT
                            </div>
                        )}
                    </div>
                </div>
            )}

            <KeyboardShortcutsHint shortcuts={SHORTCUTS} />

            <div className="divider my-12" />

            <SEOSection
                toolName="JWT Decoder"
                what="A JWT (JSON Web Token) decoder splits a token into its three Base64url-encoded components — header, payload, and signature — and decodes each into readable JSON. It also checks the expiration claim (exp) so you can instantly see if a token is still valid without any server calls."
                why="Deepchill's JWT tool runs completely in your browser using the built-in Web Crypto API. There's no server that sees your tokens. The color-coded panels (indigo for header, emerald for payload, rose for signature) make it easy to debug auth issues at a glance, and the live expiry countdown removes all ambiguity about token validity."
                useCases={[
                    { title: 'Debugging auth failures', description: 'Paste the bearer token from an Authorization header to confirm it\'s not expired and contains the expected claims.' },
                    { title: 'Validating API responses', description: 'Inspect tokens returned by identity providers (Auth0, Cognito, Okta) to verify the correct scopes and roles are present.' },
                    { title: 'Creating test tokens', description: 'Use Encode mode to generate a signed HS256 token for local testing without spinning up a real auth server.' },
                    { title: 'Security audits', description: 'Inspect the header to ensure tokens use a secure algorithm (not "alg: none") and payloads don\'t contain sensitive data.' },
                ]}
                example={{
                    input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
                    output: '{\n  "alg": "HS256",\n  "typ": "JWT"\n}\n---\n{\n  "sub": "1234567890"\n}',
                    label: 'JWT token → Decoded header & payload',
                }}
            />

            <div className="divider my-12" />

            <FAQSection
                faqs={FAQS}
                toolName="JWT Decoder"
                pageUrl="https://deepchill.app/tools/jwt"
            />

            <div className="divider my-12" />

            <RelatedTools currentSlug="jwt" />
        </div>
    );
}
