import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          deepchill
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/search" className={styles.navLink}>
            Explore
          </Link>
          <Link href="/categories" className={styles.navLink}>
            Categories
          </Link>
          <Link href="/submit" className={styles.submitLink}>
            Submit
          </Link>
        </nav>
      </div>
    </header>
  );
}
