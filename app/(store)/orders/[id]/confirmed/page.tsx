import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined };
}

export default async function OrderConfirmedPage(props: PageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const resolvedSearchParams = await Promise.resolve(props.searchParams);
  const orderId = resolvedParams.id;
  const isMock = resolvedSearchParams.mock === "true";

  // In mock mode, mark order confirmed
  if (isMock) {
    try {
      const adminSupabase = createAdminClient();
      await adminSupabase
        .from("orders")
        .update({
          order_status: "confirmed",
          payment_status: "paid",
          amount_paid_pesewas: 7000,
        })
        .eq("id", orderId);
    } catch (e) {
      console.warn("Could not mark mock order paid:", e);
    }
  }

  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (value) queryParams.set(key, value);
  }
  queryParams.set("new", "true");

  redirect(`/order/${orderId}?${queryParams.toString()}`);
}
