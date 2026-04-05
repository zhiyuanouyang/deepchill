
import Link from 'next/link';

const FOOTER_LINKS = {
    Products: [
        { label: 'All Products', href: '/products' },
        { label: 'InterviewGPT', href: '/products/interviewgpt' },
    ],
    Categories: [
        { label: 'AI & Automation', href: '/categories/ai-tools' },
        { label: 'Games & Entertainment', href: '/categories/games' },
        { label: 'Finance & Fintech', href: '/categories/finance' },
        { label: 'Productivity & Utilities', href: '/categories/productivity' },
    ],
    'Resources': [
        { label: 'Blog', href: '/blog' },
        { label: 'System Design Guide', href: '/blog/how-to-ace-system-design-interview-2025' },
        { label: 'AI Interview Tools', href: '/blog/top-ai-tools-for-software-engineer-interview-prep' },
        { label: 'Behavioral Questions', href: '/blog/behavioral-interview-questions-for-software-engineers' },
    ],
};

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-sm" aria-label="Site footer">
            <div className="container-xl py-16">
                {/* Top row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand column */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit" aria-label="Deepchill home">
                            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg text-sm">
                                D
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white">DEEPCHILL</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            A studio for ambitious products — crafted by one person, shipped for everyone.
                        </p>
                        <a
                            href="/products"
                            className="btn-secondary text-sm py-2.5 px-4 w-fit"
                            id="footer-browse-products"
                        >
                            Browse Products →
                        </a>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([sectionTitle, links]) => (
                        <div key={sectionTitle}>
                            <h3 className="text-slate-300 font-semibold text-sm mb-4 uppercase tracking-wider">
                                {sectionTitle}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-slate-500 hover:text-indigo-400 text-sm transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="divider mb-8" />

                {/* Bottom row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-600 text-xs">
                        © {currentYear} Deepchill. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-slate-600">
                        <span>Built with Next.js · Deployed on Vercel</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
