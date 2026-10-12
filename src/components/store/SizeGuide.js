// Frame measurements (lens width – bridge – temple, in mm) with a simple labelled diagram.
// Renders nothing until the measurements are filled in for the product in the admin panel.
export default function SizeGuide({ product }) {
  const { lensWidth: lens, bridgeWidth: bridge, templeLength: temple } = product;
  if (!lens || !bridge || !temple) return null;
  const total = lens * 2 + bridge + 8; // approx. front width incl. the rims
  const fit = total < 136 ? "Narrow" : total <= 144 ? "Medium" : "Wide";
  return (
    <section className="border-b border-line py-6">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.2em]">Size & fit</h3>
        <p className="text-xs text-muted">
          {lens}-{bridge}-{temple} · <span className="text-ink">{fit} fit</span>
        </p>
      </div>
      <svg viewBox="0 0 320 120" className="mt-5 w-full text-olive-800" role="img" aria-label={`Lens ${lens} mm, bridge ${bridge} mm, temple ${temple} mm`}>
        {/* front view */}
        <rect x="18" y="20" width="118" height="62" rx="26" className="fill-none stroke-current" strokeWidth="2" />
        <rect x="184" y="20" width="118" height="62" rx="26" className="fill-none stroke-current" strokeWidth="2" />
        <path d="M136 40 Q160 26 184 40" className="fill-none stroke-current" strokeWidth="2" />
        {/* lens width */}
        <path d="M18 98 H136 M18 93 V103 M136 93 V103" className="stroke-olive-500" strokeWidth="1" />
        <text x="77" y="114" textAnchor="middle" className="fill-current text-[10px]">Lens {lens}</text>
        {/* bridge */}
        <path d="M136 12 H184 M136 7 V17 M184 7 V17" className="stroke-olive-500" strokeWidth="1" />
        <text x="160" y="5" textAnchor="middle" className="fill-current text-[10px]">Bridge {bridge}</text>
        <text x="243" y="114" textAnchor="middle" className="fill-current text-[10px]">Temple {temple}</text>
      </svg>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Measurements in millimetres. Compare with a pair you already own — the numbers are usually printed inside the temple.
      </p>
    </section>
  );
}
