import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ownerships')
      .select('id, user_id, project_id, domain, verified_at, created_at');

    if (error) {
      // If table doesn't exist yet or other query error, gracefully return empty list
      return NextResponse.json({
        success: true,
        verifiedProjectIds: [],
        ownerships: [],
        tableReady: false,
      });
    }

    const verifiedProjectIds = (data || []).map((row: { project_id: string }) => row.project_id);

    return NextResponse.json({
      success: true,
      verifiedProjectIds,
      ownerships: data || [],
      tableReady: true,
    });
  } catch (err: unknown) {
    console.error('Error fetching ownerships in GET /api/projects/ownerships:', err);
    return NextResponse.json(
      { success: false, verifiedProjectIds: [], ownerships: [], error: 'Failed to fetch ownerships' },
      { status: 500 }
    );
  }
}
