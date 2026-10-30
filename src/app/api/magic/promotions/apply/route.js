import { NextResponse } from "next/server";
import { applyPromotion, readCallback } from "@/lib/magic";

// "Apply promotion" for Razorpay's checkout window: checks a discount code against the customer's bag
async function handle(request) {
  try {
    return NextResponse.json(await applyPromotion(await readCallback(request)));
  } catch {
    return NextResponse.json({ failure_code: "INVALID_PROMOTION", failure_reason: "We couldn't check this code. Please try again." });
  }
}
export { handle as GET, handle as POST };
