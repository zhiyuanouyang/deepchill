"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { SubmittedProduct } from "@/components/SubmitForm";
import EmptyState from "@/components/EmptyState";
import styles from "./page.module.css";

export default function DashboardPage() {
  const [products, setProducts] = useState<SubmittedProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("deepchill_submissions");
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
    setLoaded(true);
  }, []);

  function handleDelete(id: string) {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("deepchill_submissions", JSON.stringify(updated));
  }

  if (!loaded) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p className={styles.loadingText}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Manage your submitted products.
            </p>
          </div>
          <Link href="/submit" className={styles.addButton}>
            + Submit new
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon="📦"
            message="You haven't submitted any products yet. Share what you've built!"
          />
        ) : (
          <div className={styles.list}>
            {products.map((product) => (
              <div key={product.id} className={styles.card}>
                <div className={styles.cardMain}>
                  <span className={styles.logo} aria-hidden="true">
                    {product.logo}
                  </span>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardName}>{product.name}</h3>
                    <p className={styles.cardTagline}>{product.tagline}</p>
                    <div className={styles.cardMeta}>
                      <span className={styles.categoryPill}>
                        {product.category}
                      </span>
                      <span className={styles.date}>
                        Submitted{" "}
                        {new Date(product.submittedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionLink}
                  >
                    Visit ↗
                  </a>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className={styles.deleteButton}
                    aria-label={`Delete ${product.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{products.length}</span>
              <span className={styles.statLabel}>Product{products.length !== 1 ? "s" : ""} submitted</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>—</span>
              <span className={styles.statLabel}>Total views</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>—</span>
              <span className={styles.statLabel}>Click-throughs</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
