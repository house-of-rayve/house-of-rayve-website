export const CATEGORIES = ["Sunglasses"];
export const SHAPES = ["Rectangle", "Oval", "Round", "Cat-eye", "Square", "Shield", "Aviator"];

// General styling guidance: frames that contrast with the face shape tend to balance it
export const FACE_SHAPES = [
  { id: "round", label: "Round", shapes: ["Rectangle", "Square", "Shield"] },
  { id: "oval", label: "Oval", shapes: ["Oval", "Round", "Rectangle", "Cat-eye", "Square", "Shield", "Aviator"] },
  { id: "square", label: "Square", shapes: ["Round", "Oval", "Cat-eye"] },
  { id: "heart", label: "Heart", shapes: ["Cat-eye", "Oval", "Round", "Aviator"] },
  { id: "long", label: "Long", shapes: ["Square", "Round", "Shield"] },
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
export const SHIPPING_FEE = 149;

export function shippingFor(subtotal) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
