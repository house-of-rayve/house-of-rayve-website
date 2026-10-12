import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { json, error, authorize } from "@/lib/api";
import { saveImage } from "@/lib/storage";

const PHOTO_TYPES = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MAX_PHOTO = 4 * 1024 * 1024;

// A signed-in customer writes (or rewrites) their review of a frame; it waits for admin approval.
export async function POST(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const form = await request.formData().catch(() => null);
  if (!form) return error("Invalid review.");
  const productId = String(form.get("productId") ?? "");
  const rating = Number(form.get("rating"));
  const title = String(form.get("title") ?? "").trim().slice(0, 80);
  const body = String(form.get("body") ?? "").trim().slice(0, 1500);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return error("Please choose a rating from 1 to 5 stars.");
  if (body.length < 10) return error("Please write at least a sentence about the frame.");
  const product = await prisma.product.findFirst({ where: { id: productId, isActive: true }, select: { id: true } });
  if (!product) return error("Product not found.", 404);

  let photo;
  const file = form.get("photo");
  if (file && typeof file === "object" && file.size > 0) {
    const ext = PHOTO_TYPES[file.type];
    if (!ext) return error("The photo must be a JPG, PNG or WEBP image.");
    if (file.size > MAX_PHOTO) return error("The photo must be under 4 MB.");
    try {
      photo = await saveImage(`review-${randomUUID()}${ext}`, Buffer.from(await file.arrayBuffer()), file.type);
    } catch (e) {
      console.error("[review photo]", e);
      return error("Couldn't save the photo. Please try again.", 500);
    }
  }

  const data = { rating, title: title || null, body, approved: false, ...(photo ? { photo } : {}) };
  await prisma.review.upsert({
    where: { productId_userId: { productId, userId: user.id } },
    create: { ...data, productId, userId: user.id },
    update: data,
  });
  return json({ ok: true }, 201);
}
