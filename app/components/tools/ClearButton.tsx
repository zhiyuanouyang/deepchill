'use client';

interface ClearButtonProps {
    onClear: () => void;
    label?: string;
    className?: string;
    id?: string;
}

export default function ClearButton({ onClear, label = 'Clear', className = '', id }: ClearButtonProps) {
    return (
        <button
            id={id}
            onClick={onClear}
            aria-label={`Clear ${label}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        bg-white/5 text-slate-400 border border-white/10
        hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30
        transition-all duration-200 ${className}`}
        >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {label}
        </button>
    );
}
