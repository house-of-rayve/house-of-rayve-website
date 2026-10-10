"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import Sunglasses from "./Sunglasses";

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Rig({ progress, tint, drag }) {
  const group = useRef(null);
  const { viewport } = useThree();
  const lensColor = useMemo(() => new THREE.Color("#2b2b26"), []);
  const target = useMemo(() => new THREE.Color(), []);
  const fold = useRef(0);
  const spin = useRef(0);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current;
    // Extra spin from dragging (the section eases drag.current back to 0 on release)
    spin.current += (drag.current - spin.current) * Math.min(1, delta * 6);

    // One full turn across the scroll, starting from a slight three-quarter view
    g.rotation.y = -0.45 + p * Math.PI * 2 + spin.current;
    g.rotation.x = 0.12 + Math.sin(p * Math.PI) * 0.18;
    // On portrait screens lift the frame above the copy at the bottom
    g.position.y = (viewport.aspect < 1 ? 0.9 : 0) + Math.sin(state.clock.elapsedTime * 0.8) * 0.12;
    g.scale.setScalar(Math.min(0.62, viewport.width / (viewport.aspect < 1 ? 15.5 : 19))); // breathing room on desktop; fill the width on phones

    // Temples fold away mid-scroll and open again at the end
    const want = smooth(0.3, 0.45, p) * (1 - smooth(0.68, 0.85, p));
    fold.current += (want - fold.current) * Math.min(1, delta * 5);

    target.set(tint.current);
    lensColor.lerp(target, Math.min(1, delta * 3));
  });

  return (
    <group ref={group}>
      <Sunglasses foldRef={fold} lensColor={lensColor} />
    </group>
  );
}

export default function ToroScene({ progress, tint, drag, active = true }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 2]} camera={{ position: [0, 0.6, 17], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 6]} intensity={1.4} />
      <Rig progress={progress} tint={tint} drag={drag} />
      <ContactShadows position={[0, -2.6, 0]} opacity={0.45} scale={22} blur={2.8} far={6} color="#000000" />
      {/* Studio reflections built locally (no external HDR download) */}
      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 5, -6]} scale={[12, 2, 1]} />
        <Lightformer intensity={1.4} position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={1.4} position={[7, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" color="#c9a85b" intensity={1.2} position={[0, 3, 8]} scale={3} />
      </Environment>
    </Canvas>
  );
}
