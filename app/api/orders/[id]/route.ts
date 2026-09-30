import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const orderId = resolvedParams.id;

    if (
      !orderId ||
      typeof orderId !== "string" ||
      orderId.trim() === "" ||
      orderId === "[id]" ||
      orderId === "[orderId]" ||
      orderId.includes("[") ||
      orderId.includes("%5B")
    ) {
      return NextResponse.json(
        { error: "Invalid Order ID format" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data: order, error } = await (adminSupabase as any)
      .from("orders")
      .select(`
        id,
        order_status,
        payment_status,
        payment_method,
        paystack_reference,
        subtotal_pesewas,
        delivery_fee_pesewas,
        delivery_slot,
        created_at,
        rider_id,
        customer:customers (
          name,
          phone
        ),
        address:addresses (
          address,
          area
        ),
        rider:riders (
          id,
          full_name,
          phone_number
        ),
        items:order_items (
          id,
          quantity,
          base_price_pesewas,
          included_protein_package_name,
          meal:meals (
            name
          ),
          size:meal_sizes (
            size
          ),
          order_item_proteins (
            quantity,
            protein:protein_options (
              name
            )
          )
        )
      `)
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching order by ID:", error);
      return NextResponse.json(
        { error: "Failed to retrieve order" },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error("Order lookup route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
