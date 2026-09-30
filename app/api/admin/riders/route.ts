import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: riders, error } = await (supabase as any)
      .from("riders")
      .select("id, full_name, phone_number, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch riders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, riders: riders || [] });
  } catch (err: any) {
    console.error("Admin riders GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, phone_number } = body;

    if (!full_name || !phone_number) {
      return NextResponse.json(
        { error: "full_name and phone_number are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: newRider, error } = await (supabase as any)
      .from("riders")
      .insert({
        full_name: full_name.trim(),
        phone_number: phone_number.trim(),
        is_active: true,
      })
      .select("id, full_name, phone_number, is_active, created_at")
      .single();

    if (error) {
      console.error("Failed to create rider:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rider: newRider }, { status: 201 });
  } catch (err: any) {
    console.error("Admin riders POST error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
