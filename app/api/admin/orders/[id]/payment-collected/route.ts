import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PATCH /api/admin/orders/[id]/payment-collected
 * Marks a manual order's payment as collected (by rider or admin).
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Verify order exists
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, payment_method, payment_status, payment_collected')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_collected) {
      return NextResponse.json({ message: 'Payment already marked as collected' }, { status: 200 });
    }

    // Update payment_collected and payment_status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_collected: true,
        payment_status: 'paid',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update payment status:', updateError);
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Payment marked as collected' });
  } catch (err) {
    console.error('Payment collection error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
