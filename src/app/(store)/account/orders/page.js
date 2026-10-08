import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrderRow from "@/components/account/OrderRow";

export const metadata = { title: "My orders" };

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return (
    <section>
      <h2 className="mb-5 font-display text-xs uppercase tracking-[0.25em]">Order history ({orders.length})</h2>
      {orders.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-muted">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="btn-primary mt-6">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </section>
  );
}
