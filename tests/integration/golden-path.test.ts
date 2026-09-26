import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { calculateFoodSubtotalPesewas, formatGHS } from "@/lib/pricing";
import { isAreaServiceable, getDeliveryFeeForArea } from "@/lib/delivery";
import { POST as createOrderRoute } from "@/app/api/orders/route";
import { POST as initializePaymentRoute } from "@/app/api/payments/initialize/route";
import { POST as paystackWebhookRoute } from "@/app/api/webhooks/paystack/route";
import { PATCH as updateAdminOrderRoute } from "@/app/api/admin/orders/[id]/route";

// Mock Supabase admin client for deterministic end-to-end integration testing
const mockOrderState: Record<string, any> = {};
const mockKitchenSettings = {
  open: true,
  daily_capacity: 12,
  orders_today: 0,
  orders_date: new Date().toISOString().split("T")[0],
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "kitchen_settings") {
        return {
          select: () => ({
            limit: () => ({
              single: async () => ({
                data: mockKitchenSettings,
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "delivery_zones") {
        return {
          select: () => ({
            eq: async () => ({
              data: [
                {
                  id: "zone-a",
                  name: "Zone A (East Legon)",
                  areas: ["East Legon", "Shiashie"],
                  fee_pesewas: 1000,
                  active: true,
                },
              ],
              error: null,
            }),
          }),
        };
      }

      if (table === "meals") {
        return {
          select: () => ({
            in: async () => ({
              data: [{ id: "550e8400-e29b-41d4-a716-446655440001", name: "Jollof Rice", available: true }],
              error: null,
            }),
          }),
        };
      }

      if (table === "meal_sizes") {
        return {
          select: () => ({
            in: async () => ({
              data: [
                {
                  id: "size-med-1",
                  meal_id: "550e8400-e29b-41d4-a716-446655440001",
                  size: "medium",
                  base_price_pesewas: 7000,
                },
              ],
              error: null,
            }),
          }),
        };
      }

      if (table === "protein_options") {
        const result = {
          data: [
            { id: "prot-chicken", name: "Chicken", additional_price_pesewas: 1500, available: true },
            { id: "prot-sausage", name: "Sausage", additional_price_pesewas: 400, available: true },
            { id: "prot-egg", name: "Egg", additional_price_pesewas: 400, available: true },
            { id: "prot-fish", name: "Fish", additional_price_pesewas: 400, available: true },
          ],
          error: null,
        };
        return {
          select: () => Object.assign(Promise.resolve(result), {
            in: async () => result,
          }),
        };
      }

      if (table === "customers") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { name: "Godwin Apedo", phone: "0240000000" },
                error: null,
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: "cust-1", name: "Godwin Apedo", phone: "0240000000" },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "addresses") {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: "addr-1", area: "East Legon", address: "14 Boundary Road" },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "orders") {
        return {
          insert: (orderData: any) => ({
            select: () => ({
              single: async () => {
                const order = {
                  id: "order-golden-123",
                  ...orderData,
                  order_status: "awaiting_payment",
                  payment_status: "unpaid",
                  paystack_reference: "CAF-GOLDEN-REF-123",
                };
                Object.assign(mockOrderState, order);
                return { data: order, error: null };
              },
            }),
          }),
          select: () => ({
            eq: (_col: string, val: string) => ({
              single: async () => ({
                data: mockOrderState,
                error: null,
              }),
            }),
          }),
          update: (updatePayload: any) => ({
            eq: (_col: string, val: string) => {
              Object.assign(mockOrderState, updatePayload);
              return {
                select: () => ({
                  single: async () => ({
                    data: mockOrderState,
                    error: null,
                  }),
                }),
              };
            },
          }),
        };
      }

      if (table === "order_items") {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: "order-item-1" },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "order_item_proteins") {
        return {
          insert: async () => ({ data: null, error: null }),
        };
      }

      return {};
    },
    rpc: async (fn: string) => {
      if (fn === "increment_kitchen_orders") {
        mockKitchenSettings.orders_today += 1;
        return { data: true, error: null };
      }
      return { data: null, error: null };
    },
  }),
}));

// Mock timing rules so orders placed during tests are accepted
vi.mock("@/lib/business-rules/timing", () => ({
  isSameDayOrderAllowed: () => true,
  isWithinOrderingHours: () => true,
  getCurrentAccraTime: () => ({ hour: 8, minute: 30, isBeforeCutoff: true }),
}));

describe("Golden Path End-to-End Transaction Flow", () => {
  const secretKey = "sk_test_mock_secret_key";
  process.env.PAYSTACK_SECRET_KEY = secretKey;

  beforeEach(() => {
    mockKitchenSettings.orders_today = 0;
  });

  it("completes the full Golden Path from customization to delivery", async () => {
    // 1. Browse & Customize: Medium Jollof (7000 pesewas) + 1 Extra Chicken (+1500 pesewas)
    const foodSubtotal = calculateFoodSubtotalPesewas("medium", { chicken: 1 });
    expect(foodSubtotal).toBe(8500); // GH₵85.00
    expect(formatGHS(foodSubtotal)).toBe("GH₵85.00");

    // 2. Delivery zone & serviceability check: East Legon
    expect(isAreaServiceable("East Legon")).toBe(true);
    const zones = [
      { id: "zone-a", name: "Zone A", areas: ["East Legon"], feePesewas: 1000, active: true },
    ];
    const deliveryFee = getDeliveryFeeForArea("East Legon", zones);
    expect(deliveryFee).toBe(1000); // GH₵10.00
    expect(formatGHS(deliveryFee!)).toBe("GH₵10.00");

    // 3. Create Order via POST /api/orders
    const orderReq = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Godwin Apedo",
        phone: "0240000000",
        area: "East Legon",
        deliveryAddress: "14 Boundary Road",
        deliverySlot: "11:30 AM",
        items: [
          {
            mealId: "550e8400-e29b-41d4-a716-446655440001",
            size: "medium",
            includedProteinPackageName: "Chicken + Egg",
            extras: { chicken: 1 },
            quantity: 1,
          },
        ],
      }),
    });

    const orderRes = await createOrderRoute(orderReq);
    expect(orderRes.status).toBe(201);
    const orderData = await orderRes.json();

    expect(orderData.orderId).toBe("order-golden-123");
    expect(orderData.subtotalPesewas).toBe(8500);
    expect(orderData.deliveryFeePesewas).toBe(1000);
    expect(orderData.orderStatus).toBe("awaiting_payment");
    expect(orderData.paymentStatus).toBe("unpaid");

    // 4. Initialize Payment via POST /api/payments/initialize (mocking paystack fetch)
    const initReq = new Request("http://localhost:3000/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: orderData.orderId,
      }),
    });

    // Mock fetch for Paystack API initialize
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: {
          authorization_url: "https://checkout.paystack.com/mock-auth-url",
          access_code: "mock_code",
          reference: "CAF-GOLDEN-REF-123",
        },
      }),
    } as any);

    const initRes = await initializePaymentRoute(initReq);
    expect(initRes.status).toBe(200);
    const initData = await initRes.json();
    expect(initData.authorizationUrl).toBe("https://checkout.paystack.com/mock-auth-url");

    // 5. Paystack Webhook Confirmation via POST /api/webhooks/paystack
    const webhookPayload = JSON.stringify({
      event: "charge.success",
      data: {
        reference: "CAF-GOLDEN-REF-123",
        amount: 8500, // Exact subtotal in pesewas
        currency: "GHS",
        status: "success",
        metadata: {
          order_id: "order-golden-123",
        },
      },
    });

    const signature = crypto
      .createHmac("sha512", secretKey)
      .update(webhookPayload)
      .digest("hex");

    const webhookReq = new Request("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": signature,
      },
      body: webhookPayload,
    });

    const webhookRes = await paystackWebhookRoute(webhookReq);
    expect(webhookRes.status).toBe(200);

    // Verify order transitioned to confirmed & paid, and kitchen capacity incremented
    expect(mockOrderState.order_status).toBe("confirmed");
    expect(mockOrderState.payment_status).toBe("paid");
    expect(mockOrderState.amount_paid_pesewas).toBe(8500);
    expect(mockKitchenSettings.orders_today).toBe(1);

    // 6. Chef advances order lifecycle: Confirmed -> Preparing
    const prepReq = new Request("http://localhost:3000/api/admin/orders/order-golden-123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: "preparing" }),
    });
    const prepRes = await updateAdminOrderRoute(prepReq, {
      params: Promise.resolve({ id: "order-golden-123" }),
    });
    expect(prepRes.status).toBe(200);
    expect(mockOrderState.order_status).toBe("preparing");

    // 7. Chef marks Ready for Dispatch
    const readyReq = new Request("http://localhost:3000/api/admin/orders/order-golden-123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: "ready_for_dispatch" }),
    });
    const readyRes = await updateAdminOrderRoute(readyReq, {
      params: Promise.resolve({ id: "order-golden-123" }),
    });
    expect(readyRes.status).toBe(200);
    expect(mockOrderState.order_status).toBe("ready_for_dispatch");

    // 8. Chef marks Dispatched
    const dispatchReq = new Request("http://localhost:3000/api/admin/orders/order-golden-123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: "dispatched" }),
    });
    const dispatchRes = await updateAdminOrderRoute(dispatchReq, {
      params: Promise.resolve({ id: "order-golden-123" }),
    });
    expect(dispatchRes.status).toBe(200);
    expect(mockOrderState.order_status).toBe("dispatched");

    // 9. Rider delivers and marks Delivered
    const deliverReq = new Request("http://localhost:3000/api/admin/orders/order-golden-123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: "delivered" }),
    });
    const deliverRes = await updateAdminOrderRoute(deliverReq, {
      params: Promise.resolve({ id: "order-golden-123" }),
    });
    expect(deliverRes.status).toBe(200);
    expect(mockOrderState.order_status).toBe("delivered");
  });
});
