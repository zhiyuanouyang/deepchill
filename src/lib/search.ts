import { products, type Product } from "./data";

export function searchProducts(query: string): Product[] {
  if (!query.trim()) return [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) return [];

  return products
    .map((product) => {
      const searchable = [
        product.name,
        product.tagline,
        product.description,
        product.category,
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (product.name.toLowerCase().includes(term)) score += 10;
        if (product.tagline.toLowerCase().includes(term)) score += 5;
        if (product.category.toLowerCase().includes(term)) score += 4;
        if (product.tags.some((t) => t.toLowerCase().includes(term))) score += 3;
        if (product.description.toLowerCase().includes(term)) score += 1;
        if (!searchable.includes(term)) score -= 5;
      }

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(
    (p) => p.category.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-") === categorySlug
  );
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export function getAllProducts(): Product[] {
  return [...products];
}
