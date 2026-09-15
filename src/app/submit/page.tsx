import type { Metadata } from "next";
import SubmitForm from "@/components/SubmitForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Submit Your Product",
  description: "Share your product with the deepchill community. Get discovered by makers, founders, and early adopters.",
};

export default function SubmitPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Submit your product</h1>
            <p className={styles.subtitle}>
              Share what you&apos;ve built with a community of makers and early adopters.
              We&apos;ll review your submission and list it on the platform.
            </p>
          </div>
          <SubmitForm />
        </div>
      </div>
    </div>
  );
}
