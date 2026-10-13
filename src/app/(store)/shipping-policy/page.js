import LegalPage from "@/components/store/LegalPage";
import { BUSINESS } from "@/lib/business";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Shipping & delivery policy", alternates: { canonical: "/shipping-policy" } };

export default function ShippingPolicyPage() {
  const sections = [
    { title: "Where we ship", body: ["We currently deliver across India through our courier partners. We do not ship internationally at the moment."] },
    { title: "Shipping charges", body: [`Shipping is complimentary on orders of ${formatPrice(FREE_SHIPPING_THRESHOLD)} or more. A flat fee of ${formatPrice(SHIPPING_FEE)} applies to smaller orders. The exact charge is always shown at checkout before you pay.`] },
    { title: "Dispatch", body: ["Orders are packed and dispatched from New Delhi within 24 hours (excluding Sundays and public holidays). Orders placed after 5 pm or on a Sunday are dispatched the next working day."] },
    { title: "Delivery times", body: ["Metro cities: usually 2–3 working days after dispatch.", "Rest of India: usually 4–6 working days after dispatch.", "You can check an estimate for your PIN code on any product page. Delivery times are estimates and may be longer during sales, festivals, bad weather or for remote locations."] },
    { title: "Tracking", body: ["Once your order ships, we'll email you a tracking link. You can also follow your order's progress from My account → Orders."] },
    { title: "Cash on delivery", body: ["Cash on delivery is available on most PIN codes. Please keep the exact amount ready; our courier partners may not carry change."] },
    { title: "Receiving your order", body: ["Please check that the package is sealed and undamaged when it arrives. If it looks tampered with or damaged, you may refuse it, or accept it and tell us within 48 hours with photos so we can help."] },
    { title: "Undelivered orders", body: ["If a delivery fails because of an incorrect address or because the package is refused or unclaimed, it will be returned to us. Prepaid orders are then refunded, less the shipping charge."] },
    { title: "Questions", body: [`Write to ${BUSINESS.email} or call ${BUSINESS.phone} with your order number.`] },
  ];
  return <LegalPage title="Shipping & delivery" intro="Free shipping on orders above ₹2,999, dispatched from New Delhi within 24 hours." sections={sections} current="/shipping-policy" />;
}
