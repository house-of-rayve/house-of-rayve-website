import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { getProductBySlug, listProducts } from "@/lib/products";
import ProductGallery from "@/components/store/ProductGallery";
import ProductPurchase from "@/components/store/ProductPurchase";
import RecentlyViewed from "@/components/store/RecentlyViewed";
import ProductCarousel from "@/components/home/ProductCarousel";
import Price from "@/components/ui/Price";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return product ? { title: product.name, description: product.tagline ?? product.description } : { title: "Product" };
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

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await listProducts();
  const related = [
    ...all.filter((p) => p.id !== product.id && p.shape === product.shape),
    ...all.filter((p) => p.id !== product.id && p.shape !== product.shape && p.category === product.category),
  ].slice(0, 8);

  const specs = [
    ["Shape", product.shape],
    ["Frame", product.frameColor],
    ["Lens", product.lensColor],
    ["Material", product.material],
    ["Protection", "100% UV400"],
    ["Category", product.category],
  ].filter(([, v]) => v);

  const discount = product.comparePrice > product.price ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  return (
    <>
      <div className="container-x pb-12 pt-6 sm:pb-16 sm:pt-8">
        <nav className="mb-6 text-xs text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-ink">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} badge={discount ? `−${discount}%` : null} />
          </div>
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center gap-3">
                <p className="eyebrow">{product.category}</p>
                {product.shape && (
                  <Link href={`/shop?shape=${encodeURIComponent(product.shape)}`} className="border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted hover:border-olive-800 hover:text-ink">
                    {product.shape}
                  </Link>
                )}
              </div>
              <h1 className="display-title mt-3 text-3xl sm:text-4xl">{product.name}</h1>
              {product.tagline && <p className="mt-3 text-muted">{product.tagline}</p>}
              <div className="mt-6 flex items-baseline gap-3">
                <Price price={product.price} comparePrice={product.comparePrice} className="text-2xl font-light" />
                {discount > 0 && <span className="bg-olive-500/20 px-2 py-0.5 text-xs font-medium text-olive-800">Save {discount}%</span>}
              </div>
              <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

              <div className="mt-6 grid grid-cols-3 gap-px bg-line text-center text-[10px] uppercase tracking-[0.12em] text-muted">
                <div className="bg-paper px-2 py-3"><span className="block text-ink">{product.frameColor}</span>Frame</div>
                <div className="bg-paper px-2 py-3"><span className="block text-ink">{product.lensColor}</span>Lens</div>
                <div className="bg-paper px-2 py-3"><span className="block text-ink">{product.material}</span>Material</div>
              </div>

              <div className="mt-6">
                <ProductPurchase product={product} />
              </div>

              <div className="mt-8 border-t border-line">
                <Accordion title="Description" defaultOpen>
                  {product.description}
                </Accordion>
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
                <Accordion title="Shipping & returns">
                  <ul className="space-y-3">
                    <li className="flex gap-3"><Truck className="mt-0.5 size-4 shrink-0 text-olive-500" /> Free shipping above ₹2,999. Dispatched within 24 hours, delivered in 2–6 working days.</li>
                    <li className="flex gap-3"><RotateCcw className="mt-0.5 size-4 shrink-0 text-olive-500" /> Return or exchange unworn frames within 7 days of delivery, right from your account.</li>
                    <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-olive-500" /> 1-year warranty on frames and hinges.</li>
                  </ul>
                </Accordion>
                <Accordion title="Care">
                  Clean lenses with the RAYVE microfibre cloth, store frames in their case, and avoid leaving them on a car dashboard or near heat.
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-x border-t border-line py-20">
          <ProductCarousel eyebrow="Complete the look" title="You may also like" tabs={[{ label: "Related", products: related, href: `/shop?category=${product.category}` }]} />
        </section>
      )}
      <RecentlyViewed excludeId={product.id} />
    </>
  );
}
