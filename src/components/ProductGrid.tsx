import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  products: Product[];
  reasons?: Record<string, string>;
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  reasons,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          reason={reasons?.[product.id]}
        />
      ))}
    </div>
  );
}
