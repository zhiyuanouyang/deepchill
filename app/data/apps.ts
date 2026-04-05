
import { WebApp, AppCategory } from '@/app/types';

export const APPS_CATALOG: WebApp[] = [
    {
        id: '1',
        slug: 'interviewgpt',
        name: 'InterviewGPT',
        tagline: 'Ace your technical interviews with AI-powered coaching',
        description: 'AI-powered interview assistant that helps you prepare for and ace technical interviews with real-time feedback and personalized coaching.',
        longDescription: `InterviewGPT is the most comprehensive AI-powered interview preparation platform built for software engineers. Whether you're preparing for a FAANG coding round, a system design deep-dive, or a behavioral interview at your dream startup, InterviewGPT provides real-time AI feedback, adaptive practice sessions, and expert-curated question banks.

Unlike generic prep platforms, InterviewGPT simulates real interview conditions with an AI interviewer that asks follow-up questions, hints when you're stuck, and scores your answers on clarity, correctness, and communication. Practice coding challenges in 10+ languages, tackle system design problems with interactive diagrams, and get instant, actionable feedback after every session.

Join thousands of engineers who've used InterviewGPT to land offers at top tech companies. Start your free trial today and transform your interview performance.`,
        subdomain: 'interviewgpt.deepchill.app',
        launchUrl: 'https://interviewgpt.deepchill.app',
        category: AppCategory.AI,
        tags: ['Tech Interview', 'AI', 'Coding', 'System Design', 'Career'],
        keywords: [
            'AI technical interview prep',
            'coding interview practice with AI feedback',
            'system design interview preparation tool',
            'FAANG interview practice platform',
            'AI mock interview software engineer',
            'behavioral interview preparation AI',
            'LeetCode alternative with AI mentor',
            'technical interview coaching tool',
        ],
        features: [
            'Real-time AI feedback on code and explanations',
            'Adaptive 500+ question bank across coding, system design, SQL, and ML',
            'Live coding environment in 10+ programming languages',
            'System design whiteboard with AI guidance',
            'Behavioral interview with STAR-method scoring',
            'Detailed performance analytics and improvement tracking',
            'Company-specific interview tracks (Google, Meta, Amazon, etc.)',
            'MLSD, Frontend System Design, and SQL modules',
        ],
        imageUrl: 'https://picsum.photos/seed/interviewgpt/800/450',
        icon: 'https://interviewgpt.deepchill.app/logo.svg',
        isNew: true,
        publishedAt: '2025-01-15',
    },
    {
        id: '2',
        slug: 'resumegpt',
        name: 'ResumeGPT',
        tagline: 'Build ATS-proof resumes that get you interviews',
        description: 'AI-powered resume builder that crafts tailored, ATS-optimized resumes for software engineers and tech professionals.',
        longDescription: `ResumeGPT leverages cutting-edge AI to help software engineers and tech professionals craft compelling, ATS-optimized resumes that pass automated screening systems and impress human recruiters. Input your experience and target role, and ResumeGPT generates tailored bullet points, suggests impactful metrics, and formats everything to industry standards.

Built specifically for the tech industry, ResumeGPT understands the difference between a startup resume and a FAANG application. It analyzes job descriptions in real time, matches your skills to requirements, and highlights the most relevant experience for each application.

Stop sending generic resumes — start sending resumes that get callbacks.`,
        subdomain: 'resumegpt.deepchill.app',
        launchUrl: 'https://resumegpt.deepchill.app',
        category: AppCategory.AI,
        tags: ['Resume', 'AI', 'Career', 'ATS', 'Job Search'],
        keywords: [
            'AI resume builder for software engineers',
            'ATS-optimized resume generator',
            'tech resume AI tool',
            'resume builder for FAANG applications',
            'AI-powered resume writer',
            'resume optimization for developers',
        ],
        features: [
            'ATS keyword optimization per job description',
            'AI-generated bullet points with quantified impact',
            'Tech-industry specific templates',
            'Real-time job description matching',
            'Multi-format export (PDF, Word, JSON)',
            'Resume scoring and gap analysis',
        ],
        imageUrl: 'https://picsum.photos/seed/resumegpt/800/450',
        icon: '/icons/resumegpt.svg',
        comingSoon: true,
        publishedAt: '2025-06-01',
    },
];
