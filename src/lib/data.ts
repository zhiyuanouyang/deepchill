export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo: string;
  url: string;
  category: string;
  tags: string[];
  featured: boolean;
  launchDate: string;
  founderName: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  emoji: string;
}

export const categories: Category[] = [
  {
    name: "Developer Tools",
    slug: "developer-tools",
    description: "Tools that help developers build, test, and ship software faster.",
    emoji: "⚡",
  },
  {
    name: "Design",
    slug: "design",
    description: "Products for designers, from prototyping to asset management.",
    emoji: "🎨",
  },
  {
    name: "Productivity",
    slug: "productivity",
    description: "Apps that help you stay organized, focused, and efficient.",
    emoji: "✅",
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "Tools to grow your audience, manage campaigns, and track results.",
    emoji: "📣",
  },
  {
    name: "Analytics",
    slug: "analytics",
    description: "Understand your users and make better decisions with data.",
    emoji: "📊",
  },
  {
    name: "Finance",
    slug: "finance",
    description: "Invoicing, payments, expense tracking, and financial planning.",
    emoji: "💰",
  },
  {
    name: "AI & ML",
    slug: "ai-ml",
    description: "Artificial intelligence and machine learning tools and platforms.",
    emoji: "🤖",
  },
  {
    name: "Communication",
    slug: "communication",
    description: "Stay connected with your team, customers, and community.",
    emoji: "💬",
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Shipfast",
    slug: "shipfast",
    tagline: "Ship your SaaS in days, not months",
    description:
      "Shipfast is a boilerplate and starter kit for indie hackers who want to launch their SaaS products quickly. It includes authentication, payments, email, SEO, and a beautiful landing page out of the box. Built with Next.js and designed for speed, Shipfast lets you focus on your core product instead of reinventing the wheel.",
    logo: "🚀",
    url: "https://shipfast.example.com",
    category: "Developer Tools",
    tags: ["boilerplate", "nextjs", "saas"],
    featured: true,
    launchDate: "2026-06-15",
    founderName: "Marc Lou",
  },
  {
    id: "2",
    name: "Pika",
    slug: "pika",
    tagline: "Beautiful screenshots in seconds",
    description:
      "Pika helps you create stunning browser mockups and screenshots for social media, documentation, and marketing materials. Drag and drop your screenshot, choose a background, and export. No design skills required. Perfect for indie makers who need polished visuals without opening Figma.",
    logo: "🖼️",
    url: "https://pika.example.com",
    category: "Design",
    tags: ["screenshots", "mockups", "marketing"],
    featured: true,
    launchDate: "2026-05-20",
    founderName: "Rishi Mohan",
  },
  {
    id: "3",
    name: "Plausible",
    slug: "plausible",
    tagline: "Simple, privacy-friendly web analytics",
    description:
      "Plausible is a lightweight, open-source alternative to Google Analytics. No cookies, fully GDPR compliant, and the script is under 1KB. See your traffic, top pages, referrers, and more — all in a clean, single-page dashboard. Built for founders who care about privacy and simplicity.",
    logo: "📈",
    url: "https://plausible.example.com",
    category: "Analytics",
    tags: ["privacy", "open-source", "lightweight"],
    featured: true,
    launchDate: "2026-03-10",
    founderName: "Uku Täht",
  },
  {
    id: "4",
    name: "Resend",
    slug: "resend",
    tagline: "Email API for developers",
    description:
      "Resend provides a modern email API built for developers. Send transactional and marketing emails with excellent deliverability. Beautiful React email templates, detailed logs, and a developer-first experience. Stop fighting with legacy email providers.",
    logo: "✉️",
    url: "https://resend.example.com",
    category: "Developer Tools",
    tags: ["email", "api", "transactional"],
    featured: true,
    launchDate: "2026-04-01",
    founderName: "Zeno Rocha",
  },
  {
    id: "5",
    name: "Cal.com",
    slug: "cal-com",
    tagline: "Scheduling infrastructure for everyone",
    description:
      "Cal.com is an open-source scheduling platform that lets you set up booking pages, manage availability, and integrate with your calendar. Teams, round-robin, and collective scheduling built in. A Calendly alternative that you can self-host.",
    logo: "📅",
    url: "https://cal.example.com",
    category: "Productivity",
    tags: ["scheduling", "open-source", "calendar"],
    featured: true,
    launchDate: "2026-02-18",
    founderName: "Peer Richelsen",
  },
  {
    id: "6",
    name: "Dub",
    slug: "dub",
    tagline: "Open-source link management for modern marketers",
    description:
      "Dub is a link management platform that helps you create, share, and track short links. Built-in analytics, custom domains, QR codes, and team collaboration. An open-source Bitly alternative designed for SaaS companies and content creators.",
    logo: "🔗",
    url: "https://dub.example.com",
    category: "Marketing",
    tags: ["links", "analytics", "open-source"],
    featured: true,
    launchDate: "2026-01-25",
    founderName: "Steven Tey",
  },
  {
    id: "7",
    name: "Lemon Squeezy",
    slug: "lemon-squeezy",
    tagline: "Payments, tax, and subscriptions for software companies",
    description:
      "Lemon Squeezy is a merchant of record that handles payments, global tax compliance, fraud prevention, and subscription management. Sell digital products and SaaS without worrying about VAT, sales tax, or payment infrastructure.",
    logo: "🍋",
    url: "https://lemonsqueezy.example.com",
    category: "Finance",
    tags: ["payments", "subscriptions", "tax"],
    featured: false,
    launchDate: "2026-07-05",
    founderName: "JR Farr",
  },
  {
    id: "8",
    name: "Mintlify",
    slug: "mintlify",
    tagline: "Beautiful documentation that converts",
    description:
      "Mintlify makes it easy to create beautiful, modern documentation for your product. Markdown-based, with built-in search, analytics, and API playground. Designed to help developer tools increase adoption through great docs.",
    logo: "📖",
    url: "https://mintlify.example.com",
    category: "Developer Tools",
    tags: ["documentation", "markdown", "developer-experience"],
    featured: false,
    launchDate: "2026-05-12",
    founderName: "Han Wang",
  },
  {
    id: "9",
    name: "Typefully",
    slug: "typefully",
    tagline: "Write, schedule, and grow on Twitter/X",
    description:
      "Typefully is a writing and scheduling tool for Twitter/X and LinkedIn. Draft threads, schedule posts, analyze performance, and grow your audience. A clean, distraction-free writing experience for creators and founders building in public.",
    logo: "✍️",
    url: "https://typefully.example.com",
    category: "Marketing",
    tags: ["social-media", "writing", "scheduling"],
    featured: false,
    launchDate: "2026-04-22",
    founderName: "Francesco Di Lorenzo",
  },
  {
    id: "10",
    name: "Novu",
    slug: "novu",
    tagline: "Open-source notification infrastructure",
    description:
      "Novu is an open-source notification infrastructure for developers. Manage email, SMS, push, and in-app notifications from a single API. Content management, user preferences, and delivery optimization built in.",
    logo: "🔔",
    url: "https://novu.example.com",
    category: "Communication",
    tags: ["notifications", "open-source", "api"],
    featured: false,
    launchDate: "2026-03-30",
    founderName: "Dima Grossman",
  },
  {
    id: "11",
    name: "Tinybird",
    slug: "tinybird",
    tagline: "Real-time analytics API over any data source",
    description:
      "Tinybird lets you build real-time data products with SQL. Ingest millions of events per second, query with SQL, and publish as high-concurrency APIs. Perfect for user-facing analytics, personalization, and real-time dashboards.",
    logo: "🐦",
    url: "https://tinybird.example.com",
    category: "Analytics",
    tags: ["real-time", "sql", "data-api"],
    featured: false,
    launchDate: "2026-06-08",
    founderName: "Jorge Gomez Sancha",
  },
  {
    id: "12",
    name: "Raycast",
    slug: "raycast",
    tagline: "A blazingly fast launcher for productive developers",
    description:
      "Raycast is a productivity tool that replaces Spotlight on macOS. Search files, control apps, run scripts, manage clipboard history, and use AI — all from a single keyboard shortcut. Extensible with a marketplace of community extensions.",
    logo: "⚙️",
    url: "https://raycast.example.com",
    category: "Productivity",
    tags: ["launcher", "macos", "extensions"],
    featured: false,
    launchDate: "2026-01-15",
    founderName: "Thomas Paul Mann",
  },
  {
    id: "13",
    name: "Cursor",
    slug: "cursor",
    tagline: "The AI-first code editor",
    description:
      "Cursor is a code editor built from the ground up with AI. Intelligent autocomplete, codebase-aware chat, multi-file editing, and natural language commands. A VS Code fork that makes AI a core part of the development workflow.",
    logo: "💻",
    url: "https://cursor.example.com",
    category: "AI & ML",
    tags: ["code-editor", "ai-coding", "developer-tools"],
    featured: false,
    launchDate: "2026-02-28",
    founderName: "Michael Truell",
  },
  {
    id: "14",
    name: "Framer",
    slug: "framer",
    tagline: "Design and publish stunning sites without code",
    description:
      "Framer is a no-code website builder for designers. Visual canvas editing, responsive design, CMS, animations, and one-click publishing. Build portfolio sites, landing pages, and marketing sites with design-quality results.",
    logo: "🎯",
    url: "https://framer.example.com",
    category: "Design",
    tags: ["no-code", "website-builder", "animation"],
    featured: false,
    launchDate: "2026-05-30",
    founderName: "Koen Bok",
  },
  {
    id: "15",
    name: "Crisp",
    slug: "crisp",
    tagline: "All-in-one customer messaging platform",
    description:
      "Crisp is a customer messaging platform that combines live chat, email, chatbots, and a knowledge base. Engage website visitors, support customers, and automate conversations — all from one shared inbox. Built for startups and SMBs.",
    logo: "💭",
    url: "https://crisp.example.com",
    category: "Communication",
    tags: ["live-chat", "customer-support", "chatbot"],
    featured: false,
    launchDate: "2026-04-15",
    founderName: "Baptiste Jamin",
  },
  {
    id: "16",
    name: "Logsnag",
    slug: "logsnag",
    tagline: "Track your product events in real time",
    description:
      "Logsnag lets you monitor your application with real-time event tracking. Get push notifications for signups, payments, errors, and custom events. A simple API to stay on top of what matters in your product.",
    logo: "📋",
    url: "https://logsnag.example.com",
    category: "Analytics",
    tags: ["event-tracking", "monitoring", "push-notifications"],
    featured: false,
    launchDate: "2026-07-10",
    founderName: "Shayan Kansy",
  },
  {
    id: "17",
    name: "Polar",
    slug: "polar",
    tagline: "Monetize your open-source projects",
    description:
      "Polar helps open-source maintainers monetize their work through subscriptions, sponsorships, and issue funding. Offer benefits to backers, manage tiers, and build a sustainable funding model for your project.",
    logo: "🌟",
    url: "https://polar.example.com",
    category: "Finance",
    tags: ["open-source", "monetization", "sponsorship"],
    featured: false,
    launchDate: "2026-06-20",
    founderName: "Birk Jernström",
  },
  {
    id: "18",
    name: "Trigger.dev",
    slug: "trigger-dev",
    tagline: "Background jobs for modern web apps",
    description:
      "Trigger.dev is a platform for running background jobs, scheduled tasks, and event-driven workflows in your application. Write jobs in TypeScript, deploy alongside your app, and monitor from a dashboard. No infrastructure to manage.",
    logo: "⏱️",
    url: "https://trigger.example.com",
    category: "Developer Tools",
    tags: ["background-jobs", "typescript", "serverless"],
    featured: false,
    launchDate: "2026-03-18",
    founderName: "Matt Aitken",
  },
  {
    id: "19",
    name: "Eraser",
    slug: "eraser",
    tagline: "Technical design docs and diagrams made easy",
    description:
      "Eraser is a collaborative workspace for engineering teams to create technical design documents, architecture diagrams, and flowcharts. Markdown-based editing with an AI diagramming assistant. Replace scattered docs and whiteboard photos.",
    logo: "📐",
    url: "https://eraser.example.com",
    category: "Design",
    tags: ["diagrams", "collaboration", "engineering"],
    featured: false,
    launchDate: "2026-08-01",
    founderName: "Shin Kim",
  },
  {
    id: "20",
    name: "Inbox Zero",
    slug: "inbox-zero",
    tagline: "AI-powered email management for busy founders",
    description:
      "Inbox Zero uses AI to help you reach and maintain inbox zero. Automated categorization, bulk unsubscribe, smart replies, and email analytics. Open-source and privacy-focused. Take back control of your inbox.",
    logo: "📬",
    url: "https://inboxzero.example.com",
    category: "AI & ML",
    tags: ["email", "automation", "open-source"],
    featured: false,
    launchDate: "2026-07-22",
    founderName: "Elie Steinbock",
  },
];
