"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  defaultValue?: string;
  defaultMode?: "search" | "ai";
  placeholder?: string;
  autoFocus?: boolean;
  large?: boolean;
  suggestedPrompts?: string[];
}

export default function SearchBar({
  defaultValue = "",
  defaultMode = "search",
  placeholder,
  autoFocus = false,
  large = false,
  suggestedPrompts = [],
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [mode, setMode] = useState<"search" | "ai">(defaultMode);
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      if (mode === "ai") {
        router.push(`/discover?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, mode, router]
  );

  const handlePromptClick = useCallback(
    (prompt: string) => {
      setQuery(prompt);
      setMode("ai");
      router.push(`/discover?q=${encodeURIComponent(prompt)}`);
    },
    [router]
  );

  const placeholderText =
    placeholder ||
    (mode === "ai"
      ? "Describe what you're looking for..."
      : "Search products, categories, tags...");

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs} role="tablist" aria-label="Search mode">
        <button
          role="tab"
          aria-selected={mode === "search"}
          className={`${styles.tab} ${mode === "search" ? styles.active : ""}`}
          onClick={() => setMode("search")}
          type="button"
        >
          Search
        </button>
        <button
          role="tab"
          aria-selected={mode === "ai"}
          className={`${styles.tab} ${mode === "ai" ? styles.active : ""}`}
          onClick={() => setMode("ai")}
          type="button"
        >
          Ask AI
        </button>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={`${styles.inputWrapper} ${large ? styles.large : ""}`}>
          <svg
            className={styles.icon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {mode === "ai" ? (
              <>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </>
            ) : (
              <>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </>
            )}
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholderText}
            className={styles.input}
            autoFocus={autoFocus}
            aria-label={mode === "ai" ? "Ask AI about products" : "Search products"}
          />
          {query && (
            <button
              type="button"
              className={styles.clear}
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
          <button type="submit" className={styles.submit} disabled={!query.trim()}>
            {mode === "ai" ? "Discover" : "Search"}
          </button>
        </div>
      </form>
      {suggestedPrompts.length > 0 && mode === "ai" && (
        <div className={styles.suggestions}>
          <span className={styles.suggestionsLabel}>Try asking:</span>
          <div className={styles.prompts}>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                className={styles.prompt}
                onClick={() => handlePromptClick(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
