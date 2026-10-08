import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatPrice } from "@/lib/format";
import PageHeader, { Panel } from "@/components/admin/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import OrderControls from "@/components/admin/OrderControls";

export const metadata = { title: "Order" };

export default async function AdminOrderPage({ params }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { id: true, name: true, email: true, phone: true } } },
  });
  if (!order) notFound();

  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-block text-xs text-muted hover:text-ink">← Orders</Link>
      <PageHeader title={`Order ${order.orderNumber}`} description={`Placed ${formatDateTime(order.createdAt)}`}>
        <StatusBadge status={order.status} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title={`Items (${order.items.length})`}>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded bg-sand">
                    {item.image && <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted">{formatPrice(item.price)} × {item.quantity}</p>
                  </div>
                  <span className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="tabular-nums">{formatPrice(order.shippingFee)}</dd></div>
              <div className="flex justify-between pt-1 font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
            </dl>
          </Panel>
          <div className="grid gap-6 sm:grid-cols-2">
            <Panel title="Customer">
              <div className="space-y-1 p-5 text-sm">
                <Link href={`/admin/customers/${order.user.id}`} className="font-medium hover:underline">{order.user.name}</Link>
                <p className="text-muted">{order.user.email}</p>
                <p className="text-muted">{order.user.phone || "No phone"}</p>
              </div>
            </Panel>
            <Panel title="Shipping address">
              <address className="p-5 text-sm not-italic leading-relaxed text-muted">
                <span className="text-ink">{order.shipName}</span><br />
                {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br />
                {order.shipCity}, {order.shipState} {order.shipPostalCode}<br />
                {order.shipCountry} · {order.shipPhone}
              </address>
            </Panel>
          </div>
          {order.notes && (
            <Panel title="Customer note">
              <p className="p-5 text-sm text-muted">{order.notes}</p>
            </Panel>
          )}
        </div>
        <div className="space-y-6">
          <Panel title="Manage">
            <div className="p-5">
              <OrderControls key={order.updatedAt.toISOString()} order={{ id: order.id, status: order.status, paymentStatus: order.paymentStatus }} />
            </div>
          </Panel>
          <Panel title="Payment">
            <dl className="space-y-2 p-5 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Method</dt><dd>{order.paymentMethod === "COD" ? "Cash on delivery" : "Online"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Status</dt><dd><StatusBadge status={order.paymentStatus} /></dd></div>
              <div className="flex justify-between"><dt className="text-muted">Last update</dt><dd>{formatDateTime(order.updatedAt)}</dd></div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
