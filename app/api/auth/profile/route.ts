import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import type { Profile } from '@/lib/types';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, uid, display_name, email, created_at, updated_at')
      .eq('uid', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ profile });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name } = body;

    if (typeof display_name !== 'string' || !display_name.trim()) {
      return NextResponse.json(
        { error: 'Display name cannot be empty.' },
        { status: 400 }
      );
    }

    const cleanName = display_name.trim();

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .upsert(
        {
          uid: user.id,
          email: user.email,
          display_name: cleanName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'uid' }
      )
      .select('id, uid, display_name, email, created_at, updated_at')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ profile });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
