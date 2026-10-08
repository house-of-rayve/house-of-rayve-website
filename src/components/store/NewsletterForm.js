"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function NewsletterForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setEmail("");
        toast("Thanks — you're on the list.");
      }}
      className="mt-4 flex border-b border-sand/30 focus-within:border-sand"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-sand outline-none placeholder:text-sand/40"
      />
      <button aria-label="Subscribe" className="px-1 text-sand/70 hover:text-sand">
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
