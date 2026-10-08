import { getDashboardStats } from "@/lib/stats";
import LiveDashboard from "@/components/admin/LiveDashboard";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  return <LiveDashboard initial={stats} />;
}
