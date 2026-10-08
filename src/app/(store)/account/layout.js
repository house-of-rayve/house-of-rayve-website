import { requireUser } from "@/lib/auth";
import AccountNav from "@/components/account/AccountNav";
import LogoutButton from "@/components/account/LogoutButton";

export default async function AccountLayout({ children }) {
  const user = await requireUser();
  return (
    <div className="container-x py-10 sm:py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="display-title mt-3 text-2xl sm:text-3xl">Hello, {user.name.split(" ")[0]}</h1>
        </div>
        <LogoutButton className="shrink-0 whitespace-nowrap text-xs uppercase tracking-[0.15em] text-muted hover:text-ink lg:hidden" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr] lg:gap-12">
        <aside className="min-w-0">
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
