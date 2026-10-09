import { randomUUID } from "node:crypto";
import { json, error, authorize } from "@/lib/api";
import { saveImage } from "@/lib/storage";

const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" };
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const form = await request.formData();
  const files = form.getAll("files");
  if (!files.length) return error("No files received.");

  const urls = [];
  for (const file of files) {
    const ext = ALLOWED[file.type];
    if (!ext) return error("Only JPG, PNG, WEBP or AVIF images are allowed.");
    if (file.size > MAX_BYTES) return error("Each image must be under 5 MB.");
    const name = `${randomUUID()}${ext}`;
    try {
      urls.push(await saveImage(name, Buffer.from(await file.arrayBuffer()), file.type));
    } catch (e) {
      console.error("[upload]", e);
      return error("Could not save the image. Please try again.", 500);
    }
  }
  return json({ urls }, 201);
}
