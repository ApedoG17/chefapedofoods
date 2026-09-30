import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, rating, customer_comment } = body;

    const numericRating = Number(rating);
    if (
      !order_id ||
      typeof order_id !== "string" ||
      order_id.trim() === "" ||
      order_id === "[orderId]" ||
      order_id.includes("[") ||
      order_id.includes("%5B")
    ) {
      return NextResponse.json(
        { error: "Invalid Order ID. Please open the feedback link with your specific order reference." },
        { status: 400 }
      );
    }

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: "Valid rating and order ID are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await (supabase as any)
      .from("reviews")
      .insert([
        {
          order_id,
          rating: Math.round(numericRating),
          customer_comment: typeof customer_comment === "string" ? customer_comment.trim() || null : null,
        },
      ])
      .select()
      .single();

    if (error) {
      // Postgres error 23505 is a unique violation (already reviewed)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You have already reviewed this order." },
          { status: 400 }
        );
      }
      if (error.code === "23503") {
        return NextResponse.json(
          { error: "Order not found." },
          { status: 404 }
        );
      }
      if (error.code === "22P02") {
        return NextResponse.json(
          { error: "Invalid Order ID format. Please use the direct link from your order confirmation or SMS." },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, review: data });
  } catch (error) {
    console.error("Feedback Submission Error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback." },
      { status: 500 }
    );
  }
}
