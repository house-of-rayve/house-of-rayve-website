/**
 * "The details" as one strip: the four headline specs run past in big type on a slow loop, with a short line for
 * each underneath. The loop pauses on hover and stands still for visitors who prefer less motion.
 * `items`: [{ value, title, text }]
 */
export default function CraftTicker({ items }) {
  // four identical runs side by side: the loop moves left by half its width (two runs), so even a very wide screen
  // never sees the end of the strip
  const run = (hidden) => (
    <span className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((c) => (
        <span key={c.value} className="flex items-center">
          <span className="px-[3vw] font-display uppercase">{c.value}</span>
          <span className="text-[0.45em] text-olive-500" aria-hidden="true">✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <section className="overflow-hidden bg-olive-950 text-sand" aria-label="The details">
      <div className="container-home flex items-end justify-between gap-6 pt-20 md:pt-24">
        <p className="eyebrow text-olive-500">The details</p>
        <p className="hidden font-display text-[10px] uppercase tracking-[0.3em] text-sand/40 sm:block">Made to be worn every day</p>
      </div>

      <div className="group mt-10 border-y border-sand/10 py-8 md:mt-12 md:py-10">
        <div className="flex w-max animate-marquee whitespace-nowrap [animation-duration:70s] text-[clamp(44px,8vw,128px)] leading-none group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {run(false)}
          {run(true)}
          {run(true)}
          {run(true)}
        </div>
      </div>

      <ol className="container-home grid grid-cols-2 gap-x-8 gap-y-10 pb-20 pt-10 md:pb-24 lg:grid-cols-4">
        {items.map((c, i) => (
          <li key={c.title}>
            <span className="font-display text-[10px] tracking-[0.3em] text-olive-500">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 font-display text-[11px] uppercase tracking-[0.22em] text-sand">{c.title}</h3>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-sand/60">{c.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
