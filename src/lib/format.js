const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatPrice = (amount) => inr.format(amount ?? 0);

export const formatDate = (date, opts = {}) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", ...opts });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function parseImages(images) {
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function slugify(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
