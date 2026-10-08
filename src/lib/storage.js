import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

// Saves an uploaded image and returns its public URL.
// Uses Supabase Storage when configured, otherwise the local /uploads folder.
export async function saveImage(name, buffer, contentType) {
  const sb = supabase();
  if (sb) {
    await ensureBucket(sb);
    const { error } = await sb.storage.from(BUCKET).upload(name, buffer, { contentType, upsert: false });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  }
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/api/uploads/${name}`;
}
