import "server-only";
import { formatPrice } from "@/lib/format";
import { siteUrl as SITE } from "@/lib/site";

// Transactional email through Resend (https://resend.com). Set RESEND_API_KEY and EMAIL_FROM
// (e.g. "RAYVE <orders@houseofrayve.com>", on a domain verified in Resend); ADMIN_NOTIFY_EMAIL gets new-order alerts.
// Without a key, emails are skipped quietly so orders never fail because of email.
const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "RAYVE <orders@houseofrayve.com>";
const ADMIN = process.env.ADMIN_NOTIFY_EMAIL;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function send(to, subject, html) {
  if (!API_KEY || !to) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) console.error("Email failed", res.status, await res.text().catch(() => ""));
}

// Simple, table-based layout that renders in every mail client
function layout(title, intro, order, cta) {
  const rows = order.items
    .map(
      (i) => `<tr><td style="padding:8px 0;color:#1d1d17">${esc(i.name)} <span style="color:#7a7766">× ${i.quantity}</span></td><td align="right" style="padding:8px 0">${formatPrice(i.price * i.quantity)}</td></tr>`,
    )
    .join("");
  const line = (label, value, bold) =>
    `<tr><td style="padding:4px 0;color:${bold ? "#1d1d17" : "#7a7766"};${bold ? "font-weight:600" : ""}">${label}</td><td align="right" style="padding:4px 0;${bold ? "font-weight:600" : ""}">${value}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#f1efe8;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1d1d17">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1efe8;padding:32px 12px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fdfcf9">
<tr><td style="background:#44442a;padding:28px 32px;color:#e9e2d0;font-size:13px;letter-spacing:6px">R A Y V E</td></tr>
<tr><td style="padding:32px">
<p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#a69f4e;text-transform:uppercase">Order ${esc(order.orderNumber)}</p>
<h1 style="margin:0 0 14px;font-size:22px;font-weight:600">${esc(title)}</h1>
<p style="margin:0 0 24px;line-height:1.6;color:#4a483c">${intro}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e1d6;border-bottom:1px solid #e5e1d6;margin-bottom:12px">${rows}</table>
<table width="100%" cellpadding="0" cellspacing="0">
${line("Subtotal", formatPrice(order.subtotal))}
${order.discount ? line(`Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ""}`, `−${formatPrice(order.discount)}`) : ""}
${line("Shipping", order.shippingFee ? formatPrice(order.shippingFee) : "Free")}
${order.pointsUsed ? line("RAYVE points", `−${formatPrice(order.pointsUsed)}`) : ""}
${line("Total", formatPrice(order.total), true)}
</table>
<p style="margin:24px 0 0;line-height:1.6;color:#4a483c">Shipping to ${esc(order.shipName)}, ${esc(order.shipLine1)}${order.shipLine2 ? `, ${esc(order.shipLine2)}` : ""}, ${esc(order.shipCity)}, ${esc(order.shipState)} ${esc(order.shipPostalCode)}</p>
${cta ? `<p style="margin:28px 0 0"><a href="${cta.href}" style="display:inline-block;background:#44442a;color:#e9e2d0;padding:12px 22px;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase">${cta.label}</a></p>` : ""}
</td></tr>
<tr><td style="padding:20px 32px;background:#f1efe8;color:#7a7766;font-size:12px">Questions? Write to us at <a href="mailto:info@houseofrayve.com" style="color:#44442a">info@houseofrayve.com</a></td></tr>
</table></td></tr></table></body></html>`;
}

const MESSAGES = {
  placed: (o) => ({
    subject: `Your RAYVE order ${o.orderNumber} is placed`,
    title: "Thank you — your order is placed",
    intro: `${o.paymentMethod === "COD" ? "We've received your order. You'll pay on delivery." : "Your payment is confirmed and your order is being prepared."}${o.pointsEarned ? ` It earns you ${o.pointsEarned} RAYVE points (₹${o.pointsEarned}), yours to use once it's delivered.` : ""}${o.awb ? ` Your courier pickup is booked — <span style="text-transform:capitalize">${esc(o.courier ?? "")}</span>, AWB ${esc(o.awb)}. Follow it any time with the link below.` : ""}`,
  }),
  SHIPPED: (o) => ({
    subject: `Your RAYVE order ${o.orderNumber} has shipped`,
    title: "Your frames are on their way",
    intro: `Your order has left our studio and is on its way to you.${o.awb ? ` Courier: <span style="text-transform:capitalize">${esc(o.courier ?? "")}</span> · AWB ${esc(o.awb)}.` : ""}`,
  }),
  DELIVERED: (o) => ({ subject: `Your RAYVE order ${o.orderNumber} was delivered`, title: "Delivered", intro: "Your order has been delivered. We hope you love your new frames." }),
  CANCELLED: (o) => ({ subject: `Your RAYVE order ${o.orderNumber} was cancelled`, title: "Order cancelled", intro: "Your order has been cancelled. If you paid online, the refund will be processed to your original payment method." }),
};

/**
 * Sends the customer the email for `kind` ("placed" or a new order status), plus a new-order alert to the admin.
 * `order` must include `items` and `user { name, email }`.
 */
export async function sendOrderEmails(order, kind) {
  const message = MESSAGES[kind]?.(order);
  if (!message || !API_KEY) return;
  const link =
    (kind === "placed" || kind === "SHIPPED") && order.trackingUrl
      ? { href: order.trackingUrl, label: "Track your parcel" }
      : { href: `${SITE}/account/orders/${order.id}`, label: "View your order" };
  await send(order.user?.email, message.subject, layout(message.title, message.intro, order, link));
  if (kind === "placed" && ADMIN) {
    await send(
      ADMIN,
      `New order ${order.orderNumber} · ${formatPrice(order.total)}`,
      layout("New order", `${esc(order.user?.name)} placed an order (${order.paymentMethod === "COD" ? "cash on delivery" : order.paymentMethod === "POINTS" ? "paid with RAYVE points" : "paid online"}).`, order, { href: `${SITE}/admin/orders/${order.id}`, label: "Open in admin" }),
    );
  }
}
