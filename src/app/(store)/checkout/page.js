import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/store/CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="display-title mb-10 text-3xl sm:text-4xl">Checkout</h1>
      <CheckoutForm
        user={{ name: user.name, email: user.email, phone: user.phone }}
        addresses={addresses.map(({ createdAt, updatedAt, ...a }) => a)}
      />
    </div>
  );
}
