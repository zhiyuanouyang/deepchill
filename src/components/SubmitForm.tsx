"use client";

import { useState, type FormEvent } from "react";
import { categories } from "@/lib/data";
import styles from "./SubmitForm.module.css";

export interface SubmittedProduct {
  id: string;
  name: string;
  slug: string;
  url: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  founderName: string;
  email: string;
  submittedAt: string;
  logo: string;
}

interface SubmitFormProps {
  onSuccess?: (product: SubmittedProduct) => void;
  initialData?: Partial<SubmittedProduct>;
}

export default function SubmitForm({ onSuccess, initialData }: SubmitFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    url: initialData?.url || "",
    tagline: initialData?.tagline || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    tagsInput: initialData?.tags?.join(", ") || "",
    founderName: initialData?.founderName || "",
    email: initialData?.email || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.url.trim()) newErrors.url = "Product URL is required.";
    else if (!/^https?:\/\/.+\..+/.test(formData.url.trim()))
      newErrors.url = "Enter a valid URL starting with http:// or https://";
    if (!formData.tagline.trim()) newErrors.tagline = "Tagline is required.";
    if (formData.tagline.length > 100) newErrors.tagline = "Tagline must be under 100 characters.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.category) newErrors.category = "Select a category.";
    if (!formData.founderName.trim()) newErrors.founderName = "Your name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      newErrors.email = "Enter a valid email address.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");

    // Simulate submission delay
    setTimeout(() => {
      const product: SubmittedProduct = {
        id: initialData?.id || `user-${Date.now()}`,
        name: formData.name.trim(),
        slug: formData.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        url: formData.url.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tagsInput
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        founderName: formData.founderName.trim(),
        email: formData.email.trim(),
        submittedAt: initialData?.submittedAt || new Date().toISOString(),
        logo: initialData?.logo || "🆕",
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem("deepchill_submissions") || "[]");
      const idx = existing.findIndex((p: SubmittedProduct) => p.id === product.id);
      if (idx >= 0) {
        existing[idx] = product;
      } else {
        existing.push(product);
      }
      localStorage.setItem("deepchill_submissions", JSON.stringify(existing));

      setStatus("success");
      onSuccess?.(product);
    }, 800);
  }

  function handleChange(
    field: string,
    value: string
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success}>
        <span className={styles.successIcon} aria-hidden="true">
          ✓
        </span>
        <h2 className={styles.successTitle}>Product submitted!</h2>
        <p className={styles.successText}>
          {formData.name} has been added to your dashboard. It will be reviewed and listed shortly.
        </p>
        <div className={styles.successActions}>
          <button
            className={styles.submitButton}
            onClick={() => {
              setStatus("idle");
              setFormData({
                name: "",
                url: "",
                tagline: "",
                description: "",
                category: "",
                tagsInput: "",
                founderName: "",
                email: "",
              });
            }}
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Product name <span className={styles.required}>*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            placeholder="My Awesome Tool"
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="url" className={styles.label}>
            Website URL <span className={styles.required}>*</span>
          </label>
          <input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => handleChange("url", e.target.value)}
            className={`${styles.input} ${errors.url ? styles.inputError : ""}`}
            placeholder="https://myproduct.com"
          />
          {errors.url && <p className={styles.error}>{errors.url}</p>}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="tagline" className={styles.label}>
          Tagline <span className={styles.required}>*</span>
        </label>
        <input
          id="tagline"
          type="text"
          value={formData.tagline}
          onChange={(e) => handleChange("tagline", e.target.value)}
          className={`${styles.input} ${errors.tagline ? styles.inputError : ""}`}
          placeholder="A short, compelling description (under 100 chars)"
          maxLength={100}
        />
        <div className={styles.fieldMeta}>
          {errors.tagline && <p className={styles.error}>{errors.tagline}</p>}
          <span className={styles.charCount}>{formData.tagline.length}/100</span>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description <span className={styles.required}>*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
          placeholder="What does your product do? Who is it for? What problem does it solve?"
          rows={5}
        />
        {errors.description && <p className={styles.error}>{errors.description}</p>}
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="category" className={styles.label}>
            Category <span className={styles.required}>*</span>
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className={`${styles.select} ${errors.category ? styles.inputError : ""}`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className={styles.error}>{errors.category}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="tags" className={styles.label}>
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tagsInput}
            onChange={(e) => handleChange("tagsInput", e.target.value)}
            className={styles.input}
            placeholder="saas, open-source, api (comma-separated)"
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="founderName" className={styles.label}>
            Your name <span className={styles.required}>*</span>
          </label>
          <input
            id="founderName"
            type="text"
            value={formData.founderName}
            onChange={(e) => handleChange("founderName", e.target.value)}
            className={`${styles.input} ${errors.founderName ? styles.inputError : ""}`}
            placeholder="Jane Doe"
          />
          {errors.founderName && <p className={styles.error}>{errors.founderName}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            placeholder="you@example.com"
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : initialData ? "Save Changes" : "Submit Product"}
      </button>
    </form>
  );
}
