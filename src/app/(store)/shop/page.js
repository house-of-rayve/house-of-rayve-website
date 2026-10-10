import Link from "next/link";
import { listProducts } from "@/lib/products";
import ShopExplorer from "@/components/store/ShopExplorer";

export const metadata = { title: "Shop" };

const BANNERS = {
  Sunglasses: { text: "Distinctive silhouettes with 100% UV400 lenses, made for ordinary days." },
  default: { text: "Premium, in the everyday. Every frame, every shape, in one place." },
};

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const products = await listProducts();
  const title = sp.q ? `Results for “${sp.q}”` : sp.category || (sp.shape && !sp.shape.includes(",") ? `${sp.shape} frames` : "All eyewear");
  const banner = BANNERS[sp.category] ?? BANNERS.default;

  return (
    <>
      <section className="container-x pb-4 pt-10 text-center sm:pt-16">
        <nav className="text-[11px] uppercase tracking-[0.2em] text-muted">
          <Link href="/" className="hover:text-ink">Home</Link> <span className="mx-2">/</span> <span className="text-ink">Shop</span>
        </nav>
        <h1 className="display-title mt-6 text-3xl sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted">{banner.text}</p>
      </section>
      <div className="container-x py-10 sm:py-12">
        <ShopExplorer key={JSON.stringify(sp)} products={products} initial={sp} />
      </div>
    </>
  );
}
