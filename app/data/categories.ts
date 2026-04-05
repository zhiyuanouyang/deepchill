
export interface Category {
    slug: string;
    name: string;
    description: string;
    longDescription: string;
    keywords: string[];
    productSlugs: string[];
    blogSlugs: string[];
    emoji: string;
    color: string; // tailwind gradient class token
}

export const CATEGORIES: Category[] = [
    {
        slug: 'ai-tools',
        name: 'AI & Automation',
        emoji: '🤖',
        color: 'indigo',
        description: 'Products that harness machine learning and large language models to automate, assist, and augment what humans do.',
        longDescription: 'Explore AI-driven applications built on cutting-edge language models and machine intelligence. From smart assistants to fully automated workflows, these products push the boundaries of what software can do on your behalf.',
        keywords: [
            'AI tools',
            'AI-powered apps',
            'LLM applications',
            'machine learning products',
            'AI automation',
        ],
        productSlugs: ['interviewgpt', 'resumegpt'],
        blogSlugs: ['top-ai-tools-for-software-engineer-interview-prep'],
    },
    {
        slug: 'games',
        name: 'Games & Entertainment',
        emoji: '🎮',
        color: 'violet',
        description: 'Interactive experiences and games — from quick browser-based distractions to deeper narrative-driven adventures.',
        longDescription: 'Games and entertainment products built for pure enjoyment. Whether you have five minutes or five hours, these experiences are designed to engage, challenge, and delight across platforms.',
        keywords: [
            'indie games',
            'browser games',
            'entertainment apps',
            'interactive experiences',
            'casual games',
        ],
        productSlugs: [],
        blogSlugs: [],
    },
    {
        slug: 'finance',
        name: 'Finance & Fintech',
        emoji: '💰',
        color: 'emerald',
        description: 'Tools that help you understand, manage, and grow your money — built with clarity and simplicity in mind.',
        longDescription: 'Financial products designed to be approachable. From budgeting utilities to investment dashboards, these tools cut through complexity and put you in control of your financial picture without requiring a finance degree.',
        keywords: [
            'personal finance tools',
            'fintech apps',
            'budgeting software',
            'investment tracker',
            'money management',
        ],
        productSlugs: [],
        blogSlugs: [],
    },
    {
        slug: 'productivity',
        name: 'Productivity & Utilities',
        emoji: '⚡',
        color: 'amber',
        description: 'Everyday tools that trim the friction from your workflow — purpose-built to save time and reduce noise.',
        longDescription: 'Focused, fast, and opinionated productivity tools. The best utility is the one that disappears into your routine. These products are built lean so they get out of your way and let you do your best work.',
        keywords: [
            'productivity apps',
            'utility software',
            'workflow tools',
            'time-saving apps',
            'focus tools',
        ],
        productSlugs: ['resumegpt'],
        blogSlugs: [
            'how-to-ace-system-design-interview-2025',
            'behavioral-interview-questions-for-software-engineers',
        ],
    },
];
