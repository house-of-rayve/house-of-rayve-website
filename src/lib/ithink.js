import "server-only";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import { sendOrderEmails } from "@/lib/email";

// Shipping through iThink Logistics (https://docs.ithinklogistics.com, API v3).
// Needs ITHINK_ACCESS_TOKEN and ITHINK_SECRET_KEY (dashboard → Store → API); the pickup warehouse and
// store default to the RAYVE ones and can be overridden with ITHINK_WAREHOUSE_ID / ITHINK_STORE_ID.
const TOKEN = process.env.ITHINK_ACCESS_TOKEN;
const SECRET = process.env.ITHINK_SECRET_KEY;
const WAREHOUSE_ID = process.env.ITHINK_WAREHOUSE_ID ?? "125894"; // Nirman Vihar, New Delhi 110092
const STORE_ID = process.env.ITHINK_STORE_ID ?? "34067";
const PICKUP_PINCODE = process.env.ITHINK_PICKUP_PINCODE ?? "110092";

// Packed parcel: one pair in its case and box. Extra pairs add weight and height.
const PARCEL = { lengthCm: 20, widthCm: 12, heightCm: 8, weightKg: 0.5 };
const HSN_SUNGLASSES = "9004";

// How long a fetched tracking status is trusted before asking iThink again
const TRACK_TTL_MS = 20 * 60 * 1000;

export const ithinkEnabled = () => Boolean(TOKEN && SECRET);

async function call(path, data, host = "my") {
  if (!ithinkEnabled()) throw new Error("iThink Logistics is not set up (ITHINK_ACCESS_TOKEN / ITHINK_SECRET_KEY).");
  const res = await fetch(`https://${host}.ithinklogistics.com/api_v3/${path}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { ...data, access_token: TOKEN, secret_key: SECRET } }),
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body) throw new Error(`iThink Logistics did not respond (${res.status}).`);
  if (body.status === "error") throw new Error(body.html_message || body.message || (typeof body.data === "string" ? body.data : "iThink Logistics returned an error."));
  return body;
}

const phone10 = (v) => String(v ?? "").replace(/\D/g, "").slice(-10);

function parcelFor(order) {
  const pairs = Math.max(1, order.items.reduce((s, i) => s + i.quantity, 0));
  return {
    length: PARCEL.lengthCm,
    width: PARCEL.widthCm,
    height: PARCEL.heightCm * Math.min(pairs, 4),
    weight: +(PARCEL.weightKg * pairs).toFixed(2),
  };
}

/** Couriers that deliver to `pincode`, cheapest first, with price (₹, incl. GST) and delivery days. */
export async function courierRates(pincode, { cod = false, value = 1000, pairs = 1 } = {}) {
  const body = await call("rate/check", {
    from_pincode: PICKUP_PINCODE,
    to_pincode: String(pincode),
    shipping_length_cms: String(PARCEL.lengthCm),
    shipping_width_cms: String(PARCEL.widthCm),
    shipping_height_cms: String(PARCEL.heightCm),
    shipping_weight_kg: String(+(PARCEL.weightKg * Math.max(1, pairs)).toFixed(2)),
    order_type: "forward",
    payment_method: cod ? "cod" : "prepaid",
    product_mrp: String(value),
  });
  const rates = (body.data ?? [])
    .filter((c) => (cod ? c.cod : c.prepaid) === "Y")
    .map((c) => {
      const service = (c.service_type || "Surface").toLowerCase();
      return {
        id: `${c.logistic_name.toLowerCase()}:${service}`, // courier and service type, both needed to book
        name: service === "surface" ? c.logistic_name : `${c.logistic_name} (${c.service_type})`,
        rate: Math.round(c.rate),
        days: Number(c.delivery_tat) || null,
      };
    })
    .sort((a, b) => a.rate - b.rate);
  return { rates, eta: body.expected_delivery_date ?? null };
}

/** Books the order with iThink. `courierId` is an id from courierRates(), or empty to let iThink choose. */
export async function createShipment(order, courierId) {
  const [courier, service] = (courierId || "").split(":");
  const d = new Date(order.createdAt);
  const parcel = parcelFor(order);
  const cod = order.paymentMethod === "COD" && order.paymentStatus !== "PAID";
  const address = {
    name: order.shipName,
    add: order.shipLine1,
    add2: order.shipLine2 ?? "",
    pin: order.shipPostalCode,
    city: order.shipCity,
    state: order.shipState,
    country: order.shipCountry || "India",
    phone: phone10(order.shipPhone),
  };
  // iThink rejects a shipment unless every field of its sample request is present, so the unused ones are sent empty
  const shipment = {
    waybill: "",
    order: order.orderNumber,
    sub_order: "",
    order_date: `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`,
    total_amount: String(order.total),
    ...address,
    company_name: "",
    add3: "",
    alt_phone: address.phone,
    email: order.user?.email ?? "",
    is_billing_same_as_shipping: "yes",
    billing_name: address.name,
    billing_company_name: "",
    billing_add: address.add,
    billing_add2: address.add2,
    billing_add3: "",
    billing_pin: address.pin,
    billing_city: address.city,
    billing_state: address.state,
    billing_country: address.country,
    billing_phone: address.phone,
    billing_alt_phone: address.phone,
    billing_email: order.user?.email ?? "",
    products: order.items.map((i) => ({
      product_name: i.name,
      product_sku: i.product?.slug ? `RAYVE-${i.product.slug.toUpperCase()}` : "RAYVE", // shown on the label next to the name
      product_quantity: String(i.quantity),
      product_price: String(i.price),
      product_tax_rate: "",
      product_hsn_code: HSN_SUNGLASSES,
      product_discount: "0",
      product_img_url: i.image ? new URL(i.image, siteUrl).href : "",
    })),
    shipment_length: String(parcel.length),
    shipment_width: String(parcel.width),
    shipment_height: String(parcel.height),
    weight: String(parcel.weight),
    shipping_charges: String(order.shippingFee),
    giftwrap_charges: "0",
    transaction_charges: "0",
    total_discount: String(order.discount),
    first_attemp_discount: "0",
    cod_charges: "0",
    advance_amount: "0",
    cod_amount: cod ? String(order.total) : "0",
    payment_mode: cod ? "COD" : "Prepaid",
    reseller_name: "",
    eway_bill_number: "",
    gst_number: "",
    what3words: "",
    return_address_id: WAREHOUSE_ID,
    api_source: "0",
    store_id: STORE_ID,
  };
  const body = await call("order/add", {
    shipments: [shipment],
    pickup_address_id: WAREHOUSE_ID,
    order_type: "forward",
    s_type: service || "surface",
    ...(courier ? { logistics: courier } : {}),
  });
  const result = Object.values(body.data ?? {})[0];
  if (!result || String(result.status).toLowerCase() !== "success" || !result.waybill) {
    throw new Error(result?.remark || body.html_message || "iThink Logistics could not create the shipment.");
  }
  return {
    awb: String(result.waybill),
    courier: result.logistic_name || courier || null,
    trackingUrl: result.tracking_url || `https://ithinklogistics.co.in/postship/tracking/${result.waybill}`,
  };
}

/** Link to the printable shipping label (PDF) for an AWB. */
export async function shippingLabel(awb) {
  const body = await call("shipping/label", { awb_numbers: awb, page_size: "A4", display_cod_prepaid: "1", display_shipper_mobile: "1", display_shipper_address: "1" });
  if (!body.file_name) throw new Error("iThink Logistics did not return a label.");
  return body.file_name.replace(/^http:/, "https:");
}

export async function cancelShipment(awb) {
  const body = await call("order/cancel", { awb_numbers: awb });
  const result = Object.values(body.data ?? {})[0];
  if (result && String(result.status).toLowerCase() !== "success") throw new Error(result.remark || "iThink Logistics could not cancel the shipment.");
}

/** Latest courier status for up to 10 AWBs: { [awb]: { status, location, delivered, cancelled } } */
async function track(awbs) {
  const body = await call("order/track", { awb_number_list: awbs.join(",") }, "api");
  const out = {};
  for (const [awb, t] of Object.entries(body.data ?? {})) {
    if (!t || typeof t !== "object") continue;
    const status = t.current_status || t.last_scan_details?.status || "";
    const rto = /rto/i.test(status) || t.current_status_code === "RT";
    out[awb] = {
      status,
      location: t.last_scan_details?.scan_location || null,
      delivered: t.current_status_code === "DL" && !rto,
      cancelled: t.current_status_code === "CN",
    };
  }
  return out;
}

const withItems = { items: { include: { product: { select: { slug: true } } } }, user: { select: { id: true, name: true, email: true, phone: true } } };

// Statuses iThink reports before the courier has collected the parcel
const BEFORE_PICKUP = /manifest|not picked|pickup|booked|pending/i;

/**
 * Books the order with iThink (`courierId` from courierRates(), or empty for the cheapest courier) and saves the AWB
 * and tracking link. The order stays Confirmed until the courier picks it up; syncShipments() then marks it Shipped.
 */
export async function bookShipment(order, courierId) {
  let pick = courierId;
  if (!pick) {
    const cod = order.paymentMethod === "COD" && order.paymentStatus !== "PAID";
    const pairs = order.items.reduce((s, i) => s + i.quantity, 0);
    const { rates } = await courierRates(order.shipPostalCode, { cod, value: order.total, pairs });
    if (!rates.length) throw new Error(`No courier delivers to ${order.shipPostalCode}.`);
    pick = rates[0].id;
  }
  const shipment = await createShipment(order, pick);
  return prisma.order.update({
    where: { id: order.id },
    data: { ...shipment, status: "CONFIRMED", shipmentStatus: "Pickup scheduled", shipmentLocation: null, trackedAt: new Date() },
    include: withItems,
  });
}

/**
 * Sends a newly placed order straight to iThink (cash on delivery when placed, online once paid). Returns the
 * updated order, or the order unchanged if it couldn't be booked — the admin can then ship it from the order page.
 */
export async function autoShip(orderId) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: withItems });
  if (!order || !ithinkEnabled() || order.awb || !["PENDING", "CONFIRMED"].includes(order.status)) return order;
  if (order.paymentMethod === "ONLINE" && order.paymentStatus !== "PAID") return order;
  try {
    return await bookShipment(order);
  } catch (e) {
    console.error(`iThink auto-ship failed for ${order.orderNumber}:`, e.message);
    return prisma.order.update({ where: { id: order.id }, data: { shipmentStatus: `Not booked: ${e.message}`.slice(0, 190) }, include: withItems });
  }
}

/**
 * Refreshes the tracking status of booked orders from iThink (only those not checked in the last few minutes,
 * unless `force`). Once the courier collects the parcel the order becomes Shipped, and Delivered on delivery;
 * the customer is emailed at each step.
 */
export async function syncShipments(orders, { force = false } = {}) {
  if (!ithinkEnabled()) return;
  const due = orders.filter((o) => o.awb && ["CONFIRMED", "SHIPPED"].includes(o.status) && (force || !o.trackedAt || Date.now() - new Date(o.trackedAt) > TRACK_TTL_MS));
  for (let i = 0; i < due.length; i += 10) {
    const batch = due.slice(i, i + 10);
    let results;
    try {
      results = await track(batch.map((o) => o.awb));
    } catch (e) {
      console.error("iThink tracking failed", e.message);
      continue;
    }
    for (const o of batch) {
      const t = results[o.awb];
      const data = { trackedAt: new Date() };
      let email = null;
      if (t && !t.cancelled) {
        Object.assign(data, { shipmentStatus: t.status || o.shipmentStatus, shipmentLocation: t.location });
        if (t.delivered) {
          data.status = "DELIVERED";
          if (o.paymentMethod === "COD") data.paymentStatus = "PAID";
          email = "DELIVERED";
        } else if (o.status === "CONFIRMED" && t.status && !BEFORE_PICKUP.test(t.status)) {
          data.status = "SHIPPED";
          data.shippedAt = new Date();
          email = "SHIPPED";
        }
      }
      const updated = await prisma.order.update({ where: { id: o.id }, data, include: withItems });
      if (email) await sendOrderEmails(updated, email).catch(() => {});
    }
  }
}
