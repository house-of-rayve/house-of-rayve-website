import Image from "next/image";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import NewsletterForm from "@/components/store/NewsletterForm";

// Shown on the public domain (houseofrayve.com) until launch — see src/proxy.js
export const metadata = {
  title: { absolute: "RAYVE — Coming soon" },
  description: "Premium eyewear for the everyday. RAYVE is arriving soon.",
};

export default function ComingSoonPage() {
  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-olive-950 text-sand">
      <Image
        src="/images/campaign-matador.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[50%_25%] opacity-35"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-olive-950/70 via-olive-950/50 to-olive-950/90" />

      <div className="container-x flex flex-1 flex-col items-center justify-center py-16 text-center">
        <LogoMark className="h-14 w-24 animate-fade-up text-olive-400 sm:h-16 sm:w-28" />
        <Wordmark className="mt-6 h-5 w-[152px] animate-fade-up [animation-delay:100ms] sm:h-6 sm:w-[183px]" />

        <p className="eyebrow mt-14 animate-fade-up text-olive-400 [animation-delay:200ms]">Coming soon</p>
        <h1 className="display-title mt-5 animate-fade-up text-4xl [animation-delay:300ms] sm:text-6xl lg:text-7xl">Own the energy</h1>
        <p className="mt-6 max-w-md animate-fade-up text-sm leading-relaxed text-sand/75 [animation-delay:400ms] sm:text-base">
          Premium, in the everyday. Distinctive silhouettes, refined details and an elevated finish — made for ordinary
          days, not just special ones.
        </p>

        <div className="mt-12 w-full max-w-sm animate-fade-up [animation-delay:500ms]">
          <p className="text-[11px] uppercase tracking-[0.25em] text-sand/60">Be the first to know</p>
          <NewsletterForm source="coming-soon" />
        </div>
      </div>

      <footer className="container-x flex flex-col items-center gap-2 pb-8 text-[10px] uppercase tracking-[0.25em] text-sand/40 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Rayve</span>
        <span>Poise · Tension · Precision · Command</span>
      </footer>
    </main>
  );
}
