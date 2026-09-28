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
      return NextResponse.json({
        user: null,
        session: null,
        profile: null,
      });
    }

    // Retrieve profile from public.profiles table
    let profile: Profile | null = null;
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, uid, display_name, email, created_at, updated_at')
      .eq('uid', user.id)
      .maybeSingle();

    if (profileData) {
      profile = profileData;
    } else {
      // Fallback: If not yet created by database trigger, insert or upsert it
      const fallbackDisplayName =
        (user.user_metadata?.display_name as string) ||
        (user.user_metadata?.full_name as string) ||
        user.email?.split('@')[0] ||
        'Maker';

      const { data: createdProfile } = await supabase
        .from('profiles')
        .upsert(
          {
            uid: user.id,
            email: user.email,
            display_name: fallbackDisplayName,
          },
          { onConflict: 'uid' }
        )
        .select('id, uid, display_name, email, created_at, updated_at')
        .maybeSingle();

      profile = createdProfile ?? {
        id: user.id,
        uid: user.id,
        display_name: fallbackDisplayName,
        email: user.email ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      user,
      session: {
        user,
      },
      profile,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        user: null,
        session: null,
        profile: null,
        error: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
