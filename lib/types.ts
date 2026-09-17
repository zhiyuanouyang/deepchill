export type ProductCategory =
  | 'DevTools'
  | 'AI & Machine Learning'
  | 'Productivity'
  | 'Design & Creative'
  | 'Open Source Infrastructure'
  | 'SaaS & Analytics'
  | 'Security & Privacy'
  | 'Developer Utilities';

export type PricingModel = 'Free' | 'Freemium' | 'Open Source' | 'Paid';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  repoUrl?: string;
  category: ProductCategory;
  pricing: PricingModel;
  tags: string[];
  makerName: string;
  makerHandle?: string;
  makerAvatar?: string;
  logoUrl?: string;
  upvotes: number;
  featured?: boolean;
  launchDate: string;
  badgeCode?: string;
  starsCount?: number;
  dofollowApproved?: boolean;
}

export interface AiAskResponse {
  answer: string;
  recommendedProductIds: string[];
  keyTakeaways: string[];
  searchTags: string[];
}

export interface EnhanceSubmissionResponse {
  polishedTagline: string;
  suggestedTags: string[];
  seoAdvice: string;
}
