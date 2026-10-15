"use client";

import { useEffect, useId, useRef, useState } from "react";
import { INDIAN_STATES, matchState } from "@/lib/india";
import PhoneField from "@/components/ui/PhoneField";

export const EMPTY_ADDRESS = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function AddressFields({ value, onChange, showLabel = false }) {
  const uid = useId();
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const [lookup, setLookup] = useState(null); // null | "loading" | "missing"
  const latest = useRef(value); // the form as it is now, for when a lookup comes back
  useEffect(() => {
    latest.current = value;
  }, [value]);

  // Fill in the city and state for a full PIN code (India Post directory, via our API)
  const lookUp = async (pin) => {
    setLookup("loading");
    try {
      const res = await fetch(`/api/pincode?pin=${pin}`);
      const data = res.ok ? await res.json() : null;
      if (latest.current.postalCode !== pin) return; // the PIN changed while we were looking
      if (!data?.city) return setLookup("missing");
      onChange({ ...latest.current, city: data.city, state: matchState(data.state) ?? data.state });
      setLookup(null);
    } catch {
      setLookup("missing");
    }
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {showLabel && (
        <div className="sm:col-span-2">
          <label className="label" htmlFor={`${uid}-label`}>Label</label>
          <input id={`${uid}-label`} className="field" value={value.label ?? ""} onChange={set("label")} placeholder="Home, Office…" />
        </div>
      )}
      <div>
        <label className="label" htmlFor={`${uid}-fullName`}>Full name</label>
        <input id={`${uid}-fullName`} className="field" required value={value.fullName} onChange={set("fullName")} autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-phone`}>Phone</label>
        <PhoneField id={`${uid}-phone`} required value={value.phone} onChange={(phone) => onChange({ ...value, phone })} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`${uid}-line1`}>Address</label>
        <input id={`${uid}-line1`} className="field" required value={value.line1} onChange={set("line1")} autoComplete="address-line1" placeholder="House no., street" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`${uid}-line2`}>Apartment, area (optional)</label>
        <input id={`${uid}-line2`} className="field" value={value.line2 ?? ""} onChange={set("line2")} autoComplete="address-line2" />
      </div>
      {/* PIN code first: it fills in the city and state */}
      <div>
        <label className="label" htmlFor={`${uid}-postalCode`}>PIN code</label>
        <input
          id={`${uid}-postalCode`}
          className="field"
          required
          inputMode="numeric"
          maxLength={6}
          value={value.postalCode}
          onChange={(e) => {
            const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
            onChange({ ...value, postalCode: pin });
            if (pin.length === 6) lookUp(pin);
            else setLookup(null);
          }}
          autoComplete="postal-code"
        />
        {lookup === "loading" && <p className="mt-1.5 text-xs text-muted">Finding your city…</p>}
        {lookup === "missing" && <p className="mt-1.5 text-xs text-muted">We couldn&apos;t find this PIN code — please fill in the city and state.</p>}
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-city`}>City</label>
        <input id={`${uid}-city`} className="field" required value={value.city} onChange={set("city")} autoComplete="address-level2" />
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-state`}>State</label>
        <select id={`${uid}-state`} className="field" required value={value.state} onChange={set("state")} autoComplete="address-level1">
          <option value="" disabled>
            Select state
          </option>
          {/* keep an older spelling from a saved address selectable */}
          {value.state && !INDIAN_STATES.includes(value.state) && <option value={value.state}>{value.state}</option>}
          {INDIAN_STATES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-country`}>Country</label>
        <input id={`${uid}-country`} className="field" value={value.country} onChange={set("country")} autoComplete="country-name" />
      </div>
    </div>
  );
}
