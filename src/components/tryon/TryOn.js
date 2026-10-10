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
  const list = onlyMatches && faceShape ? products.filter((p) => faceShape.shapes.includes(p.shape)) : products;

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
    if (samples.current.length === SCAN_SAMPLES) setFaceShape(classifyFace(samples.current));
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
        setFaceShape(classifyFace([m]));
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

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      {/* Stage */}
      <div className="lg:col-span-8">
        <div ref={stage} className="relative aspect-[3/4] overflow-hidden bg-olive-950 text-sand sm:aspect-[4/3]">
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
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(166,159,78,0.18),transparent_65%)]" />
              <div className="relative max-w-sm">
                {mode === "loading" ? (
                  <>
                    <Loader2 className="mx-auto size-8 animate-spin text-olive-400" />
                    <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-sand/70">Loading face tracking…</p>
                  </>
                ) : (
                  <>
                    <ScanFace className="mx-auto size-10 text-olive-400" strokeWidth={1.2} />
                    <p className="display-title mt-5 text-2xl sm:text-3xl" data-no-split>
                      See them on you
                    </p>
                    <p className="mt-3 text-sm text-sand/60">Turn on your camera to try frames live, or use a front-facing photo.</p>
                    <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
                      <button onClick={startCamera} className="btn h-11 whitespace-nowrap bg-sand text-olive-950 hover:bg-paper">
                        <Camera className="size-4" /> Start camera
                      </button>
                      <button onClick={() => fileInput.current?.click()} className="btn h-11 whitespace-nowrap border border-sand/30 text-sand hover:border-sand">
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
              <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                <span className="flex items-center gap-2 bg-olive-950/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] backdrop-blur">
                  <span className={`size-1.5 rounded-full ${found ? "bg-olive-400" : "animate-pulse bg-sand/50"}`} />
                  {found ? product?.name : mode === "camera" ? "Looking for your face…" : "No face found"}
                </span>
              </div>
              <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4">
                <button onClick={snapshot} disabled={!found} className="grid size-10 place-items-center rounded-full bg-olive-950/70 backdrop-blur transition hover:bg-olive-950 disabled:opacity-40" aria-label="Save a picture">
                  <Download className="size-4" />
                </button>
                <button onClick={stop} className="grid size-10 place-items-center rounded-full bg-olive-950/70 backdrop-blur transition hover:bg-olive-950" aria-label="Stop try-on">
                  <X className="size-4" />
                </button>
              </div>
              {error && mode === "photo" && (
                <p className="absolute inset-x-3 bottom-3 bg-olive-950/80 p-3 text-center text-xs backdrop-blur sm:inset-x-4 sm:bottom-4">{error}</p>
              )}
              {mode === "camera" && !faceShape && found && (
                <div className="absolute inset-x-3 bottom-3 bg-olive-950/70 p-3 backdrop-blur sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-72">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-sand/70">Reading your face shape — look straight ahead</p>
                  <div className="mt-2 h-px bg-sand/15">
                    <div className="h-px bg-olive-400 transition-[width] duration-300" style={{ width: `${(scan / SCAN_SAMPLES) * 100}%` }} />
                  </div>
                </div>
              )}
            </>
          )}

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

        <p className="mt-3 flex items-start gap-2 text-xs text-muted">
          <ShieldCheck className="mt-px size-3.5 shrink-0 text-olive-500" />
          Everything runs on your device — your camera and photos are never uploaded or saved. The preview uses a 3D stand-in for each frame shape, so colours and size are approximate.
        </p>
      </div>

      {/* Panel */}
      <aside className="lg:col-span-4">
        {faceShape && (
          <div className="mb-6 border border-olive-800 bg-olive-800 p-5 text-sand animate-fade-up">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-sand/60">Your face shape (estimate)</p>
                <p className="display-title mt-2 text-2xl" data-no-split>
                  {faceShape.label}
                </p>
              </div>
              {mode === "camera" && (
                <button onClick={resetScan} className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-sand/60 hover:text-sand">
                  <RefreshCw className="size-3" /> Rescan
                </button>
              )}
            </div>
            <p className="mt-3 text-sm text-sand/70">Frames that tend to balance it: {faceShape.shapes.join(", ")}.</p>
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs">
              <input type="checkbox" checked={onlyMatches} onChange={(e) => setOnlyMatches(e.target.checked)} className="accent-olive-400" />
              Only show frames that suit me
            </label>
          </div>
        )}

        {product && (
          <div className="border-b border-line pb-6">
            <p className="eyebrow">Now trying</p>
            <h2 className="display-title mt-3 text-2xl" data-no-split>
              {product.name}
            </h2>
            <p className="mt-2 text-xs text-muted">{[product.shape, product.frameColor, product.lensColor && `${product.lensColor} lens`].filter(Boolean).join(" · ")}</p>
            <Price price={product.price} comparePrice={product.comparePrice} className="mt-3 text-lg font-light" />
            <div className="mt-5 flex gap-2">
              <button
                disabled={product.stock <= 0}
                onClick={(e) => {
                  add(product, 1, e.currentTarget);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1600);
                }}
                className="btn-primary h-11 flex-1"
              >
                {product.stock <= 0 ? "Sold out" : added ? (
                  <>
                    <Check className="size-4" /> Added
                  </>
                ) : (
                  "Add to bag"
                )}
              </button>
              <Link href={`/product/${product.slug}`} className="btn h-11 border border-line hover:border-olive-800">
                Details <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}

        <p className="mb-4 mt-6 text-[10px] uppercase tracking-[0.25em] text-muted">
          {list.length} {list.length === 1 ? "frame" : "frames"} to try
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
          {list.map((p) => {
            const active = p.slug === product?.slug;
            const suits = faceShape?.shapes.includes(p.shape);
            return (
              <button
                key={p.id}
                onClick={() => setSlug(p.slug)}
                aria-pressed={active}
                className={`group text-left transition ${active ? "" : "opacity-70 hover:opacity-100"}`}
              >
                <span className={`relative block aspect-square overflow-hidden bg-mist ring-offset-2 ring-offset-canvas ${active ? "ring-1 ring-olive-800" : ""}`}>
                  {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="(min-width:1024px) 10vw, (min-width:640px) 16vw, 33vw" className="object-cover" />}
                  {suits && <span className="absolute left-1.5 top-1.5 size-1.5 rounded-full bg-olive-500" title="Suits your face shape" />}
                </span>
                <span className="mt-1.5 block truncate font-display text-[9px] uppercase tracking-[0.15em]">{p.name}</span>
                <span className="block truncate text-[10px] text-muted">{p.shape}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
