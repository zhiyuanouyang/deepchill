import { Suspense } from 'react';
import { DirectoryView } from '@/components/directory-view';
import {
  getTrendingProjects,
  getNewestProjects,
  getAllProjects,
  getCategories,
} from '@/lib/server-data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [initialTrending, initialNewest, initialProducts, initialCategories] = await Promise.all([
    getTrendingProjects(),
    getNewestProjects(),
    getAllProjects(),
    getCategories(),
  ]);

  return (
    <Suspense>
      <DirectoryView
        initialTrendingProducts={initialTrending}
        initialNewestProducts={initialNewest}
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />
    </Suspense>
  );
}
