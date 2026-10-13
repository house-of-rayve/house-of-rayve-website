import LegalPage from "@/components/store/LegalPage";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Cancellation & refund policy", alternates: { canonical: "/refund-policy" } };

export default function RefundPolicyPage() {
  const sections = [
    { title: "Cancelling an order", body: ["You can cancel an order free of charge any time before it is shipped — open My account → Orders and choose “Cancel order”, or contact us. Once an order has shipped it can no longer be cancelled, but you can return it after delivery (see below)."] },
    { title: "7-day returns and exchanges", body: ["If you change your mind, you can return or exchange your frames within 7 days of delivery.", "To be eligible, the frames must be unworn, undamaged and returned in their original packaging with the case, cloth and any tags.", "To start a return, write to us with your order number; we'll arrange a pickup where available or share the return address."] },
    { title: "Damaged, defective or wrong items", body: ["If your order arrives damaged, defective or isn't what you ordered, please contact us within 48 hours of delivery with photos of the product and packaging. We'll replace it or refund you in full, including any shipping charges, at no cost to you."] },
    { title: "Refunds", body: ["Once we receive and inspect the returned item, we'll confirm your refund by email.", "Online payments are refunded to the original payment method (UPI, card, net banking or wallet). Approved refunds are initiated within 2 working days, and banks usually take 5–7 working days to show them in your account.", "Cash on delivery orders are refunded by bank transfer or UPI to the account details you share with us.", "Cancelled orders that were paid online are refunded in full to the original payment method."] },
    { title: "Shipping charges", body: ["Shipping charges (if any were paid) are refunded only when the return is due to our error — a damaged, defective or wrong item. For change-of-mind returns, the original shipping charge is not refunded."] },
    { title: "Not eligible", body: ["Frames that have been worn, scratched, adjusted or damaged after delivery, or returned without their original packaging and accessories, cannot be returned. Manufacturing defects after the return window are covered by our 1-year warranty."] },
    { title: "Questions", body: [`Write to ${BUSINESS.email} or call ${BUSINESS.phone} (Mon – Sat, 10 am – 7 pm IST) with your order number.`] },
  ];
  return (
    <LegalPage
      title="Cancellation & refunds"
      intro="Cancel before shipping, return within 7 days of delivery, and get your money back to the way you paid."
      sections={sections}
      current="/refund-policy"
    />
  );
}
