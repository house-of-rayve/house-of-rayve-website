import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listProducts } from "@/lib/products";
import ProductCard from "@/components/store/ProductCard";
import { LogoMark } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

const PILLARS = [
  { title: "The horns", text: "Sweeping horns express strength, presence and controlled confidence." },
  { title: "The bridge", text: "The connecting line represents the bridge of glasses." },
  { title: "The face", text: "Sculpted cuts subtly define the bull's face." },
];

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    listProducts({ featured: true, take: 4 }),
    listProducts({ sort: "newest", take: 8 }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-olive-900">
        <Image
          src="/images/hero-green.jpg"
          alt="Model wearing RAYVE olive sunglasses"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[50%_30%] opacity-90"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-olive-950/75 via-olive-950/30 to-transparent" />
        <div className="container-x flex min-h-[78svh] flex-col justify-end pb-16 pt-32 sm:pb-24">
          <p className="eyebrow animate-fade-up text-sand/70">New season · Collection 01</p>
          <h1 className="display-title mt-5 max-w-2xl animate-fade-up text-4xl text-sand sm:text-6xl lg:text-7xl">
            Own the energy
          </h1>
          <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-sand/80">
            A frame you recognise — altered. Distinctive silhouettes and refined details, made for ordinary days, not just
            special ones.
          </p>
          <div className="mt-9 flex animate-fade-up flex-wrap gap-3">
            <Link href="/shop" className="btn-accent">
              Shop the collection
            </Link>
            <Link href="/about" className="btn border border-sand/40 text-sand hover:bg-sand hover:text-olive-900">
              Our story
            </Link>
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="container-x py-24 text-center sm:py-32">
        <LogoMark className="mx-auto h-8 w-14 text-olive-500" />
        <p className="mx-auto mt-8 max-w-3xl text-2xl font-light leading-snug text-olive-900 sm:text-3xl">
          Most sunglasses live at two extremes — the ones you buy without thinking, and the ones you think twice about.{" "}
          <span className="text-olive-500">RAYVE was created for everything in between.</span>
        </p>
      </section>

      {/* Featured */}
      <section className="container-x pb-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Signature frames</p>
            <h2 className="display-title mt-3 text-2xl sm:text-3xl">Featured</h2>
          </div>
          <Link href="/shop" className="group hidden items-center gap-2 text-[11px] uppercase tracking-[0.2em] sm:flex">
            View all <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 2} />
          ))}
        </div>
      </section>

      {/* Editorial split */}
      <section className="grid bg-olive-800 text-sand lg:grid-cols-2">
        <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[640px]">
          <Image src="/images/campaign-matador.jpg" alt="RAYVE campaign at the bullring" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-6 py-16 sm:px-16 lg:px-20">
          <p className="eyebrow text-olive-400">A different way of seeing the familiar</p>
          <h2 className="display-title mt-5 text-3xl sm:text-4xl">Where the familiar takes an unexpected form</h2>
          <p className="mt-6 max-w-md leading-relaxed text-sand/75">
            Rayve takes forms, codes and references we already recognise and shifts them through proportion, detail,
            contrast and attitude. Not novelty for its own sake — a classic idea, seen through another point of view.
          </p>
          <Link href="/about" className="btn-accent mt-10 self-start">
            Discover Rayve
          </Link>
        </div>
      </section>

      {/* Latest */}
      <section className="container-x py-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Premium, in the everyday</p>
            <h2 className="display-title mt-3 text-2xl sm:text-3xl">The collection</h2>
          </div>
          <Link href="/shop" className="group flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
            Shop all <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {latest.map((p) => (
            <div key={p.id} className="w-[62%] shrink-0 snap-start sm:w-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* Category tiles */}
      <section className="container-x grid gap-4 pb-24 sm:grid-cols-2 sm:gap-6">
        {[
          { title: "Sunglasses", href: "/shop?category=Sunglasses", img: "/images/collection.jpg" },
          { title: "Optical", href: "/shop?category=Optical", img: "/images/malaga.jpg" },
        ].map((c) => (
          <Link key={c.title} href={c.href} className="group relative block aspect-[4/3] overflow-hidden bg-sand">
            <Image src={c.img} alt={c.title} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-olive-950/60 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between text-sand">
              <h3 className="display-title text-xl sm:text-2xl">{c.title}</h3>
              <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
                Shop <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Pillars */}
      <section className="border-t border-line bg-sand/50">
        <div className="container-x py-24">
          <div className="grid items-end gap-6 lg:grid-cols-2">
            <h2 className="display-title text-3xl sm:text-5xl">What we stand for</h2>
            <p className="max-w-md text-sm leading-relaxed text-muted lg:justify-self-end">
              The bull is our symbol of precision, vision and presence. Not aggression — control. Not noise — confidence.
            </p>
          </div>
          <div className="mt-14 grid gap-px bg-line sm:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="bg-cream p-8">
                <span className="font-display text-xs text-olive-500">/0{i + 1}</span>
                <h3 className="display-title mt-6 text-sm">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle strip */}
      <section className="grid grid-cols-2 sm:grid-cols-4">
        {["model-toro", "model-sevilla", "model-ronda", "model-granada"].map((img) => (
          <div key={img} className="relative aspect-square">
            <Image src={`/images/${img}.jpg`} alt="" fill sizes="(min-width:640px) 25vw, 50vw" className="object-cover" />
          </div>
        ))}
      </section>
    </>
  );
}
