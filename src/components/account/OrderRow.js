import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, formatPrice } from "@/lib/format";

export default function OrderRow({ order }) {
  const count = order.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <Link href={`/account/orders/${order.id}`} className="card group flex items-center gap-4 p-4 transition-colors hover:border-olive-200 sm:gap-6 sm:p-5">
      <div className="flex -space-x-4">
        {order.items.slice(0, 3).map((item) => (
          <div key={item.id} className="relative size-14 overflow-hidden border-2 border-paper bg-sand">
            {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm font-medium">{order.orderNumber}</span>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 truncate text-xs text-muted">
          {formatDate(order.createdAt)} · {count} {count === 1 ? "item" : "items"} · {order.items.map((i) => i.name).join(", ")}
        </p>
      </div>
      <span className="hidden text-sm sm:block">{formatPrice(order.total)}</span>
      <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
