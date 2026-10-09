"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function NewsletterForm({ variant = "dark" }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const submit = (e) => {
    e.preventDefault();
    setEmail("");
    toast("Thanks — you're on the list.");
  };

  if (variant === "light") {
    return (
      <form onSubmit={submit} className="flex border border-olive-800 bg-paper">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted"
        />
        <button className="btn-primary h-12 shrink-0">Subscribe</button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 flex border-b border-sand/30 focus-within:border-sand">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        aria-label="Email address"
        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-sand outline-none placeholder:text-sand/40"
      />
      <button aria-label="Subscribe" className="px-1 text-sand/70 hover:text-sand">
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
