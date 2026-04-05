
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/blog', label: 'Blog' },
    { href: '/categories/ai-tools', label: 'Categories' },
];

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-5 py-3">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2.5 group" aria-label="Deepchill home">
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg text-sm transition-transform group-hover:scale-105">
                        D
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">DEEPCHILL</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1" role="menubar">
                    {NAV_LINKS.map((link) => {
                        const isActive = link.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                role="menuitem"
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <a
                        href="https://interviewgpt.deepchill.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm py-2.5 px-5"
                    >
                        Try InterviewGPT
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle mobile menu"
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden mt-2 mx-0 glass rounded-2xl p-4 flex flex-col gap-1">
                    {NAV_LINKS.map((link) => {
                        const isActive = link.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-indigo-600/20 text-indigo-300'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <div className="divider my-2" />
                    <a
                        href="https://interviewgpt.deepchill.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm py-2.5 text-center"
                    >
                        Try InterviewGPT →
                    </a>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
