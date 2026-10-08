import { STATUS_LABELS } from "@/lib/constants";

const STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-stone-200 text-stone-600",
  PAID: "bg-emerald-100 text-emerald-800",
  REFUNDED: "bg-stone-200 text-stone-600",
};

export default function StatusBadge({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STYLES[status] ?? "bg-stone-100 text-stone-700"} ${className}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
