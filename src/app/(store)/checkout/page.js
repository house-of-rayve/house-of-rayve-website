import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/store/CheckoutForm";
import { razorpayEnabled } from "@/lib/razorpay";
import { pointsBalance } from "@/lib/points";
import { POINTS_ENABLED } from "@/lib/constants";
import { magicCheckoutEnabled } from "@/lib/magic";
import { normalizePhone } from "@/lib/phone";
import MagicCheckout from "@/components/store/MagicCheckout";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  // Razorpay Magic Checkout, once switched on, replaces our own address and payment steps
  if (magicCheckoutEnabled()) {
    return (
      <div className="container-x py-12 sm:py-16">
        <h1 className="display-title mb-10 text-3xl sm:text-4xl">Checkout</h1>
        <MagicCheckout user={{ name: user.name, email: user.email, phone: normalizePhone(user.phone) }} />
      </div>
    );
  }
  const [addresses, points] = await Promise.all([
    prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
    POINTS_ENABLED ? pointsBalance(user.id) : { available: 0 },
  ]);
  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="display-title mb-10 text-3xl sm:text-4xl">Checkout</h1>
      <CheckoutForm
        user={{ name: user.name, email: user.email, phone: user.phone }}
        addresses={addresses.map(({ createdAt, updatedAt, ...a }) => a)}
        onlinePayments={razorpayEnabled()}
        points={points.available}
      />
    </div>
  );
}
