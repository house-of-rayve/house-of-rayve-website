import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-5 text-center">
      <LogoMark className="h-10 w-16 text-olive-500" />
      <h1 className="display-title mt-8 text-3xl">Page not found</h1>
      <p className="mt-4 text-muted">The page you&apos;re looking for has moved or no longer exists.</p>
      <Link href="/" className="btn-primary mt-10">Back to home</Link>
    </div>
  );
}
