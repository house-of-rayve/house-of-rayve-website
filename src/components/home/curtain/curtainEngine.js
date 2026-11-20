// Olive velvet stage curtains (three.js) for the home hero. Two pleated panels part in one smooth,
// eased motion and uncover the arena photo behind them. The RAYVE crest is printed across the
// meeting edge, so it splits 50/50 as they open and stays on the folds once drawn aside.
// mountCurtain(hero, opts) starts it and returns a dispose() function.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const PALETTE = { base: "#353922", light: [110, 116, 66], dark: [16, 17, 10], sheen: [0.42, 0.46, 0.27], spot: 0xf1eee0, exposure: 0.62, foot: 0xf6ead2 };
const PANEL = { half: 0.55, width: 0.552, height: 1.1 }; // × view.w / view.w / view.h
const COLS = 360, ROWS = 90, PLEATS = 12;
const OPEN_MS = 2600, CLOSE_MS = 2400;

const hash = (n) => { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x); };
const vnoise = (x) => { const i = Math.floor(x); let f = x - i; f = f * f * (3 - 2 * f); return hash(i) + (hash(i + 1) - hash(i)) * f; };
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (e0, e1, x) => { const q = clamp01((x - e0) / (e1 - e0)); return q * q * (3 - 2 * q); };

async function loadImg(src) { const i = new Image(); i.src = src; await i.decode(); return i; }
function tint(img, color) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

export async function mountCurtain(hero, { markSrc, wordSrc, fontFamily = "sans-serif", freeze = null } = {}) {
  const canvas = hero.querySelector("[data-curtain-gl]");
  const replayBtn = hero.querySelector("[data-curtain-replay]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let disposed = false;
  const cleanups = [];
  const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); cleanups.push(() => el.removeEventListener(ev, fn, opt)); };

  // If WebGL can't start (or the GPU drops it), never leave a blank hero: show the arena straight away.
  const fallback = () => { canvas.style.display = "none"; hero.classList.add("is-playing", "is-revealed"); };
  on(canvas, "webglcontextlost", (e) => { e.preventDefault(); fallback(); });
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    fallback();
    return () => cleanups.forEach((f) => f());
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = PALETTE.exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const view = { w: 1, h: 1 };
  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    view.h = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    view.w = view.h * camera.aspect;
  }

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  // stage lighting: key spot from upper-left, softer fill from the right, footlights below
  scene.add(new THREE.HemisphereLight(0xfff0e0, 0x1c160c, 0.42));
  const spot = new THREE.SpotLight(PALETTE.spot, 3.0, 0, 0.75, 0.95, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(2048, 2048); // 2k is plenty for soft fold shadows and starts much faster
  spot.shadow.bias = -0.0008;
  spot.shadow.normalBias = 0.05;
  spot.shadow.radius = 10;
  scene.add(spot, spot.target);
  const fill = new THREE.SpotLight(PALETTE.spot, 2.4, 0, 0.85, 1.0, 0);
  scene.add(fill, fill.target);
  const footlights = [-0.34, 0, 0.34].map((fx) => {
    const l = new THREE.PointLight(PALETTE.foot, 22, 0, 2);
    l.userData.fx = fx;
    scene.add(l);
    return l;
  });
  const sideL = new THREE.DirectionalLight(0xffb98a, 0.18);
  const sideR = new THREE.DirectionalLight(0xffb98a, 0.18);
  scene.add(sideL, sideR);

  // the RAYVE crest (horns + wordmark), tinted sand
  let crest = null;
  try {
    const [mark, word] = await Promise.all([loadImg(markSrc), loadImg(wordSrc)]);
    crest = { mark: tint(mark, "#e6dcc2"), word: tint(word, "#e6dcc2") };
  } catch { crest = null; }
  if (disposed) { renderer.dispose(); return () => {}; }

  function velvetColor(side) {
    const Wp = view.w * PANEL.width, Hp = view.h * PANEL.height;
    let CW = 2048, CH = Math.round((CW * Hp) / Wp);
    if (CH > 4096) { CW = Math.round((CW * 4096) / CH); CH = 4096; }
    const c = document.createElement("canvas");
    c.width = CW; c.height = CH;
    const g = c.getContext("2d");
    g.fillStyle = PALETTE.base;
    g.fillRect(0, 0, CW, CH);
    g.save();
    g.scale(CW / 1024, 1);
    for (let x = 0; x < 1024; x += 2) {
      const v = Math.sin(x * 0.013) * 0.5 + Math.sin(x * 0.051 + 1.7) * 0.3 + (Math.random() - 0.5) * 0.4;
      g.fillStyle = v > 0 ? `rgba(${PALETTE.light}, ${0.06 * v})` : `rgba(${PALETTE.dark}, ${-0.08 * v})`;
      g.fillRect(x, 0, 2, CH);
    }
    g.restore();
    if (crest) {
      const pxPerUnit = CW / Wp;
      const originX = side < 0 ? ((view.w * PANEL.half) / Wp) * CW : ((Wp - view.w * PANEL.half) / Wp) * CW;
      g.setTransform(pxPerUnit, 0, 0, pxPerUnit, originX, CH / 2);
      const Lw = Math.min(view.w * 0.34, view.h * 0.62);
      const cy = -view.h * 0.06;
      const mw = Lw * 0.4, mh = mw * (crest.mark.height / crest.mark.width);
      const ww = Lw, wh = ww * (crest.word.height / crest.word.width);
      const gap = Lw * 0.07;
      const top = cy - (mh + gap + wh) / 2;
      g.shadowColor = "rgba(8, 8, 2, 0.55)";
      g.shadowBlur = Lw * 0.012 * pxPerUnit;
      g.shadowOffsetX = Lw * 0.002 * pxPerUnit;
      g.shadowOffsetY = Lw * 0.004 * pxPerUnit;
      g.globalAlpha = 0.94;
      g.drawImage(crest.mark, -mw / 2, top, mw, mh);
      g.drawImage(crest.word, -ww / 2, top + mh + gap, ww, wh);
      const ty = top + mh + gap + wh + Lw * 0.09;
      g.shadowBlur = Lw * 0.006 * pxPerUnit;
      g.fillStyle = "#e6dcc2";
      g.font = `600 ${Lw * 0.036}px ${fontFamily}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      const tag = "OWN THE ENERGY";
      const sp = Lw * 0.02;
      const widths = [...tag].map((ch) => g.measureText(ch).width);
      const total = widths.reduce((a, w) => a + w, 0) + sp * (tag.length - 1);
      let x = -total / 2;
      [...tag].forEach((ch, i) => { g.fillText(ch, x + widths[i] / 2, ty); x += widths[i] + sp; });
      g.fillRect(-total / 2 - Lw * 0.2, ty - Lw * 0.0012, Lw * 0.14, Lw * 0.0024);
      g.fillRect(total / 2 + Lw * 0.06, ty - Lw * 0.0012, Lw * 0.14, Lw * 0.0024);
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  function pileNormal() {
    const S = 256;
    const h = new Float32Array(S * S);
    for (let i = 0; i < h.length; i++) h[i] = Math.random();
    const b = new Float32Array(S * S);
    const at = (x, y) => h[((y + S) % S) * S + ((x + S) % S)];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      b[y * S + x] = (at(x, y) * 4 + at(x + 1, y) + at(x - 1, y) + at(x, y + 1) * 2 + at(x, y - 1) * 2) / 10;
    }
    const bt = (x, y) => b[((y + S) % S) * S + ((x + S) % S)];
    const data = new Uint8Array(S * S * 4);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = (bt(x + 1, y) - bt(x - 1, y)) * 2.0;
      const dy = (bt(x, y + 1) - bt(x, y - 1)) * 2.0;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * S + x) * 4;
      data[i] = (-dx / l * 0.5 + 0.5) * 255;
      data[i + 1] = (-dy / l * 0.5 + 0.5) * 255;
      data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
    const t = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.needsUpdate = true;
    return t;
  }

  const pile = pileNormal();
  const velvet = new THREE.MeshPhysicalMaterial({
    normalMap: pile,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughness: 1.0,
    sheen: 1.0,
    sheenColor: new THREE.Color(...PALETTE.sheen),
    sheenRoughness: 0.42,
    envMapIntensity: 0.08,
    vertexColors: true,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide,
  });

  function makePanel(side) {
    const geo = new THREE.PlaneGeometry(1, 1, COLS, ROWS);
    geo.attributes.position.setUsage(THREE.DynamicDrawUsage);
    const col = new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3);
    col.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("color", col);
    const mesh = new THREE.Mesh(geo, velvet.clone());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.userData.side = side;
    scene.add(mesh);
    return mesh;
  }
  const panels = [makePanel(-1), makePanel(1)];

  function updatePanel(mesh, T) {
    const side = mesh.userData.side;
    const posA = mesh.geometry.attributes.position;
    const colA = mesh.geometry.attributes.color;
    const uv = mesh.geometry.attributes.uv.array;
    const p = posA.array, cl = colA.array;
    const Wp = view.w * PANEL.width, Hp = view.h * PANEL.height, outer = side * view.w * PANEL.half;
    const seed = side * 7.3, spacing = Wp / PLEATS;
    const qEnd = clamp01((T - 0.72) / 0.28);
    const carry = Math.sin(Math.PI * qEnd) * (1 - qEnd);
    for (let i = 0, n = posA.count; i < n; i++) {
      const u = uv[i * 2], v = uv[i * 2 + 1];
      const s = side < 0 ? u : 1 - u;                       // 0 outer edge → 1 meeting edge
      const drop = 1 - v;                                    // 0 at the rail → 1 at the hem
      const k = ease(clamp01((T - drop * 0.16) / 0.84));     // the rail leads, the heavy hem trails
      // open: the outer cloth bunches tightly, the front (crest) part only halves, so it stays readable
      const LOGO_S = 0.62;
      const openPos = s < LOGO_S ? 0.075 * (s / LOGO_S) : 0.075 + ((s - LOGO_S) / (1 - LOGO_S)) * 0.2;
      let x = outer - side * Wp * (s + (openPos - s) * k);
      const front = smooth(LOGO_S - 0.08, LOGO_S + 0.08, s) * k;
      const y = (v - 0.5) * Hp;
      const ph = 2 * Math.PI * (s * PLEATS + 0.5 * vnoise(s * 6 + seed) + 0.35 * vnoise(s * 2.3 + seed * 2)
        + 0.06 * Math.sin(drop * 2.6 + s * 9 + seed));
      const a = 0.55 + 0.8 * vnoise(s * PLEATS * 0.6 + 2 + seed);
      const fullness = 0.62 + 0.62 * Math.pow(drop, 0.8);
      const calm = (1 - k) * (0.7 * smooth(0.55, 0.85, s) + 0.3 * smooth(0.9, 1.0, s));
      const depth = spacing * (0.32 + 0.18 * k) * a * fullness * (1 - calm) * (1 - 0.55 * front);
      const sn = Math.sin(ph);
      const shape = sn - 0.15 * sn * sn;
      let z = shape * depth;
      z += Math.sin(s * 2.2 + seed * 1.3 + drop * 0.8) * spacing * 0.28 * (1 - calm) * (0.5 + drop);
      z += Math.sin(s * 3.3 + seed + drop * 0.6) * spacing * 0.7 * k * (1 - 0.7 * front);
      x += side * Math.cos(s * 3.3 + seed) * spacing * 0.12 * k * (1 - front);
      const moving = k * (1 - k) * 4;
      z += Math.sin(s * 8 - T * 12) * 0.022 * moving * drop;
      const head = Math.pow(1 - drop, 4);
      z += Math.sin(2 * Math.PI * (s * PLEATS * 4 + 0.6 * vnoise(s * 31 + seed))) * spacing * 0.05 * head * (1 - calm);
      x += side * Math.pow(drop, 1.6) * Wp * 0.035 * carry;
      if (side < 0) z += 0.003 + 0.03 * k;
      p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
      const valley = 0.5 + 0.5 * (shape * (0.6 + 0.4 * a));
      const ao = (0.42 + 0.58 * smooth(0.0, 1.0, valley)) * (1 - calm) + calm;
      const rail = 0.55 + 0.45 * smooth(0.0, 0.14, drop);
      const edge = 0.8 + 0.2 * smooth(0.0, 0.35, s);
      const c = ao * rail * edge;
      cl[i * 3] = c; cl[i * 3 + 1] = c; cl[i * 3 + 2] = c;
    }
    posA.needsUpdate = true;
    colA.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  }

  function placeLights() {
    spot.position.set(-view.w * 0.18, view.h * 1.0, 10);
    spot.target.position.set(view.w * 0.04, -view.h * 0.1, 0);
    fill.position.set(view.w * 0.4, view.h * 0.5, 9);
    fill.target.position.set(-view.w * 0.05, -view.h * 0.05, 0);
    spot.shadow.camera.near = 2;
    spot.shadow.camera.far = 40;
    for (const l of footlights) l.position.set(l.userData.fx * view.w, -view.h * 0.62, 3.6);
    sideL.position.set(-view.w * 0.8, view.h * 0.2, 6);
    sideR.position.set(view.w * 0.8, view.h * 0.2, 6);
    pile.repeat.set((view.w * PANEL.width) / 0.35, (view.h * PANEL.height) / 0.35);
  }

  function paintPanels() {
    for (const m of panels) {
      if (m.material.map) m.material.map.dispose();
      m.material.map = velvetColor(m.userData.side);
      m.material.needsUpdate = true;
    }
  }

  // ── timeline (time-based, frame-rate independent) ──
  let T = 0, from = 0, to = 0, t0 = 0, dur = 1, raf = 0, autoTimer = 0;
  const reveal = () => hero.classList.add("is-revealed");

  function render() {
    for (const m of panels) updatePanel(m, T);
    renderer.render(scene, camera);
    if (!hero.classList.contains("gl-ready")) requestAnimationFrame(() => hero.classList.add("gl-ready"));
  }
  function tick(now) {
    const k = dur > 0 ? clamp01((now - t0) / dur) : 1;
    T = from + (to - from) * k;
    if (to > from && T > 0.1) reveal();
    render();
    if (k < 1) raf = requestAnimationFrame(tick);
    else if (to === 1) canvas.style.pointerEvents = "none";
  }
  function animateTo(target, ms) {
    from = T; to = target; dur = ms * Math.abs(to - from); t0 = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }
  function open() {
    if (to === 1) return;
    clearTimeout(autoTimer);
    hero.classList.add("is-playing");
    animateTo(1, OPEN_MS);
  }

  on(canvas, "click", open);
  on(window, "wheel", () => open(), { passive: true });
  on(window, "touchmove", () => open(), { passive: true });
  if (replayBtn) on(replayBtn, "click", () => {
    canvas.style.pointerEvents = "";
    hero.classList.remove("is-playing", "is-revealed");
    animateTo(0, CLOSE_MS);
    clearTimeout(autoTimer);
    autoTimer = setTimeout(open, CLOSE_MS + 400);
  });

  function fit() { resize(); paintPanels(); placeLights(); render(); }
  const ro = new ResizeObserver(() => fit());
  ro.observe(canvas);
  cleanups.push(() => ro.disconnect());

  fit();
  if (freeze !== null) {
    T = freeze;
    if (T > 0.1) { hero.classList.add("is-playing"); reveal(); }
    if (T >= 1) canvas.style.pointerEvents = "none";
    render();
  } else if (reduced) {
    T = 1;
    canvas.style.pointerEvents = "none";
    hero.classList.add("is-playing");
    reveal();
    render();
  } else {
    autoTimer = setTimeout(open, 700); // open soon after the first frame is on screen
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    clearTimeout(autoTimer);
    cleanups.forEach((f) => f());
    for (const m of panels) { m.geometry.dispose(); m.material.map?.dispose(); m.material.dispose(); }
    velvet.dispose();
    pile.dispose();
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}
