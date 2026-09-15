"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { aiDiscover, suggestedPrompts, type AIResponse } from "@/lib/ai";
import styles from "./page.module.css";

function DiscoverContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const runDiscovery = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const result = await aiDiscover(prompt);
      setResponse(result);
    } catch {
      setResponse({ summary: "Something went wrong. Please try again.", results: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query) {
      runDiscovery(query);
    }
  }, [query, runDiscovery]);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>AI Discovery</h1>
          <p className={styles.subtitle}>
            Describe what you need and let AI find the right products for you.
          </p>
        </div>

        <div className={styles.searchSection}>
          <SearchBar
            defaultValue={query}
            defaultMode="ai"
            suggestedPrompts={suggestedPrompts}
          />
        </div>

        <div className={styles.results}>
          {loading && (
            <LoadingState message="Finding the best products for you..." />
          )}

          {!loading && response && response.results.length > 0 && (
            <>
              <div className={styles.summary}>
                <p className={styles.summaryText}>{response.summary}</p>
              </div>
              <div className={styles.resultsList}>
                {response.results.map(({ product, reason }) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    reason={reason}
                  />
                ))}
              </div>
            </>
          )}

          {!loading && hasSearched && response && response.results.length === 0 && (
            <EmptyState
              icon="🤔"
              message={response.summary || "No matching products found. Try rephrasing your query."}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." />}>
      <DiscoverContent />
    </Suspense>
  );
}
