import LegalPage from "@/components/store/LegalPage";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  const sections = [
    { title: "Who we are", body: [`${BUSINESS.name} (“RAYVE”) operates ${BUSINESS.website}. This policy explains what personal information we collect, how we use it and the choices you have.`] },
    { title: "What we collect", body: ["Information you give us: your name, email address, phone number, delivery addresses, order details, reviews and messages you send us.", "Information collected automatically: basic device and usage information (such as pages visited and browser type) needed to run and secure the website.", "Payment information: online payments are handled by Razorpay. We receive confirmation of the payment, but never your full card, UPI PIN or banking credentials."] },
    { title: "Camera and photos for virtual try-on", body: ["Virtual try-on and face-shape suggestions run entirely in your browser. Your camera feed and any photo you choose are processed on your device and are never uploaded to or stored on our servers."] },
    { title: "How we use your information", body: ["To process and deliver your orders, handle returns and refunds, and provide customer support.", "To send order and account emails (confirmation, shipping, delivery).", "To send our newsletter, only if you subscribe — you can unsubscribe at any time.", "To keep the website secure, prevent fraud and comply with legal obligations (for example, tax and accounting records)."] },
    { title: "Sharing", body: ["We share information only as needed to run our business: with courier partners to deliver orders, with Razorpay to process payments, and with service providers who host our website and send our emails. We do not sell your personal information."] },
    { title: "Cookies", body: ["We use essential cookies to keep you signed in and remember your bag, wishlist and preferences. We do not use them to sell advertising."] },
    { title: "Retention and security", body: ["We keep your information for as long as your account is active or as needed to fulfil orders and meet legal requirements. We use industry-standard measures, including encrypted connections, to protect it."] },
    { title: "Your choices", body: [`You can view and update your profile and addresses from your account at any time. To request a copy of your data or ask us to delete your account, write to ${BUSINESS.email}.`] },
    { title: "Contact", body: [`For any privacy question or concern, contact us at ${BUSINESS.email} or ${BUSINESS.phone}, or write to ${BUSINESS.name}, ${BUSINESS.address.join(", ")}.`] },
  ];
  return <LegalPage title="Privacy policy" intro="How RAYVE collects, uses and protects your personal information." sections={sections} current="/privacy" />;
}
