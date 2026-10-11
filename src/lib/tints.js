// On-screen approximations of each lens tint: a colour filter plus a multiply wash
export const TINTS = [
  { name: "Smoke Grey", match: /grey|gray|smoke|black/i, swatch: "#2b2b26", filter: "brightness(0.7) contrast(1.15) saturate(0.85)", wash: "rgba(43,43,38,0.42)", note: "True colour, less glare" },
  { name: "Amber", match: /amber|orange/i, swatch: "#c4691c", filter: "sepia(0.4) saturate(1.45) contrast(1.18) brightness(0.92)", wash: "rgba(196,105,28,0.34)", note: "Warmer, sharper contrast" },
  { name: "Bottle Green", match: /green/i, swatch: "#2f6136", filter: "contrast(1.12) brightness(0.86) saturate(0.95)", wash: "rgba(47,97,54,0.42)", note: "Cool, calm, classic" },
  { name: "Brown", match: /brown/i, swatch: "#5a3a22", filter: "sepia(0.3) contrast(1.16) brightness(0.86) saturate(1.1)", wash: "rgba(90,58,34,0.4)", note: "Rich, defined detail" },
];

export const tintIndexFor = (lensName) => Math.max(0, TINTS.findIndex((t) => t.match.test(lensName ?? "")));
