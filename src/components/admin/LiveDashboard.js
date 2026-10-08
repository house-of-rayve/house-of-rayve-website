"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IndianRupee, ShoppingCart, Users, Package, TrendingUp, AlertTriangle } from "lucide-react";
import RevenueChart from "./RevenueChart";
import { Panel } from "./PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/constants";

const ACTIVITY_TEXT = {
  "order:created": (d) => `New order ${d.orderNumber} from ${d.customer} · ${formatPrice(d.total)}`,
  "order:updated": (d) => `Order ${d.orderNumber} marked ${STATUS_LABELS[d.status]?.toLowerCase() ?? d.status}`,
  "customer:created": (d) => `New customer signed up: ${d.name}`,
  "customer:updated": () => "Customer details updated",
  "product:changed": () => "Catalogue updated",
};

function timeAgo(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function Kpi({ label, value, sub, Icon }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <Icon className="size-4 text-olive-500" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted">{sub}</p>
    </div>
  );
}

export default function LiveDashboard({ initial }) {
  const { toast } = useToast();
  const [stats, setStats] = useState(initial);
  const [connected, setConnected] = useState(false);
  const [activity, setActivity] = useState([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const es = new EventSource("/api/admin/stream");
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.addEventListener("stats", (e) => {
      setConnected(true);
      setStats(JSON.parse(e.data));
    });
    es.addEventListener("activity", (e) => {
      const evt = JSON.parse(e.data);
      setActivity((a) => [{ ...evt, key: evt.at + evt.type }, ...a].slice(0, 12));
      if (evt.type === "order:created") toast(`New order ${evt.data.orderNumber} · ${formatPrice(evt.data.total)}`);
    });
    const timer = setInterval(() => setTick((t) => t + 1), 30000); // refresh relative times
    return () => {
      es.close();
      clearInterval(timer);
    };
  }, [toast]);

  const { totals, series, statusBreakdown, recentOrders, lowStock, topProducts } = stats;
  const maxStatus = Math.max(1, ...Object.values(statusBreakdown));
  const range = series.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Store performance, updated in real time.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-white px-3 py-1.5 text-xs text-muted sm:self-auto">
          <span className="relative flex size-2">
            {connected && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />}
            <span className={`relative inline-flex size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-stone-400"}`} />
          </span>
          {connected ? "Live" : "Connecting…"} · updated {new Date(stats.generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Kpi label="Total revenue" value={formatPrice(totals.revenue)} sub={`${formatPrice(totals.todayRevenue)} today`} Icon={IndianRupee} />
        <Kpi label="Orders" value={totals.orders} sub={`${totals.todayOrders} today`} Icon={ShoppingCart} />
        <Kpi label="Customers" value={totals.customers} sub={`${totals.newCustomers} new in 30 days`} Icon={Users} />
        <Kpi label="Avg. order value" value={formatPrice(totals.avgOrderValue)} sub={`${totals.products} products listed`} Icon={TrendingUp} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Revenue · last 14 days"
          action={<span className="text-sm font-medium tabular-nums text-ink">{formatPrice(range)}</span>}
          className="xl:col-span-2"
        >
          <div className="p-4 sm:p-5">
            <RevenueChart data={series} />
          </div>
        </Panel>
        <Panel title="Orders by status">
          <ul className="space-y-4 p-5">
            {ORDER_STATUSES.map((s) => {
              const n = statusBreakdown[s] ?? 0;
              return (
                <li key={s}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink">{STATUS_LABELS[s]}</span>
                    <span className="tabular-nums text-muted">{n}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-[#efede4]">
                    <div className="h-full rounded-full bg-olive-500 transition-all duration-500" style={{ width: `${(n / maxStatus) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Recent orders" action={<Link href="/admin/orders" className="text-xs text-olive-700 hover:underline">View all</Link>} className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="px-5 py-2.5 font-medium">Order</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#faf9f5]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium text-ink hover:underline">{o.orderNumber}</Link>
                      <p className="text-xs text-muted">{timeAgo(o.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-ink">{o.user.name}</p>
                      <p className="text-xs text-muted">{o._count.items} {o._count.items === 1 ? "item" : "items"}</p>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Live activity">
            {activity.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">Waiting for activity… new orders, sign-ups and updates appear here instantly.</p>
            ) : (
              <ul className="max-h-64 divide-y divide-line overflow-y-auto">
                {activity.map((a) => (
                  <li key={a.key} className="animate-fade-up px-5 py-3 text-sm">
                    <p className="text-ink">{ACTIVITY_TEXT[a.type]?.(a.data) ?? a.type}</p>
                    <p className="text-xs text-muted">{timeAgo(a.at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Best sellers">
            <ol className="divide-y divide-line">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <span className="w-4 text-xs text-muted">{i + 1}</span>
                  <span className="flex-1 text-ink">{p.name}</span>
                  <span className="tabular-nums text-muted">{p.sold} sold</span>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel title="Low stock">
            {lowStock.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted">All products are well stocked.</p>
            ) : (
              <ul className="divide-y divide-line">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                    <AlertTriangle className="size-3.5 text-amber-600" />
                    <Link href={`/admin/products/${p.id}`} className="flex-1 text-ink hover:underline">{p.name}</Link>
                    <span className="text-xs font-medium text-amber-700">{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
      <p className="flex items-center gap-2 text-xs text-muted">
        <Package className="size-3.5" /> Revenue excludes cancelled orders. Figures in INR.
      </p>
    </div>
  );
}
