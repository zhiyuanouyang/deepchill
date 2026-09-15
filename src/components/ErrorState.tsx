import styles from "./StateScreens.module.css";

interface ErrorStateProps {
  message?: string;
}

export default function ErrorState({
  message = "Something went wrong. Please try again.",
}: ErrorStateProps) {
  return (
    <div className={styles.container} role="alert">
      <span className={styles.icon} aria-hidden="true">
        ⚠️
      </span>
      <p className={styles.messageError}>{message}</p>
    </div>
  );
}
