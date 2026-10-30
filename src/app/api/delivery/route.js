import { json, error } from "@/lib/api";
import { deliveryEstimate, ithinkEnabled } from "@/lib/ithink";
import { isNcrPin, isValidPin, shippingFor } from "@/lib/shipping";

// Delivery date for a PIN code, with the shipping charge when paid online (free) and with cash on delivery: GET /api/delivery?pin=110092&value=4990
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const pin = params.get("pin") ?? "";
  const value = Math.max(1, Math.round(Number(params.get("value")) || 1000));
  if (!isValidPin(pin)) return error("Enter a valid 6-digit PIN code.");
  if (!ithinkEnabled()) return error("Delivery dates aren't available right now.", 503);
  try {
    const estimate = await deliveryEstimate(pin, value);
    return json({ pin, ncr: isNcrPin(pin), shipping: shippingFor(pin), codShipping: shippingFor(pin, { cod: true }), ...estimate });
  } catch {
    return error("We couldn't check this PIN code right now. Please try again.", 502);
  }
}
