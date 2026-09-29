import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    const { data: orders, error } = await adminSupabase
      .from("orders")
      .select(`
        *,
        customer:customers (name, phone),
        address:addresses (address, area),
        items:order_items (
          id,
          quantity,
          base_price_pesewas,
          included_protein_package_name,
          meal:meals (name),
          size:meal_sizes (size),
          proteins:order_item_proteins (
            protein:protein_options (name, additional_price_pesewas)
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch orders" }, { status: 500 });
  }
}
