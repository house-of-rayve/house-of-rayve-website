"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X, LayoutGrid, Grid3x3, Check, RectangleHorizontal, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import CompareBar, { CompareToggle } from "./CompareBar";
import Price from "@/components/ui/Price";
import { useCart } from "@/components/cart/CartProvider";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { formatPrice } from "@/lib/format";

const VIEWS = [
  ["grid", "Large grid", LayoutGrid],
  ["compact", "Compact grid", Grid3x3],
  ["editorial", "Editorial view", RectangleHorizontal],
];

/** Big, magazine-style row for the editorial view. */
function EditorialRow({ product, index }) {
  const { add } = useCart();
  const photo = useRef(null);
  const [primary, secondary] = product.images;
  const soldOut = product.stock <= 0;
  return (
    <article className="grid items-center gap-6 border-b border-line pb-12 md:grid-cols-12 md:gap-10">
      <Link
        ref={photo}
        href={`/product/${product.slug}`}
        className={`group relative aspect-[4/3] overflow-hidden bg-mist md:col-span-7 ${index % 2 ? "md:order-2" : ""}`}
      >
        {primary && <Image src={primary} alt={product.name} fill sizes="(min-width:768px) 50vw, 100vw" className={`object-cover transition duration-700 group-hover:scale-[1.03] ${secondary ? "group-hover:opacity-0" : ""}`} />}
        {secondary && <Image src={secondary} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover opacity-0 transition duration-700 group-hover:opacity-100" />}
      </Link>
      <div className="md:col-span-5">
        <p className="font-display text-xs text-olive-500">{String(index + 1).padStart(2, "0")}</p>
        <h3 className="display-title mt-3 text-2xl sm:text-3xl" data-no-split>
          <Link href={`/product/${product.slug}`} className="hover:text-olive-700">
            {product.name}
          </Link>
        </h3>
        {product.tagline && <p className="mt-2 text-muted">{product.tagline}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          {[product.shape, product.frameColor, product.lensColor && `${product.lensColor} lens`, product.material].filter(Boolean).map((t) => (
            <span key={t} className="border border-line px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-muted">
              {t}
            </span>
          ))}
        </div>
        <Price price={product.price} comparePrice={product.comparePrice} className="mt-5 text-xl font-light" />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button disabled={soldOut} onClick={() => add(product, 1, photo.current)} className="btn-primary h-11">
            {soldOut ? "Sold out" : "Add to bag"}
          </button>
          <Link href={`/product/${product.slug}`} className="btn h-11 border border-line hover:border-olive-800">
            Details <ArrowRight className="size-3.5" />
          </Link>
          <CompareToggle id={product.id} className="ml-2" />
        </div>
      </div>
    </article>
  );
}

const SORTS = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
];

const PRICE_BUCKETS = [
  ["under-4500", "Under ₹4,500", (p) => p < 4500],
  ["4500-5500", "₹4,500 – ₹5,500", (p) => p >= 4500 && p <= 5500],
  ["over-5500", "Above ₹5,500", (p) => p > 5500],
];

const SORTERS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

const list = (v) => (v ? v.split(",").filter(Boolean) : []);

function FilterGroup({ title, children }) {
  return (
    <div role="group" aria-label={title} className="border-b border-line py-6 first:pt-0">
      <p className="mb-4 font-display text-[10px] uppercase tracking-[0.25em]">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Option({ checked, onChange, label, count, type = "checkbox" }) {
  return (
    <label className={`group flex cursor-pointer items-center gap-3 text-sm ${count === 0 && !checked ? "opacity-40" : ""}`}>
      <input type={type} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`grid size-4 shrink-0 place-items-center border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-olive-500 ${
          type === "radio" ? "rounded-full" : ""
        } ${checked ? "border-olive-800 bg-olive-800 text-sand" : "border-line bg-paper group-hover:border-olive-800"}`}
      >
        {checked && (type === "radio" ? <span className="size-1.5 rounded-full bg-mist" /> : <Check className="size-3" strokeWidth={3} />)}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted">{count}</span>}
    </label>
  );
}

export default function ShopExplorer({ products, initial }) {
  const [category, setCategory] = useState(initial.category ?? "");
  const [shapes, setShapes] = useState(list(initial.shape));
  const [materials, setMaterials] = useState(list(initial.material));
  const [price, setPrice] = useState(initial.price ?? "");
  const [inStock, setInStock] = useState(initial.stock === "1");
  const [onOffer, setOnOffer] = useState(initial.offer === "1");
  const [sort, setSort] = useState(initial.sort ?? "featured");
  const [q, setQ] = useState(initial.q ?? "");
  const [view, setView] = useState("grid"); // grid | compact | editorial
  const grid = useRef(null);
  const rects = useRef(new Map()); // where each product sat after the previous render (page coordinates)
  const [drawer, setDrawer] = useState(false);

  // Keep the URL shareable without a server round trip
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (shapes.length) params.set("shape", shapes.join(","));
    if (materials.length) params.set("material", materials.join(","));
    if (price) params.set("price", price);
    if (inStock) params.set("stock", "1");
    if (onOffer) params.set("offer", "1");
    if (sort !== "featured") params.set("sort", sort);
    if (q) params.set("q", q);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/shop?${qs}` : "/shop");
  }, [category, shapes, materials, price, inStock, onOffer, sort, q]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const needle = q.trim().toLowerCase();
  const priceTest = PRICE_BUCKETS.find(([id]) => id === price)?.[2];

  // Each filter applied except one, so option counts reflect the other active filters
  const apply = (skip) =>
    products.filter(
      (p) =>
        (skip === "category" || !category || p.category === category) &&
        (skip === "shape" || !shapes.length || shapes.includes(p.shape)) &&
        (skip === "material" || !materials.length || materials.includes(p.material)) &&
        (skip === "price" || !priceTest || priceTest(p.price)) &&
        (!inStock || p.stock > 0) &&
        (!onOffer || p.comparePrice > p.price) &&
        (!needle ||
          [p.name, p.tagline, p.frameColor, p.shape, p.lensColor, p.material].filter(Boolean).some((v) => v.toLowerCase().includes(needle))),
    );

  let results = apply();
  if (SORTERS[sort]) results = [...results].sort(SORTERS[sort]);

  const countBy = (skip, key, value) => apply(skip).filter((p) => p[key] === value).length;
  const allCategories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  const allShapes = [...new Set(products.map((p) => p.shape).filter(Boolean))].sort();
  const allMaterials = [...new Set(products.map((p) => p.material).filter(Boolean))].sort();
  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const chips = [
    category && { label: category, clear: () => setCategory("") },
    ...shapes.map((s) => ({ label: s, clear: () => toggle(shapes, setShapes, s) })),
    ...materials.map((m) => ({ label: m, clear: () => toggle(materials, setMaterials, m) })),
    price && { label: PRICE_BUCKETS.find(([id]) => id === price)?.[1], clear: () => setPrice("") },
    inStock && { label: "In stock", clear: () => setInStock(false) },
    onOffer && { label: "On offer", clear: () => setOnOffer(false) },
    q && { label: `“${q}”`, clear: () => setQ("") },
  ].filter(Boolean);

  const clearAll = () => {
    setCategory("");
    setShapes([]);
    setMaterials([]);
    setPrice("");
    setInStock(false);
    setOnOffer(false);
    setQ("");
  };

  const filters = (
    <>
      {allCategories.length > 1 && (
        <FilterGroup title="Category">
          {["", ...allCategories].map((c) => (
            <Option
              key={c || "all"}
              type="radio"
              checked={category === c}
              onChange={() => setCategory(c)}
              label={c || "All eyewear"}
              count={c ? countBy("category", "category", c) : apply("category").length}
            />
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="Shape">
        {allShapes.map((s) => (
          <Option key={s} checked={shapes.includes(s)} onChange={() => toggle(shapes, setShapes, s)} label={s} count={countBy("shape", "shape", s)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        {PRICE_BUCKETS.map(([id, label, test]) => (
          <Option
            key={id}
            type="radio"
            checked={price === id}
            onChange={() => setPrice(price === id ? "" : id)}
            label={label}
            count={apply("price").filter((p) => test(p.price)).length}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Material">
        {allMaterials.map((m) => (
          <Option key={m} checked={materials.includes(m)} onChange={() => toggle(materials, setMaterials, m)} label={m} count={countBy("material", "material", m)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Availability">
        <Option checked={inStock} onChange={() => setInStock(!inStock)} label="In stock only" />
        <Option checked={onOffer} onChange={() => setOnOffer(!onOffer)} label="On offer" />
      </FilterGroup>
    </>
  );

  const priceRange = results.length ? [Math.min(...results.map((p) => p.price)), Math.max(...results.map((p) => p.price))] : null;

  // Animated filtering (FLIP): frames that stay glide from their old spot to the new one, new ones fade up
  const layoutKey = `${view}|${results.map((p) => p.id).join(",")}`;
  useLayoutEffect(() => {
    const el = grid.current;
    if (!el) return;
    const items = [...el.children];
    const next = new Map(items.map((c) => {
      const r = c.getBoundingClientRect();
      return [c.dataset.id, { x: r.left + window.scrollX, y: r.top + window.scrollY }];
    }));
    if (!prefersReducedMotion()) {
      let fresh = 0;
      items.forEach((c) => {
        const before = rects.current.get(c.dataset.id);
        const now = next.get(c.dataset.id);
        if (before) {
          const dx = before.x - now.x;
          const dy = before.y - now.y;
          if (dx || dy) gsap.fromTo(c, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.7, ease: "expo.out", clearProps: "transform" });
        } else {
          gsap.fromTo(c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, delay: Math.min(fresh++, 8) * 0.04, ease: "power3.out", clearProps: "opacity,transform" });
        }
      });
    }
    rects.current = next;
  }, [layoutKey]);

  return (
    <div className="lg:grid lg:grid-cols-[230px_1fr] lg:gap-12">
      <aside className="hidden lg:block">
        <div data-lenis-prevent className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto pb-8 pr-2">{filters}</div>
      </aside>

      <div>
        <div className="sticky top-16 z-20 -mx-5 flex items-center gap-3 border-b border-line bg-canvas/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:backdrop-blur-none">
          <button onClick={() => setDrawer(true)} className="flex h-9 items-center gap-2 border border-line bg-paper px-3 text-xs lg:hidden">
            <SlidersHorizontal className="size-3.5" /> Filters {chips.length > 0 && <span className="grid size-4 place-items-center rounded-full bg-olive-800 text-[9px] text-sand">{chips.length}</span>}
          </button>
          <p className="mr-auto text-xs text-muted">
            <span className="text-ink">{results.length}</span> {results.length === 1 ? "frame" : "frames"}
            {priceRange && <span className="max-sm:hidden"> · {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}</span>}
          </p>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 border border-line bg-paper px-3 text-xs outline-none">
            {SORTS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <div className="hidden items-center border border-line bg-paper md:flex">
            {VIEWS.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                aria-label={label}
                title={label}
                aria-pressed={view === id}
                className={`grid size-9 place-items-center ${view === id ? "bg-olive-800 text-sand" : "text-muted hover:text-ink"}`}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button key={c.label} onClick={c.clear} className="flex items-center gap-1.5 border border-line bg-paper px-3 py-1.5 text-xs transition-colors hover:border-olive-800">
                {c.label} <X className="size-3" />
              </button>
            ))}
            <button onClick={clearAll} className="ml-1 text-xs text-muted underline underline-offset-4 hover:text-ink">
              Clear all
            </button>
          </div>
        )}

        <h2 className="sr-only">Products</h2>
        {results.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-muted">No frames match these filters.</p>
            <button onClick={clearAll} className="btn-outline mt-6">
              Clear filters
            </button>
          </div>
        ) : (
          <div
            ref={grid}
            className={`mt-8 grid gap-x-4 gap-y-12 sm:gap-x-6 ${
              view === "editorial" ? "grid-cols-1" : view === "compact" ? "grid-cols-2 md:grid-cols-4 xl:grid-cols-5" : "grid-cols-2 md:grid-cols-3"
            }`}
          >
            {results.map((p, i) => (
              <div key={p.id} data-id={p.id}>
                {view === "editorial" ? <EditorialRow product={p} index={i} /> : <ProductCard product={p} priority={i < 3} morph compare />}
              </div>
            ))}
          </div>
        )}
      </div>

      <CompareBar products={products} />

      {/* Mobile filter drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${drawer ? "" : "pointer-events-none"}`}>
        <div onClick={() => setDrawer(false)} className={`absolute inset-0 bg-olive-950/40 transition-opacity ${drawer ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-canvas transition-transform duration-300 ${drawer ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <p className="font-display text-xs uppercase tracking-[0.25em]">Filters</p>
            <button onClick={() => setDrawer(false)} aria-label="Close filters">
              <X className="size-5" />
            </button>
          </div>
          <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-6">{filters}</div>
          <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
            <button onClick={clearAll} className="btn-outline">
              Clear
            </button>
            <button onClick={() => setDrawer(false)} className="btn-primary">
              Show {results.length}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
