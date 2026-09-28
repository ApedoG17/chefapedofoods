import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Hubtel payload structure: Data object contains clientReference, responseCode, status
    const data = body.Data || body.data || body;
    const clientReference = data.clientReference || data.client_reference || data.orderId;
    const responseCode = data.responseCode || data.response_code;
    const status = data.status;

    if (!clientReference) {
      return NextResponse.json(
        { message: "Missing clientReference in webhook payload" },
        { status: 400 }
      );
    }

    // responseCode '0000' or status 'Success' indicates confirmed payment
    if (responseCode === "0000" || status === "Success") {
      const supabase = createAdminClient();

      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update({
          order_status: "confirmed",
          payment_status: "paid",
        })
        .eq("id", clientReference)
        .select("id, order_status, payment_status")
        .single();

      if (error) {
        console.error("Failed to update order status from Hubtel webhook:", error);
        throw error;
      }

      return NextResponse.json(
        {
          message: "Order confirmed successfully",
          orderId: clientReference,
          status: updatedOrder?.order_status,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Payment not successful or pending", status },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Hubtel Webhook Error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
