"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/format";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-ink">{label}</p>
      <p className="mt-1 text-ink">{formatPrice(d.revenue)}</p>
      <p className="text-muted">{d.orders} {d.orders === 1 ? "order" : "orders"}</p>
    </div>
  );
}

const compact = (v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);

export default function RevenueChart({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap={4}>
          <CartesianGrid vertical={false} stroke="#ebe8dd" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6f6c5c" }} interval="preserveStartEnd" minTickGap={16} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6f6c5c" }} tickFormatter={compact} width={48} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "#a69f4e", fillOpacity: 0.1 }} />
          <Bar dataKey="revenue" fill="#44442a" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
