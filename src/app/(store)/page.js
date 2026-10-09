import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { listProducts } from "@/lib/products";
import { LogoMark } from "@/components/ui/Logo";
import Reveal from "@/components/ui/Reveal";
import HeroSlider from "@/components/home/HeroSlider";
import Marquee from "@/components/home/Marquee";
import ShapeRail from "@/components/home/ShapeRail";
import ProductCarousel from "@/components/home/ProductCarousel";
import ShopTheLook from "@/components/home/ShopTheLook";
import NewsletterForm from "@/components/store/NewsletterForm";

export const dynamic = "force-dynamic";

const PILLARS = [
  { title: "The horns", text: "Sweeping horns express strength, presence and controlled confidence." },
  { title: "The bridge", text: "The connecting line represents the bridge of glasses." },
  { title: "The face", text: "Sculpted cuts subtly define the bull's face." },
];

const PERKS = [
  { Icon: Truck, title: "Free shipping", text: "On orders above ₹2,999" },
  { Icon: RotateCcw, title: "7-day returns", text: "Easy exchanges, no questions" },
  { Icon: ShieldCheck, title: "UV400 lenses", text: "Full protection, every pair" },
  { Icon: Sparkles, title: "1-year warranty", text: "On frames and hinges" },
];

export default async function HomePage() {
  const all = await listProducts();
  const featured = all.filter((p) => p.featured);
  const newest = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const offers = all.filter((p) => p.comparePrice > p.price || p.stock <= 5);
  const shapeCounts = all.reduce((acc, p) => ({ ...acc, [p.shape]: (acc[p.shape] ?? 0) + 1 }), {});

  return (
    <>
      <HeroSlider />
      <Marquee />

      {/* Statement */}
      <section className="container-x py-24 text-center sm:py-32">
        <Reveal>
          <LogoMark className="mx-auto h-8 w-14 text-olive-500" />
          <p className="mx-auto mt-8 max-w-3xl text-2xl font-light leading-snug text-olive-900 sm:text-3xl">
            Most sunglasses live at two extremes — the ones you buy without thinking, and the ones you think twice about.{" "}
            <span className="text-olive-500">RAYVE was created for everything in between.</span>
          </p>
        </Reveal>
      </section>

      {/* Product rail with tabs */}
      <section className="container-x pb-24">
        <Reveal>
          <ProductCarousel
            eyebrow="Premium, in the everyday"
            title="The collection"
            tabs={[
              { label: "Bestsellers", products: featured.length ? featured : all.slice(0, 6), href: "/shop" },
              { label: "New in", products: newest.slice(0, 8), href: "/shop?sort=newest" },
              ...(offers.length ? [{ label: "Last pieces", products: offers, href: "/shop" }] : []),
            ]}
          />
        </Reveal>
      </section>

      {/* Shop by shape */}
      <section className="border-y border-line bg-sand/40 py-20">
        <div className="container-x">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Find your frame</p>
              <h2 className="display-title mt-3 text-2xl sm:text-3xl">Shop by shape</h2>
            </div>
            <Link href="/shop" className="group flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
              All frames <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <Reveal delay={100}>
            <ShapeRail counts={shapeCounts} />
          </Reveal>
        </div>
      </section>

      {/* Shop the look */}
      <section className="container-x py-24">
        <Reveal>
          <ShopTheLook products={all} />
        </Reveal>
      </section>

      {/* Editorial split */}
      <section className="grid bg-olive-800 text-sand lg:grid-cols-2">
        <div className="group relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[680px]">
          <Image
            src="/images/campaign-matador.jpg"
            alt="RAYVE campaign at the bullring"
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
          />
        </div>
        <Reveal className="flex flex-col justify-center px-6 py-16 sm:px-16 lg:px-20">
          <p className="eyebrow text-olive-400">A different way of seeing the familiar</p>
          <h2 className="display-title mt-5 text-3xl sm:text-4xl">Where the familiar takes an unexpected form</h2>
          <p className="mt-6 max-w-md leading-relaxed text-sand/75">
            Rayve takes forms, codes and references we already recognise and shifts them through proportion, detail,
            contrast and attitude. Not novelty for its own sake — a classic idea, seen through another point of view.
          </p>
          <Link href="/about" className="btn-accent mt-10 self-start">
            Discover Rayve
          </Link>
        </Reveal>
      </section>

      {/* Category tiles */}
      <section className="container-x grid gap-4 py-24 sm:grid-cols-2 sm:gap-6">
        {[
          { title: "Sunglasses", sub: `${all.filter((p) => p.category === "Sunglasses").length} frames`, href: "/shop?category=Sunglasses", img: "/images/model-sevilla.jpg" },
          { title: "Optical", sub: `${all.filter((p) => p.category === "Optical").length} frames`, href: "/shop?category=Optical", img: "/images/malaga.jpg" },
        ].map((c, i) => (
          <Reveal key={c.title} delay={i * 120}>
            <Link href={c.href} className="group relative block aspect-[4/5] overflow-hidden bg-sand sm:aspect-[4/3]">
              <Image src={c.img} alt={c.title} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-950/70 via-olive-950/10 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between text-sand sm:inset-x-8 sm:bottom-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-sand/70">{c.sub}</p>
                  <h3 className="display-title mt-2 text-2xl sm:text-3xl">{c.title}</h3>
                </div>
                <span className="grid size-12 place-items-center rounded-full border border-sand/40 transition-all duration-300 group-hover:bg-sand group-hover:text-olive-900">
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:-rotate-45" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* Perks */}
      <section className="border-y border-line bg-paper">
        <div className="container-x grid grid-cols-2 lg:grid-cols-4">
          {PERKS.map(({ Icon, title, text }, i) => (
            <Reveal
              key={title}
              delay={i * 80}
              className={`flex items-center gap-4 py-8 ${i % 2 ? "pl-4 sm:pl-8" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i % 2 === 0 && i > 0 ? "lg:pl-8" : ""} ${i > 0 ? "lg:border-l lg:border-line" : ""}`}
            >
              <Icon className="size-6 shrink-0 text-olive-500" strokeWidth={1.25} />
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.2em]">{title}</p>
                <p className="mt-1 text-xs text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="container-x py-24">
        <Reveal className="grid items-end gap-6 lg:grid-cols-2">
          <h2 className="display-title text-3xl sm:text-5xl">What we stand for</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted lg:justify-self-end">
            The bull is our symbol of precision, vision and presence. Not aggression — control. Not noise — confidence.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-px bg-line sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 120} className="group bg-cream p-8 transition-colors duration-500 hover:bg-olive-800 hover:text-sand">
              <span className="font-display text-xs text-olive-500">/0{i + 1}</span>
              <h3 className="display-title mt-6 text-sm">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-sand/70">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Lifestyle grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4">
        {[
          ["model-toro", "/product/toro"],
          ["model-sevilla", "/product/sevilla"],
          ["model-ronda", "/product/ronda"],
          ["model-granada", "/product/granada"],
        ].map(([img, href]) => (
          <Link key={img} href={href} className="group relative aspect-square overflow-hidden">
            <Image src={`/images/${img}.jpg`} alt="" fill sizes="(min-width:640px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 grid place-items-center bg-olive-950/0 transition-colors duration-500 group-hover:bg-olive-950/40">
              <span className="translate-y-2 text-[10px] uppercase tracking-[0.25em] text-sand opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                Shop this frame
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Newsletter */}
      <section className="bg-sand/60">
        <Reveal className="container-x flex flex-col items-center py-20 text-center">
          <p className="eyebrow">The Rayve list</p>
          <h2 className="display-title mt-4 max-w-xl text-2xl sm:text-3xl">New frames, first</h2>
          <p className="mt-4 max-w-md text-sm text-muted">Early access to new drops, restocks and private previews. No noise.</p>
          <div className="mt-8 w-full max-w-md">
            <NewsletterForm variant="light" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
