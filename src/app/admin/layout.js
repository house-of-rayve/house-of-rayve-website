import { requireAdminPage } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import AdminAppInstall from "@/components/admin/AdminAppInstall";

export const metadata = {
  title: { default: "Admin", template: "%s · RAYVE Admin" },
  // Installable as its own app (scope /admin) — see public/admin.webmanifest and public/admin-sw.js
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "RAYVE Admin", statusBarStyle: "black-translucent" },
  icons: { apple: "/brand/admin-app/apple-touch-icon.png" },
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#22221a" };

export default async function AdminLayout({ children }) {
  const user = await requireAdminPage();
  return (
    <div className="min-h-svh bg-[#f6f5f0]">
      <AdminNav user={{ name: user.name }} />
      <div className="lg:pl-60">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          <AdminAppInstall />
          {children}
        </main>
      </div>
    </div>
  );
}
