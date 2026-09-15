import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGrid from "@/components/ProductGrid";
import SectionHeader from "@/components/SectionHeader";
import { getProductBySlug, getRelatedProducts } from "@/lib/search";
import { products } from "@/lib/data";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} — ${product.tagline}`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product);

  return (
    <div className={styles.page}>
      <div className="container">
        <Link href="/search" className={styles.back}>
          ← Back to explore
        </Link>

        <div className={styles.content}>
          <div className={styles.main}>
            <div className={styles.header}>
              <span className={styles.logo} aria-hidden="true">
                {product.logo}
              </span>
              <div>
                <h1 className={styles.name}>{product.name}</h1>
                <p className={styles.tagline}>{product.tagline}</p>
              </div>
            </div>

            <div className={styles.description}>
              <p>{product.description}</p>
            </div>

            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span className={styles.categoryPill}>{product.category}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tags</span>
                <div className={styles.tags}>
                  {product.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Built by</span>
                <span className={styles.metaValue}>{product.founderName}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Launched</span>
                <span className={styles.metaValue}>
                  {new Date(product.launchDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              Visit {product.name} →
            </a>
          </div>
        </div>

        {related.length > 0 && (
          <div className={styles.related}>
            <SectionHeader
              title="Related products"
              subtitle={`More in ${product.category}`}
            />
            <ProductGrid products={related} />
          </div>
        )}
      </div>
    </div>
  );
}
