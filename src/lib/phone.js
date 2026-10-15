// Indian mobile numbers: 10 digits starting 6–9. "+91 98765 43210", "09876543210" and "9876543210" are all accepted
// and stored as the plain 10 digits. Shared by forms and the server.
export const PHONE_ERROR = "Enter a 10-digit mobile number.";

export function normalizePhone(value) {
  let d = String(value ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

/** What to show in a 10-digit field for a stored number (older entries may include +91 or spaces). */
export const phoneDigits = (value) => normalizePhone(value) ?? String(value ?? "").replace(/\D/g, "").slice(-10);
