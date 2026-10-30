import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pointsBalance } from "@/lib/points";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_VALUE_TIER, POINTS_BELOW_TIER, POINTS_FROM_TIER } from "@/lib/shipping";
import { POINTS_ENABLED } from "@/lib/constants";
import { notFound } from "next/navigation";

export const metadata = { title: "RAYVE points" };

const KIND = { EARNED: "Earned", SPENT: "Used", REFUNDED: "Returned", ADJUSTED: "Adjusted" };

export default async function PointsPage() {
  if (!POINTS_ENABLED) notFound();
  const user = await requireUser("/account/points");
  const [balance, history] = await Promise.all([
    pointsBalance(user.id),
    prisma.pointsEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="bg-olive-800 p-6 text-sand sm:p-8">
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-sand/60">
          <Sparkles className="size-3.5" /> RAYVE points
        </p>
        <p className="display-title mt-4 text-5xl" data-no-split>
          {balance.available.toLocaleString("en-IN")}
        </p>
        <p className="mt-2 text-sm text-sand/75">Worth {formatPrice(balance.available)} on any order — use them whenever you like.</p>
        {balance.pending > 0 && (
          <p className="mt-4 border-t border-sand/15 pt-4 text-sm text-sand/75">
            + {balance.pending.toLocaleString("en-IN")} points on their way — they unlock when your order is delivered.
          </p>
        )}
      </div>

      <div className="grid gap-px bg-line sm:grid-cols-3">
        {[
          ["1 point = ₹1", "Spend them at checkout, all at once or a few at a time."],
          [`${POINTS_BELOW_TIER} points`, `On every order below ${formatPrice(ORDER_VALUE_TIER)}.`],
          [`${POINTS_FROM_TIER} points`, `On every order of ${formatPrice(ORDER_VALUE_TIER)} or more.`],
        ].map(([k, v]) => (
          <div key={k} className="bg-paper p-5">
            <p className="font-display text-xs uppercase tracking-[0.18em]">{k}</p>
            <p className="mt-2 text-xs text-muted">{v}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 font-display text-xs uppercase tracking-[0.25em]">History</h2>
        {history.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-muted">No points yet — your first order earns up to {POINTS_FROM_TIER}.</p>
            <Link href="/shop" className="btn-primary mt-6">Start shopping</Link>
          </div>
        ) : (
          <ul className="card divide-y divide-line">
            {history.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                <div className="min-w-0">
                  <p>
                    {KIND[e.kind] ?? e.kind}
                    {e.status === "PENDING" && <span className="ml-2 bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-800">Unlocks on delivery</span>}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {e.note} · {formatDate(e.createdAt)}
                  </p>
                </div>
                <span className={`shrink-0 tabular-nums ${e.points > 0 ? "text-olive-700" : "text-ink"}`}>
                  {e.points > 0 ? "+" : "−"}
                  {Math.abs(e.points).toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
