import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validation/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isAreaServiceable,
  getDeliveryFeeForArea,
} from "@/lib/delivery";
import { isSameDayOrderAllowed } from "@/lib/business-rules/timing";

/**
 * POST /api/orders — creates an order in `awaiting_payment` status.
 *
 * Server-side business rules enforced here (per docs/PRD.md §10 and RULES.md):
 *   1. Kitchen must be open (kitchen_settings.open)
 *   2. Daily capacity not yet reached (kitchen_settings.orders_today < daily_capacity)
 *   3. Requested delivery slot respects same-day cutoff (10:00 AM Accra time)
 *   4. Delivery area is serviceable and not in EXCLUDED_DELIVERY_AREAS
 *   5. Delivery fee is derived server-side from active DeliveryZone
 *   6. All selected meals and protein options are active (`available = true`)
 *   7. Price is recalculated authoritatively server-side — never trust client totals
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    // 1. Validate payload structure
    const parseResult = createOrderSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const orderData = parseResult.data;
    const adminSupabase = createAdminClient();

    // 2. Kitchen Status & Capacity check
    const { data: kitchenSettings, error: kitchenError } = await adminSupabase
      .from("kitchen_settings")
      .select("open, daily_capacity, orders_today, orders_date")
      .limit(1)
      .single();

    if (kitchenError || !kitchenSettings) {
      return NextResponse.json(
        { error: "Could not retrieve kitchen operational status" },
        { status: 500 }
      );
    }

    if (!kitchenSettings.open) {
      return NextResponse.json(
        { error: "Kitchen is currently closed. We are not accepting new orders right now." },
        { status: 409 }
      );
    }

    // Capacity check: if orders today already reached capacity
    if (kitchenSettings.orders_today >= kitchenSettings.daily_capacity) {
      return NextResponse.json(
        { error: "Today's orders are full. Daily capacity reached." },
        { status: 409 }
      );
    }

    // 3. Cutoff Rule (Rule 3): Same-day orders close at 10:00 AM Accra time
    // For MVP, orders default to same-day delivery slots
    if (!isSameDayOrderAllowed()) {
      return NextResponse.json(
        {
          error:
            "Same-day order cutoff (10:00 AM) has passed. Please contact us on WhatsApp for special requests.",
        },
        { status: 409 }
      );
    }

    // 4. Delivery Area & Fee Lookup (Rule 2 & 7)
    if (!isAreaServiceable(orderData.area)) {
      return NextResponse.json(
        { error: "We currently do not deliver to this area. Please select another location." },
        { status: 422 }
      );
    }

    const { data: zones, error: zonesError } = await adminSupabase
      .from("delivery_zones")
      .select("id, name, areas, fee_pesewas, active")
      .eq("active", true);

    if (zonesError || !zones || zones.length === 0) {
      return NextResponse.json(
        { error: "Delivery zones are currently unavailable" },
        { status: 500 }
      );
    }

    const deliveryFeePesewas = getDeliveryFeeForArea(orderData.area, zones);
    if (deliveryFeePesewas === null) {
      return NextResponse.json(
        { error: "We currently do not deliver to this area. Please select another location." },
        { status: 422 }
      );
    }

    const matchedZone = zones.find((z) =>
      z.areas.some(
        (a) => a.trim().toLowerCase() === orderData.area.trim().toLowerCase()
      )
    );

    if (!matchedZone) {
      return NextResponse.json(
        { error: "Delivery zone matching failed" },
        { status: 422 }
      );
    }

    // 5. Meals and Sizes Validation (Rule 6: Stock & Availability)
    const mealIds = [...new Set(orderData.items.map((i) => i.mealId))];
    const { data: meals, error: mealsError } = await adminSupabase
      .from("meals")
      .select("id, name, available")
      .in("id", mealIds);

    if (mealsError || !meals) {
      return NextResponse.json(
        { error: "Could not retrieve meal information" },
        { status: 500 }
      );
    }

    for (const mealId of mealIds) {
      const meal = meals.find((m) => m.id === mealId);
      if (!meal) {
        return NextResponse.json(
          { error: `Meal with ID ${mealId} does not exist` },
          { status: 400 }
        );
      }
      if (!meal.available) {
        return NextResponse.json(
          { error: `"${meal.name}" is currently out of stock.` },
          { status: 409 }
        );
      }
    }

    const { data: mealSizes, error: sizesError } = await adminSupabase
      .from("meal_sizes")
      .select("id, meal_id, size, base_price_pesewas")
      .in("meal_id", mealIds);

    if (sizesError || !mealSizes) {
      return NextResponse.json(
        { error: "Could not retrieve meal size pricing" },
        { status: 500 }
      );
    }

    const { data: proteinOptions, error: proteinsError } = await adminSupabase
      .from("protein_options")
      .select("id, name, additional_price_pesewas, available");

    if (proteinsError || !proteinOptions) {
      return NextResponse.json(
        { error: "Could not retrieve protein options" },
        { status: 500 }
      );
    }

    // 6. Recalculate Subtotal Authoritatively
    let calculatedSubtotalPesewas = 0;
    const preparedOrderItems: {
      mealId: string;
      sizeId: string;
      quantity: number;
      basePricePesewas: number;
      includedProteinPackageName: string;
      proteins: { proteinId: string; quantity: number; additionalPricePesewas: number }[];
    }[] = [];

    for (const item of orderData.items) {
      const sizeRow = mealSizes.find(
        (ms) => ms.meal_id === item.mealId && ms.size === item.size
      );

      if (!sizeRow) {
        return NextResponse.json(
          { error: `Size "${item.size}" is not valid for this meal.` },
          { status: 400 }
        );
      }

      let itemExtrasTotal = 0;
      const itemProteinsToInsert: {
        proteinId: string;
        quantity: number;
        additionalPricePesewas: number;
      }[] = [];

      if (item.extras) {
        const extraKeys = Object.keys(item.extras) as (keyof typeof item.extras)[];
        for (const key of extraKeys) {
          const qty = item.extras[key] ?? 0;
          if (qty > 0) {
            // Find protein by name case-insensitively
            const option = proteinOptions.find(
              (po) => po.name.toLowerCase() === key.toLowerCase()
            );

            if (!option) {
              return NextResponse.json(
                { error: `Extra protein "${key}" does not exist` },
                { status: 400 }
              );
            }

            if (!option.available) {
              return NextResponse.json(
                { error: `Protein "${option.name}" is currently out of stock.` },
                { status: 409 }
              );
            }

            itemExtrasTotal += option.additional_price_pesewas * qty;
            itemProteinsToInsert.push({
              proteinId: option.id,
              quantity: qty,
              additionalPricePesewas: option.additional_price_pesewas,
            });
          }
        }
      }

      const itemTotal = (sizeRow.base_price_pesewas + itemExtrasTotal) * item.quantity;
      calculatedSubtotalPesewas += itemTotal;

      preparedOrderItems.push({
        mealId: item.mealId,
        sizeId: sizeRow.id,
        quantity: item.quantity,
        basePricePesewas: sizeRow.base_price_pesewas,
        includedProteinPackageName: item.includedProteinPackageName,
        proteins: itemProteinsToInsert,
      });
    }

    // 7. Persist Customer, Address, Order, and Items
    const { data: customer, error: custErr } = await adminSupabase
      .from("customers")
      .insert({
        name: orderData.customerName,
        phone: orderData.phone,
      })
      .select("id")
      .single();

    if (custErr || !customer) {
      return NextResponse.json(
        { error: "Failed to record customer details" },
        { status: 500 }
      );
    }

    const fullAddress = orderData.landmark
      ? `${orderData.deliveryAddress} (Landmark: ${orderData.landmark})`
      : orderData.deliveryAddress;

    const { data: address, error: addrErr } = await adminSupabase
      .from("addresses")
      .insert({
        customer_id: customer.id,
        address: fullAddress,
        area: orderData.area,
        delivery_zone_id: matchedZone.id,
      })
      .select("id")
      .single();

    if (addrErr || !address) {
      return NextResponse.json(
        { error: "Failed to record delivery address" },
        { status: 500 }
      );
    }

    // Generate unique internal payment reference ahead of time (e.g. CAF-<timestamp>-<random>)
    const generatedReference = `CAF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: order, error: orderErr } = await adminSupabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        address_id: address.id,
        delivery_slot: orderData.deliverySlot,
        subtotal_pesewas: calculatedSubtotalPesewas,
        delivery_fee_pesewas: deliveryFeePesewas,
        amount_paid_pesewas: 0,
        payment_method: "hubtel",
        payment_status: "unpaid",
        order_status: "awaiting_payment",
        paystack_reference: generatedReference,
        refund_status: "none",
      })
      .select("id, subtotal_pesewas, delivery_fee_pesewas, order_status, payment_status, paystack_reference")
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Insert order items and extra proteins
    for (const preparedItem of preparedOrderItems) {
      const { data: orderItem, error: itemErr } = await adminSupabase
        .from("order_items")
        .insert({
          order_id: order.id,
          meal_id: preparedItem.mealId,
          size_id: preparedItem.sizeId,
          quantity: preparedItem.quantity,
          base_price_pesewas: preparedItem.basePricePesewas,
          included_protein_package_name: preparedItem.includedProteinPackageName,
        })
        .select("id")
        .single();

      if (itemErr || !orderItem) {
        return NextResponse.json(
          { error: "Failed to record order item" },
          { status: 500 }
        );
      }

      for (const protein of preparedItem.proteins) {
        await adminSupabase.from("order_item_proteins").insert({
          order_item_id: orderItem.id,
          protein_id: protein.proteinId,
          quantity: protein.quantity,
          additional_price_pesewas: protein.additionalPricePesewas,
        });
      }
    }

    // 8. Return successfully created order in awaiting_payment state
    return NextResponse.json(
      {
        orderId: order.id,
        subtotalPesewas: order.subtotal_pesewas,
        deliveryFeePesewas: order.delivery_fee_pesewas,
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        paystackReference: order.paystack_reference,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your order" },
      { status: 500 }
    );
  }
}
