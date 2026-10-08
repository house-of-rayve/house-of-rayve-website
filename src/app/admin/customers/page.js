import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import PageHeader from "@/components/admin/PageHeader";
import ListToolbar from "@/components/admin/ListToolbar";
import AutoRefresh from "@/components/admin/AutoRefresh";

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage({ searchParams }) {
  const { q } = await searchParams;
  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }], take: 1 },
      orders: { select: { total: true, status: true } },
    },
  });

  return (
    <>
      <AutoRefresh events={["customer:created", "customer:updated", "order:created"]} />
      <PageHeader title="Customers" description={`${customers.length} registered customers`} />
      <div className="rounded-lg border border-line bg-white">
        <Suspense>
          <ListToolbar placeholder="Name, email or phone…" />
        </Suspense>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Address</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Spent</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((c) => {
                const a = c.addresses[0];
                const spent = c.orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
                return (
                  <tr key={c.id} className="hover:bg-[#faf9f5]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-olive-500/15 text-xs font-semibold text-olive-800">
                          {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </span>
                        <div>
                          <Link href={`/admin/customers/${c.id}`} className="font-medium text-ink hover:underline">{c.name}</Link>
                          <p className="text-xs text-muted">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">{c.phone || "—"}</td>
                    <td className="max-w-[240px] px-5 py-3 text-muted">
                      <p className="truncate">{a ? `${a.line1}, ${a.city}, ${a.state} ${a.postalCode}` : "—"}</p>
                    </td>
                    <td className="px-5 py-3 tabular-nums">{c.orders.length}</td>
                    <td className="px-5 py-3 tabular-nums">{formatPrice(spent)}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(c.createdAt)}</td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
