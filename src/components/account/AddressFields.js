"use client";

import { useId } from "react";

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
        <input id={`${uid}-phone`} className="field" required value={value.phone} onChange={set("phone")} autoComplete="tel" placeholder="+91" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`${uid}-line1`}>Address</label>
        <input id={`${uid}-line1`} className="field" required value={value.line1} onChange={set("line1")} autoComplete="address-line1" placeholder="House no., street" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`${uid}-line2`}>Apartment, area (optional)</label>
        <input id={`${uid}-line2`} className="field" value={value.line2 ?? ""} onChange={set("line2")} autoComplete="address-line2" />
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-city`}>City</label>
        <input id={`${uid}-city`} className="field" required value={value.city} onChange={set("city")} autoComplete="address-level2" />
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-state`}>State</label>
        <input id={`${uid}-state`} className="field" required value={value.state} onChange={set("state")} autoComplete="address-level1" />
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-postalCode`}>PIN code</label>
        <input id={`${uid}-postalCode`} className="field" required inputMode="numeric" maxLength={6} value={value.postalCode} onChange={set("postalCode")} autoComplete="postal-code" />
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-country`}>Country</label>
        <input id={`${uid}-country`} className="field" value={value.country} onChange={set("country")} autoComplete="country-name" />
      </div>
    </div>
  );
}
