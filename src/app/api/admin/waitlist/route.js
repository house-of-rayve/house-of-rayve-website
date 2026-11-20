import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/api";

const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

// The waitlist as a CSV file (optionally one frame, ?product=<slug>), for the admin panel's download button
export async function GET(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const product = request.nextUrl.searchParams.get("product");
  const entries = await prisma.waitlistEntry.findMany({
    where: product ? { product: { slug: product } } : {},
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } } },
  });
  const rows = [
    ["Name", "Email", "Phone", "Frame", "Colour", "Joined (IST)"],
    ...entries.map((e) => [e.name, e.email, e.phone, e.product.name, e.color, e.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })]),
  ];
  const csv = rows.map((r) => r.map(cell).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rayve-waitlist${product ? `-${product}` : ""}.csv"`,
    },
  });
}
