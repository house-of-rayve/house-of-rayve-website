// Indian states and union territories, for the address form
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // Union territories
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const squash = (s) => String(s ?? "").toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");

/** The list's spelling of a state name from elsewhere ("Jammu & Kashmir" → "Jammu and Kashmir"), or null. */
export function matchState(name) {
  const key = squash(name);
  if (!key) return null;
  if (key === "nctofdelhi" || key === "newdelhi") return "Delhi";
  if (key === "pondicherry") return "Puducherry";
  if (key === "orissa") return "Odisha";
  if (key === "uttaranchal") return "Uttarakhand";
  if (key.startsWith("dadra") || key.startsWith("daman")) return "Dadra and Nagar Haveli and Daman and Diu";
  return INDIAN_STATES.find((s) => squash(s) === key) ?? null;
}
