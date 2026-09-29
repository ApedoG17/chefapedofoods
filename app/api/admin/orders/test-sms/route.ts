import { NextResponse } from "next/server";
import { sendDeliverySMS } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 });
    }

    const sent = await sendDeliverySMS(phone, "Test Customer", "TEST-001");

    return NextResponse.json({ 
      success: sent, 
      message: sent 
        ? "Test SMS dispatched successfully!" 
        : "SMS dispatched in test mock mode (see console output)." 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Failed to trigger test SMS" }, { status: 500 });
  }
}
