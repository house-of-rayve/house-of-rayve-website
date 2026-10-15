import LegalPage from "@/components/store/LegalPage";
import { BUSINESS } from "@/lib/business";
import { ORDER_VALUE_TIER, SHIPPING_BELOW_TIER, SHIPPING_FROM_TIER } from "@/lib/shipping";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Shipping & delivery policy", alternates: { canonical: "/shipping-policy" } };

export default function ShippingPolicyPage() {
  const sections = [
    { title: "Where we ship", body: ["We currently deliver across India through our courier partners. We do not ship internationally at the moment."] },
    {
      title: "Shipping charges",
      body: [
        "Delivery is free on every order within Delhi NCR (Delhi, Gurugram, Noida, Greater Noida, Ghaziabad and Faridabad).",
        `Everywhere else in India: ${formatPrice(SHIPPING_BELOW_TIER)} on orders below ${formatPrice(ORDER_VALUE_TIER)}, and ${formatPrice(SHIPPING_FROM_TIER)} on orders of ${formatPrice(ORDER_VALUE_TIER)} or more.`,
        "The exact charge for your PIN code is shown on the product page and at checkout before you pay.",
      ],
    },
    { title: "Dispatch", body: ["Orders are packed and dispatched from New Delhi within 24 hours (excluding Sundays and public holidays). Orders placed after 5 pm or on a Sunday are dispatched the next working day."] },
    { title: "Delivery times", body: ["Enter your PIN code on any product page to see the expected delivery date. It comes live from our courier partner for your exact PIN code.", "Delivery dates are estimates and may be longer during sales, festivals, bad weather or for remote locations."] },
    { title: "Tracking", body: ["Once your order ships, we'll email you a tracking link. You can also follow your order's progress from My account → Orders."] },
    { title: "Cash on delivery", body: ["Cash on delivery is available on most PIN codes. Please keep the exact amount ready; our courier partners may not carry change."] },
    { title: "Receiving your order", body: ["Please check that the package is sealed and undamaged when it arrives. If it looks tampered with or damaged, you may refuse it, or accept it and tell us within 48 hours with photos so we can help."] },
    { title: "Undelivered orders", body: ["If a delivery fails because of an incorrect address or because the package is refused or unclaimed, it will be returned to us. Prepaid orders are then refunded, less the shipping charge."] },
    { title: "Questions", body: [`Write to ${BUSINESS.email} or call ${BUSINESS.phone} with your order number.`] },
  ];
  return <LegalPage title="Shipping & delivery" intro="Free delivery across Delhi NCR, dispatched from New Delhi within 24 hours." sections={sections} current="/shipping-policy" />;
}
