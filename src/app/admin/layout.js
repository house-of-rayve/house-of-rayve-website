import { requireAdminPage } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: { default: "Admin", template: "%s · RAYVE Admin" } };

export default async function AdminLayout({ children }) {
  const user = await requireAdminPage();
  return (
    <div className="min-h-svh bg-[#f6f5f0]">
      <AdminNav user={{ name: user.name }} />
      <div className="lg:pl-60">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
