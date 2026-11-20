import { Suspense } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import PageHeader from "@/components/admin/PageHeader";
import ListToolbar from "@/components/admin/ListToolbar";
import AutoRefresh from "@/components/admin/AutoRefresh";

export const metadata = { title: "Waitlist" };

// Who has joined the waitlist for which frame, newest first; filter by frame or search by name, email or phone
export default async function AdminWaitlistPage({ searchParams }) {
  const { q, product } = await searchParams;
  const [entries, counts, products] = await Promise.all([
    prisma.waitlistEntry.findMany({
      where: {
        ...(product ? { product: { slug: product } } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, slug: true } } },
    }),
    prisma.waitlistEntry.groupBy({ by: ["productId"], _count: true }),
    prisma.product.findMany({ where: { waitlist: { some: {} } }, select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
  ]);
  const total = counts.reduce((s, c) => s + c._count, 0);
  const countFor = (id) => counts.find((c) => c.productId === id)?._count ?? 0;
  const people = new Set(entries.map((e) => e.email)).size;

  return (
    <>
      <AutoRefresh events={["waitlist:joined"]} />
      <PageHeader title="Waitlist" description={`${total} sign-ups across ${products.length} frames`}>
        <a href={`/api/admin/waitlist${product ? `?product=${product}` : ""}`} className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm hover:bg-stone-50">
          <Download className="size-4" /> Download CSV
        </a>
      </PageHeader>
      <div className="rounded-lg border border-line bg-white">
        <Suspense>
          <ListToolbar placeholder="Name, email or phone…" tabKey="product" tabs={[["", `All (${total})`], ...products.map((p) => [p.slug, `${p.name} (${countFor(p.id)})`])]} />
        </Suspense>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Frame</th>
                <th className="px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-[#faf9f5]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/customers/${e.userId}`} className="font-medium text-ink hover:underline">
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{e.email}</td>
                  <td className="px-5 py-3 text-muted">{e.phone || "—"}</td>
                  <td className="px-5 py-3">{e.product.name}</td>
                  <td className="px-5 py-3 text-muted">{formatDateTime(e.createdAt)}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">No one on the waitlist yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {entries.length > 0 && <p className="border-t border-line px-5 py-3 text-xs text-muted">{entries.length} sign-ups shown, from {people} people.</p>}
      </div>
    </>
  );
}
