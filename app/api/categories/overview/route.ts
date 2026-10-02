import { NextResponse } from 'next/server';
import { getCategoryOverview } from '@/lib/server-data';
export type { CategoryCardOverview } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategoryOverview();
    return NextResponse.json({ categories });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

