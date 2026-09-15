import Link from "next/link";
import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
}: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className={styles.viewAll}>
          {viewAllLabel} →
        </Link>
      )}
    </div>
  );
}
