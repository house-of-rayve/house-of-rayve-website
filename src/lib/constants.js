// Virtual try-on switch: false returns 404 for the page and hides every link to it.
export const TRY_ON_ENABLED = true;
// RAYVE points switch: false hides points everywhere on the site and admin, and stops new orders earning or spending
// them. Points already recorded are kept, so turning it back on carries on where it left off.
export const POINTS_ENABLED = false;

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

// The launch frames, in order on the home page hero. `glow` colours the italic half of each name.
export const LAUNCH_FRAMES = [
  { slug: "toro", glow: "222,200,168" },
  { slug: "arena", glow: "190,196,140" },
  { slug: "cordoba", glow: "214,176,110" },
];

// Home page hero scenes, each a rendered image. Positions are in % of the image: [left, top, width, height].
// The arena: a bullring at sunset in three layers that line up (stands and sky, the wall, the foreground);
// `sun` is where the sun sits and `niches` where each frame's niche is in the wall.
export const ARENA_SCENE = {
  width: 1376,
  height: 768,
  back: "/images/arena/back.webp",
  wall: "/images/arena/wall.webp",
  front: "/images/arena/front.webp",
  sun: [39.6, 22.8],
  niches: [
    [20.1, 36.5, 13.3, 28.3],
    [43.5, 36.5, 13.1, 28.3],
    [66.4, 36.5, 13.4, 28.3],
  ],
};
// The museum: a dark marble gallery in three layers (the room, the plinths, the velvet rope in front), with each pair
// of sunglasses as its own cut-out floating above a plinth. For each plinth: `x` is its centre and `width` its top's
// width, in % of the image width; `aspect` is the cut-out's width / height. `plinthTop` / `plinthBottom` are the
// heights of the plinths' top surface and foot, in % of the image height.
export const MUSEUM_SCENE = {
  width: 1376,
  height: 768,
  room: "/images/museum/room.webp",
  plinths: "/images/museum/plinths.webp",
  rope: "/images/museum/rope.webp",
  frames: [
    { x: 28.2, width: 10.4, sprite: "/images/museum/frame-1.webp", aspect: 362 / 147 },
    { x: 50.0, width: 9.2, sprite: "/images/museum/frame-2.webp", aspect: 351 / 128 },
    { x: 71.8, width: 10.4, sprite: "/images/museum/frame-3.webp", aspect: 360 / 138 },
  ],
  plinthTop: 45.6,
  plinthBottom: 81.4,
};

// Toro, the RAYVE bull, in one look per frame: his world (a rendered scene with a round platform) and his cut-out
// wearing that frame. `platform` is where his feet go in the world image, `nose` and `glasses` where those are on the
// cut-out, all in %; `bullAspect` is the cut-out's width / height.
export const TORO_LOOKS = {
  arena: {
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
  alba: {
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
  cordoba: {
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
