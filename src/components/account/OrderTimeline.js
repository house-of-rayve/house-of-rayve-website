import { Check, X } from "lucide-react";

const STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
const LABELS = { PENDING: "Placed", CONFIRMED: "Confirmed", SHIPPED: "Shipped", DELIVERED: "Delivered" };

export default function OrderTimeline({ status }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 bg-stone-100 px-4 py-3 text-sm text-stone-600">
        <X className="size-4" /> This order was cancelled.
      </div>
    );
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-4">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span className={`absolute right-1/2 top-3 h-px w-full ${i <= current ? "bg-olive-800" : "bg-line"}`} />
            )}
            <span
              className={`relative z-10 grid size-6 place-items-center rounded-full border ${
                done ? "border-olive-800 bg-olive-800 text-sand" : "border-line bg-paper"
              }`}
            >
              {done && <Check className="size-3" />}
            </span>
            <span className={`mt-2 text-[11px] uppercase tracking-[0.12em] ${done ? "text-ink" : "text-muted"}`}>
              {LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
