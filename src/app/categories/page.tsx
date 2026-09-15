import Link from "next/link";
import type { Metadata } from "next";
import { categories } from "@/lib/data";
import { getProductsByCategory } from "@/lib/search";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse products by category — developer tools, design, productivity, and more.",
};

export default function CategoriesPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>Browse products by what they do.</p>
        </div>

        <div className={styles.grid}>
          {categories.map((cat) => {
            const count = getProductsByCategory(cat.slug).length;
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={styles.card}
              >
                <span className={styles.emoji} aria-hidden="true">
                  {cat.emoji}
                </span>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardName}>{cat.name}</h2>
                  <p className={styles.cardDescription}>{cat.description}</p>
                  <span className={styles.count}>
                    {count} product{count !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
