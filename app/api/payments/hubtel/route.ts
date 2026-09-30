import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items = [], customerDetails = {}, subtotal, deliveryFee } = body;

    // Normalize customer details supporting both nested customerDetails and flat body
    const customerName = (customerDetails.name || body.customerName || "Customer").trim();
    const phone = (customerDetails.phone || body.phone || "").trim();
    const deliveryAddress = (customerDetails.address || customerDetails.deliveryAddress || body.deliveryAddress || "").trim();
    const area = (customerDetails.area || body.area || "East Legon").trim();
    const landmark = (customerDetails.notes || customerDetails.landmark || body.landmark || "").trim();
    const deliverySlot = (customerDetails.deliverySlot || body.deliverySlot || "11:30 AM").trim();

    // Calculate subtotal and delivery fee in integer pesewas
    const calculatedSubtotal = Number(subtotal || body.subtotal_pesewas || 0);
    const calculatedDeliveryFee = Number(deliveryFee || body.delivery_fee_pesewas || 1000);

    const supabase = createAdminClient();

    // 1. Create or lookup customer in Supabase
    let customerId: string | null = null;
    if (phone) {
      try {
        const { data: customer, error: customerErr } = await supabase
          .from("customers")
          .upsert(
            { name: customerName, phone },
            { onConflict: "phone" }
          )
          .select("id")
          .single();

        if (!customerErr && customer) {
          customerId = customer.id;
        }
      } catch {
        // Fall back to insert if upsert is unsupported
      }
    }

    if (!customerId) {
      const { data: newCustomer, error: newCustErr } = await supabase
        .from("customers")
        .insert({ name: customerName, phone: phone || "0240000000" })
        .select("id")
        .single();

      if (newCustErr || !newCustomer) {
        throw new Error(newCustErr?.message || "Could not register customer");
      }
      customerId = newCustomer.id;
    }

    // 2. Find matching delivery zone for address foreign key
    const { data: zones } = await supabase
      .from("delivery_zones")
      .select("id, areas, fee_pesewas")
      .eq("active", true);

    let zoneId = zones?.[0]?.id;
    if (zones && zones.length > 0) {
      const normArea = area.toLowerCase();
      const matched = zones.find((z) =>
        z.areas?.some((a: string) => a.toLowerCase() === normArea)
      );
      if (matched) zoneId = matched.id;
    }

    if (!zoneId) {
      const { data: allZones } = await supabase
        .from("delivery_zones")
        .select("id");
      zoneId = allZones?.[0]?.id || "00000000-0000-0000-0000-000000000000";
    }


    // 3. Record delivery address
    const { data: address, error: addressErr } = await supabase
      .from("addresses")
      .insert({
        customer_id: customerId,
        address: deliveryAddress || area,
        area: area,
        delivery_zone_id: zoneId!,
      })
      .select("id")
      .single();

    if (addressErr || !address) {
      throw new Error(addressErr?.message || "Could not record delivery address");
    }

    // 4. Generate reference code for tracking
    const hubtelClientRef = `HUBTEL-${Date.now().toString(36).toUpperCase()}`;

    // 5. Insert order into Supabase with 'hubtel' payment method
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        address_id: address.id,
        delivery_slot: deliverySlot,
        subtotal_pesewas: calculatedSubtotal,
        delivery_fee_pesewas: calculatedDeliveryFee,
        amount_paid_pesewas: 0,
        payment_method: "hubtel",
        payment_status: "unpaid",
        order_status: "awaiting_payment",
        paystack_reference: hubtelClientRef,
        refund_status: "none",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || "Failed to create order record in Supabase");
    }

    // 6. Insert individual order items
    if (Array.isArray(items) && items.length > 0) {
      const { data: dbMeals } = await supabase.from("meals").select("id, name");
      const { data: dbSizes } = await supabase.from("meal_sizes").select("id, size, meal_id");

      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUUID = (val?: string | null): boolean => typeof val === "string" && UUID_REGEX.test(val);

      const defaultMealId = dbMeals?.[0]?.id;
      const defaultSizeId = dbSizes?.find((s) => s.meal_id === defaultMealId)?.id || dbSizes?.[0]?.id;

      for (const it of items) {
        let matchedMealId = it.mealId;
        if (!isValidUUID(matchedMealId)) {
          const found = dbMeals?.find((m) => m.name.toLowerCase().includes((it.name || "").toLowerCase()));
          matchedMealId = found?.id || defaultMealId;
        }

        let matchedSizeId = it.sizeId;
        if (!isValidUUID(matchedSizeId)) {
          const requestedSize = (it.size || "medium").toLowerCase();
          const foundSize = dbSizes?.find(
            (s) => s.meal_id === matchedMealId && s.size.toLowerCase() === requestedSize
          );
          matchedSizeId = foundSize?.id || dbSizes?.find((s) => s.meal_id === matchedMealId)?.id || defaultSizeId;
        }

        const unitPrice = Number(it.price || it.base_price_pesewas || 4500);

        if (matchedMealId && matchedSizeId) {
          const { data: insertedItem } = await supabase
            .from("order_items")
            .insert({
              order_id: order.id,
              meal_id: matchedMealId,
              size_id: matchedSizeId,
              quantity: Number(it.quantity || 1),
              base_price_pesewas: unitPrice,
              included_protein_package_name: it.includedProteinPackageName || it.proteinPackage || "",
            })
            .select("id")
            .single();

          if (insertedItem && it.extras && typeof it.extras === "object") {
            const { data: dbProteins } = await supabase.from("protein_options").select("id, name");
            for (const [key, qty] of Object.entries(it.extras)) {
              const count = Number(qty);
              if (count > 0 && dbProteins) {
                const matchedProtein = dbProteins.find((p) => p.name.toLowerCase().includes(key.toLowerCase()));
                if (matchedProtein) {
                  await supabase.from("order_item_proteins").insert({
                    order_item_id: insertedItem.id,
                    protein_id: matchedProtein.id,
                    quantity: count,
                    additional_price_pesewas: 400 * count,
                  });
                }
              }
            }
          }
        }
      }
    }


    // 7. Prepare the Hubtel API Payload
    // Hubtel expects amounts in Ghana Cedis (e.g. 70.00 for GH₵70), not pesewas
    // Prepay food subtotal online per the split model
    const amountInGHS = (calculatedSubtotal / 100).toFixed(2);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chefapedofoods.vercel.app";

    const hubtelPayload = {
      totalAmount: amountInGHS,
      description: `Chef Apedo Foods Order ${order.id}`,
      callbackUrl: `${baseUrl}/api/webhooks/hubtel`,
      returnUrl: `${baseUrl}/order/${order.id}`,
      merchantAccountNumber: process.env.HUBTEL_MERCHANT_ID || "placeholder_merchant_id",
      cancellationUrl: `${baseUrl}/checkout`,
      clientReference: order.id,
    };

    // 8. Request Checkout URL from Hubtel
    const clientId = process.env.HUBTEL_CLIENT_ID || "";
    const clientSecret = process.env.HUBTEL_CLIENT_SECRET || "";
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const hubtelResponse = await fetch("https://payproxyapi.hubtel.com/items/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(hubtelPayload),
    });

    const hubtelData = await hubtelResponse.json().catch(() => null);

    if (hubtelData && hubtelData.responseCode === "0000" && hubtelData.data?.checkoutUrl) {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        checkoutUrl: hubtelData.data.checkoutUrl,
      });
    } else {
      // Hubtel placeholder keys / gateway rejection
      console.warn("Hubtel initiation response:", hubtelData);
      return NextResponse.json(
        {
          success: false,
          orderId: order.id,
          message:
            hubtelData?.message ||
            "Hubtel payment gateway initialization failed with current credentials.",
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("Hubtel Init Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Payment gateway error." },
      { status: 500 }
    );
  }
}
