import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/account/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
