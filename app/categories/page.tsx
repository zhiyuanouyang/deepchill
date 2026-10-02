import type { Metadata } from 'next';
import { CategoriesView } from '@/components/categories-view';

import { getCategoryOverview } from '@/lib/server-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Categories — Deepchill Directory',
  description:
    'Browse all project categories on Deepchill. Discover the top-ranked indie and open-source projects across DevTools, AI & ML, Productivity, Design, Infrastructure, and more.',
  openGraph: {
    title: 'Categories — Deepchill Directory',
    description:
      'Browse all project categories on Deepchill. Discover the top-ranked indie and open-source projects across DevTools, AI & ML, Productivity, Design, Infrastructure, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Categories — Deepchill Directory',
    description:
      'Browse all project categories on Deepchill. Discover the top-ranked indie and open-source projects.',
  },
};

export default async function CategoriesPage() {
  const initialCategories = await getCategoryOverview();
  return <CategoriesView initialCategories={initialCategories} />;
}

