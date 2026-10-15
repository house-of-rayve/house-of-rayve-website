import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/api";
import { ithinkEnabled, labelPdf } from "@/lib/ithink";

const message = (text, status) => new NextResponse(text, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

// Shipping labels as an A6 PDF: ?order=<id> for one order, or with no query every order still waiting for pickup
export async function GET(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  if (!ithinkEnabled()) return message("iThink Logistics isn't set up.", 503);
  const id = new URL(request.url).searchParams.get("order");
  const orders = await prisma.order.findMany({
    where: id ? { id, awb: { not: null } } : { awb: { not: null }, status: "CONFIRMED" },
    select: { awb: true, orderNumber: true },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
  if (!orders.length) return message(id ? "This order hasn't been booked with iThink yet." : "No orders are waiting for pickup.", 404);
  try {
    const pdf = await labelPdf(orders.map((o) => o.awb));
    const name = id ? `label-${orders[0].orderNumber}.pdf` : `labels-${new Date().toISOString().slice(0, 10)}.pdf`;
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${name}"`, "Cache-Control": "no-store" } });
  } catch (e) {
    return message(`Couldn't get the label from iThink: ${e.message}`, 502);
  }
}
