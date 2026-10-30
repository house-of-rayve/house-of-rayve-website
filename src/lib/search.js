// Product search shared by the shop page (server) and the header search (browser).
// Accents and case are ignored, so "cordoba" finds Córdoba.
const fold = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function matchesSearch(product, q) {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = fold([product.name, product.tagline, product.description, product.frameColor, product.shape, product.lensColor, product.material].filter(Boolean).join(" "));
  return words.every((w) => text.includes(w));
}

/** Names first: products whose name matches come before ones that only match in the description. */
export function searchProducts(products, q) {
  const needle = fold(q).trim();
  return products.filter((p) => matchesSearch(p, q)).sort((a, b) => Number(!fold(a.name).includes(needle)) - Number(!fold(b.name).includes(needle)));
}
