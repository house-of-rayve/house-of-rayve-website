import { formatPrice } from "@/lib/format";

export default function Price({ price, comparePrice, className = "" }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span>{formatPrice(price)}</span>
      {comparePrice > price && <span className="text-muted line-through decoration-1">{formatPrice(comparePrice)}</span>}
    </span>
  );
}
