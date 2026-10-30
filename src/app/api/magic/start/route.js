import { json, error, readJson, authorize } from "@/lib/api";
import { OrderError } from "@/lib/orders";
import { magicCheckoutEnabled, startMagicCheckout } from "@/lib/magic";

// Opens a Magic Checkout for the signed-in customer's bag
export async function POST(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  if (!magicCheckoutEnabled()) return error("Checkout isn't available right now.", 503);
  const { items } = await readJson(request);
  try {
    return json(await startMagicCheckout(user, items));
  } catch (e) {
    return error(e instanceof OrderError ? e.message : "We couldn't start the checkout. Please try again.", e instanceof OrderError ? 400 : 502);
  }
}
