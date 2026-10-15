"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Check, Download, ImageUp, Loader2, RefreshCw, ScanFace, ShieldCheck, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import Price from "@/components/ui/Price";
import { frameColorFor, lensColorFor } from "@/lib/frameColors";
import { measureFace, classifyFace, photoView, faceFocus } from "./faceShape";

const TryOnScene = dynamic(() => import("./TryOnScene"), { ssr: false });

// Pinned to the installed @mediapipe/tasks-vision version so the wasm matches the JS
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const SCAN_SAMPLES = 40; // frames averaged for the face-shape estimate

async function createLandmarker() {
  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
  const files = await FilesetResolver.forVisionTasks(WASM_URL);
  const options = (delegate) => ({ baseOptions: { modelAssetPath: MODEL_URL, delegate }, runningMode: "VIDEO", numFaces: 1 });
  try {
    return await FaceLandmarker.createFromOptions(files, options("GPU"));
  } catch {
    return FaceLandmarker.createFromOptions(files, options("CPU"));
  }
}

const cameraError = (err) =>
  err?.name === "NotAllowedError"
    ? "Camera access was blocked. Allow it in your browser's site settings, or upload a photo instead."
    : err?.name === "NotFoundError"
      ? "No camera was found on this device. Try uploading a photo instead."
      : "We couldn't start the camera. Try again, or upload a photo instead.";

export default function TryOn({ products, initialSlug }) {
  const { add } = useCart();
  const [slug, setSlug] = useState(() => (products.some((p) => p.slug === initialSlug) ? initialSlug : products[0]?.slug));
  const [mode, setMode] = useState("idle"); // idle | loading | camera | photo
  const [error, setError] = useState("");
  const [found, setFound] = useState(false);
  const [photo, setPhoto] = useState(null); // object URL of an uploaded photo
  const [scan, setScan] = useState(0); // samples collected so far
  const [faceShape, setFaceShape] = useState(null);
  const [onlyMatches, setOnlyMatches] = useState(false);
  const [shapeFilter, setShapeFilter] = useState(null); // one recommended frame shape, picked from the result card
  const [added, setAdded] = useState(false);
  const [photoMeta, setPhotoMeta] = useState(null); // { w, h, focus } of the uploaded photo
  const [stageSize, setStageSize] = useState(null);

  const stage = useRef(null);
  const video = useRef(null);
  const photoImg = useRef(null);
  const fileInput = useRef(null);
  const glCanvas = useRef(null);
  const landmarker = useRef(null);
  const stream = useRef(null);
  const raf = useRef(0);
  const face = useRef(null); // latest landmarks, read every frame by the 3D scene
  const samples = useRef([]);

  const product = products.find((p) => p.slug === slug) ?? products[0];
  const frame = { shape: product?.shape ?? "Oval", ...frameColorFor(product?.frameColor), lens: lensColorFor(product?.lensColor) };
  const list = shapeFilter
    ? products.filter((p) => p.shape === shapeFilter)
    : onlyMatches && faceShape
      ? products.filter((p) => faceShape.shapes.includes(p.shape))
      : products;
  const counts = products.reduce((acc, p) => ({ ...acc, [p.shape]: (acc[p.shape] ?? 0) + 1 }), {});

  const stopCamera = () => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };

  // Release the camera and the model when leaving the page
  useEffect(
    () => () => {
      stopCamera();
      landmarker.current?.close();
    },
    [],
  );

  useEffect(() => () => photo && URL.revokeObjectURL(photo), [photo]);

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setStageSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(stage.current);
    return () => ro.disconnect();
  }, []);

  const resetScan = () => {
    samples.current = [];
    setScan(0);
    setFaceShape(null);
    setShapeFilter(null);
  };

  // Once the face is read: show only the frames that suit it, and put the first of them on straight away
  const applyFaceShape = (shape) => {
    setFaceShape(shape);
    setOnlyMatches(true);
    setShapeFilter(null);
    setSlug((current) => {
      const suits = (s) => shape.shapes.includes(products.find((p) => p.slug === s)?.shape);
      return suits(current) ? current : (products.find((p) => shape.shapes.includes(p.shape))?.slug ?? current);
    });
  };

  // Feeds one detection into the scene and the face-shape estimate
  const handleResult = (result, w, h) => {
    const lm = result.faceLandmarks?.[0];
    face.current = lm ? { landmarks: lm, w, h } : null;
    setFound(Boolean(lm));
    if (!lm || samples.current.length >= SCAN_SAMPLES) return;
    const m = measureFace(lm, w, h);
    if (!m) return;
    samples.current.push(m);
    if (samples.current.length === SCAN_SAMPLES || samples.current.length % 5 === 0) setScan(samples.current.length);
    if (samples.current.length === SCAN_SAMPLES) applyFaceShape(classifyFace(samples.current));
  };

  const loadModel = async () => {
    landmarker.current ??= await createLandmarker();
    return landmarker.current;
  };

  const startCamera = async () => {
    setError("");
    setMode("loading");
    resetScan();
    face.current = null;
    try {
      const [model, media] = await Promise.all([
        loadModel(),
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false }),
      ]);
      stream.current = media;
      await model.setOptions({ runningMode: "VIDEO" });
      setPhoto(null);
      setMode("camera");
      const v = video.current;
      v.srcObject = media;
      await v.play();
      let last = -1;
      const tick = () => {
        if (v.readyState >= 2 && v.currentTime !== last) {
          last = v.currentTime;
          handleResult(model.detectForVideo(v, performance.now()), v.videoWidth, v.videoHeight);
        }
        raf.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      stopCamera();
      setMode("idle");
      setError(err?.name ? cameraError(err) : "Face tracking couldn't load. Check your connection and try again.");
    }
  };

  const tryPhoto = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    setError("");
    stopCamera();
    setMode("loading");
    resetScan();
    face.current = null;
    try {
      const model = await loadModel();
      await model.setOptions({ runningMode: "IMAGE" });
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = url;
      await img.decode();
      setPhoto(url);
      setMode("photo");
      const result = model.detect(img);
      // A single photo is a fair reading on its own, so count it as a full scan
      const lm = result.faceLandmarks?.[0];
      const meta = { w: img.naturalWidth, h: img.naturalHeight, focus: lm ? faceFocus(lm) : null };
      setPhotoMeta(meta);
      face.current = lm ? { landmarks: lm, ...meta, photo: true } : null;
      setFound(Boolean(lm));
      const m = lm && measureFace(lm, img.naturalWidth, img.naturalHeight);
      if (m) {
        samples.current = [m];
        setScan(SCAN_SAMPLES);
        applyFaceShape(classifyFace([m]));
      }
      if (!lm) setError("We couldn't find a face in that photo. Try a clear, front-facing picture.");
    } catch {
      setMode("idle");
      setError("Face tracking couldn't load. Check your connection and try again.");
    }
  };

  const stop = () => {
    stopCamera();
    face.current = null;
    setPhoto(null);
    setFound(false);
    setMode("idle");
  };

  // Combines the camera/photo with the 3D layer into one image the shopper can keep
  const snapshot = () => {
    const el = stage.current;
    const media = mode === "camera" ? video.current : photoImg.current;
    if (!el || !media || !glCanvas.current) return;
    const { width, height } = el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const out = document.createElement("canvas");
    out.width = Math.round(width * dpr);
    out.height = Math.round(height * dpr);
    const ctx = out.getContext("2d");
    if (mode === "camera") {
      ctx.translate(out.width, 0);
      ctx.scale(-1, 1);
    }
    const mw = media.videoWidth || media.naturalWidth;
    const mh = media.videoHeight || media.naturalHeight;
    ctx.fillStyle = "#22221a";
    ctx.fillRect(0, 0, out.width, out.height);
    if (mode === "photo") {
      const { s, ox, oy } = photoView(out.width, out.height, mw, mh, photoMeta?.focus);
      ctx.drawImage(media, ox, oy, mw * s, mh * s);
    } else {
      const s = Math.max(out.width / mw, out.height / mh);
      ctx.drawImage(media, (out.width - mw * s) / 2, (out.height - mh * s) / 2, mw * s, mh * s);
    }
    ctx.drawImage(glCanvas.current, 0, 0, out.width, out.height);
    const a = document.createElement("a");
    a.href = out.toDataURL("image/jpeg", 0.92);
    a.download = `rayve-${product.slug}-try-on.jpg`;
    a.click();
  };

  const live = mode === "camera" || mode === "photo";

  const steps = [
    ["Scan your face", faceShape ? "done" : "active"],
    ["See what suits you", faceShape ? "done" : "next"],
    ["Try them on live", faceShape ? "active" : "next"],
  ];

  return (
    // At least a screen tall; the panel can make it taller and the stage stretches with it, so nothing is cut off
    <div className="grid bg-olive-950 text-sand lg:min-h-[max(640px,calc(100svh-4rem))] lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
      {/* Stage */}
      <div ref={stage} className="relative h-[72svh] min-h-[460px] overflow-hidden bg-[#1b1b15] lg:h-auto">
        {/* Selfie view is mirrored, like a mirror; the 3D layer flips with it so they stay aligned */}
        <div className="absolute inset-0" style={mode === "camera" ? { transform: "scaleX(-1)" } : undefined}>
          <video ref={video} playsInline muted className={`absolute inset-0 size-full object-cover ${mode === "camera" ? "" : "hidden"}`} />
          {photo && mode === "photo" && photoMeta && stageSize && (() => {
            const { s, ox, oy } = photoView(stageSize.w, stageSize.h, photoMeta.w, photoMeta.h, photoMeta.focus);
            return (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL, never optimised
              <img
                ref={photoImg}
                src={photo}
                alt="Your photo"
                className="absolute max-w-none"
                style={{ left: ox, top: oy, width: photoMeta.w * s, height: photoMeta.h * s }}
              />
            );
          })()}
          {live && (
            <div className="absolute inset-0">
              <TryOnScene face={face} frame={frame} onCanvas={(c) => (glCanvas.current = c)} />
            </div>
          )}
        </div>

        {/* Start screen */}
        {!live && (
          <div className="absolute inset-0 grid place-items-center p-6 pb-36 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(166,159,78,0.22),transparent_62%)]" />
            <div className="relative max-w-md">
              {mode === "loading" ? (
                <>
                  <Loader2 className="mx-auto size-8 animate-spin text-olive-400" />
                  <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-sand/70">Loading face tracking…</p>
                </>
              ) : (
                <>
                  {/* face guide */}
                  <span className="relative mx-auto grid h-36 w-28 place-items-center rounded-[50%] border border-sand/25 sm:h-44 sm:w-36">
                    <span className="absolute inset-0 animate-ping rounded-[50%] border border-olive-400/30 [animation-duration:2.6s]" />
                    <ScanFace className="size-9 text-olive-400" strokeWidth={1.1} />
                  </span>
                  <p className="display-title mt-8 text-3xl sm:text-4xl" data-no-split>
                    Find your frame
                  </p>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-sand/60">
                    We&apos;ll read your face shape, pick the frames that balance it and put them on you — live.
                  </p>
                  <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
                    <button onClick={startCamera} className="btn h-12 whitespace-nowrap bg-sand text-olive-950 hover:bg-paper">
                      <Camera className="size-4" /> Scan my face
                    </button>
                    <button onClick={() => fileInput.current?.click()} className="btn h-12 whitespace-nowrap border border-sand/30 text-sand hover:border-sand">
                      <ImageUp className="size-4" /> Upload a photo
                    </button>
                  </div>
                  {error && <p className="mt-5 text-xs text-[#e8b4a0]">{error}</p>}
                </>
              )}
            </div>
          </div>
        )}

        {/* Live controls */}
        {live && (
          <>
            <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
              <span className="flex items-center gap-2 bg-olive-950/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] backdrop-blur">
                <span className={`size-1.5 rounded-full ${found ? "bg-olive-400" : "animate-pulse bg-sand/50"}`} />
                {found ? product?.name : mode === "camera" ? "Looking for your face…" : "No face found"}
              </span>
            </div>
            <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
              <button onClick={snapshot} disabled={!found} className="grid size-10 place-items-center rounded-full bg-olive-950/70 backdrop-blur transition hover:bg-olive-950 disabled:opacity-40" aria-label="Save a picture">
                <Download className="size-4" />
              </button>
              <button onClick={stop} className="grid size-10 place-items-center rounded-full bg-olive-950/70 backdrop-blur transition hover:bg-olive-950" aria-label="Stop try-on">
                <X className="size-4" />
              </button>
            </div>
            {error && mode === "photo" && (
              <p className="absolute inset-x-4 top-16 bg-olive-950/80 p-3 text-center text-xs backdrop-blur sm:inset-x-6">{error}</p>
            )}
            {mode === "camera" && !faceShape && found && (
              <div className="absolute inset-x-4 bottom-36 mx-auto max-w-xs bg-olive-950/70 p-3 text-center backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.2em] text-sand/70">Reading your face shape — look straight ahead</p>
                <div className="mt-2 h-px bg-sand/15">
                  <div className="h-px bg-olive-400 transition-[width] duration-300" style={{ width: `${(scan / SCAN_SAMPLES) * 100}%` }} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Frame rail: tap a frame to put it on */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-olive-950 via-olive-950/70 to-transparent pb-4 pt-12">
          <p className="mb-3 px-4 text-[10px] uppercase tracking-[0.25em] text-sand/60 sm:px-6">
            {list.length} {list.length === 1 ? "frame" : "frames"}
            {shapeFilter ? ` · ${shapeFilter}` : onlyMatches && faceShape ? " that suit you" : " to try"}
          </p>
          {/* vertical padding leaves room for the selected frame's ring, which the scroll box would otherwise clip */}
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 py-1.5 sm:px-6">
            {list.map((p) => {
              const active = p.slug === product?.slug;
              const suits = faceShape?.shapes.includes(p.shape);
              return (
                <button key={p.id} onClick={() => setSlug(p.slug)} aria-pressed={active} className="group w-16 shrink-0 text-center sm:w-[72px]">
                  <span
                    className={`relative block aspect-square overflow-hidden rounded-full bg-mist transition-all duration-300 ${
                      active ? "ring-2 ring-sand ring-offset-2 ring-offset-olive-950" : "opacity-60 group-hover:opacity-100"
                    }`}
                  >
                    {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="72px" className="object-cover" />}
                  </span>
                  <span className={`mt-2 block truncate font-display text-[8px] uppercase tracking-[0.14em] ${active ? "text-sand" : "text-sand/55"}`}>
                    {suits && <span className="mr-1 inline-block size-1 rounded-full bg-olive-400 align-middle" />}
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            tryPhoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {/* Panel */}
      <aside className="flex min-w-0 flex-col border-sand/10 px-5 py-8 sm:px-8 lg:border-l lg:py-10">
        <p className="eyebrow text-sand/60">Virtual try-on</p>
        <h1 className="display-title mt-3 text-2xl sm:text-3xl">What suits your face?</h1>

        <ol className="mt-7 space-y-3">
          {steps.map(([label, state], i) => (
            <li key={label} className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] ${state === "next" ? "text-sand/40" : "text-sand"}`}>
              <span
                className={`grid size-6 place-items-center rounded-full border font-display text-[9px] ${
                  state === "done" ? "border-olive-400 bg-olive-400 text-olive-950" : state === "active" ? "border-sand" : "border-sand/20"
                }`}
              >
                {state === "done" ? <Check className="size-3" /> : i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>

        <div className="mt-8 border-t border-sand/10 pt-8">
          {faceShape ? (
            <div className="animate-fade-up">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-sand/50">Your face shape</p>
                  <p className="display-title mt-2 text-4xl" data-no-split>
                    {faceShape.label}
                  </p>
                </div>
                {mode === "camera" && (
                  <button onClick={resetScan} className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-sand/50 hover:text-sand">
                    <RefreshCw className="size-3" /> Rescan
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-sand/65">{faceShape.why}</p>
              <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-sand/50">Frames that suit you</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {faceShape.shapes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setShapeFilter(shapeFilter === s ? null : s)}
                    disabled={!counts[s]}
                    aria-pressed={shapeFilter === s}
                    className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-colors disabled:opacity-30 ${
                      shapeFilter === s ? "border-sand bg-sand text-olive-950" : "border-sand/25 hover:border-sand"
                    }`}
                  >
                    {s} <span className={shapeFilter === s ? "text-olive-950/60" : "text-sand/45"}>{counts[s] ?? 0}</span>
                  </button>
                ))}
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-sand/70">
                <input
                  type="checkbox"
                  checked={onlyMatches}
                  onChange={(e) => {
                    setOnlyMatches(e.target.checked);
                    setShapeFilter(null);
                  }}
                  className="accent-olive-400"
                />
                Only show frames that suit me
              </label>
            </div>
          ) : (
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-sand/50">Your face shape</p>
              <p className="mt-3 text-sm leading-relaxed text-sand/55">
                {mode === "photo"
                  ? "We need a clear, front-facing photo to read your face shape."
                  : live
                    ? found
                      ? "Reading it now — keep looking straight ahead…"
                      : "Show your face to the camera to start."
                    : "Scan your face and we'll tell you its shape and the frames that balance it."}
              </p>
            </div>
          )}
        </div>

        {product && (
          <div className="mt-8 border-t border-sand/10 pt-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-sand/50">Now trying</p>
            <h2 className="display-title mt-3 text-3xl" data-no-split>
              {product.name}
            </h2>
            <p className="mt-2 text-xs text-sand/55">{[product.shape, product.frameColor, product.lensColor && `${product.lensColor} lens`].filter(Boolean).join(" · ")}</p>
            <Price price={product.price} comparePrice={product.comparePrice} className="mt-3 text-lg font-light" />
            <div className="mt-6 flex gap-2">
              <button
                disabled={product.stock <= 0}
                onClick={(e) => {
                  add(product, 1, e.currentTarget);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1600);
                }}
                className="btn h-12 flex-1 bg-sand text-olive-950 hover:bg-paper"
              >
                {product.stock <= 0 ? "Sold out" : added ? (
                  <>
                    <Check className="size-4" /> Added
                  </>
                ) : (
                  "Add to bag"
                )}
              </button>
              <Link href={`/product/${product.slug}`} className="btn h-12 border border-sand/25 text-sand hover:border-sand">
                Details <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}

        <p className="mt-auto flex items-start gap-2 pt-10 text-[11px] leading-relaxed text-sand/45">
          <ShieldCheck className="mt-px size-3.5 shrink-0 text-olive-400" />
          Everything runs on your device — your camera and photos are never uploaded or saved. Frames are shown as 3D stand-ins, so colour and size are approximate.
        </p>
      </aside>
    </div>
  );
}
