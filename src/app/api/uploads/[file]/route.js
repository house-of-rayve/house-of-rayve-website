import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
const CACHE = { "Cache-Control": "public, max-age=31536000, immutable" };

// Serves images uploaded through the admin panel: from the database, or from /uploads for older local files.
export async function GET(_request, { params }) {
  const { file } = await params;
  const name = path.basename(file);
  const ext = path.extname(name).toLowerCase();
  if (!TYPES[ext]) return new Response("Not found", { status: 404 });

  const upload = await prisma.upload.findUnique({ where: { id: name.slice(0, -ext.length) } });
  if (upload) {
    return new Response(upload.data, { headers: { "Content-Type": upload.contentType, ...CACHE } });
  }
  try {
    const data = await readFile(path.join(process.cwd(), "uploads", name));
    return new Response(data, { headers: { "Content-Type": TYPES[ext], ...CACHE } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
