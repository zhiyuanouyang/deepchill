import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, display_name, descriptions, count, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .order('count', { ascending: false })
      .order('display_name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ categories: categories as Category[] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category_name, category_id } = body;

    if (!category_name && !category_id) {
      return NextResponse.json(
        { error: 'category_name or category_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const target = category_name || category_id;
    const { data: newCount, error } = await supabase.rpc('increment_category_count', {
      category_name: target,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: newCount });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
