"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import ProductGrid from "@/components/ProductGrid";
import LoadingState from "@/components/LoadingState";
import { searchProducts, getAllProducts } from "@/lib/search";
import styles from "./page.module.css";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const results = query ? searchProducts(query) : getAllProducts();

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.searchSection}>
          <SearchBar defaultValue={query} defaultMode="search" />
        </div>

        <div className={styles.results}>
          <p className={styles.resultCount}>
            {query ? (
              <>
                {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
                <strong>&ldquo;{query}&rdquo;</strong>
              </>
            ) : (
              <>All products ({results.length})</>
            )}
          </p>
          <ProductGrid
            products={results}
            emptyMessage={`No products found for "${query}". Try a different search term.`}
          />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading search..." />}>
      <SearchContent />
    </Suspense>
  );
}
