import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({
        user: null,
        session: null,
      });
    }

    return NextResponse.json({
      user,
      session: {
        user,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        user: null,
        session: null,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
