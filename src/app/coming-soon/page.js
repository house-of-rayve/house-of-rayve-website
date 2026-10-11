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
        {/* phones (portrait banner), laptops up to 15", large desktops */}
        <source media="(max-width: 767px)" srcSet="/banner/mobile.jpg" />
        <source media="(max-width: 1599px)" srcSet="/banner/laptop.jpg" />
        <img src="/banner/desktop.jpg" alt="RAYVE — Coming soon" className="absolute inset-0 size-full object-cover" fetchPriority="high" />
      </picture>
    </main>
  );
}
