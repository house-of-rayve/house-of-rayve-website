import { FACE_SHAPES } from "@/lib/constants";

// MediaPipe face-mesh landmark indices
const CHEEK_L = 234;
const CHEEK_R = 454;
const BROW_TOP = 10; // top of the forehead the mesh reaches (below the hairline)
const CHIN = 152;
const JAW_L = 172;
const JAW_R = 397;
const TEMPLE_L = 54;
const TEMPLE_R = 284;
const NOSE_TIP = 1;

const dist = (a, b, w, h) => Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);

/** Proportions of one detected face, or null when the head is turned too far for a fair reading. */
export function measureFace(lm, w, h) {
  const width = dist(lm[CHEEK_L], lm[CHEEK_R], w, h);
  if (!width) return null;
  // Head turned: the nose tip sits off-centre between the cheeks
  const left = dist(lm[NOSE_TIP], lm[CHEEK_L], w, h);
  const right = dist(lm[NOSE_TIP], lm[CHEEK_R], w, h);
  if (Math.abs(left - right) / width > 0.14) return null;
  return {
    length: dist(lm[BROW_TOP], lm[CHIN], w, h) / width,
    jaw: dist(lm[JAW_L], lm[JAW_R], w, h) / width,
    forehead: dist(lm[TEMPLE_L], lm[TEMPLE_R], w, h) / width,
  };
}

/** Averages several readings and returns the closest face shape from FACE_SHAPES. */
export function classifyFace(samples) {
  const n = samples.length;
  const avg = (k) => samples.reduce((s, m) => s + m[k], 0) / n;
  const length = avg("length");
  const jaw = avg("jaw");
  const forehead = avg("forehead");

  let id;
  if (length >= 1.32) id = "long";
  else if (forehead - jaw >= 0.1) id = "heart";
  else if (length <= 1.12) id = jaw >= 0.8 ? "square" : "round";
  else id = jaw >= 0.84 ? "square" : "oval";
  return { ...FACE_SHAPES.find((f) => f.id === id), metrics: { length, jaw, forehead } };
}

/**
 * How to lay a photo out in the stage so the face fills it: returns the scale and offset (in px)
 * of the image, never zooming out further than "contain" and never leaving needless gaps.
 */
export function photoView(cw, ch, w, h, focus) {
  const contain = Math.min(cw / w, ch / h);
  const s = focus ? Math.max(contain, (ch * 0.42) / (focus.height * h)) : contain;
  const place = (stage, len, centre) => (len <= stage ? (stage - len) / 2 : Math.min(0, Math.max(stage - len, stage / 2 - centre)));
  return {
    s,
    ox: place(cw, w * s, focus ? focus.x * w * s : 0),
    oy: place(ch, h * s, focus ? focus.y * h * s : 0),
  };
}

/** Centre and height (normalised) of the face, used to zoom photos in on it. */
export function faceFocus(lm) {
  const ys = lm.map((p) => p.y);
  const xs = lm.map((p) => p.x);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (top + bottom) / 2, height: bottom - top };
}
