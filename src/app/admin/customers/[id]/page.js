import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import PageHeader, { Panel } from "@/components/admin/PageHeader";
import CustomerForm from "@/components/admin/CustomerForm";
import StatusBadge from "@/components/ui/StatusBadge";
import PointsAdjust from "@/components/admin/PointsAdjust";
import { pointsBalance } from "@/lib/points";
import { POINTS_ENABLED } from "@/lib/constants";

export const metadata = { title: "Customer" };

export default async function AdminCustomerPage({ params }) {
  const { id } = await params;
  const customer = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      orders: { orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } },
    },
  });
  if (!customer) notFound();
  const [points, pointsHistory] = POINTS_ENABLED
    ? await Promise.all([
        pointsBalance(customer.id),
        prisma.pointsEntry.findMany({ where: { userId: customer.id }, orderBy: { createdAt: "desc" }, take: 50 }),
      ])
    : [null, []];

  const spent = customer.orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const addresses = customer.addresses.map(({ createdAt, updatedAt, ...a }) => a);

  return (
    <>
      <Link href="/admin/customers" className="mb-3 inline-block text-xs text-muted hover:text-ink">← Customers</Link>
      <PageHeader title={customer.name} description={`Customer since ${formatDate(customer.createdAt)}`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerForm key={customer.updatedAt.toISOString()} customer={{ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, addresses }} />
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs text-muted">Orders</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{customer.orders.length}</p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs text-muted">Total spent</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{formatPrice(spent)}</p>
            </div>
          </div>
          {points && (
          <Panel title="RAYVE points">
            <div className="flex items-end justify-between gap-3 p-5">
              <div>
                <p className="text-3xl font-semibold tabular-nums">{points.available.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted">available · worth {formatPrice(points.available)}</p>
              </div>
              {points.pending > 0 && <p className="text-right text-xs text-muted">+{points.pending.toLocaleString("en-IN")} pending delivery</p>}
            </div>
            <div className="border-t border-line p-5">
              <PointsAdjust customerId={customer.id} />
            </div>
            {pointsHistory.length > 0 && (
              <ul className="max-h-72 divide-y divide-line overflow-y-auto border-t border-line">
                {pointsHistory.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate">
                        {e.kind.charAt(0) + e.kind.slice(1).toLowerCase()}
                        {e.status === "PENDING" && <span className="ml-2 text-xs text-amber-700">pending</span>}
                      </p>
                      <p className="truncate text-xs text-muted">{e.note} · {formatDate(e.createdAt)}</p>
                    </div>
                    <span className={`shrink-0 tabular-nums ${e.points > 0 ? "text-emerald-700" : ""}`}>{e.points > 0 ? `+${e.points}` : e.points}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          )}
          <Panel title="Order history">
            {customer.orders.length === 0 ? (
              <p className="p-5 text-sm text-muted">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {customer.orders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-[#faf9f5]">
                      <div>
                        <p className="font-medium">{o.orderNumber}</p>
                        <p className="text-xs text-muted">{formatDate(o.createdAt)} · {o._count.items} items</p>
                      </div>
                      <div className="text-right">
                        <p className="tabular-nums">{formatPrice(o.total)}</p>
                        <StatusBadge status={o.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          {addresses.length > 1 && (
            <Panel title="Other addresses">
              <ul className="divide-y divide-line">
                {addresses.slice(1).map((a) => (
                  <li key={a.id} className="px-5 py-3 text-sm text-muted">
                    {a.fullName}, {a.line1}, {a.city}, {a.state} {a.postalCode}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
