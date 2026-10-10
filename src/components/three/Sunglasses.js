"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// A stylised acetate frame built from code (stand-in until the client's real .glb models arrive).
// Units are roughly centimetres; the frame is centred on the origin, facing +Z.
const RIM = 0.32; // acetate thickness around the lens
const GAP = 0.55; // half the distance between the two lenses (bridge)
const DEPTH = 0.42;
const WRAP = 0.035; // how much the front curves back around the face
const STEPS = 96; // points per lens outline

// Lens proportions per frame shape. `n` is the superellipse exponent: 2 = ellipse, higher = squarer corners.
const LENS = {
  Oval: { a: 2.55, b: 1.25, n: 2 },
  Round: { a: 2.05, b: 1.95, n: 2 },
  Square: { a: 2.35, b: 2.0, n: 4.5 },
  Rectangle: { a: 2.6, b: 1.55, n: 5 },
  Shield: { a: 2.95, b: 1.75, n: 3.2 },
  "Cat-eye": { a: 2.5, b: 1.45, n: 2.6, lift: 0.75 },
  Aviator: { a: 2.6, b: 1.55, bottom: 2.15, n: 2.2 },
};
const lensFor = (shape) => LENS[shape] ?? LENS.Oval;

/** Width and hinge position for a frame shape, so callers can size it to a real face. */
export function frameMetrics(shape) {
  const { a } = lensFor(shape);
  const centerX = GAP + a + RIM * 0.4;
  const hingeX = centerX + a + RIM * 0.6;
  return { centerX, hingeX, width: hingeX * 2 + 0.3 };
}

// Point on the right lens outline (outer side = +x) at angle t, grown outward by `grow`.
function lensPoint(L, t, grow) {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const e = 2 / L.n;
  const b = (s < 0 && L.bottom ? L.bottom : L.b) + grow;
  const x = (L.a + grow) * Math.sign(c) * Math.abs(c) ** e;
  let y = b * Math.sign(s) * Math.abs(s) ** e;
  // Cat-eye: sweep the outer top corner upward
  if (L.lift && x > 0) y += L.lift * (x / (L.a + grow)) ** 2 * (s > 0 ? 1 : 0.35);
  return [x, y];
}

// Outline of one lens centred at cx. side = 1 for the right lens, -1 for the left (mirrored).
function outline(L, cx, side, grow, from = 0, to = Math.PI * 2) {
  const pts = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = from + ((to - from) * i) / STEPS;
    // The left lens mirrors the right one, so sample the mirrored angle
    const [x, y] = lensPoint(L, side === 1 ? t : Math.PI - t, grow);
    pts.push(new THREE.Vector2(cx + x * side, y));
  }
  return pts;
}

function useFrontGeometry(shape) {
  return useMemo(() => {
    const L = lensFor(shape);
    const { centerX } = frameMetrics(shape);
    const deg = Math.PI / 180;
    // Outer outline as one loop: left rim → nose bridge → right rim → brow bridge
    const left = outline(L, -centerX, -1, RIM, 25 * deg, 355 * deg);
    const right = outline(L, centerX, 1, RIM, 185 * deg, 515 * deg);
    const top = Math.max(...left.map((p) => p.y));
    const front = new THREE.Shape();
    front.moveTo(left[0].x, left[0].y);
    left.forEach((p) => front.lineTo(p.x, p.y));
    front.quadraticCurveTo(0, top * 0.12, right[0].x, right[0].y); // nose bridge arches upward
    right.forEach((p) => front.lineTo(p.x, p.y));
    front.quadraticCurveTo(0, top * 0.62, left[0].x, left[0].y); // brow bridge
    front.holes.push(new THREE.Path(outline(L, -centerX, -1, 0).reverse()));
    front.holes.push(new THREE.Path(outline(L, centerX, 1, 0).reverse()));

    const geo = new THREE.ExtrudeGeometry(front, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.1,
      bevelSegments: 6,
      curveSegments: 24,
    });
    geo.translate(0, 0, -DEPTH / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, pos.getZ(i) - x * x * WRAP);
    }
    geo.computeVertexNormals();
    return geo;
  }, [shape]);
}

function useLensGeometries(shape) {
  return useMemo(() => {
    const L = lensFor(shape);
    return [-1, 1].map((side) => new THREE.ShapeGeometry(new THREE.Shape(outline(L, 0, side, 0.05)), 1));
  }, [shape]);
}

function useTempleGeometry() {
  return useMemo(() => {
    // Side profile of an arm: thick at the hinge, tapering, with the ear bend at the end
    const s = new THREE.Shape();
    s.moveTo(0, 0.38);
    s.lineTo(9.2, 0.16);
    s.quadraticCurveTo(10.6, 0.1, 11.4, -1.2);
    s.lineTo(11.15, -1.32);
    s.quadraticCurveTo(10.4, -0.2, 9.2, -0.12);
    s.lineTo(0, -0.38);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 24 });
    geo.translate(0, 0, -0.11);
    geo.rotateY(Math.PI / 2); // arms run backwards along -Z
    return geo;
  }, []);
}

/**
 * @param shape      frame shape name (see LENS); defaults to Oval
 * @param foldRef    ref whose .current is 0 (open) … 1 (temples folded)
 * @param lensColor  THREE.Color that may change every frame (lens tint)
 * @param frameColor hex colour of the acetate / metal
 * @param metal      render the frame as polished metal instead of acetate
 * @param lensGlow   emissive strength that keeps the tint readable on dark backgrounds
 */
export default function Sunglasses({ shape = "Oval", foldRef, lensColor, frameColor = "#0d0d0b", metal = false, lensGlow = 0.35, lensOpacity = 0.78 }) {
  const front = useFrontGeometry(shape);
  const lenses = useLensGeometries(shape);
  const temple = useTempleGeometry();
  const temples = useRef([]);
  const { centerX, hingeX } = frameMetrics(shape);

  const frameMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: frameColor,
        roughness: metal ? 0.22 : 0.18,
        metalness: metal ? 1 : 0,
        clearcoat: metal ? 0 : 1,
        clearcoatRoughness: 0.08,
      }),
    [frameColor, metal],
  );
  const lensMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#2b2b26",
        roughness: 0.04,
        metalness: 0.1,
        transparent: true,
        opacity: lensOpacity,
        emissive: "#000000",
        emissiveIntensity: lensGlow,
        clearcoat: 1,
        side: THREE.DoubleSide,
      }),
    [lensGlow, lensOpacity],
  );
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9a85b", metalness: 1, roughness: 0.25 }), []);

  useFrame(() => {
    if (lensColor) {
      lensMat.color.copy(lensColor);
      lensMat.emissive.copy(lensColor);
    }
    const fold = (foldRef?.current ?? 0) * 1.45;
    temples.current.forEach((t, i) => {
      if (t) t.rotation.y = (i === 0 ? -1 : 1) * fold; // fold inward, behind the lenses
    });
  });

  const lensZ = 0.02 - centerX * centerX * WRAP;

  return (
    <group>
      <mesh geometry={front} material={frameMat} />
      <mesh geometry={lenses[0]} material={lensMat} position={[-centerX, 0, lensZ]} />
      <mesh geometry={lenses[1]} material={lensMat} position={[centerX, 0, lensZ]} />

      {/* Temples pivot at the hinges (index 0 = left) */}
      {[-1, 1].map((side, i) => (
        <group key={side} ref={(el) => (temples.current[i] = el)} position={[side * hingeX, 0.25, -0.3 - hingeX * hingeX * WRAP]}>
          <mesh geometry={temple} material={frameMat} />
          {/* gold horns mark on the outside of each arm */}
          <mesh position={[side * 0.17, 0.02, -1.6]} material={goldMat}>
            <boxGeometry args={[0.03, 0.16, 0.55]} />
          </mesh>
          <mesh position={[0, 0, 0.22]} material={goldMat}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
