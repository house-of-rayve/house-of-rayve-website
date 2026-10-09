import "server-only";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

let client = null;
function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

let bucketReady = false;
async function ensureBucket(sb) {
  if (bucketReady) return;
  const { data } = await sb.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await sb.storage.createBucket(BUCKET, { public: true });
    if (error && !/already exists/i.test(error.message)) throw error;
  }
  bucketReady = true;
}

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

// Saves an uploaded image and returns its public URL.
// Uses Supabase Storage when configured; otherwise stores the image in the database, which works the
// same locally and on serverless hosting (where the filesystem is read-only).
export async function saveImage(name, buffer, contentType) {
  const sb = supabase();
  if (sb) {
    await ensureBucket(sb);
    const { error } = await sb.storage.from(BUCKET).upload(name, buffer, { contentType, upsert: false });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  }
  const upload = await prisma.upload.create({
    data: { contentType, size: buffer.length, data: buffer },
    select: { id: true },
  });
  return `/api/uploads/${upload.id}.${EXT[contentType] ?? "jpg"}`;
}
