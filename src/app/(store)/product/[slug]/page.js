import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, RotateCcw, ScanFace, ShieldCheck, Truck } from "lucide-react";
import { getProductBySlug, listProducts } from "@/lib/products";
import ProductStage from "@/components/store/ProductStage";
import ProductPurchase from "@/components/store/ProductPurchase";
import RecentlyViewed from "@/components/store/RecentlyViewed";
import SizeGuide from "@/components/store/SizeGuide";
import ProductReviews from "@/components/store/ProductReviews";
import { getProductReviews } from "@/lib/reviews";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
import LensTintLab from "@/components/motion/LensTintLab";
import { tintIndexFor } from "@/lib/tints";
import ProductCarousel from "@/components/home/ProductCarousel";
import Price from "@/components/ui/Price";
import { PAGE_IMAGE_ORDER, PRODUCT_LAYOUT, TRY_ON_ENABLED } from "@/lib/constants";
import FilmStrip from "@/components/store/FilmStrip";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  const description = product.tagline ?? product.description;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: `${product.name} · RAYVE`, description, images: product.images.slice(0, 1).map((url) => ({ url, alt: product.name })) },
  };
}

function Accordion({ title, defaultOpen = false, children }) {
  return (
    <details open={defaultOpen} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[11px] font-medium uppercase tracking-[0.2em] [&::-webkit-details-marker]:hidden">
        {title}
        <Plus className="size-4 transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-sm leading-relaxed text-ink/80">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params;
  const { color: colorCode } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Colour options: ?color=<code> picks one (its photos and frame/lens names); the first is the main colour
  const colors = product.colors ?? [];
  const color = colors.find((c) => c.code === colorCode) ?? colors[0] ?? null;
  const frameColor = color?.frame ?? product.frameColor;
  const lensColor = color?.lens ?? product.lensColor;
  const swatches = colors.length > 1 && (
    <div className="mt-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
        Colour <span className="ml-2 normal-case tracking-normal text-ink">{color.name}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {colors.map((c, i) => (
          <Link
            key={c.code}
            href={i === 0 ? `/product/${product.slug}` : `/product/${product.slug}?color=${c.code}`}
            replace
            scroll={false}
            aria-label={c.name}
            aria-current={c.code === color.code ? "true" : undefined}
            title={c.name}
            className={`grid size-9 place-items-center rounded-full ring-1 transition ${c.code === color.code ? "ring-ink" : "ring-transparent hover:ring-line"}`}
          >
            <span className="size-7 overflow-hidden rounded-full ring-1 ring-black/10" style={{ background: `linear-gradient(135deg, ${c.swatch?.[0] ?? "#999"} 50%, ${c.swatch?.[1] ?? c.swatch?.[0] ?? "#666"} 50%)` }} />
          </Link>
        ))}
      </div>
    </div>
  );

  const [reviews, user] = await Promise.all([getProductReviews(product.id), getCurrentUser()]);
  const all = await listProducts();
  const related = [
    ...all.filter((p) => p.id !== product.id && p.shape === product.shape),
    ...all.filter((p) => p.id !== product.id && p.shape !== product.shape && p.category === product.category),
  ].slice(0, 8);

  const specs = [
    ["Shape", product.shape],
    ["Frame", frameColor],
    ["Lens", lensColor],
    ["Material", product.material],
    ["Protection", "100% UV400"],
    ["Category", product.category],
  ].filter(([, v]) => v);

  // This page can show the photos in its own order; cards elsewhere keep the stored one
  const order = PAGE_IMAGE_ORDER[product.slug];
  const mainImages = order ? [...order.filter((i) => i < product.images.length).map((i) => product.images[i]), ...product.images.filter((_, i) => !order.includes(i))] : product.images;
  const pageImages = color?.images?.length ? color.images : mainImages;

  const discount = product.comparePrice > product.price ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  // Structured data so search engines can show the price, stock and rating
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline ?? product.description,
    image: product.images.map((src) => (src.startsWith("http") ? src : `${siteUrl}${src}`)),
    brand: { "@type": "Brand", name: "RAYVE" },
    sku: product.slug,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(reviews.count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: reviews.average.toFixed(1), reviewCount: reviews.count } } : {}),
  };

  // Breadcrumb trail for search results only (not shown on the page)
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: product.category, item: `${siteUrl}/shop?category=${encodeURIComponent(product.category)}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${siteUrl}/product/${product.slug}` },
    ],
  };

  const details = (
    <>
      <Accordion title="Specifications">
        <dl className="divide-y divide-line">
          {specs.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </Accordion>
      <SizeGuide product={product} />
      <Accordion title="Shipping & returns">
        <ul className="space-y-3">
          <li className="flex gap-3"><Truck className="mt-0.5 size-4 shrink-0 text-olive-500" /> Free shipping when you pay online. Dispatched within 24 hours of launch.</li>
          <li className="flex gap-3"><RotateCcw className="mt-0.5 size-4 shrink-0 text-olive-500" /> Return or exchange unworn frames within 7 days of delivery, right from your account.</li>
          <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-olive-500" /> 1-year warranty on frames and hinges.</li>
        </ul>
      </Accordion>
      <Accordion title="Care">
        Clean lenses with the RAYVE microfibre cloth, store frames in their case, and avoid leaving them on a car dashboard or near heat.
      </Accordion>
    </>
  );
  const tryOnLink = TRY_ON_ENABLED && product.category === "Sunglasses" && (
    <Link
      href={`/try-on?p=${product.slug}`}
      className="group mt-3 flex items-center justify-between border border-line px-4 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-olive-800"
    >
      <span className="flex items-center gap-3">
        <ScanFace className="size-4 text-olive-500" /> Try it on with your camera
      </span>
      <span className="text-muted transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }} />
      {PRODUCT_LAYOUT === "film" ? (
        <>
          <FilmStrip
            images={pageImages}
            name={product.name}
            panel={
              <>
                <div className="flex items-center gap-3">
                  <p className="eyebrow">{product.category}</p>
                  {product.shape && <span className="border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted">{product.shape}</span>}
                </div>
                <h1 className="display-title mt-4 text-5xl xl:text-6xl">{product.name}</h1>
                {product.tagline && <p className="mt-3 text-muted">{product.tagline}</p>}
                <div className="mt-6 flex items-baseline gap-3">
                  <Price price={product.price} comparePrice={product.comparePrice} className="text-2xl font-light" />
                  {discount > 0 && <span className="bg-olive-500/20 px-2 py-0.5 text-xs font-medium text-olive-800">Save {discount}%</span>}
                </div>
                <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
                {swatches}
                <div className="mt-6">
                  <ProductPurchase product={product} color={color?.code} />
                  {tryOnLink}
                </div>
                <div className="mt-6 border-t border-line">
                  <Accordion title="Description">{product.description}</Accordion>
                  {details}
                </div>
              </>
            }
          />
        </>
      ) : (
        <>
      {/* Split screen: the photos full-bleed on the left, a dark olive panel with everything else on the right */}
      <div className="lg:grid lg:grid-cols-[3fr_2fr]">
        <div className="min-w-0">
          <div className="px-5 pt-6 sm:px-8 lg:hidden">
            <ProductStage images={pageImages} name={product.name} />
          </div>
          <div className="hidden bg-white lg:block">
            {pageImages.map((src, i) => (
              <div key={src} className="relative h-[calc(100svh-4rem)] min-h-[520px] w-full bg-white">
                <Image src={src} alt={i === 0 ? product.name : ""} fill priority={i === 0} sizes="60vw" className="object-cover" />
                <span className="pointer-events-none absolute bottom-6 left-6 font-display text-[10px] tracking-[0.3em] text-ink/50">
                  {String(i + 1).padStart(2, "0")} / {String(pageImages.length).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="on-dark mt-8 bg-olive-950 lg:mt-0">
          <div data-lenis-prevent className="no-scrollbar px-5 py-12 sm:px-8 lg:sticky lg:top-16 lg:flex lg:h-[calc(100svh-4rem)] lg:flex-col lg:overflow-y-auto lg:px-12 lg:py-12 xl:px-16">
            <div className="w-full max-w-[540px] lg:my-auto 2xl:max-w-[620px]">
              <div className="flex items-center gap-3">
                <p className="font-display text-[10px] uppercase tracking-[0.35em] text-olive-400">{product.category}</p>
                {product.shape && <span className="border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted">{product.shape}</span>}
              </div>
              <h1 className="display-title mt-5 text-5xl text-sand xl:text-7xl">{product.name}</h1>
              {product.tagline && <p className="mt-4 text-lg text-sand/70">{product.tagline}</p>}
              <div className="mt-8 flex items-baseline gap-3">
                <Price price={product.price} comparePrice={product.comparePrice} className="text-2xl font-light" />
                {discount > 0 && <span className="bg-olive-500/20 px-2 py-0.5 text-xs font-medium text-olive-400">Save {discount}%</span>}
              </div>
              <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

              {swatches}
              {/* Frame, lens and material as small tiles; frame and lens carry a dot of their colour */}
              <div className="mt-8 grid auto-cols-fr grid-flow-col gap-2">
                {[
                  ["Frame", frameColor, color?.swatch?.[0]],
                  ["Lens", lensColor, color?.swatch?.[1]],
                  ["Material", product.material, null],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v, dot]) => (
                    <div key={k} className="bg-sand/[0.04] px-4 py-3.5 ring-1 ring-inset ring-sand/10">
                      <p className="font-display text-[9px] uppercase tracking-[0.3em] text-olive-400">{k}</p>
                      <p className="mt-2 flex items-start gap-2 text-[13px] leading-tight text-sand">
                        {dot && <span className="mt-[3px] size-2.5 shrink-0 rounded-full ring-1 ring-sand/25" style={{ background: dot }} />}
                        {v}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="mt-8">
                <ProductPurchase product={product} color={color?.code} />
                {tryOnLink}
              </div>

              <div className="mt-10 border-t border-line">
                <Accordion title="Description" defaultOpen>
                  {product.description}
                </Accordion>
                {details}
              </div>
            </div>
          </div>
        </div>
      </div>

        </>
      )}

      {product.category === "Sunglasses" && (
        <>
          <LensTintLab initialTint={tintIndexFor(product.lensColor)} />
        </>
      )}

      <ProductReviews productId={product.id} slug={product.slug} summary={reviews} signedIn={Boolean(user)} />

      {related.length > 0 && (
        <section className="container-x border-t border-line py-20">
          <ProductCarousel eyebrow="Complete the look" title="You may also like" tabs={[{ label: "Related", products: related, href: `/shop?category=${product.category}` }]} />
        </section>
      )}
      <RecentlyViewed excludeId={product.id} />
    </>
  );
}
