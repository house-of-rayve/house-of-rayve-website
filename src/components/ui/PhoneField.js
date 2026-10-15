"use client";

import { phoneDigits } from "@/lib/phone";

/** A 10-digit Indian mobile number with a fixed +91. Only digits can be typed, and the browser blocks anything else. */
export default function PhoneField({ id, value, onChange, required = false }) {
  return (
    <div className="flex">
      <span className="grid shrink-0 place-items-center border border-r-0 border-line bg-mist px-3 text-sm text-muted">+91</span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        className="field min-w-0 flex-1"
        required={required}
        value={phoneDigits(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        maxLength={10}
        pattern="[6-9][0-9]{9}"
        title="Enter a 10-digit mobile number starting with 6, 7, 8 or 9"
        placeholder="98765 43210"
      />
    </div>
  );
}
