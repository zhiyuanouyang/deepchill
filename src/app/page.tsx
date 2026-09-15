import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ProductGrid from "@/components/ProductGrid";
import SectionHeader from "@/components/SectionHeader";
import { getFeaturedProducts } from "@/lib/search";
import { categories } from "@/lib/data";
import { suggestedPrompts } from "@/lib/ai";
import styles from "./page.module.css";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.headline}>
              Discover your next favorite tool.
            </h1>
            <p className={styles.subheadline}>
              Curated products from indie makers, SaaS founders, and independent developers.
            </p>
            <div className={styles.searchWrapper}>
              <SearchBar
                large
                autoFocus
                suggestedPrompts={suggestedPrompts.slice(0, 3)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.section}>
        <div className="container">
          <SectionHeader
            title="Featured"
            subtitle="Hand-picked products worth exploring"
            viewAllHref="/search"
            viewAllLabel="Explore all"
          />
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* Browse by Category */}
      <section className={styles.section}>
        <div className="container">
          <SectionHeader
            title="Browse by category"
            viewAllHref="/categories"
          />
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={styles.categoryCard}
              >
                <span className={styles.categoryEmoji} aria-hidden="true">
                  {cat.emoji}
                </span>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Submit CTA */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle}>Built something?</h2>
            <p className={styles.ctaText}>
              Share your product with a community of makers and early adopters.
            </p>
            <Link href="/submit" className={styles.ctaButton}>
              Submit your product →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
