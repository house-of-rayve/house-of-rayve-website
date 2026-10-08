import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatPrice } from "@/lib/format";
import StatusBadge from "@/components/ui/StatusBadge";
import OrderTimeline from "@/components/account/OrderTimeline";
import CancelOrderButton from "@/components/account/CancelOrderButton";

export const metadata = { title: "Order details" };

export default async function OrderDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await requireUser(`/account/orders/${id}`);
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      {placed && (
        <div className="flex items-start gap-4 bg-olive-800 p-6 text-sand">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-olive-400" />
          <div>
            <p className="font-display text-xs uppercase tracking-[0.2em]">Thank you — your order is placed</p>
            <p className="mt-2 text-sm text-sand/75">
              We&apos;ve received order {order.orderNumber}. You can follow its progress right here.
            </p>
          </div>
        </div>
      )}

      <Link href="/account/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> All orders
      </Link>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">Order {order.orderNumber}</h2>
            <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            {["PENDING", "CONFIRMED"].includes(order.status) && <CancelOrderButton orderId={order.id} />}
          </div>
        </div>
        <div className="mt-8">
          <OrderTimeline status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display text-xs uppercase tracking-[0.25em]">Items</h3>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-sand">
                  {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="flex-1">
                  {item.product ? (
                    <Link href={`/product/${item.product.slug}`} className="font-display text-xs uppercase tracking-[0.15em] hover:text-olive-700">
                      {item.name}
                    </Link>
                  ) : (
                    <span className="font-display text-xs uppercase tracking-[0.15em]">{item.name}</span>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shippingFee ? formatPrice(order.shippingFee) : "Complimentary"}</dd></div>
            <div className="flex justify-between pt-2 text-base font-medium"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-display text-xs uppercase tracking-[0.25em]">Shipping to</h3>
            <address className="mt-4 text-sm not-italic leading-relaxed text-ink/80">
              {order.shipName}<br />
              {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}<br />
              {order.shipCity}, {order.shipState} {order.shipPostalCode}<br />
              {order.shipCountry}<br />
              {order.shipPhone}
            </address>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-xs uppercase tracking-[0.25em]">Payment</h3>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>{order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}</span>
              <StatusBadge status={order.paymentStatus} />
            </div>
            {order.notes && <p className="mt-4 border-t border-line pt-4 text-sm text-muted">“{order.notes}”</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
