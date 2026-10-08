import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { getCurrentUser } from "@/lib/auth";

export default async function StoreLayout({ children }) {
  const user = await getCurrentUser();
  return (
    <>
      <Header user={user && { name: user.name, role: user.role }} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
