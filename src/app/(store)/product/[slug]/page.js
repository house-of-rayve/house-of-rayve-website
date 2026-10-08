import { notFound } from "next/navigation";
import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { getProductBySlug, listProducts } from "@/lib/products";
import ProductGallery from "@/components/store/ProductGallery";
import AddToBag from "@/components/store/AddToBag";
import ProductCard from "@/components/store/ProductCard";
import Price from "@/components/ui/Price";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await listProducts({ category: product.category, take: 5 }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const specs = [
    ["Shape", product.shape],
    ["Frame", product.frameColor],
    ["Lens", product.lensColor],
    ["Material", product.material],
    ["Category", product.category],
  ].filter(([, v]) => v);

  return (
    <>
      <div className="container-x py-8 sm:py-12">
        <nav className="mb-6 text-xs text-muted">
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          <span className="mx-2">/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-ink">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>
          <div className="lg:col-span-5 lg:pt-4">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">{product.category}</p>
              <h1 className="display-title mt-3 text-3xl sm:text-4xl">{product.name}</h1>
              {product.tagline && <p className="mt-3 text-muted">{product.tagline}</p>}
              <Price price={product.price} comparePrice={product.comparePrice} className="mt-6 text-xl" />
              <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

              <div className="mt-8">
                <AddToBag product={product} />
              </div>

              <p className="mt-8 text-sm leading-relaxed text-ink/80">{product.description}</p>

              <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3">
                    <dt className="text-muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-8 grid gap-4 text-xs text-muted">
                <li className="flex items-center gap-3"><Truck className="size-4 text-olive-500" /> Free shipping above ₹2,999 · Delivered in 3–5 days</li>
                <li className="flex items-center gap-3"><RotateCcw className="size-4 text-olive-500" /> Easy 7-day returns & exchanges</li>
                <li className="flex items-center gap-3"><ShieldCheck className="size-4 text-olive-500" /> 100% UV400 protection · 1-year warranty</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-x border-t border-line py-20">
          <h2 className="display-title mb-10 text-xl sm:text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
