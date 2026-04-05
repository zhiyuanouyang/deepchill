
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
        name: 'AI Tools',
        emoji: '🤖',
        color: 'indigo',
        description: 'AI-powered tools that leverage large language models to supercharge your productivity and career growth.',
        longDescription: 'Explore our suite of AI-powered applications built on cutting-edge large language models. From interview coaching to resume building, our AI tools adapt to your needs and provide personalized, real-time feedback that generic tools can\'t match.',
        keywords: [
            'AI tools for software engineers',
            'AI-powered productivity apps',
            'LLM-powered career tools',
            'artificial intelligence SaaS tools',
            'AI career acceleration tools',
        ],
        productSlugs: ['interviewgpt', 'resumegpt'],
        blogSlugs: ['top-ai-tools-for-software-engineer-interview-prep'],
    },
    {
        slug: 'interview-prep',
        name: 'Interview Prep',
        emoji: '🎯',
        color: 'rose',
        description: 'Tools and resources to help software engineers prepare for technical and behavioral interviews at top tech companies.',
        longDescription: 'The technical interview landscape is demanding and competitive. Our interview preparation tools are purpose-built for software engineers targeting FAANG and top-tier tech companies. From coding challenges to system design simulations, we cover every dimension of the modern technical interview.',
        keywords: [
            'software engineer interview preparation',
            'technical interview prep tools',
            'FAANG interview practice',
            'coding interview practice platform',
            'system design interview practice',
        ],
        productSlugs: ['interviewgpt'],
        blogSlugs: [
            'how-to-ace-system-design-interview-2025',
            'leetcode-vs-ai-interview-prep-which-is-better',
            'behavioral-interview-questions-for-software-engineers',
            'how-to-prepare-for-machine-learning-system-design-interview',
        ],
    },
    {
        slug: 'career-growth',
        name: 'Career Growth',
        emoji: '🚀',
        color: 'emerald',
        description: 'Resources and tools to accelerate your software engineering career — from landing your first role to reaching Staff Engineer.',
        longDescription: 'Whether you\'re a new grad trying to land your first software job or a senior engineer aiming for Staff or Principal, career growth requires deliberate practice, strong positioning, and the right tools. Our career growth resources help you at every stage.',
        keywords: [
            'software engineer career growth',
            'how to get promoted to senior engineer',
            'software engineering career resources',
            'tech career acceleration',
            'developer career tools',
        ],
        productSlugs: ['interviewgpt', 'resumegpt'],
        blogSlugs: [
            'top-ai-tools-for-software-engineer-interview-prep',
            'behavioral-interview-questions-for-software-engineers',
        ],
    },
];
