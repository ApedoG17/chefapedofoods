import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Privileged Service Role client bypasses RLS securely
    const supabase = createAdminClient();

    // Use ilike for case-insensitive matching (e.g., "pent10" matches "PENT10")
    const { data: promo, error } = await (supabase as any)
      .from("promo_codes")
      .select("id, code, discount_percentage, max_uses, current_uses, is_active")
      .ilike("code", code.trim())
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: "Invalid promo code." }, { status: 404 });
    }

    if (!promo.is_active) {
      return NextResponse.json({ error: "This promo code is no longer active." }, { status: 400 });
    }

    if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ error: "This promo code has reached its usage limit." }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      id: promo.id, 
      discount_percentage: promo.discount_percentage,
      code: promo.code,
    });
  } catch (error) {
    console.error("Promo Validation Error:", error);
    return NextResponse.json({ error: "Failed to validate promo code." }, { status: 500 });
  }
}
