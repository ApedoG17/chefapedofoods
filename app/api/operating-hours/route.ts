import { NextResponse } from "next/server";
import { getAsapOperatingStatus } from "@/lib/operating-hours";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getAsapOperatingStatus(new Date());

  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
