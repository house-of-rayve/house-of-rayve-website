import Image from "next/image";
import Link from "next/link";
import BrandStory from "@/components/motion/BrandStory";
import FullBanner from "@/components/home/FullBanner";

export const metadata = { title: "The brand" };

export default function AboutPage() {
  return (
    <>
      <h1 className="sr-only">The brand</h1>
      {/* text sits on the left of this artwork, so phones keep the left side in view */}
      <FullBanner src="/images/banners/the-signal.jpg" alt="RAYVE — The signal has arrived" priority reveal={false} focus="0% 50%" full />

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
