import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";
import { parseCouponInput } from "@/lib/coupons";

export async function GET() {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return json({ coupons });
}

export async function POST(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const parsed = parseCouponInput(await readJson(request));
  if (parsed.error) return error(parsed.error);
  if (await prisma.coupon.findUnique({ where: { code: parsed.data.code } })) return error("A code with that name already exists.", 409);
  const coupon = await prisma.coupon.create({ data: parsed.data });
  return json({ coupon }, 201);
}
