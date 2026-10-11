"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import Sunglasses, { frameMetrics } from "./Sunglasses";

// Soft pool of light that each spotlight throws on the wall behind a frame
function usePoolTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 44, 2, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,226,160,0.9)");
    grad.addColorStop(0.35, "rgba(214,182,112,0.35)");
    grad.addColorStop(1, "rgba(214,182,112,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Rows of frames on brass shelves, sized to fit the viewport below the heading. */
function useLayout(count) {
  const { viewport } = useThree();
  return useMemo(() => {
    const cols = viewport.aspect < 0.62 ? 3 : viewport.aspect < 1.3 ? 4 : 5;
    const rows = Math.ceil(count / cols);
    const top = viewport.aspect < 0.8 ? 0.24 : 0.22; // room for the site header and the heading
    const cellW = Math.min((viewport.width * 0.9) / cols, (viewport.height * (0.9 - top)) / rows / 0.78);
    const cellH = cellW * 0.78;
    const rowY = (r) => ((rows - 1) / 2 - r) * cellH - viewport.height * (top / 2) - cellH * 0.18;
    const slots = Array.from({ length: count }, (_, i) => {
      const r = Math.floor(i / cols);
      const inRow = r === rows - 1 ? count - r * cols : cols;
      return { x: ((i % cols) - (inRow - 1) / 2) * cellW, y: rowY(r) };
    });
    const shelves = Array.from({ length: rows }, (_, r) => ({ y: rowY(r), width: cellW * cols }));
    return { slots, shelves, cellW };
  }, [count, viewport.width, viewport.height, viewport.aspect]);
}

function Frame({ product, slot, cellW, index, hovered, anyHovered, onHover, onPick, pool, anchorRef, placardsRef }) {
  const glasses = useRef(null);
  const light = useRef(null);
  const appear = useRef(0);
  const zoom = useRef(1);
  const lensColor = useMemo(() => new THREE.Color(product.lens), [product.lens]);
  const v = useMemo(() => new THREE.Vector3(), []);
  const { camera, size } = useThree();
  const metrics = frameMetrics(product.shape);
  const scale = (cellW * 0.7) / metrics.width;
  const restY = metrics.halfBelow * scale + cellW * 0.012; // resting on the shelf, whatever the lens height

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const k = Math.min(1, delta * 6);
    // Quiet entrance: each frame fades up onto its shelf in turn
    if (t > 0.3 + index * 0.08) appear.current = Math.min(1, appear.current + delta * 1.6);
    const a = 1 - (1 - appear.current) ** 3;
    zoom.current = THREE.MathUtils.lerp(zoom.current, hovered ? 1.14 : 1, k);
    const g = glasses.current;
    g.scale.setScalar(scale * a * zoom.current);
    g.position.y = THREE.MathUtils.lerp(g.position.y, restY + (hovered ? cellW * 0.08 : 0) - (1 - a) * cellW * 0.06, k);
    g.position.z = THREE.MathUtils.lerp(g.position.z, hovered ? cellW * 0.35 : 0, k);
    // Still on the shelf; a slow turn only when picked out
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, hovered ? Math.sin(t * 1.2) * 0.55 : -0.18, Math.min(1, delta * 3));
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, hovered ? 0.05 : 0.22, k);

    const m = light.current.material;
    m.opacity = THREE.MathUtils.lerp(m.opacity, (hovered ? 0.95 : anyHovered ? 0.18 : 0.42) * a, k);

    // HTML placard under the frame, and the quick-view card beside the hovered one
    const placard = placardsRef.current[index];
    if (placard) {
      v.set(slot.x, slot.y - cellW * 0.02, 0).project(camera);
      placard.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
      placard.style.opacity = String(a * (hovered ? 1 : anyHovered ? 0.35 : 0.75));
    }
    if (hovered && anchorRef.current) {
      g.getWorldPosition(v).project(camera);
      const x = ((v.x + 1) / 2) * size.width;
      anchorRef.current.style.transform = `translate(${x}px, ${((1 - v.y) / 2) * size.height}px)`;
      anchorRef.current.dataset.side = x > size.width * 0.6 ? "left" : "right";
    }
  });

  return (
    <group
      position={[slot.x, slot.y, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(index);
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onPick(index, e.nativeEvent.pointerType);
      }}
    >
      {/* light pool on the wall */}
      <mesh ref={light} position={[0, cellW * 0.22, -cellW * 0.3]}>
        <planeGeometry args={[cellW * 1.1, cellW * 1.1]} />
        <meshBasicMaterial map={pool} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* invisible hit area so the whole bay responds to the pointer */}
      <mesh position={[0, cellW * 0.2, 0]} visible={false}>
        <planeGeometry args={[cellW * 0.95, cellW * 0.6]} />
      </mesh>
      <group ref={glasses} scale={0}>
        <Sunglasses shape={product.shape} frameColor={product.hex} metal={product.metal} lensColor={lensColor} lensGlow={0.08} />
      </group>
    </group>
  );
}

function Wall({ products, hovered, onHover, onPick, anchorRef, placardsRef }) {
  const { slots, shelves, cellW } = useLayout(products.length);
  const pool = usePoolTexture();

  useFrame((state, delta) => {
    // Slow parallax: the camera drifts a little with the pointer
    const { camera } = state;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, state.pointer.x * 0.5, Math.min(1, delta * 1.5));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, state.pointer.y * 0.25, Math.min(1, delta * 1.5));
    camera.lookAt(0, 0, -2);
  });

  return (
    <>
      {/* the wall */}
      <mesh position={[0, 0, -cellW * 0.32]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1c1c16" roughness={0.95} />
      </mesh>
      {/* thin brass shelves */}
      {shelves.map((r, i) => (
        <group key={i} position={[0, r.y, 0]}>
          <mesh position={[0, 0, -cellW * 0.08]}>
            <boxGeometry args={[r.width * 0.96, cellW * 0.018, cellW * 0.42]} />
            <meshStandardMaterial color="#b8975a" metalness={0.85} roughness={0.32} />
          </mesh>
          {/* shadow line where the shelf meets the wall */}
          <mesh position={[0, -cellW * 0.03, -cellW * 0.31]}>
            <planeGeometry args={[r.width * 0.96, cellW * 0.05]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {products.map((p, i) => (
        <Frame
          key={p.id}
          product={p}
          slot={slots[i]}
          cellW={cellW}
          index={i}
          hovered={hovered === i}
          anyHovered={hovered !== null}
          onHover={onHover}
          onPick={onPick}
          pool={pool}
          anchorRef={anchorRef}
          placardsRef={placardsRef}
        />
      ))}
    </>
  );
}

export default function ArenaScene({ products, hovered, onHover, onPick, anchorRef, placardsRef, active = true }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 14], fov: 32 }}
      gl={{ antialias: true }}
      onPointerMissed={() => onHover(null, true)}
    >
      <color attach="background" args={["#1c1c16"]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[0, 10, 6]} intensity={1.6} color="#fff1d6" />
      <Wall products={products} hovered={hovered} onHover={onHover} onPick={onPick} anchorRef={anchorRef} placardsRef={placardsRef} />
      <Environment resolution={128}>
        <Lightformer intensity={2.4} position={[0, 6, 4]} scale={[14, 1.5, 1]} color="#fff1d6" />
        <Lightformer intensity={0.8} position={[-8, 1, 3]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={0.8} position={[8, 1, 3]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
