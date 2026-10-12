import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import CouponManager from "@/components/admin/CouponManager";

export const metadata = { title: "Discount codes" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="Discount codes" description="Codes customers can enter at checkout" />
      <CouponManager initial={JSON.parse(JSON.stringify(coupons))} />
    </>
  );
}
