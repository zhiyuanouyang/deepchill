
export interface WebApp {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    longDescription: string;
    subdomain: string;
    launchUrl: string;
    category: AppCategory;
    tags: string[];
    keywords: string[];
    features: string[];
    imageUrl: string;
    icon: string;
    isNew?: boolean;
    comingSoon?: boolean;
    publishedAt: string;
}

export enum AppCategory {
    AI = 'Artificial Intelligence',
    PRODUCTIVITY = 'Productivity',
    DEVELOPER = 'Developer Tools',
    ANALYTICS = 'Analytics',
    GAMES = 'Games & Entertainment',
    FINANCE = 'Finance & Fintech',
    CONSUMER = 'Consumer',
    UTILITIES = 'Utilities',
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
}
