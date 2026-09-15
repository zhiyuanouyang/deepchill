import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import { categories } from "@/lib/data";
import { getProductsByCategory } from "@/lib/search";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(slug);

  return (
    <div className={styles.page}>
      <div className="container">
        <Link href="/categories" className={styles.back}>
          ← All categories
        </Link>

        <div className={styles.header}>
          <span className={styles.emoji} aria-hidden="true">
            {category.emoji}
          </span>
          <div>
            <h1 className={styles.title}>{category.name}</h1>
            <p className={styles.description}>{category.description}</p>
          </div>
        </div>

        <p className={styles.count}>
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>

        <ProductGrid
          products={products}
          emptyMessage="No products in this category yet."
        />
      </div>
    </div>
  );
}
