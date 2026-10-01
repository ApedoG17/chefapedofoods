import { z } from "zod";
import { isAreaServiceable } from "@/lib/delivery";

export const ghanaPhoneRegex = /^(?:\+233|0)[25]\d{8}$/;

/**
 * Validates a Ghanaian mobile phone number against national telecom formats
 * (MTN 024/054/055/059/053, Telecel 020/050, AT 027/057/026/056)
 */
export function isValidGhanaPhone(input: string): boolean {
  if (!input) return false;
  const cleaned = input.replace(/[\s\-()]/g, "");
  return ghanaPhoneRegex.test(cleaned);
}

/**
 * Validates that a customer full name has realistic length, contains alphabetic characters,
 * and is not pure numbers (e.g. "8584") or random punctuation.
 */
export function isValidFullName(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && /[a-zA-Z]/.test(trimmed) && !/^\d+$/.test(trimmed);
}

/**
 * Strips HTML tags and script contents, trimming whitespace to prevent Cross-Site Scripting (XSS) injection.
 */
export const sanitizeHTML = (val: string): string =>
  val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .trim();

export const orderItemExtrasSchema = z.object({
  chicken: z.number().int().nonnegative().optional().default(0),
  sausage: z.number().int().nonnegative().optional().default(0),
  egg: z.number().int().nonnegative().optional().default(0),
  fish: z.number().int().nonnegative().optional().default(0),
});

export const orderItemSchema = z.object({
  mealId: z.string().uuid("Invalid meal ID format"),
  size: z.enum(["small", "medium", "large"], {
    errorMap: () => ({ message: "Size must be small, medium, or large" }),
  }),
  includedProteinPackageId: z.string().uuid().optional(),
  includedProteinPackageName: z
    .string()
    .min(1, "Included protein selection is required")
    .transform(sanitizeHTML),
  extras: orderItemExtrasSchema.optional().default({}),
  quantity: z.number().int().positive("Quantity must be at least 1").default(1),
});

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .transform(sanitizeHTML)
    .refine((val) => val.length >= 2, {
      message: "Name must be at least 2 characters",
    })
    .refine((val) => val.length <= 100, {
      message: "Name is too long",
    })
    .refine((val) => isValidFullName(val), {
      message: "Please enter a valid full name with letters (e.g. Kwame Mensah)",
    }),
  phone: z
    .string()
    .trim()
    .transform(sanitizeHTML)
    .refine((val) => isValidGhanaPhone(val), {
      message: "Please enter a valid Ghana phone number (e.g. 024 000 0000)",
    }),
  area: z
    .string()
    .trim()
    .transform(sanitizeHTML)
    .refine((val) => val.length >= 2, {
      message: "Area is required",
    })
    .refine((area) => isAreaServiceable(area), {
      message:
        "We currently do not deliver to this area. Please select another location or contact us on WhatsApp.",
    }),
  deliveryAddress: z
    .string()
    .trim()
    .transform(sanitizeHTML)
    .refine((val) => val.length >= 3, {
      message: "Street address or house number is required",
    }),
  landmark: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? sanitizeHTML(v) : v)),
  deliverySlot: z
    .string()
    .trim()
    .transform(sanitizeHTML)
    .refine((val) => val.length >= 1, {
      message: "Delivery slot is required",
    }),
  notes: z
    .string()
    .optional()
    .transform((v) => (v ? sanitizeHTML(v) : v)),
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
});

export const orderSchema = createOrderSchema;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
