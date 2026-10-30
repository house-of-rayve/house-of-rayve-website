import { NextResponse } from "next/server";
import { readCallback, shippingOptions } from "@/lib/magic";

// Called by Razorpay's checkout window (Dashboard → Magic Checkout → Shipping Setup → API) with the customer's addresses
async function handle(request) {
  try {
    return NextResponse.json(await shippingOptions(await readCallback(request)));
  } catch (e) {
    console.error("Magic shipping failed", e.message);
    return NextResponse.json({ addresses: [] }, { status: 500 });
  }
}
export { handle as GET, handle as POST };
