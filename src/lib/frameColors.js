// Approximate render colours for the frame and lens names used in the catalogue (for the 3D try-on).
const FRAMES = [
  [/gold/i, "#c9a85b", true],
  [/bronze|copper/i, "#8a5a2b", true],
  [/silver|steel|gunmetal/i, "#8d8f91", true],
  [/dark tortoise/i, "#3b2210", false],
  [/tortoise|havana/i, "#5a3214", false],
  [/olive/i, "#3a3a24", false],
  [/sand|beige|cream/i, "#c8b48a", false],
  [/brown/i, "#4a2e1a", false],
  [/clear|crystal/i, "#8f8c6a", false],
];

const LENSES = [
  [/amber|orange/i, "#c4691c"],
  [/green/i, "#2f6136"],
  [/brown/i, "#5a3a22"],
  [/blue/i, "#22384f"],
  [/rose|pink/i, "#a8545c"],
  [/grey|gray|smoke|black/i, "#2b2b26"],
];

/** @returns {{ hex: string, metal: boolean }} */
export function frameColorFor(name = "") {
  const hit = FRAMES.find(([re]) => re.test(name ?? ""));
  return hit ? { hex: hit[1], metal: hit[2] } : { hex: "#0d0d0b", metal: false };
}

export function lensColorFor(name = "") {
  return LENSES.find(([re]) => re.test(name ?? ""))?.[1] ?? "#2b2b26";
}
