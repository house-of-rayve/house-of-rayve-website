import { NextResponse } from "next/server";

// "Get promotions" for Razorpay's checkout window: codes to suggest. Our codes are private, so none are listed —
// customers type the code they were given, which is checked by ./apply.
async function handle() {
  return NextResponse.json({ promotions: [] });
}
export { handle as GET, handle as POST };
