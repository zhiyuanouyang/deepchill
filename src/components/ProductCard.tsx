import Link from "next/link";
import type { Product } from "@/lib/data";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  reason?: string;
}

export default function ProductCard({ product, reason }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <Link href={`/product/${product.slug}`} className={styles.link}>
        <div className={styles.top}>
          <span className={styles.logo} aria-hidden="true">
            {product.logo}
          </span>
          <div className={styles.info}>
            <h3 className={styles.name}>{product.name}</h3>
            <p className={styles.tagline}>{product.tagline}</p>
          </div>
        </div>
        <div className={styles.meta}>
          <span className={styles.category}>{product.category}</span>
          {product.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        {reason && <p className={styles.reason}>{reason}</p>}
        <span className={styles.action}>View →</span>
      </Link>
    </article>
  );
}
