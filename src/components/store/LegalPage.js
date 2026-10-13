import Link from "next/link";
import { BUSINESS, POLICIES_UPDATED } from "@/lib/business";

export const LEGAL_PAGES = [
  ["Contact us", "/contact"],
  ["Terms & conditions", "/terms"],
  ["Privacy policy", "/privacy"],
  ["Cancellation & refunds", "/refund-policy"],
  ["Shipping & delivery", "/shipping-policy"],
];

/**
 * Shared layout for the contact and policy pages: title, a side index of all the policy pages,
 * and numbered sections. `sections` = [{ title, body: string | string[] | ReactNode }].
 */
export default function LegalPage({ eyebrow = "Policies", title, intro, sections, current, children }) {
  return (
    <div className="container-x pb-24 pt-10 sm:pt-14">
      <header className="max-w-3xl border-b border-line pb-10">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-title mt-4 text-3xl sm:text-5xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{intro}</p>}
        {current !== "/contact" && <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted">Last updated · {POLICIES_UPDATED}</p>}
      </header>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <nav aria-label="Policies" className="min-w-0 lg:col-span-3">
          <ul className="flex gap-x-5 gap-y-3 overflow-x-auto pb-2 lg:sticky lg:top-28 lg:flex-col lg:overflow-visible">
            {LEGAL_PAGES.map(([label, href]) => (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={current === href ? "page" : undefined}
                  className={`text-[11px] uppercase tracking-[0.2em] transition-colors ${current === href ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  {current === href && <span className="mr-2 inline-block h-px w-4 bg-olive-700 align-middle" />}
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 lg:col-span-8 lg:col-start-5">
          {children}
          {sections?.map((s, i) => (
            <section key={s.title} className="border-b border-line py-8 first:pt-0">
              <h2 className="flex items-baseline gap-4 font-display text-xs uppercase tracking-[0.22em]">
                <span className="text-olive-700">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">
                {typeof s.body === "string" ? <p>{s.body}</p> : Array.isArray(s.body) ? s.body.map((p) => <p key={p}>{p}</p>) : s.body}
              </div>
            </section>
          ))}

          <aside className="mt-10 bg-mist p-6 text-sm leading-relaxed">
            <p className="font-display text-[11px] uppercase tracking-[0.22em]">{BUSINESS.name}</p>
            <p className="mt-3 text-ink/80">{BUSINESS.address.join(", ")}</p>
            <p className="mt-2 text-ink/80">
              <a href={`mailto:${BUSINESS.email}`} className="underline underline-offset-4">{BUSINESS.email}</a> ·{" "}
              <a href={BUSINESS.phoneHref} className="underline underline-offset-4">{BUSINESS.phone}</a>
            </p>
            <p className="mt-2 text-muted">GSTIN {BUSINESS.gstin}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
