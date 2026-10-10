import { gsap, prefersReducedMotion } from "./gsap";

/**
 * Flies a copy of a product image from `from` (an element or its image) into the header bag icon.
 * Resolves when it lands (immediately when there is nothing to animate).
 */
export function flyToBag(from, src) {
  const target = document.querySelector("[data-bag-target]");
  const img = from?.tagName === "IMG" ? from : from?.querySelector?.("img");
  const url = img?.currentSrc || img?.src || src;
  if (!from || !target || !url || prefersReducedMotion()) return Promise.resolve();

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  if (!a.width || a.bottom < 0 || a.top > innerHeight) return Promise.resolve();

  // Keep the flying copy a manageable size even when it starts from a large gallery photo
  const size = Math.min(a.width, a.height, 220);
  const startX = a.left + a.width / 2 - size / 2;
  const startY = a.top + a.height / 2 - size / 2;
  const endX = b.left + b.width / 2 - size / 2;
  const endY = b.top + b.height / 2 - size / 2;

  const ghost = document.createElement("img");
  ghost.src = url;
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
    zIndex: "80",
    pointerEvents: "none",
    borderRadius: "2px",
    boxShadow: "0 18px 40px -12px rgba(30,30,18,0.45)",
  });
  document.body.appendChild(ghost);

  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: () => (ghost.remove(), resolve()) })
      .set(ghost, { x: startX, y: startY, scale: 1, opacity: 1 })
      // Horizontal and vertical move on different eases gives the throw a curved arc
      .to(ghost, { x: endX, duration: 0.75, ease: "power2.inOut" }, 0)
      .to(ghost, { y: endY, duration: 0.75, ease: "back.in(1.4)" }, 0)
      .to(ghost, { scale: 0.08, borderRadius: "50%", duration: 0.75, ease: "power3.in" }, 0)
      .to(ghost, { opacity: 0, duration: 0.12 }, 0.66);
  });
}
