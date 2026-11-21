import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listProducts } from "@/lib/products";
import Reveal from "@/components/ui/Reveal";
import FullBanner from "@/components/home/FullBanner";
import CurtainHero from "@/components/home/curtain/CurtainHero";
import LookbookStories from "@/components/home/LookbookStories";
import HorizontalShowcase from "@/components/motion/HorizontalShowcase";
import FloatingGallery from "@/components/motion/FloatingGallery";
import ToroShowcase from "@/components/three/ToroShowcase";
import ImageTrail from "@/components/motion/ImageTrail";
import FlashlightReveal from "@/components/motion/FlashlightReveal";
import PhotoInWord from "@/components/motion/PhotoInWord";
import HomeFAQ from "@/components/home/HomeFAQ";
import Manifesto from "@/components/home/Manifesto";
import FrameChapters from "@/components/home/FrameChapters";
import { PRODUCT_DETAILS } from "@/lib/productDetails";
import ProductCard from "@/components/store/ProductCard";
import NewsletterForm from "@/components/store/NewsletterForm";

export const dynamic = "force-dynamic";

// The launch frames, in the order they stand in the arena
const LAUNCH = ["fiero", "bravo", "nobel"];

// What a chapter needs: the opening line of the description and three quick facts from the product sheet
function chapter(p) {
  const spec = (label) => PRODUCT_DETAILS[p.slug]?.specs.find(([k]) => k === label)?.[1];
  const first = (p.description ?? "").split(/\n\s*\n/)[0].trim();
  const sentences = first.match(/[^.!?]+[.!?]+/g) ?? (first ? [first] : []);
  let blurb = "";
  for (const s of sentences) {
    if (blurb && (blurb + s).length > 190) break;
    blurb += s;
  }
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    images: p.images,
    colors: p.colors ?? [],
    blurb: blurb.trim(),
    facts: [
      ["Frame", spec("Frame material") ?? p.material ?? p.shape],
      ["Weight", spec("Weight")],
      ["Lens", "UV400"],
    ].filter(([, v]) => v),
  };
}

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
  ["model-valencia", "valencia", ""],
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

// Sections switched off for now
const SHOW_TORO = false;
// Off while only the launch frames are live
const SHOW_LOOKBOOK = false; // the story bubbles
const SHOW_COLLECTION = false; // "Shop the collection"
const SHOW_TILES = false; // the Sunglasses / New arrivals tiles
const SHOW_NEW_ARRIVALS = false; // the New arrivals grid
const SHOW_SIGNAL = false; // the RAYVE word that opens onto "The signal has arrived"
const SHOW_ENERGY = false; // "Own the energy", photos following the cursor
const SHOW_GALLERY = false; // "Seen in RAYVE", photos drifting past
const SHOW_FLASHLIGHT = false; // "Made for the light" cursor reveal

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
      {/* Hero: campaign banner (sits under the transparent header) */}
      <h1 className="sr-only">RAYVE — the familiar, broken open</h1>
      <CurtainHero className="-mt-[65px]" />

      {/* The brand line, lighting up word by word */}
      <Manifesto />

      {/* The three launch frames, one chapter each */}
      <FrameChapters frames={LAUNCH.map((s) => bySlug[s]).filter((p) => p?.images?.length).map(chapter)} />

      {/* Lookbook: Instagram-style stories of the frames on model */}
      {SHOW_LOOKBOOK && <section className="px-5 pb-6 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <p className="eyebrow mb-8 flex items-center gap-4 lg:justify-center">
          <span className="hidden h-px w-12 bg-line lg:block" /> The lookbook <span className="h-px flex-1 bg-line lg:w-12 lg:flex-none" />
        </p>
        <LookbookStories products={all.filter((p) => p.category === "Sunglasses")} />
      </section>}

      {/* Collection: pins and scrolls sideways on desktop */}
      {SHOW_COLLECTION && <HorizontalShowcase eyebrow="Collection 01" title="Shop the collection" products={featured.length >= 4 ? [...featured, ...all.filter((p) => !p.featured)] : all} />}

      {/* Full-bleed category tiles */}
      {SHOW_TILES && <section className="grid gap-1 md:grid-cols-2">
        {[
          { title: "Sunglasses", sub: frames(count("Sunglasses")), href: "/shop?category=Sunglasses", img: "/images/model-sevilla.jpg" },
          { title: "New arrivals", sub: "Just landed", href: "/shop?sort=newest", img: "/images/model-arena.jpg" },
        ].map((c) => (
          <Link key={c.title} href={c.href} data-reveal className="group relative block aspect-[4/5] overflow-hidden bg-mist md:aspect-[4/5] lg:aspect-square">
            <Image src={c.img} alt={c.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-olive-950/55 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-10 text-center text-sand md:pb-12">
              <p className="text-[10px] uppercase tracking-[0.3em] text-sand/80">{c.sub}</p>
              <h2 className="display-title mt-3 text-3xl lg:text-4xl">{c.title}</h2>
              <span className="mt-6 border-b border-sand/60 pb-1 text-[11px] uppercase tracking-[0.25em] transition-colors group-hover:border-sand">Shop now</span>
            </div>
          </Link>
        ))}
      </section>}

      {/* What we stand for */}
      <section className="border-y border-line bg-mist">
        <div className="container-home section-y">
          <Reveal className="section-head">
            <p className="eyebrow">The mark</p>
            <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">What we stand for</h2>
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

      {/* Brand moment: the campaign photo seen through the letters of RAYVE, opening up on scroll */}
      {SHOW_SIGNAL && <PhotoInWord image="/images/banners/the-signal.jpg" alt="RAYVE sunglasses floating before a sunlit gateway" focus="20% 50%" line="Poise. Tension. Precision. Command." sub="Collection 01 — premium, in the everyday." />}

      {/* New arrivals grid */}
      {SHOW_NEW_ARRIVALS && <section className="container-home section-y">
        <SectionHead eyebrow="Just landed" title="New arrivals" href="/shop?sort=newest" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {newest.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>}

      {/* Campaign banner */}
      <FullBanner src="/images/banners/break-the-familiar.jpg" alt="RAYVE — Break the familiar" />

      {/* Craft details */}
      <section className="container-home section-y">
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

      {/* Signature product in 3D: rotates, folds and changes lens tint as you scroll */}
      {/* Hidden for now — set SHOW_TORO to true to bring it back */}
      {SHOW_TORO && <ToroShowcase product={spotlight} />}

      {/* Editorial split */}
      <section className="grid bg-olive-800 text-sand lg:grid-cols-2">
        <div data-reveal className="group relative aspect-[4/5] overflow-hidden md:aspect-[16/11] lg:aspect-auto lg:min-h-[640px]">
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

      {/* Image trail: campaign photos follow the cursor */}
      {SHOW_ENERGY && <section className="bg-olive-950 text-sand">
        <ImageTrail>
          <div className="flex min-h-svh flex-col items-center justify-center px-5 py-24 text-center">
            <p className="eyebrow text-olive-400">Collection 01</p>
            <p className="display-title mt-6 text-[13vw] leading-[0.9] sm:text-[10vw] lg:text-[8.5vw]" data-no-split>
              Own the
              <br />
              energy
            </p>
            <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-sand/50">
              <span className="max-lg:hidden">Move your cursor</span>
            </p>
          </div>
        </ImageTrail>
      </section>}

      {/* Lifestyle: headline holds still while photos drift past */}
      {SHOW_GALLERY && (
        <FloatingGallery
          eyebrow="Worn in the everyday"
          title="Seen in RAYVE"
          subtitle="A frame you recognise — altered."
          items={GALLERY.map(([img, slug]) => ({
            img: `/images/${img}.jpg`,
            href: bySlug[slug] ? `/product/${slug}` : "/shop",
            label: bySlug[slug]?.name ?? "RAYVE",
            caption: bySlug[slug]?.frameColor ?? "",
          }))}
        />
      )}

      {/* Flashlight: a pool of light follows the pointer and uncovers the campaign photo */}
      {SHOW_FLASHLIGHT && <FlashlightReveal />}

      {/* FAQ */}
      <section className="border-t border-line">
        <div className="container-home section-y">
          <Reveal>
            <HomeFAQ />
          </Reveal>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-line bg-mist">
        <Reveal className="container-home section-y flex flex-col items-center text-center">
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
