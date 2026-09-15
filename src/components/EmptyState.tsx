import styles from "./StateScreens.module.css";

interface EmptyStateProps {
  message?: string;
  icon?: string;
}

export default function EmptyState({
  message = "No products found.",
  icon = "🔍",
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
