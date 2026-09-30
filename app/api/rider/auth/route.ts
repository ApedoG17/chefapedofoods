import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phoneNumber = body.phone_number || body.phone;

    if (!phoneNumber || typeof phoneNumber !== "string" || !phoneNumber.trim()) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const rawPhone = phoneNumber.trim();
    const cleanPhone = rawPhone.replace(/[\s\-()]/g, "");
    const altPhone = cleanPhone.startsWith("0")
      ? "+233" + cleanPhone.slice(1)
      : cleanPhone.startsWith("+233")
      ? "0" + cleanPhone.slice(4)
      : cleanPhone;

    const supabase = createAdminClient();

    const { data: rider, error } = await (supabase as any)
      .from("riders")
      .select("id, full_name, phone_number, is_active")
      .or(`phone_number.eq.${rawPhone},phone_number.eq.${cleanPhone},phone_number.eq.${altPhone}`)
      .limit(1)
      .maybeSingle();

    if (error || !rider) {
      return NextResponse.json({ error: "Rider not found. Contact Admin." }, { status: 404 });
    }

    if (!rider.is_active) {
      return NextResponse.json({ error: "Your account is currently deactivated." }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      rider: {
        id: rider.id,
        full_name: rider.full_name,
        phone_number: rider.phone_number,
        is_active: rider.is_active,
      },
    });
  } catch (error) {
    console.error("Rider Auth Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
