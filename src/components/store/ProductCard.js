import Image from "next/image";
import Link from "next/link";
import Price from "@/components/ui/Price";

export default function ProductCard({ product, priority = false }) {
  const [primary, secondary] = product.images;
  const soldOut = product.stock <= 0;
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {primary && (
          <Image
            src={primary}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-all duration-700 group-hover:scale-[1.03] ${secondary ? "group-hover:opacity-0" : ""}`}
          />
        )}
        {secondary && (
          <Image
            src={secondary}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {soldOut ? (
            <span className="bg-paper px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-muted">Sold out</span>
          ) : product.comparePrice > product.price ? (
            <span className="bg-olive-800 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-sand">Offer</span>
          ) : product.stock <= 5 ? (
            <span className="bg-paper px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-olive-800">Few left</span>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xs uppercase tracking-[0.18em]">{product.name}</h3>
          <p className="mt-1.5 text-xs text-muted">{product.frameColor}</p>
        </div>
        <Price price={product.price} comparePrice={product.comparePrice} className="flex-col items-end gap-0 text-sm sm:flex-row sm:items-baseline sm:gap-2" />
      </div>
    </Link>
  );
}
