import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const rawAmount = body.amount ?? body.price;
    const amount = Number(rawAmount);

    if (!amount || isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: 'Please specify a valid whole dollar bid amount of at least $1.' },
        { status: 400 }
      );
    }

    if (amount > 1000000) {
      return NextResponse.json(
        { error: 'Bid amount exceeds maximum limit ($1,000,000).' },
        { status: 400 }
      );
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // If not a valid UUID (e.g. local mock seed project like 'supabase' or 'coolify' before migration)
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({
        success: true,
        bid: {
          id: `local-bid-${Date.now()}`,
          project_id: id,
          price: amount,
          created_at: new Date().toISOString(),
        },
        totalBids: amount,
        updatedAt: new Date().toISOString(),
      });
    }

    const supabase = await createClient();

    // 1. Insert new bid record into public.bids
    // Database trigger 'on_bid_created_update_total' will automatically update public.total_bids
    // and 'on_bid_created_update_category_timestamp' will touch category updated_at.
    const { data: newBid, error: bidError } = await supabase
      .from('bids')
      .insert({
        project_id: id,
        price: amount,
      })
      .select()
      .single();

    if (bidError) {
      console.error('Error inserting bid:', bidError);
      return NextResponse.json({ error: bidError.message }, { status: 400 });
    }

    // 2. Fetch the newly computed total_bids record for this project
    const { data: totalBidsData, error: totalError } = await supabase
      .from('total_bids')
      .select('price, updated_at')
      .eq('project_id', id)
      .single();

    if (totalError) {
      console.warn('Notice fetching total_bids:', totalError.message);
    }

    return NextResponse.json({
      success: true,
      bid: newBid,
      totalBids: totalBidsData?.price ?? amount,
      updatedAt: totalBidsData?.updated_at ?? newBid.created_at ?? new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('Error in POST /api/projects/[id]/bids:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
