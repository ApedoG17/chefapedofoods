import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (val?: string | null): boolean => typeof val === "string" && UUID_REGEX.test(val);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items = [],
      customerDetails = {},
      subtotal,
      deliveryFee,
      promo_code_id,
      original_amount,
      discount_amount,
    } = body;

    // Normalize customer details supporting both nested customerDetails and flat body
    const customerName = (customerDetails.name || body.customerName || "Customer").trim();
    const phone = (customerDetails.phone || body.phone || "").trim();
    const deliveryAddress = (customerDetails.address || customerDetails.deliveryAddress || body.deliveryAddress || "").trim();
    const area = (customerDetails.area || body.area || "East Legon").trim();
    const landmark = (customerDetails.notes || customerDetails.landmark || body.landmark || "").trim();
    const deliverySlot = (customerDetails.deliverySlot || body.deliverySlot || "11:30 AM").trim();

    // 1. Calculate the final total in pesewas to guarantee integrity
    const calculatedSubtotal = Number(subtotal || body.subtotal_pesewas || 0);
    const calculatedDeliveryFee = Number(deliveryFee || body.delivery_fee_pesewas || 1000);

    const supabase = createAdminClient();

    // 2. Ensure customer record exists
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

    // 3. Find matching delivery zone for address foreign key
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


    // 4. Record delivery address
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

    // 5. Generate human-readable reference code
    const manualRef = `MANUAL-${Date.now().toString(36).toUpperCase()}`;

    // 6. Insert parent order into Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        address_id: address.id,
        delivery_slot: deliverySlot,
        subtotal_pesewas: calculatedSubtotal,
        delivery_fee_pesewas: calculatedDeliveryFee,
        amount_paid_pesewas: 0,
        payment_method: (body.paymentMethod as any) || "manual",
        payment_status: "unpaid",
        order_status: "awaiting_payment",
        paystack_reference: manualRef,
        refund_status: "none",
        promo_code_id: isValidUUID(promo_code_id) ? promo_code_id : null,
        original_amount: original_amount !== undefined ? Number(original_amount) : calculatedSubtotal,
        discount_amount: discount_amount !== undefined ? Number(discount_amount) : 0,
      } as any)
      .select("id")
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || "Failed to create order record");
    }

    // Increment promo code usage count if a promo code was applied
    if (isValidUUID(promo_code_id)) {
      try {
        const { data: promoData } = await (supabase as any)
          .from("promo_codes")
          .select("current_uses")
          .eq("id", promo_code_id)
          .single();

        if (promoData) {
          await (supabase as any)
            .from("promo_codes")
            .update({ current_uses: (promoData.current_uses || 0) + 1 })
            .eq("id", promo_code_id);
        }
      } catch (promoErr) {
        console.warn("Could not increment promo code usage:", promoErr);
      }
    }

    // 7. Format and insert individual order items
    if (Array.isArray(items) && items.length > 0) {
      // Fetch available meals and sizes to resolve valid IDs if needed
      const { data: dbMeals } = await supabase.from("meals").select("id, name");
      const { data: dbSizes } = await supabase.from("meal_sizes").select("id, size, meal_id");

      const defaultMealId = dbMeals?.[0]?.id;
      const defaultSizeId = dbSizes?.find((s) => s.meal_id === defaultMealId)?.id || dbSizes?.[0]?.id;

      for (const it of items) {
        // Resolve meal ID: check if it is already a UUID or look up by name
        let matchedMealId = it.mealId;
        if (!isValidUUID(matchedMealId)) {
          const found = dbMeals?.find((m) => m.name.toLowerCase().includes((it.name || "").toLowerCase()));
          matchedMealId = found?.id || defaultMealId;
        }

        // Resolve size ID
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

          // Extra proteins if provided in extras dictionary
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

    // 8. Return the generated Order ID for the frontend redirect
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("Manual Order Creation Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create order." },
      { status: 500 }
    );
  }
}

