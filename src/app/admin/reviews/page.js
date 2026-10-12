import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import ReviewModeration from "@/components/admin/ReviewModeration";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { name: true, email: true } }, product: { select: { name: true, slug: true } } },
  });
  const pending = reviews.filter((r) => !r.approved).length;
  return (
    <>
      <PageHeader title="Reviews" description={`${reviews.length} reviews · ${pending} waiting for approval`} />
      <ReviewModeration initial={JSON.parse(JSON.stringify(reviews))} />
    </>
  );
}
