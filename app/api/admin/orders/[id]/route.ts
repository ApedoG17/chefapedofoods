import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDeliverySMS, sendFeedbackSMS } from "@/lib/notifications";

interface UpdateOrderBody {
  orderStatus?: string;
  status?: string;
  cancellationReason?: string;
  rider_id?: string | null;
  riderId?: string | null;
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const orderId = resolvedParams.id;
    const body = (await request.json()) as UpdateOrderBody;
    const rawStatus = body.status || body.orderStatus;
    
    // Normalize status to valid database enum check constraints
    const newStatus =
      rawStatus === "completed"
        ? "delivered"
        : rawStatus === "out_for_delivery"
        ? "dispatched"
        : rawStatus;

    const adminSupabase = createAdminClient();

    const updatePayload: {
      order_status?: string;
      cancelled_at?: string;
      cancellation_reason?: string;
      rider_id?: string | null;
    } = {};

    if (newStatus) {
      updatePayload.order_status = newStatus;
      if (newStatus === "cancelled") {
        updatePayload.cancelled_at = new Date().toISOString();
        if (body.cancellationReason) {
          updatePayload.cancellation_reason = body.cancellationReason;
        }
      }
    }

    const riderIdToSet = body.rider_id !== undefined ? body.rider_id : body.riderId;
    if (riderIdToSet !== undefined) {
      updatePayload.rider_id = riderIdToSet;
    }


    const { data: updated, error } = await adminSupabase
      .from("orders")
      .update(updatePayload as any)
      .eq("id", orderId)
      .select(`
        id,
        order_status,
        cancellation_reason,
        customer:customers (
          name,
          phone
        )
      `)
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: error?.message || "Failed to update order status" },
        { status: 500 }
      );
    }

    // Trigger SMS notification automatically when order transitions to out_for_delivery / dispatched
    const customerPhone = (updated as any)?.customer?.phone;
    const customerName = (updated as any)?.customer?.name || "Customer";

    if (
      (newStatus === "out_for_delivery" || newStatus === "dispatched") &&
      customerPhone
    ) {
      // Fire asynchronously without blocking the client response
      sendDeliverySMS(customerPhone, customerName, updated.id).catch((err) => {
        console.error("Async SMS dispatch error:", err);
      });
    }

    // Trigger Feedback SMS rating link automatically when order is marked delivered/completed
    if (
      (newStatus === "completed" || newStatus === "delivered") &&
      customerPhone
    ) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chefapedofoods.com";
      sendFeedbackSMS(customerPhone, customerName, updated.id, baseUrl).catch((err) => {
        console.error("Async Feedback SMS dispatch error:", err);
      });
    }

    return NextResponse.json({ 
      success: true, 
      order: {
        ...updated,
        status: updated.order_status,
        customer_phone: customerPhone,
        customer_name: customerName,
      } 
    });
  } catch (err: any) {
    console.error("Admin order update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
