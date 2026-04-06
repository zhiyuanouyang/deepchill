
import Link from 'next/link';

const FOOTER_LINKS = [
    {
        title: 'Products',
        span: 'md:col-span-2',
        links: [
            { label: 'All Products', href: '/products' },
            { label: 'InterviewGPT', href: '/products/interviewgpt' },
        ],
    },
    {
        title: 'Tools',
        span: 'md:col-span-5',
        columns: 2,
        links: [
            { label: 'Base64 Tool', href: '/tools/base64' },
            { label: 'Cron Parser', href: '/tools/cron-parser' },
            { label: 'JSON Formatter', href: '/tools/json-formatter' },
            { label: 'JWT Decoder', href: '/tools/jwt' },
            { label: 'Regex Tester', href: '/tools/regex' },
            { label: 'Text Curator', href: '/tools/text-curator' },
            { label: 'Text Diff Tool', href: '/tools/text-diff' },
            { label: 'Timestamp Converter', href: '/tools/timestamp' },
            { label: 'URL Encoder / Decoder', href: '/tools/url-encoder' },
            { label: 'UUID Generator', href: '/tools/uuid-generator' },
        ],
    },
    {
        title: 'Company',
        span: 'md:col-span-2',
        links: [
            { label: 'About', href: '/about' },
            // { label: 'Blog', href: '/blog' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
        ],
    },
];

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-sm" aria-label="Site footer">
            <div className="container-xl py-16">
                {/* Top row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                    {/* Brand column */}
                    <div className="md:col-span-3">
                        <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit" aria-label="Deepchill home">
                            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg text-sm">
                                D
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white">DEEPCHILL</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed mb-3">
                            A studio for ambitious products — crafted by one person, shipped for everyone.
                        </p>
                        <a
                            href="https://zhiyuanouyang.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-indigo-400 text-xs transition-colors inline-flex items-center gap-1 mb-6"
                            id="footer-developer-link"
                            aria-label="Visit developer personal website"
                        >
                            <span>Made by Zhiyuan Ouyang</span>
                            <span aria-hidden>↗</span>
                        </a>
                        <a
                            href="/products"
                            className="btn-secondary text-sm py-2.5 px-4 w-fit"
                            id="footer-browse-products"
                        >
                            Browse Products →
                        </a>
                    </div>

                    {/* Link columns */}
                    {FOOTER_LINKS.map((section) => (
                        <div key={section.title} className={section.span}>
                            <h3 className="text-slate-300 font-semibold text-sm mb-4 uppercase tracking-wider">
                                {section.title}
                            </h3>
                            <ul className={`space-y-3 ${section.columns === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 space-y-0' : ''}`}>
                                {section.links.map((link) => (
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
                        <Link href="/privacy" className="hover:text-slate-400 transition-colors" id="footer-privacy-link">Privacy</Link>
                        <Link href="/terms" className="hover:text-slate-400 transition-colors" id="footer-terms-link">Terms</Link>
                        <span>Built with Next.js · Deployed on Vercel</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
