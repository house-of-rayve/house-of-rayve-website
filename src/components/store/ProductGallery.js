"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  if (!images.length) return <div className="aspect-[4/5] bg-sand" />;
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto sm:w-20 sm:flex-col">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-sand transition-opacity sm:w-full ${
                active === i ? "ring-1 ring-olive-800" : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-sand">
        <Image
          key={images[active]}
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="animate-fade-up object-cover"
        />
      </div>
    </div>
  );
}
