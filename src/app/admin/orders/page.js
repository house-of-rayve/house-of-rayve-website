import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
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

  return (
    <>
      <AutoRefresh />
      <PageHeader title="Orders" description={`${orders.length} ${orders.length === 1 ? "order" : "orders"}${status ? ` · ${STATUS_LABELS[status]}` : ""}`} />
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
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
