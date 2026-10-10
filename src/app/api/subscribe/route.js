import { prisma } from "@/lib/prisma";
import { json, error, readJson, str, isEmail } from "@/lib/api";

const SOURCES = ["newsletter", "coming-soon"];

export async function POST(request) {
  const body = await readJson(request);
  const email = str(body.email).toLowerCase();
  if (!isEmail(email)) return error("Please enter a valid email address.");
  const source = SOURCES.includes(body.source) ? body.source : "newsletter";

  // Signing up twice is fine: keep the first record, still report success
  await prisma.subscriber.upsert({ where: { email }, update: {}, create: { email, source } });
  return json({ ok: true }, 201);
}
