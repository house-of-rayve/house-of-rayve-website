import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/api";
import { ithinkEnabled, shippingLabel } from "@/lib/ithink";

const message = (text, status) => new NextResponse(text, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

// Opens the shipping label PDF: ?order=<id> for one order, or with no query every order still waiting for pickup, in one PDF
export async function GET(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  if (!ithinkEnabled()) return message("iThink Logistics isn't set up.", 503);
  const id = new URL(request.url).searchParams.get("order");
  const orders = await prisma.order.findMany({
    where: id ? { id, awb: { not: null } } : { awb: { not: null }, status: "CONFIRMED" },
    select: { awb: true },
    orderBy: { createdAt: "asc" },
    take: 100, // iThink prints up to 100 labels at a time
  });
  if (!orders.length) return message(id ? "This order hasn't been booked with iThink yet." : "No orders are waiting for pickup.", 404);
  try {
    return NextResponse.redirect(await shippingLabel(orders.map((o) => o.awb).join(",")), 302);
  } catch (e) {
    return message(`Couldn't get the label from iThink: ${e.message}`, 502);
  }
}
