import { Suspense } from 'react';
import { DirectoryView } from '@/components/directory-view';

export default function Home() {
  return (
    <Suspense>
      <DirectoryView />
    </Suspense>
  );
}
