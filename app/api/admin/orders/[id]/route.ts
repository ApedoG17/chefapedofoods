import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface UpdateOrderBody {
  orderStatus?: string;
  cancellationReason?: string;
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const orderId = resolvedParams.id;
    const body = (await request.json()) as UpdateOrderBody;
    const adminSupabase = createAdminClient();

    const updatePayload: {
      order_status?: string;
      cancelled_at?: string;
      cancellation_reason?: string;
    } = {};

    if (body.orderStatus) {
      updatePayload.order_status = body.orderStatus;
      if (body.orderStatus === "cancelled") {
        updatePayload.cancelled_at = new Date().toISOString();
        if (body.cancellationReason) {
          updatePayload.cancellation_reason = body.cancellationReason;
        }
      }
    }

    const { data: updated, error } = await adminSupabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select("id, order_status, cancellation_reason")
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Admin order update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
