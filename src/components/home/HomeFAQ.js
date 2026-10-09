import { Plus } from "lucide-react";

const FAQS = [
  ["How long does delivery take?", "Orders are dispatched within 24 hours. Metro cities usually receive them in 2–3 working days, the rest of India in 4–6. Shipping is free on orders above ₹2,999."],
  ["Can I pay cash on delivery?", "Yes. Choose cash on delivery at checkout, or pay online by UPI, card or netbanking."],
  ["What is your return policy?", "Return or exchange unworn frames within 7 days of delivery. Start it from your account under Orders."],
  ["Do your sunglasses offer UV protection?", "Every RAYVE sunglass lens blocks 100% of UVA and UVB rays (UV400)."],
  ["Can I fit prescription lenses?", "Our optical frames ship with demo lenses so any optician can fit your prescription."],
  ["Is there a warranty?", "Every frame carries a 1-year warranty against manufacturing defects in the frame and hinges."],
];

export default function HomeFAQ() {
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="eyebrow">Good to know</p>
        <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">Questions, answered</h2>
        <p className="mt-4 text-sm text-muted">
          Still curious? Write to us at{" "}
          <a href="mailto:hello@rayve.in" className="text-ink underline underline-offset-4">
            hello@rayve.in
          </a>
        </p>
      </div>
      <div className="border-t border-line lg:col-span-8">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-base [&::-webkit-details-marker]:hidden">
              {q}
              <Plus className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
