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
    getTrendingProjects(undefined, 10, 0),
    getNewestProjects(undefined, 10, 0),
    getAllProjects(),
    getCategories(),
  ]);

  return (
    <Suspense>
      <DirectoryView
        initialTrendingProducts={initialTrending.products}
        initialTrendingTotal={initialTrending.total}
        initialNewestProducts={initialNewest.products}
        initialNewestTotal={initialNewest.total}
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />
    </Suspense>
  );
}
