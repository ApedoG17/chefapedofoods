/**
 * Mirrors the schema in docs/ARCHITECTURE.md and migrations 0001, 0002, 0003.
 * Kept in sync with Supabase migrations — RULES.md: no `any` for order/payment/menu data.
 */

export type OrderStatus =
  | "awaiting_payment"
  | "confirmed"
  | "preparing"
  | "ready_for_dispatch"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";
export type RefundStatus = "none" | "pending" | "refunded" | "failed";

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface Address {
  id: string;
  customer_id: string;
  address: string;
  area: string;
  delivery_zone_id: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string | null;
  available: boolean;
}

export interface MealSize {
  id: string;
  meal_id: string;
  size: "small" | "medium" | "large";
  base_price_pesewas: number;
}

export interface ProteinOption {
  id: string;
  name: string;
  additional_price_pesewas: number;
  available: boolean;
}

export interface ProteinPackage {
  id: string;
  meal_size_id: string;
  name: string;
}

export interface PackageItem {
  package_id: string;
  protein_id: string;
  quantity: number;
}

export interface Order {
  id: string;
  customer_id: string;
  address_id: string;
  delivery_slot: string;
  subtotal_pesewas: number;
  delivery_fee_pesewas: number;
  amount_paid_pesewas: number;
  payment_method: "paystack" | "hubtel" | "manual";
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  paystack_reference: string | null;
  created_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  refund_status: RefundStatus;
  paystack_refund_reference: string | null;
  rider_id?: string | null;
  promo_code_id?: string | null;
  original_amount?: number | null;
  discount_amount?: number | null;
  payment_collected?: boolean;
}

export interface Rider {
  id: string;
  full_name: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  rating: number;
  customer_comment: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  meal_id: string;
  size_id: string;
  quantity: number;
  base_price_pesewas: number;
  included_protein_package_name: string;
}

export interface OrderItemProtein {
  id: string;
  order_item_id: string;
  protein_id: string;
  quantity: number;
  additional_price_pesewas: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  areas: string[];
  fee_pesewas: number;
  active: boolean;
}

export interface KitchenSettings {
  id: string;
  open: boolean;
  daily_capacity: number;
  orders_today: number;
  orders_date: string;
}

// Official generated Database type from Supabase CLI
export type { Database } from "./database.types";


