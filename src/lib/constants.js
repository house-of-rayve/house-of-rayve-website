// Virtual try-on switch: false returns 404 for the page and hides every link to it.
export const TRY_ON_ENABLED = false;
// RAYVE points switch: false hides points everywhere on the site and admin, and stops new orders earning or spending
// them. Points already recorded are kept, so turning it back on carries on where it left off.
export const POINTS_ENABLED = false;
// Hidden while only the launch frames are live; true brings each back everywhere it appears.
export const SHOP_NAV_ENABLED = false; // "Shop" in the header, the menu and the phone tab bar (the shop page itself stays)
export const NEW_ARRIVALS_ENABLED = false; // "New arrivals" links
export const LOOKBOOK_ENABLED = false; // the lookbook page and its links
export const WISHLIST_ENABLED = false; // wishlist hearts, the wishlist page and its links
// Before launch: every "Add to bag" becomes "Join the waitlist", and the bag and checkout are switched off
export const WAITLIST_MODE = true;

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

// Photos kept out of editorial features (lookbook, stories) because they carry a third-party watermark.
// Replace the photo in the admin panel, then remove it from this list.
export const EDITORIAL_EXCLUDE = ["/images/model-cordoba.jpg"];

// Try-on: a photo of the frame from the front, cut out on a transparent background, worn on the face instead of the
// drawn 3D model, with 3D temples running back to the ears. `aspect` is the cut-out's width / height; `temple` the
// temples' colour and `templeOpacity` how solid they are. Frames without a cut-out use the 3D model for their shape.
export const TRY_ON_DEFAULT = "bravo"; // the frame try-on opens with
export const TRY_ON_CUTOUTS = {
  bravo: { src: "/images/tryon/bravo.webp", aspect: 2.963, temple: "#cdbfa8", templeOpacity: 0.7 },
  fiero: { src: "/images/tryon/fiero.webp", aspect: 3.183, temple: "#4a2a17", templeOpacity: 1 },
  nobel: { src: "/images/tryon/nobel.webp", aspect: 2.9056, temple: "#c9a35a", templeOpacity: 1 },
};

// Product page layout: "split" (photos left, dark details panel right) or "film" (photos slide sideways as you scroll)
export const PRODUCT_LAYOUT = "split";

// Product page only: the order to show a frame's photos in (indexes into product.images). Shop cards and the rest
// of the site keep the stored order, so the full front view stays first there.
export const PAGE_IMAGE_ORDER = {
  nobel: [3, 0, 1, 2, 5, 4], // logo close-up first, hinge close-up last
};

// The bottom tab bar on phones (Home / Try on). Off for launch.
export const MOBILE_TABBAR_ENABLED = false;

// Toro, the RAYVE bull, in one look per launch frame: his world (a rendered scene with a round platform) and his
// cut-out. `platform` is where his feet go in the world image, `nose` and `glasses` where those are on the cut-out,
// all in %; `bullAspect` is the cut-out's width / height. The home page shows them in this order.
export const TORO_LOOKS = {
  fiero: {
    word: "OLIVO",
    world: "/images/toro/olivo.webp",
    width: 1376,
    height: 768,
    platform: [50.1, 75.0],
    bull: "/images/toro/bull-arena.webp",
    bullAspect: 593 / 737,
    nose: [52, 23],
    glasses: [39.6, 15.3, 27, 7],
  },
  bravo: {
    word: "AMANECER",
    world: "/images/toro/amanecer.webp",
    width: 1376,
    height: 768,
    platform: [50.1, 75.0],
    bull: "/images/toro/bull-alba.webp",
    bullAspect: 449 / 745,
    nose: [58, 19],
    glasses: [42.3, 12.3, 29, 5.5],
  },
  nobel: {
    word: "ORO",
    world: "/images/toro/oro.webp",
    width: 1376,
    height: 768,
    platform: [50.1, 75.0],
    bull: "/images/toro/bull-cordoba.webp",
    bullAspect: 702 / 736,
    nose: [49, 27],
    glasses: [39.6, 19, 23.8, 7.1],
  },
};
