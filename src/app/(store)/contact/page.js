import { Mail, MapPin, Phone, Clock } from "lucide-react";
import LegalPage from "@/components/store/LegalPage";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Contact us", description: "Get in touch with RAYVE — orders, returns, warranty and everything else.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  const cards = [
    { Icon: Mail, label: "Email", value: BUSINESS.email, href: `mailto:${BUSINESS.email}`, note: "We reply within one working day." },
    { Icon: Phone, label: "Phone & WhatsApp", value: BUSINESS.phone, href: BUSINESS.phoneHref, note: "Monday to Saturday, 10 am – 7 pm IST." },
    { Icon: MapPin, label: "Registered office", value: BUSINESS.address.join(", "), note: BUSINESS.name },
    { Icon: Clock, label: "Support hours", value: "Mon – Sat · 10:00 – 19:00 IST", note: "Closed on Sundays and national holidays." },
  ];
  return (
    <LegalPage eyebrow="Help" title="Contact us" intro="Questions about an order, a return, sizing or a frame you have your eye on — we're here to help." current="/contact">
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ Icon, label, value, href, note }) => (
          <div key={label} className="border border-line bg-paper p-6">
            <Icon className="size-5 text-olive-700" strokeWidth={1.5} />
            <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted">{label}</p>
            {href ? (
              <a href={href} className="mt-2 block break-words text-base hover:text-olive-700">{value}</a>
            ) : (
              <p className="mt-2 text-base">{value}</p>
            )}
            <p className="mt-2 text-xs text-muted">{note}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm leading-relaxed text-ink/80">
        For anything about an existing order, please include your order number (it starts with “RV-”) so we can help you faster.
      </p>
    </LegalPage>
  );
}
