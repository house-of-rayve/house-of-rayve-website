import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import OrderRow from "@/components/account/OrderRow";

export const metadata = { title: "My account" };

export default async function AccountOverview() {
  const user = await requireUser();
  const [orders, address] = await Promise.all([
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } }),
    prisma.address.findFirst({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
  ]);
  const spent = orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const active = orders.filter((o) => ["PENDING", "CONFIRMED", "SHIPPED"].includes(o.status)).length;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
        {[
          ["Orders", orders.length],
          ["In progress", active],
          ["Total spent", formatPrice(spent)],
        ].map(([k, v]) => (
          <div key={k} className="bg-paper p-5 last:col-span-2 sm:p-6 sm:last:col-span-1">
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted">{k}</p>
            <p className="mt-2 text-2xl font-light">{v}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xs uppercase tracking-[0.25em]">Recent orders</h2>
          {orders.length > 0 && <Link href="/account/orders" className="link-underline text-xs">View all</Link>}
        </div>
        {orders.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-muted">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="btn-primary mt-6">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xs uppercase tracking-[0.25em]">Profile</h2>
            <Link href="/account/profile" className="link-underline text-xs">Edit</Link>
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex gap-3"><dt className="w-20 text-muted">Name</dt><dd>{user.name}</dd></div>
            <div className="flex gap-3"><dt className="w-20 text-muted">Email</dt><dd className="truncate">{user.email}</dd></div>
            <div className="flex gap-3"><dt className="w-20 text-muted">Phone</dt><dd>{user.phone || "—"}</dd></div>
            <div className="flex gap-3"><dt className="w-20 text-muted">Joined</dt><dd>{formatDate(user.createdAt)}</dd></div>
          </dl>
        </section>
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xs uppercase tracking-[0.25em]">Default address</h2>
            <Link href="/account/addresses" className="link-underline text-xs">Manage</Link>
          </div>
          {address ? (
            <address className="mt-5 text-sm not-italic leading-relaxed text-ink/80">
              {address.fullName}<br />
              {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
              {address.city}, {address.state} {address.postalCode}<br />
              {address.phone}
            </address>
          ) : (
            <p className="mt-5 text-sm text-muted">No saved address yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
