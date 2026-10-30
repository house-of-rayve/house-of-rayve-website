// Shipping and RAYVE points rules, shared by the storefront and the server (no server-only imports here).

// Delhi NCR, by PIN code: Delhi (110…), Gurugram (1220…, 1221…), Faridabad (1210…, 1211…),
// Ghaziabad (2010…, 2011…) and Noida / Greater Noida (2013…).
export const NCR_PIN_PREFIXES = ["110", "1210", "1211", "1220", "1221", "2010", "2011", "2013"];

export const ORDER_VALUE_TIER = 2500; // ₹; at or above this an order earns the higher RAYVE points reward
export const POINTS_BELOW_TIER = 200;
export const POINTS_FROM_TIER = 400;

// Shipping is free when paid online. With cash on delivery the customer pays a shipping charge: ₹99 in Delhi NCR,
// ₹149 elsewhere (meant to be collected in advance once Razorpay's partial COD is switched on).
export const COD_SHIPPING_NCR = 99;
export const COD_SHIPPING_ELSEWHERE = 149;

export const isValidPin = (pin) => /^[1-9]\d{5}$/.test(String(pin ?? ""));
export const isNcrPin = (pin) => isValidPin(pin) && NCR_PIN_PREFIXES.some((p) => String(pin).startsWith(p));

/** Shipping fee for an order going to `pin`: 0 when paid online; for cash on delivery null until the PIN code is known. */
export function shippingFor(pin, { cod = false } = {}) {
  if (!cod) return 0;
  if (!isValidPin(pin)) return null;
  return isNcrPin(pin) ? COD_SHIPPING_NCR : COD_SHIPPING_ELSEWHERE;
}

/** RAYVE points an order worth `orderValue` earns (1 point = ₹1). */
export const pointsFor = (orderValue) => (orderValue <= 0 ? 0 : orderValue >= ORDER_VALUE_TIER ? POINTS_FROM_TIER : POINTS_BELOW_TIER);
