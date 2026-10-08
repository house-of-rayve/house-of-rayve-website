import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-olive-900 lg:block">
        <Image src="/images/model-matador.jpg" alt="" fill priority sizes="50vw" className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-olive-950/70 to-transparent" />
        <p className="display-title absolute bottom-12 left-12 text-3xl text-sand">Own the energy</p>
      </div>
      <div className="flex flex-col px-5 py-8 sm:px-12">
        <Link href="/" className="self-center text-olive-800 lg:self-start" aria-label="RAYVE home">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
      </div>
    </div>
  );
}
