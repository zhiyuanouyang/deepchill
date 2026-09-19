import React from 'react';
import { Metadata } from 'next';
import { INITIAL_PRODUCTS } from '@/data/initial-products';
import { Product } from '@/lib/types';
import { DirectoryProductPage } from '@/components/directory-product-page';

interface PageProps {
  params: Promise<{ 'product-name': string }>;
}

function findProductBySlug(slug: string): Product | undefined {
  const normalized = decodeURIComponent(slug).toLowerCase().trim();
  return (
    INITIAL_PRODUCTS.find((p) => p.id.toLowerCase() === normalized) ||
    INITIAL_PRODUCTS.find(
      (p) =>
        p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') === normalized
    )
  );
}

export async function generateStaticParams() {
  return INITIAL_PRODUCTS.map((p) => ({
    'product-name': p.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = resolvedParams['product-name'];
  const product = findProductBySlug(rawSlug);

  if (!product) {
    const cleanName = rawSlug.replace(/-/g, ' ');
    return {
      title: `${cleanName} | OpenIndie Directory`,
      description: `Explore ${cleanName} on OpenIndie Product Directory.`,
    };
  }

  const title = `${product.name} – ${product.tagline} | OpenIndie Directory`;
  const description = `${product.name}: ${product.tagline}. Explore key features, pricing, verified DoFollow backlink, and community reviews.`;
  const canonicalUrl = `https://indiedirectory.dev/directory/${product.id}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category,
      product.pricing,
      ...(product.tags || []),
      'indie directory',
      'developer tools',
      'open source software',
      'DoFollow backlink',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'OpenIndie Directory',
      images: product.logoUrl
        ? [
            {
              url: product.logoUrl,
              width: 256,
              height: 256,
              alt: `${product.name} logo`,
            },
          ]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      creator: product.makerHandle || '@openindie',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function ProductLandingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams['product-name'];
  const product = findProductBySlug(rawSlug);

  // If statically not found, create a fallback product object based on slug
  // The client DirectoryProductPage component will hydrate the full product from localStorage if it was recently submitted
  const activeProduct: Product =
    product || {
      id: rawSlug,
      name: rawSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      tagline: 'An innovative indie product listed on OpenIndie Directory.',
      description:
        'This product was submitted to the OpenIndie Directory. Browse features, verified backlinks, and community discussions.',
      websiteUrl: 'https://indiedirectory.dev',
      category: 'DevTools',
      pricing: 'Open Source',
      tags: ['Indie', 'DevTools'],
      makerName: 'Indie Maker',
      upvotes: 1,
      clicks: 0,
      launchDate: new Date().toISOString().split('T')[0],
      dofollowApproved: true,
    };

  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.category === activeProduct.category && p.id !== activeProduct.id
  ).slice(0, 4);

  // Schema.org Structured Data
  const jsonLdSoftwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: activeProduct.name,
    headline: activeProduct.tagline,
    description: activeProduct.description,
    applicationCategory: activeProduct.category,
    operatingSystem: 'Web, Cloud',
    url: activeProduct.websiteUrl,
    author: {
      '@type': 'Person',
      name: activeProduct.makerName,
    },
    offers: {
      '@type': 'Offer',
      price:
        activeProduct.pricing === 'Free' || activeProduct.pricing === 'Open Source'
          ? '0'
          : '9.00',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: Math.max(activeProduct.upvotes, 1),
    },
  };

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://indiedirectory.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Directory',
        item: 'https://indiedirectory.dev',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: activeProduct.category,
        item: `https://indiedirectory.dev/?category=${encodeURIComponent(activeProduct.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: activeProduct.name,
        item: `https://indiedirectory.dev/directory/${activeProduct.id}`,
      },
    ],
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${activeProduct.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${activeProduct.name} is a ${activeProduct.category} product designed for modern teams. ${activeProduct.tagline}`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the pricing model for ${activeProduct.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${activeProduct.name} operates under a ${activeProduct.pricing} pricing model.`,
        },
      },
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <DirectoryProductPage
        initialProduct={activeProduct}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
