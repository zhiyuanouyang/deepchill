import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              deepchill
            </Link>
            <p className={styles.tagline}>
              Discover tools built by independent makers.
            </p>
          </div>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Discover</h4>
            <Link href="/search" className={styles.link}>Explore</Link>
            <Link href="/discover" className={styles.link}>AI Discovery</Link>
            <Link href="/categories" className={styles.link}>Categories</Link>
          </div>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>For Makers</h4>
            <Link href="/submit" className={styles.link}>Submit Product</Link>
            <Link href="/dashboard" className={styles.link}>Dashboard</Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} deepchill. Built for indie makers.
          </p>
        </div>
      </div>
    </footer>
  );
}
