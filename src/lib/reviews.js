import "server-only";
import { prisma } from "@/lib/prisma";

/** Approved reviews for a product, with the average rating and a "verified buyer" flag for each. */
export async function getProductReviews(productId) {
  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });
  // Verified = the reviewer received this frame in a delivered order
  const buyers = reviews.length
    ? await prisma.orderItem.findMany({
        where: { productId, order: { status: "DELIVERED", userId: { in: reviews.map((r) => r.user.id) } } },
        select: { order: { select: { userId: true } } },
      })
    : [];
  const verified = new Set(buyers.map((b) => b.order.userId));
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return {
    count,
    average,
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      photo: r.photo,
      createdAt: r.createdAt.toISOString(),
      author: r.user.name.split(" ")[0], // first name only, for privacy
      verified: verified.has(r.user.id),
    })),
  };
}
