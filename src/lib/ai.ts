import { products, type Product } from "./data";

export interface AIResult {
  product: Product;
  reason: string;
}

export interface AIResponse {
  summary: string;
  results: AIResult[];
}

const intentKeywords: Record<string, string[]> = {
  payments: ["payments", "pay", "billing", "subscription", "checkout", "revenue", "monetize", "money", "pricing", "stripe"],
  email: ["email", "mail", "newsletter", "transactional", "inbox", "smtp"],
  analytics: ["analytics", "tracking", "metrics", "data", "dashboard", "monitor", "insights", "stats", "traffic"],
  marketing: ["marketing", "social", "twitter", "growth", "audience", "content", "seo", "promote"],
  design: ["design", "ui", "ux", "mockup", "screenshot", "prototype", "visual", "website", "builder"],
  documentation: ["docs", "documentation", "readme", "guide", "api-docs", "knowledge"],
  scheduling: ["scheduling", "calendar", "booking", "appointment", "meetings", "time"],
  notifications: ["notification", "push", "alert", "messaging", "chat", "communicate"],
  "developer-tools": ["developer", "dev", "code", "coding", "api", "backend", "deploy", "ship", "launch", "build", "boilerplate"],
  productivity: ["productivity", "organize", "task", "workflow", "automate", "efficient"],
  "open-source": ["open-source", "oss", "free", "self-host", "self-hosted"],
  ai: ["ai", "artificial", "intelligence", "machine-learning", "ml", "gpt", "llm", "automation"],
  finance: ["finance", "invoice", "expense", "tax", "accounting", "funding"],
};

function extractIntent(query: string): string[] {
  const lower = query.toLowerCase();
  const matched: string[] = [];

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(intent);
    }
  }

  return matched;
}

function scoreProduct(product: Product, query: string, intents: string[]): number {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/).filter((w) => w.length > 2);
  let score = 0;

  // Direct name/tagline match
  for (const word of words) {
    if (product.name.toLowerCase().includes(word)) score += 8;
    if (product.tagline.toLowerCase().includes(word)) score += 5;
    if (product.description.toLowerCase().includes(word)) score += 2;
    if (product.tags.some((t) => t.includes(word))) score += 4;
  }

  // Intent matching
  for (const intent of intents) {
    const catSlug = product.category.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-");
    if (catSlug.includes(intent) || intent.includes(catSlug)) score += 6;
    if (product.tags.some((t) => t.includes(intent))) score += 4;
    const ikws = intentKeywords[intent] || [];
    for (const kw of ikws) {
      if (product.description.toLowerCase().includes(kw)) score += 1;
    }
  }

  return score;
}

function generateReason(product: Product, query: string, intents: string[]): string {
  const lower = query.toLowerCase();

  if (lower.includes("open-source") || lower.includes("self-host")) {
    if (product.tags.includes("open-source")) {
      return `${product.name} is open-source, which aligns with your preference for transparent, self-hostable tools.`;
    }
  }

  if (intents.includes("payments") || intents.includes("finance")) {
    if (product.category === "Finance") {
      return `${product.name} handles ${product.tags.join(", ")} — relevant to your financial needs.`;
    }
  }

  if (intents.includes("email")) {
    if (product.tags.some((t) => t.includes("email"))) {
      return `${product.name} specializes in email: "${product.tagline}".`;
    }
  }

  if (intents.includes("analytics")) {
    if (product.category === "Analytics") {
      return `${product.name} provides analytics capabilities: "${product.tagline}".`;
    }
  }

  if (intents.includes("developer-tools")) {
    if (product.category === "Developer Tools") {
      return `Built for developers — ${product.tagline.toLowerCase()}.`;
    }
  }

  if (intents.includes("design")) {
    if (product.category === "Design") {
      return `${product.name} helps with design workflows: "${product.tagline}".`;
    }
  }

  if (intents.includes("marketing")) {
    if (product.category === "Marketing") {
      return `${product.name} supports marketing efforts: "${product.tagline}".`;
    }
  }

  // Fallback
  return `${product.name} matches your query because it ${product.tagline.toLowerCase()}.`;
}

export async function aiDiscover(prompt: string): Promise<AIResponse> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

  if (!prompt.trim()) {
    return { summary: "", results: [] };
  }

  const intents = extractIntent(prompt);

  const scored = products
    .map((product) => ({
      product,
      score: scoreProduct(product, prompt, intents),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (scored.length === 0) {
    return {
      summary: `I couldn't find products matching "${prompt}". Try different keywords or browse our categories.`,
      results: [],
    };
  }

  const results: AIResult[] = scored.map(({ product }) => ({
    product,
    reason: generateReason(product, prompt, intents),
  }));

  const categoryNames = [...new Set(results.map((r) => r.product.category))];
  const summary = `Found ${results.length} product${results.length > 1 ? "s" : ""} across ${categoryNames.join(", ")} that match your query.`;

  return { summary, results };
}

export const suggestedPrompts = [
  "I need a simple analytics tool that respects user privacy",
  "What tools can help me launch a SaaS faster?",
  "Find me open-source alternatives for common dev tools",
  "I want to manage customer communications in one place",
  "Tools to grow my audience on social media",
  "Help me handle payments and tax compliance",
];
