import { getCurrentUser } from "@/lib/auth";
import { json } from "@/lib/api";

export async function GET() {
  return json({ user: await getCurrentUser() });
}
