import { json, error } from "@/lib/api";
import { matchState } from "@/lib/india";

// City and state for a PIN code, from India Post's public directory. GET /api/pincode?pin=110092
const cache = new Map(); // PIN codes don't move; keep answers for the life of the server

// The names people actually use for a few districts
const CITY_NAMES = { "gautam buddha nagar": "Noida", gurgaon: "Gurugram", bangalore: "Bengaluru", "bangalore rural": "Bengaluru" };

export async function GET(request) {
  const pin = new URL(request.url).searchParams.get("pin") ?? "";
  if (!/^[1-9]\d{5}$/.test(pin)) return error("Enter a valid 6-digit PIN code.");
  if (cache.has(pin)) return json(cache.get(pin));
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: AbortSignal.timeout(6000) });
    const [result] = await res.json();
    const office = result?.Status === "Success" ? result.PostOffice?.[0] : null;
    if (!office) return error("We couldn't find this PIN code.", 404);
    const district = office.District ?? "";
    const city = /delhi/i.test(district) ? "Delhi" : (CITY_NAMES[district.toLowerCase()] ?? district);
    const data = { pin, city, state: matchState(office.State) ?? office.State };
    cache.set(pin, data);
    return json(data);
  } catch {
    return error("Couldn't look up this PIN code right now.", 502);
  }
}
