import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName, name, next = '/' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const safeNext = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';

    const cleanDisplayName =
      (typeof displayName === 'string' && displayName.trim()) ||
      (typeof name === 'string' && name.trim()) ||
      email.trim().split('@')[0];

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}`,
        data: {
          display_name: cleanDisplayName,
          full_name: cleanDisplayName,
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    let profile = null;
    if (data.user) {
      const { data: upsertedProfile } = await supabase
        .from('profiles')
        .upsert(
          {
            uid: data.user.id,
            email: data.user.email,
            display_name: cleanDisplayName,
          },
          { onConflict: 'uid' }
        )
        .select('id, uid, display_name, email, created_at, updated_at')
        .maybeSingle();

      profile = upsertedProfile;
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      profile,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
