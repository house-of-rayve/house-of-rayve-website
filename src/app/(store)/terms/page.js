import Link from "next/link";
import LegalPage from "@/components/store/LegalPage";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Terms & conditions", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  const sections = [
    { title: "About these terms", body: [`This website (${BUSINESS.website}) is operated by ${BUSINESS.name} (“RAYVE”, “we”, “us”), registered at ${BUSINESS.address.join(", ")}. By using the website or placing an order, you agree to these terms. If you do not agree, please do not use the website.`] },
    { title: "Eligibility and your account", body: ["You must be at least 18 years old, or use the website under the supervision of a parent or guardian, to place an order.", "You are responsible for keeping your account details and password confidential and for all activity under your account. Please tell us straight away if you believe your account has been used without your permission."] },
    { title: "Products and pricing", body: ["We make every effort to show our frames, colours and lens tints accurately, but colours may vary slightly between screens. Virtual try-on, 3D views and tint previews are illustrations and may differ from the actual product.", "All prices are in Indian Rupees (₹) and include applicable taxes (GST). Shipping charges, if any, are shown at checkout before you pay. We may change prices at any time; the price that applies is the one shown when you place your order."] },
    { title: "Orders", body: ["Your order is an offer to buy. We accept it when we confirm or dispatch it. We may decline or cancel an order — for example if a product is out of stock, if there is an error in the price or description, or if we suspect fraud. If we cancel an order you have paid for, we will refund you in full."] },
    { title: "Payment", body: ["We accept cash on delivery and online payments (UPI, cards, net banking and wallets). Online payments are processed securely by our payment partner, Razorpay; we do not see or store your card details.", "Discount codes are subject to their stated conditions, cannot be exchanged for cash and may be withdrawn at any time."] },
    { title: "Shipping, cancellations and returns", body: <p>Delivery, cancellation, return and refund terms are set out in our <Link href="/shipping-policy" className="underline underline-offset-4">Shipping & delivery policy</Link> and <Link href="/refund-policy" className="underline underline-offset-4">Cancellation & refund policy</Link>, which form part of these terms.</p> },
    { title: "Warranty", body: ["Every RAYVE frame carries a 1-year warranty from the date of delivery against manufacturing defects in the frame and hinges. The warranty does not cover normal wear, scratches, accidental damage, loss, or damage from misuse or unauthorised repairs."] },
    { title: "Intellectual property", body: ["All content on this website — including the RAYVE name and bull mark, designs, photographs, text and code — belongs to us or our licensors and may not be copied or used without our written permission."] },
    { title: "Reviews and content you submit", body: ["By submitting a review or photo, you confirm it is your own, honest and lawful, and you allow us to display it on our website and channels. We may moderate or remove any submission."] },
    { title: "Limitation of liability", body: ["To the extent permitted by law, our liability for any claim relating to a product is limited to the price you paid for it. We are not liable for indirect or consequential losses. Nothing in these terms limits your statutory rights as a consumer."] },
    { title: "Governing law", body: ["These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts at New Delhi."] },
    { title: "Changes and contact", body: [`We may update these terms from time to time; the version on this page applies to orders placed while it is shown. Questions? Write to ${BUSINESS.email} or call ${BUSINESS.phone}.`] },
  ];
  return <LegalPage title="Terms & conditions" intro="The terms that apply when you browse this website and shop with RAYVE." sections={sections} current="/terms" />;
}
