import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Provider } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, next = '/' } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'OAuth provider is required.' },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const safeNext = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    return NextResponse.json({
      url: data.url,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
