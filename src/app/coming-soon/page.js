// Shown on the public domain (houseofrayve.com) from the launch time until the site opens — see src/proxy.js.
// Just the client's banner, full screen, in the version made for the visitor's screen.
export const metadata = {
  title: { absolute: "RAYVE — Coming soon" },
  description: "Premium eyewear for the everyday. RAYVE is arriving soon.",
};

export default function ComingSoonPage() {
  return (
    <main className="relative h-svh overflow-hidden bg-olive-950">
      <picture>
        {/* Picked by screen shape so the text is never cropped: tall screens (phones, portrait tablets) get the
            portrait banner (1170×2532), very wide screens the 2:1 banner (3840×1920), everything else the
            laptop banner (3024×1720) */}
        <source media="(max-aspect-ratio: 4/5)" srcSet="/banner/mobile.jpg" />
        <source media="(max-aspect-ratio: 19/10)" srcSet="/banner/laptop.jpg" />
        <img src="/banner/desktop.jpg" alt="RAYVE — Coming soon" className="absolute inset-0 size-full object-cover" fetchPriority="high" />
      </picture>
    </main>
  );
}
