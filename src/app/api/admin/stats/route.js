import { json, authorize } from "@/lib/api";
import { getDashboardStats } from "@/lib/stats";

export async function GET() {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  return json(await getDashboardStats());
}
