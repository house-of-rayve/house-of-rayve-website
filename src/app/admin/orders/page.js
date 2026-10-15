import { Suspense } from "react";
import Link from "next/link";
import { FileDown, Printer } from "lucide-react";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncShipments } from "@/lib/ithink";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatPrice } from "@/lib/format";
import PageHeader from "@/components/admin/PageHeader";
import ListToolbar from "@/components/admin/ListToolbar";
import StatusBadge from "@/components/ui/StatusBadge";
import AutoRefresh from "@/components/admin/AutoRefresh";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }) {
  const { status, q } = await searchParams;
  const orders = await prisma.order.findMany({
    where: {
      ...(ORDER_STATUSES.includes(status) ? { status } : {}),
      ...(q ? { OR: [{ orderNumber: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }, { user: { email: { contains: q, mode: "insensitive" } } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, _count: { select: { items: true } } },
  });
  after(() => syncShipments(orders)); // keep courier statuses fresh; marks delivered parcels as Delivered
  const awaitingPickup = await prisma.order.count({ where: { awb: { not: null }, status: "CONFIRMED" } });

  return (
    <>
      <AutoRefresh />
      <PageHeader title="Orders" description={`${orders.length} ${orders.length === 1 ? "order" : "orders"}${status ? ` · ${STATUS_LABELS[status]}` : ""}`}>
        {awaitingPickup > 0 && (
          <a href="/api/admin/labels" target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-md bg-olive-800 px-4 text-sm font-medium text-sand hover:bg-olive-950">
            <Printer className="size-4" /> Print {awaitingPickup} {awaitingPickup === 1 ? "label" : "labels"}
          </a>
        )}
      </PageHeader>
      <div className="rounded-lg border border-line bg-white">
        <Suspense>
          <ListToolbar placeholder="Order no., customer…" tabs={[["", "All"], ...ORDER_STATUSES.map((s) => [s, STATUS_LABELS[s]])]} />
        </Suspense>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] whitespace-nowrap text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Label</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#faf9f5]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:underline">{o.orderNumber}</Link>
                    <p className="text-xs text-muted">{o._count.items} {o._count.items === 1 ? "item" : "items"}</p>
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDateTime(o.createdAt)}</td>
                  <td className="px-5 py-3">
                    <p>{o.user.name}</p>
                    <p className="text-xs text-muted">{o.user.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">{o.paymentMethod === "COD" ? "COD" : "Online"}</span>
                      <StatusBadge status={o.paymentStatus} />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status} />
                    {o.trackingUrl && (
                      <a href={o.trackingUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-muted hover:text-ink hover:underline">
                        {o.shipmentStatus ?? "Track"} ↗
                      </a>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {o.awb ? (
                      <a href={`/api/admin/labels?order=${o.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-olive-800 hover:underline">
                        <FileDown className="size-3.5" /> PDF
                      </a>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-muted">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
