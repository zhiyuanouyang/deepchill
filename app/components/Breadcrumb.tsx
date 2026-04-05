
import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
    return (
        <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${className}`}>
            <ol
                className="flex items-center gap-2 flex-wrap"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
            >
                <li
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                >
                    <Link
                        href="/"
                        itemProp="item"
                        className="text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span itemProp="name" className="sr-only">Home</span>
                    </Link>
                    <meta itemProp="position" content="1" />
                </li>

                {items.map((item, index) => (
                    <li
                        key={item.label}
                        className="flex items-center gap-2"
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        <svg className="w-3 h-3 text-slate-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {item.href && index < items.length - 1 ? (
                            <Link
                                href={item.href}
                                itemProp="item"
                                className="text-slate-500 hover:text-indigo-400 transition-colors"
                            >
                                <span itemProp="name">{item.label}</span>
                            </Link>
                        ) : (
                            <span
                                itemProp="name"
                                className="text-slate-300 font-medium"
                            >
                                {item.label}
                            </span>
                        )}
                        <meta itemProp="position" content={String(index + 2)} />
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
