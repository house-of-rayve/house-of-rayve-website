import { readFile } from "node:fs/promises";
import path from "node:path";

const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };

// Serves images uploaded through the admin panel (stored in /uploads).
export async function GET(_request, { params }) {
  const { file } = await params;
  const name = path.basename(file);
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(process.cwd(), "uploads", name));
    return new Response(data, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
