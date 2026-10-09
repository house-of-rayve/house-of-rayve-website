import { LogoMark } from "@/components/ui/Logo";

const ITEMS = ["100% UV400 protection", "Free shipping above ₹2,999", "Hand-polished acetate", "7-day easy returns", "1-year warranty", "Premium, in the everyday"];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-olive-700 bg-olive-800 py-4 text-sand">
      <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-[11px] uppercase tracking-[0.3em]">
            {t}
            <LogoMark className="h-3 w-5 text-olive-400" />
          </span>
        ))}
      </div>
    </div>
  );
}
