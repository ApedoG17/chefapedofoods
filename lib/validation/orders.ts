import { z } from "zod";
import { isAreaServiceable } from "@/lib/delivery";

export const ghanaPhoneRegex = /^(?:\+233|0)[25]\d{8}$/;

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
    .min(1, "Included protein selection is required"),
  extras: orderItemExtrasSchema.optional().default({}),
  quantity: z.number().int().positive("Quantity must be at least 1").default(1),
});

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .trim()
    .refine((val) => ghanaPhoneRegex.test(val.replace(/\s+/g, "")), {
      message: "Please enter a valid Ghana phone number (e.g. 024 000 0000)",
    }),
  area: z
    .string()
    .trim()
    .min(2, "Area is required")
    .refine((area) => isAreaServiceable(area), {
      message:
        "We currently do not deliver to this area. Please select another location or contact us on WhatsApp.",
    }),
  deliveryAddress: z
    .string()
    .trim()
    .min(3, "Street address or house number is required"),
  landmark: z.string().trim().optional(),
  deliverySlot: z.string().min(1, "Delivery slot is required"),
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
