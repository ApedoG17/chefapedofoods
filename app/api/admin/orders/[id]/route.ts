import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDeliverySMS } from "@/lib/notifications";

interface UpdateOrderBody {
  orderStatus?: string;
  status?: string;
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
    const newStatus = body.status || body.orderStatus;
    const adminSupabase = createAdminClient();

    const updatePayload: {
      order_status?: string;
      cancelled_at?: string;
      cancellation_reason?: string;
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

    const { data: updated, error } = await adminSupabase
      .from("orders")
      .update(updatePayload)
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
