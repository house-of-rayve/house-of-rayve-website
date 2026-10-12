import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { EDITORIAL_EXCLUDE } from "@/lib/constants";
import FullBanner from "@/components/home/FullBanner";

export const metadata = {
  title: "Lookbook",
  description: "Collection 01, on location — every RAYVE frame as it's meant to be worn.",
  alternates: { canonical: "/lookbook" },
};

// Brand lines that break up the looks (from the brand book)
const INTERLUDES = [
  { line: "Familiar. Altered.", sub: "A frame you recognise, reconsidered through proportion, detail and finish.", image: "/images/bullring.jpg" },
  { line: "Not noise — confidence.", sub: "Strength in stillness, structure and presence.", image: "/images/bull-shadow.jpg" },
];

function Worn({ product, light = false }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group inline-flex items-center gap-4 border px-4 py-3 backdrop-blur transition-colors ${
        light ? "border-sand/30 bg-olive-950/40 text-sand hover:bg-olive-950/60" : "border-line bg-paper hover:border-olive-800"
      }`}
    >
      <span>
        <span className={`block text-[9px] uppercase tracking-[0.25em] ${light ? "text-sand/60" : "text-muted"}`}>Worn</span>
        <span className="block font-display text-[11px] uppercase tracking-[0.18em]">
          {product.name} · {formatPrice(product.price)}
        </span>
      </span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export default async function LookbookPage() {
  const looks = (await listProducts({ category: "Sunglasses" })).filter((p) => p.images[1] && !EDITORIAL_EXCLUDE.includes(p.images[1])).slice(0, 9);

  const blocks = [];
  looks.forEach((p, i) => {
    const photo = p.images[1];
    // Model photography is portrait, so each look keeps its shape: photo and copy side by side, alternating
    const flip = i % 2 === 1;
    blocks.push(
      <section key={p.id} className="container-x section-y grid items-center gap-10 md:grid-cols-12 md:gap-14">
        <div data-reveal className={`relative aspect-[4/5] overflow-hidden bg-mist md:col-span-6 lg:col-span-5 ${flip ? "md:order-2 md:col-start-7 lg:col-start-8" : "lg:col-start-2"}`}>
          <Image src={photo} alt={`${p.name} on model`} fill sizes="(min-width:1024px) 42vw, (min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className={`md:col-span-6 lg:col-span-4 ${flip ? "lg:col-start-2" : "lg:col-start-8"}`}>
          <p className="font-display text-[11px] uppercase tracking-[0.3em] text-olive-700">Look {String(i + 1).padStart(2, "0")}</p>
          <h2 className="display-title mt-5 text-3xl [overflow-wrap:anywhere] sm:text-4xl">{p.name}</h2>
          {p.tagline && <p className="mt-4 text-lg font-light text-muted">{p.tagline}</p>}
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted">{[p.shape, p.frameColor, p.lensColor && `${p.lensColor} lens`].filter(Boolean).join(" · ")}</p>
          <div className="mt-8">
            <Worn product={p} />
          </div>
        </div>
      </section>,
    );
    // a brand interlude after every third look
    const interlude = INTERLUDES[Math.floor(i / 3)];
    if (i % 3 === 2 && interlude) {
      blocks.push(
        <section key={`interlude-${i}`} className="relative isolate flex min-h-[80svh] items-center justify-center overflow-hidden bg-olive-950 px-5 text-center text-sand">
          <Image src={interlude.image} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-30" />
          <div>
            <p className="display-title text-4xl sm:text-6xl lg:text-7xl">{interlude.line}</p>
            <p className="mx-auto mt-6 max-w-md text-sand/70">{interlude.sub}</p>
          </div>
        </section>,
      );
    }
  });

  return (
    <>
      <h1 className="sr-only">The lookbook — Collection 01</h1>
      <FullBanner src="/images/banners/something-big.jpg" alt="RAYVE — Something big is coming" priority reveal={false} underHeader className="-mt-[65px]" />

      {blocks}

      <section className="container-x section-y text-center">
        <p className="eyebrow">Collection 01</p>
        <h2 className="display-title mx-auto mt-4 max-w-xl text-3xl">Find the pair that&apos;s yours</h2>
        <Link href="/shop" className="btn-primary mt-10">
          Shop the collection
        </Link>
      </section>
    </>
  );
}
