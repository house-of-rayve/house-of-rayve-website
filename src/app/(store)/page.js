import Image from "next/image";
import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { listProducts } from "@/lib/products";
import Reveal from "@/components/ui/Reveal";
import HeroSlider from "@/components/home/HeroSlider";
import ShapeRail from "@/components/home/ShapeRail";
import ProductCarousel from "@/components/home/ProductCarousel";
import ShopTheLook from "@/components/home/ShopTheLook";
import NewsletterForm from "@/components/store/NewsletterForm";

export const dynamic = "force-dynamic";

const PERKS = [
  { Icon: Truck, text: "Free shipping above ₹2,999" },
  { Icon: RotateCcw, text: "7-day easy returns" },
  { Icon: ShieldCheck, text: "100% UV400 lenses" },
  { Icon: Sparkles, text: "1-year warranty" },
];

export default async function HomePage() {
  const all = await listProducts();
  const featured = all.filter((p) => p.featured);
  const newest = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const offers = all.filter((p) => p.comparePrice > p.price || p.stock <= 5);
  const shapeCounts = all.reduce((acc, p) => ({ ...acc, [p.shape]: (acc[p.shape] ?? 0) + 1 }), {});
  const count = (category) => all.filter((p) => p.category === category).length;

  return (
    <>
      <HeroSlider />

      {/* Perks bar */}
      <section className="border-b border-line">
        <div className="container-x no-scrollbar flex gap-8 overflow-x-auto py-5 sm:justify-between">
          {PERKS.map(({ Icon, text }) => (
            <p key={text} className="flex shrink-0 items-center gap-2.5 text-xs text-muted">
              <Icon className="size-4 text-olive-500" strokeWidth={1.5} /> {text}
            </p>
          ))}
        </div>
      </section>

      {/* Statement */}
      <section className="container-x py-28 text-center sm:py-36">
        <Reveal>
          <p className="eyebrow">Premium, in the everyday</p>
          <p className="mx-auto mt-8 max-w-3xl text-2xl font-light leading-snug text-olive-900 sm:text-4xl sm:leading-tight">
            Most sunglasses live at two extremes. <span className="text-olive-500">RAYVE was created for everything in between.</span>
          </p>
        </Reveal>
      </section>

      {/* Product rail with tabs */}
      <section className="container-x pb-28 sm:pb-36">
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
      <section className="grid gap-1 sm:grid-cols-2">
        {[
          { title: "Sunglasses", sub: `${count("Sunglasses")} frames`, href: "/shop?category=Sunglasses", img: "/images/model-sevilla.jpg" },
          { title: "Optical", sub: `${count("Optical")} frames`, href: "/shop?category=Optical", img: "/images/malaga.jpg" },
        ].map((c) => (
          <Link key={c.title} href={c.href} className="group relative block aspect-[4/5] overflow-hidden bg-mist lg:aspect-square">
            <Image src={c.img} alt={c.title} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-olive-950/55 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-12 text-center text-sand">
              <p className="text-[10px] uppercase tracking-[0.3em] text-sand/80">{c.sub}</p>
              <h2 className="display-title mt-3 text-3xl sm:text-4xl">{c.title}</h2>
              <span className="mt-6 border-b border-sand/60 pb-1 text-[11px] uppercase tracking-[0.25em] transition-colors group-hover:border-sand">
                Shop now
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Shop the look */}
      <section className="container-x py-28 sm:py-36">
        <Reveal>
          <ShopTheLook products={all} />
        </Reveal>
      </section>

      {/* Editorial split */}
      <section className="grid bg-olive-800 text-sand lg:grid-cols-2">
        <div className="group relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[720px]">
          <Image
            src="/images/campaign-matador.jpg"
            alt="RAYVE campaign at the bullring"
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
          />
        </div>
        <Reveal className="flex flex-col justify-center px-6 py-20 sm:px-16 lg:px-24">
          <p className="eyebrow text-olive-400">A different way of seeing the familiar</p>
          <h2 className="display-title mt-6 text-3xl sm:text-4xl">Where the familiar takes an unexpected form</h2>
          <p className="mt-6 max-w-md leading-relaxed text-sand/75">
            Rayve takes forms, codes and references we already recognise and shifts them through proportion, detail,
            contrast and attitude. A classic idea, seen through another point of view.
          </p>
          <Link href="/about" className="mt-10 self-start border-b border-sand/60 pb-1 text-[11px] uppercase tracking-[0.25em] hover:border-sand">
            Discover Rayve
          </Link>
        </Reveal>
      </section>

      {/* Shop by shape */}
      <section className="container-x py-28 sm:py-36">
        <Reveal className="mb-12 text-center">
          <p className="eyebrow">Find your frame</p>
          <h2 className="display-title mt-4 text-2xl sm:text-3xl">Shop by shape</h2>
        </Reveal>
        <Reveal delay={100}>
          <ShapeRail counts={shapeCounts} />
        </Reveal>
      </section>

      {/* Newsletter */}
      <section className="border-t border-line bg-mist">
        <Reveal className="container-x flex flex-col items-center py-24 text-center">
          <p className="eyebrow">The Rayve list</p>
          <h2 className="display-title mt-4 max-w-xl text-2xl sm:text-3xl">New frames, first</h2>
          <p className="mt-4 max-w-md text-sm text-muted">Early access to new drops, restocks and private previews. No noise.</p>
          <div className="mt-10 w-full max-w-md">
            <NewsletterForm variant="light" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
