import Image from "next/image";
import Link from "next/link";
import BrandStory from "@/components/motion/BrandStory";

export const metadata = { title: "The brand" };

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-olive-900">
        <Image src="/images/bullring.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-olive-950/80 to-transparent" />
        <div className="container-x pb-16 text-sand">
          <p className="eyebrow text-sand/70">The brand</p>
          <h1 className="display-title mt-4 max-w-3xl text-4xl sm:text-6xl">Poise. Tension. Precision. Command.</h1>
        </div>
      </section>

      {/* The story, chapter by chapter: idea, symbol, voice, promise */}
      <BrandStory />

      <section id="care" className="border-t border-line bg-sand/50">
        <div className="container-x section-y grid gap-10 md:grid-cols-3">
          {[
            ["Shipping", "Complimentary shipping on orders above ₹2,999. Orders are dispatched within 24 hours and delivered in 3–5 working days."],
            ["Returns", "Changed your mind? Return or exchange unworn frames within 7 days of delivery, from your account."],
            ["Care", "Clean lenses with the RAYVE cloth, store frames in their case, and avoid leaving them in hot cars."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="display-title text-sm">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x section-y text-center">
        <p className="eyebrow">Premium, in the everyday</p>
        <h2 className="display-title mx-auto mt-4 max-w-xl text-3xl">The pair you reach for without thinking</h2>
        <Link href="/shop" className="btn-primary mt-10">Shop the collection</Link>
      </section>
    </>
  );
}
