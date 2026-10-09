import Image from "next/image";
import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export const metadata = { title: "The brand" };

const VOICE = [
  ["Precise", "Short. Considered. Purposeful."],
  ["Effortless", "Premium without trying too hard. Active in attitude. Refined in expression."],
  ["Progressive", "Forward-looking. Contemporary. Culturally aware."],
  ["Confident", "Clear. Assured. Self-aware."],
];

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

      <section className="container-x section-y grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <LogoMark className="h-10 w-16 text-olive-800" />
          <h2 className="display-title mt-8 text-2xl sm:text-3xl">A different way of seeing the familiar</h2>
        </div>
        <div className="space-y-5 text-lg font-light leading-relaxed text-ink/80">
          <p>
            Rayve is about taking forms, codes and references we already recognise and shifting them through proportion,
            detail, contrast and attitude.
          </p>
          <p>
            Not creating novelty for its own sake. Not reinventing everything from zero. A frame you recognise — altered.
            A silhouette you know — reconsidered.
          </p>
          <p className="text-olive-700">Where the familiar takes an unexpected form.</p>
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="relative aspect-square">
          <Image src="/images/bull-shadow.jpg" alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center bg-olive-800 px-5 py-20 text-sand sm:px-8 md:px-16 lg:px-20">
          <p className="eyebrow text-olive-400">The symbol</p>
          <h2 className="display-title mt-5 text-3xl">Not aggression — control</h2>
          <p className="mt-6 max-w-md leading-relaxed text-sand/75">
            The bull is Rayve&apos;s symbol of precision, vision and presence. Not noise — confidence. Its strength lies in
            stillness, structure and the ability to command attention without asking for it. Familiar in form. Stronger
            in presence.
          </p>
        </div>
      </section>

      <section className="container-x section-y">
        <h2 className="display-title text-3xl sm:text-4xl">Tone of voice</h2>
        <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {VOICE.map(([t, d], i) => (
            <div key={t} className="bg-canvas p-8">
              <span className="font-display text-xs text-olive-500">/0{i + 1}</span>
              <h3 className="display-title mt-6 text-sm">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

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
