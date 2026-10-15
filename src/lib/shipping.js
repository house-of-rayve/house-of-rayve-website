// Shipping and RAYVE points rules, shared by the storefront and the server (no server-only imports here).

// Delhi NCR, by PIN code: Delhi (110…), Gurugram (1220…, 1221…), Faridabad (1210…, 1211…),
// Ghaziabad (2010…, 2011…) and Noida / Greater Noida (2013…). Delivery there is free.
export const NCR_PIN_PREFIXES = ["110", "1210", "1211", "1220", "1221", "2010", "2011", "2013"];

export const ORDER_VALUE_TIER = 2500; // ₹; at or above this the higher shipping fee and points apply
export const SHIPPING_BELOW_TIER = 200;
export const SHIPPING_FROM_TIER = 300;
export const POINTS_BELOW_TIER = 200;
export const POINTS_FROM_TIER = 400;

export const isValidPin = (pin) => /^[1-9]\d{5}$/.test(String(pin ?? ""));
export const isNcrPin = (pin) => isValidPin(pin) && NCR_PIN_PREFIXES.some((p) => String(pin).startsWith(p));

/**
 * Shipping fee for an order worth `orderValue` (products after any discount code) going to `pin`.
 * Returns null when the PIN code isn't known yet, so the fee can be shown as "calculated at checkout".
 */
export function shippingFor(orderValue, pin) {
  if (!orderValue) return 0;
  if (!isValidPin(pin)) return null;
  if (isNcrPin(pin)) return 0;
  return orderValue >= ORDER_VALUE_TIER ? SHIPPING_FROM_TIER : SHIPPING_BELOW_TIER;
}

/** RAYVE points an order worth `orderValue` earns (1 point = ₹1). */
export const pointsFor = (orderValue) => (orderValue <= 0 ? 0 : orderValue >= ORDER_VALUE_TIER ? POINTS_FROM_TIER : POINTS_BELOW_TIER);
