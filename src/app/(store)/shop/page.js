import Image from "next/image";
import Link from "next/link";
import { listProducts } from "@/lib/products";
import ShopExplorer from "@/components/store/ShopExplorer";

export const metadata = { title: "Shop" };

const BANNERS = {
  Sunglasses: { img: "/images/collection.jpg", text: "Distinctive silhouettes with 100% UV400 lenses, made for ordinary days." },
  Optical: { img: "/images/malaga.jpg", text: "Everyday optical frames in translucent acetate. Bring your own prescription." },
  default: { img: "/images/model-arena.jpg", text: "Premium, in the everyday. Every frame, every shape, in one place." },
};

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const products = await listProducts();
  const title = sp.q ? `Results for “${sp.q}”` : sp.category || (sp.shape && !sp.shape.includes(",") ? `${sp.shape} frames` : "All eyewear");
  const banner = BANNERS[sp.category] ?? BANNERS.default;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-olive-900 text-sand">
        <Image src={banner.img} alt="" fill priority sizes="100vw" className="-z-10 object-cover object-center opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-olive-950/80 to-olive-950/20" />
        <div className="container-x py-14 sm:py-20">
          <nav className="text-[11px] uppercase tracking-[0.2em] text-sand/60">
            <Link href="/" className="hover:text-sand">Home</Link> <span className="mx-2">/</span> <span className="text-sand">Shop</span>
          </nav>
          <h1 className="display-title mt-5 text-3xl sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-sand/75">{banner.text}</p>
        </div>
      </section>
      <div className="container-x py-10 sm:py-12">
        <ShopExplorer key={JSON.stringify(sp)} products={products} initial={sp} />
      </div>
    </>
  );
}
