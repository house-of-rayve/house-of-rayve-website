export const CATEGORIES = ["Sunglasses"];
export const SHAPES = ["Rectangle", "Oval", "Round", "Cat-eye", "Square", "Shield", "Aviator"];

// General styling guidance: frames that contrast with the face shape tend to balance it
export const FACE_SHAPES = [
  { id: "round", label: "Round", shapes: ["Rectangle", "Square", "Shield"], why: "Soft curves and similar width and length. Angular frames add definition." },
  { id: "oval", label: "Oval", shapes: ["Oval", "Round", "Rectangle", "Cat-eye", "Square", "Shield", "Aviator"], why: "Balanced proportions. Almost every shape works — go with your style." },
  { id: "square", label: "Square", shapes: ["Round", "Oval", "Cat-eye"], why: "A strong jaw and straight lines. Rounded frames soften the angles." },
  { id: "heart", label: "Heart", shapes: ["Cat-eye", "Oval", "Round", "Aviator"], why: "A wider forehead and a narrow chin. Frames that are wider at the bottom or softly curved balance it." },
  { id: "long", label: "Long", shapes: ["Square", "Round", "Shield"], why: "Longer than it is wide. Deeper, bolder frames shorten it visually." },
];

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
export const PAYMENT_STATUSES = ["PENDING", "PAID", "REFUNDED"];

export const STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

export const FREE_SHIPPING_THRESHOLD = 2999;
// TEMPORARY: shipping is free on every order while live payments are being tested. Restore to 149 afterwards.
export const SHIPPING_FEE = 0;

export function shippingFor(subtotal) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

// Photos kept out of editorial features (lookbook, stories) because they carry a third-party watermark.
// Replace the photo in the admin panel, then remove it from this list.
export const EDITORIAL_EXCLUDE = ["/images/model-cordoba.jpg"];
