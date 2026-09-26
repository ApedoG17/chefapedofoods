import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const adminSupabase = createAdminClient();

    const [settingsRes, mealsRes, proteinsRes] = await Promise.all([
      adminSupabase.from("kitchen_settings").select("*").limit(1).single(),
      adminSupabase.from("meals").select("id, name, available").order("name"),
      adminSupabase.from("protein_options").select("id, name, available").order("name"),
    ]);

    return NextResponse.json({
      kitchenSettings: settingsRes.data,
      meals: mealsRes.data || [],
      proteins: proteinsRes.data || [],
    });
  } catch (err: any) {
    console.error("Admin kitchen fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch kitchen data" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const adminSupabase = createAdminClient();

    // Toggle kitchen settings (open, daily_capacity)
    if (body.kitchenSettings) {
      const { open, daily_capacity } = body.kitchenSettings;
      const updateData: {
        open?: boolean;
        daily_capacity?: number;
      } = {};
      if (typeof open === "boolean") updateData.open = open;
      if (typeof daily_capacity === "number") updateData.daily_capacity = daily_capacity;

      const { data: settings } = await adminSupabase
        .from("kitchen_settings")
        .select("id")
        .limit(1)
        .single();

      if (settings) {
        await adminSupabase
          .from("kitchen_settings")
          .update(updateData)
          .eq("id", settings.id);
      }
    }

    // Toggle meal availability
    if (body.mealId && typeof body.available === "boolean") {
      await adminSupabase
        .from("meals")
        .update({ available: body.available })
        .eq("id", body.mealId);
    }

    // Toggle protein availability
    if (body.proteinId && typeof body.available === "boolean") {
      await adminSupabase
        .from("protein_options")
        .update({ available: body.available })
        .eq("id", body.proteinId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin kitchen update error:", err);
    return NextResponse.json({ error: "Failed to update kitchen settings" }, { status: 500 });
  }
}
