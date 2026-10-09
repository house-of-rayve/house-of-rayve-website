import Image from "next/image";
import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { listProducts } from "@/lib/products";
import Reveal from "@/components/ui/Reveal";
import HeroSlider from "@/components/home/HeroSlider";
import ProductCarousel from "@/components/home/ProductCarousel";
import ShopTheLook from "@/components/home/ShopTheLook";
import ProductSpotlight from "@/components/home/ProductSpotlight";
import FrameFinder from "@/components/home/FrameFinder";
import HomeFAQ from "@/components/home/HomeFAQ";
import ProductCard from "@/components/store/ProductCard";
import NewsletterForm from "@/components/store/NewsletterForm";

export const dynamic = "force-dynamic";

const PERKS = [
  { Icon: Truck, text: "Free shipping above ₹2,999" },
  { Icon: RotateCcw, text: "7-day easy returns" },
  { Icon: ShieldCheck, text: "100% UV400 lenses" },
  { Icon: Sparkles, text: "1-year warranty" },
];

const CRAFT = [
  { value: "UV400", title: "Full protection", text: "Every sunglass lens blocks 100% of UVA and UVB rays." },
  { value: "Acetate", title: "Italian & bio-acetate", text: "Frames cut from premium acetate and hand-polished for depth of colour." },
  { value: "Horns", title: "Signature hinges", text: "RAYVE signature hinges, with the horns marked on every pair." },
  { value: "1 year", title: "Warranty", text: "Covered against manufacturing defects in the frame and hinges." },
];

const PILLARS = [
  { title: "The horns", text: "Sweeping horns express strength, presence and controlled confidence." },
  { title: "The bridge", text: "The connecting line represents the bridge of glasses." },
  { title: "The face", text: "Sculpted cuts subtly define the bull's face." },
];

const GALLERY = [
  ["model-toro", "toro", "row-span-2"],
  ["model-sevilla", "sevilla", ""],
  ["model-cordoba", "cordoba", ""],
  ["model-granada", "granada", "row-span-2"],
  ["model-ronda", "ronda", ""],
  ["model-alba", "alba", ""],
];

function SectionHead({ eyebrow, title, href, linkLabel = "View all", center = false }) {
  return (
    <Reveal className={`section-head flex gap-4 ${center ? "flex-col items-center text-center" : "flex-wrap items-end justify-between"}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group flex items-center gap-2 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.2em]">
          {linkLabel} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}

export default async function HomePage() {
  const all = await listProducts();
  const featured = all.filter((p) => p.featured);
  const newest = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const offers = all.filter((p) => p.comparePrice > p.price || p.stock <= 5);
  const count = (category) => all.filter((p) => p.category === category).length;
  const frames = (n) => `${n} ${n === 1 ? "frame" : "frames"}`;
  const spotlight = all.find((p) => p.slug === "toro") ?? featured[0] ?? all[0];
  const bySlug = Object.fromEntries(all.map((p) => [p.slug, p]));

  return (
    <>
      <HeroSlider />

      {/* Perks bar (height is part of the first-screen calculation in HeroSlider) */}
      <section className="border-b border-line">
        <div className="container-x no-scrollbar flex h-16 items-center gap-8 overflow-x-auto md:h-20 md:justify-between">
          {PERKS.map(({ Icon, text }) => (
            <p key={text} className="flex shrink-0 items-center gap-3 text-sm text-ink/80 md:text-[15px]">
              <Icon className="size-5 text-olive-500" strokeWidth={1.5} /> {text}
            </p>
          ))}
        </div>
      </section>

      {/* Statement */}
      <section className="container-x section-y text-center">
        <Reveal>
          <p className="eyebrow">Premium, in the everyday</p>
          <p className="mx-auto mt-8 max-w-3xl text-2xl font-light leading-snug text-olive-900 md:text-3xl lg:text-4xl lg:leading-tight">
            Most sunglasses live at two extremes. <span className="text-olive-500">RAYVE was created for everything in between.</span>
          </p>
        </Reveal>
      </section>

      {/* Product rail with tabs */}
      <section className="container-x pb-20 md:pb-24 lg:pb-28">
        <Reveal>
          <ProductCarousel
            eyebrow="Collection 01"
            title="Shop the collection"
            tabs={[
              { label: "Bestsellers", products: featured.length ? featured : all.slice(0, 6), href: "/shop" },
              { label: "New in", products: newest.slice(0, 8), href: "/shop?sort=newest" },
              ...(offers.length ? [{ label: "Last pieces", products: offers, href: "/shop" }] : []),
            ]}
          />
        </Reveal>
      </section>

      {/* Full-bleed category tiles */}
      <section className="grid gap-1 md:grid-cols-2">
        {[
          { title: "Sunglasses", sub: frames(count("Sunglasses")), href: "/shop?category=Sunglasses", img: "/images/model-sevilla.jpg" },
          { title: "Optical", sub: frames(count("Optical")), href: "/shop?category=Optical", img: "/images/malaga.jpg" },
        ].map((c) => (
          <Link key={c.title} href={c.href} className="group relative block aspect-[4/5] overflow-hidden bg-mist md:aspect-[4/5] lg:aspect-square">
            <Image src={c.img} alt={c.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-olive-950/55 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-10 text-center text-sand md:pb-12">
              <p className="text-[10px] uppercase tracking-[0.3em] text-sand/80">{c.sub}</p>
              <h2 className="display-title mt-3 text-3xl lg:text-4xl">{c.title}</h2>
              <span className="mt-6 border-b border-sand/60 pb-1 text-[11px] uppercase tracking-[0.25em] transition-colors group-hover:border-sand">Shop now</span>
            </div>
          </Link>
        ))}
      </section>

      {/* New arrivals grid */}
      <section className="container-x section-y">
        <SectionHead eyebrow="Just landed" title="New arrivals" href="/shop?sort=newest" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {newest.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Signature product */}
      {spotlight && (
        <section>
          <ProductSpotlight product={spotlight} />
        </section>
      )}

      {/* Frame finder */}
      <section className="border-y border-line bg-mist">
        <div className="container-x section-y">
          <Reveal>
            <FrameFinder products={all} />
          </Reveal>
        </div>
      </section>

      {/* Shop the look */}
      <section className="container-x section-y">
        <Reveal>
          <ShopTheLook products={all} />
        </Reveal>
      </section>

      {/* Editorial split */}
      <section className="grid bg-olive-800 text-sand lg:grid-cols-2">
        <div className="group relative aspect-[4/5] overflow-hidden md:aspect-[16/11] lg:aspect-auto lg:min-h-[640px]">
          <Image src="/images/campaign-matador.jpg" alt="RAYVE campaign at the bullring" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1.5s] group-hover:scale-105" />
        </div>
        <Reveal className="flex flex-col justify-center px-5 py-20 sm:px-8 md:px-16 lg:px-20 xl:px-24">
          <p className="eyebrow text-olive-400">A different way of seeing the familiar</p>
          <h2 className="display-title mt-6 text-3xl lg:text-4xl">Where the familiar takes an unexpected form</h2>
          <p className="mt-6 max-w-md leading-relaxed text-sand/75">
            Rayve takes forms, codes and references we already recognise and shifts them through proportion, detail,
            contrast and attitude. A classic idea, seen through another point of view.
          </p>
          <Link href="/about" className="mt-10 self-start border-b border-sand/60 pb-1 text-[11px] uppercase tracking-[0.25em] hover:border-sand">
            Discover Rayve
          </Link>
        </Reveal>
      </section>

      {/* Craft details */}
      <section className="container-x section-y">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="relative aspect-[4/5] overflow-hidden bg-mist md:aspect-[16/10] lg:col-span-5 lg:aspect-auto lg:min-h-[520px]">
            <Image src="/images/matador.jpg" alt="RAYVE temple detail with the signature horns" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
          </Reveal>
          <div className="flex flex-col justify-center lg:col-span-7">
            <Reveal>
              <p className="eyebrow">The details</p>
              <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">Made to be worn every day</h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
                Distinctive silhouettes, refined details and an elevated finish — the pair beside your keys, the pair you reach for without thinking.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-px bg-line sm:grid-cols-2">
              {CRAFT.map((c, i) => (
                <Reveal key={c.title} delay={i * 80} className="bg-canvas p-6 sm:p-8">
                  <p className="font-display text-xl text-olive-500">{c.value}</p>
                  <h3 className="mt-4 font-display text-[11px] uppercase tracking-[0.2em]">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we stand for */}
      <section className="border-y border-line bg-mist">
        <div className="container-x section-y">
          <Reveal className="section-head grid items-end gap-6 lg:grid-cols-2">
            <div>
              <p className="eyebrow">The symbol</p>
              <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">What we stand for</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted lg:justify-self-end">
              The bull is our symbol of precision, vision and presence. Not aggression — control. Not noise — confidence.
            </p>
          </Reveal>
          <div className="grid gap-px bg-line md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100} className="group bg-canvas p-6 transition-colors duration-500 hover:bg-olive-800 hover:text-sand sm:p-8">
                <span className="font-display text-xs text-olive-500">/0{i + 1}</span>
                <h3 className="display-title mt-6 text-sm">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-sand/70">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle gallery */}
      {/* Heading stays in the container; the grid runs edge to edge */}
      <section className="section-y">
        <div className="container-x">
          <SectionHead eyebrow="Worn by you" title="In the everyday" href="/shop" linkLabel="Shop all" />
        </div>
        <div className="grid auto-rows-[180px] grid-cols-2 gap-1 sm:auto-rows-[240px] md:grid-cols-4 lg:auto-rows-[300px] xl:auto-rows-[360px]">
          {GALLERY.map(([img, slug, span]) => {
            const p = bySlug[slug];
            return (
              <Link key={img} href={p ? `/product/${slug}` : "/shop"} className={`group relative overflow-hidden bg-mist ${span}`}>
                <Image src={`/images/${img}.jpg`} alt={p ? `${p.name} worn` : ""} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
                {p && (
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between bg-gradient-to-t from-olive-950/70 to-transparent p-5 text-sand md:p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="font-display text-[10px] uppercase tracking-[0.2em]">{p.name}</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line">
        <div className="container-x section-y">
          <Reveal>
            <HomeFAQ />
          </Reveal>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-line bg-mist">
        <Reveal className="container-x section-y flex flex-col items-center text-center">
          <p className="eyebrow">The Rayve list</p>
          <h2 className="display-title mt-4 max-w-xl text-2xl sm:text-3xl lg:text-4xl">New frames, first</h2>
          <p className="mt-4 max-w-md text-sm text-muted">Early access to new drops, restocks and private previews. No noise.</p>
          <div className="mt-10 w-full max-w-md">
            <NewsletterForm variant="light" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
