import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/account/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { googleConfigured } from "@/lib/google";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  const wantsAdmin = typeof next === "string" && next.startsWith("/admin");

  // A customer trying to open the admin panel stays here to switch accounts
  if (user && !(wantsAdmin && user.role !== "ADMIN")) {
    redirect(user.role === "ADMIN" ? "/admin" : "/account");
  }
  return (
    <>
      {user && (
        <p className="mb-8 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You&apos;re signed in as {user.email}, which isn&apos;t an admin account. Sign in with an admin account to
          open the admin panel.
        </p>
      )}
      <Suspense>
        <AuthForm mode="login" googleEnabled={googleConfigured()} />
      </Suspense>
    </>
  );
}
