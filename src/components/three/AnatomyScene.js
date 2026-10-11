"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import Sunglasses, { frameMetrics } from "./Sunglasses";

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const LENS_PULL = 1.8; // how far the lenses come forward when exploded

/** Anchor points on the frame (in frame space) for the labels, for an explode amount e. */
const anchors = ({ centerX, hingeX }) => {
  const wrapZ = (x) => -x * x * 0.035;
  return [
    (e) => [centerX + 1.2, -0.9, wrapZ(centerX) + e * LENS_PULL], // lens
    () => [0, 1.55, 0.2], // front (brow bridge)
    (e) => [-(hingeX + e * 2.2), 0.3, -7 - e * 1.4], // temple, near the ear end
    (e) => [hingeX + e * 2.2, 0.3, -0.3 + wrapZ(hingeX) - e * 1.4], // hinge
  ];
};

function Rig({ progress, frame, labelEls }) {
  const group = useRef(null);
  const explode = useRef(0);
  const { viewport, camera, size } = useThree();
  const points = useRef([]);
  const v = useMemo(() => new THREE.Vector3(), []);
  const lensColor = useMemo(() => new THREE.Color(frame.lens), [frame.lens]);
  const metrics = frameMetrics(frame.shape);
  const at = anchors(metrics);

  useFrame((state, delta) => {
    const p = progress.current;
    const want = smooth(0.12, 0.6, p);
    explode.current += (want - explode.current) * Math.min(1, delta * 6);
    const g = group.current;
    // Turns from a three-quarter view to a more open angle while the parts separate
    g.rotation.y = -0.75 + p * 0.85;
    g.rotation.x = 0.16 - p * 0.06;
    g.position.y = (viewport.aspect < 1 ? 0.6 : 0) + Math.sin(state.clock.elapsedTime * 0.7) * 0.08;
    g.scale.setScalar(Math.min(0.58, viewport.width / (viewport.aspect < 1 ? 23 : 21))); // room for the arms sliding out

    // Move each HTML label to its anchor's position on screen
    const shown = String(smooth(0.55, 0.9, explode.current));
    at.forEach((fn, i) => {
      const p3 = points.current[i];
      const el = labelEls.current?.[i];
      if (!p3 || !el) return;
      p3.position.set(...fn(explode.current));
      p3.getWorldPosition(v).project(camera);
      el.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
      el.style.opacity = shown;
    });
  });

  return (
    <group ref={group}>
      <Sunglasses shape={frame.shape} frameColor={frame.hex} metal={frame.metal} lensColor={lensColor} explodeRef={explode} lensGlow={0.3}>
        {at.map((_, i) => (
          <group key={i} ref={(el) => (points.current[i] = el)} />
        ))}
      </Sunglasses>
    </group>
  );
}

export default function AnatomyScene({ progress, frame, labelEls, active = true }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 2]} camera={{ position: [0, 0.8, 17], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 8, 6]} intensity={1.4} />
      <Rig progress={progress} frame={frame} labelEls={labelEls} />
      <ContactShadows position={[0, -2.8, 0]} opacity={0.4} scale={24} blur={2.8} far={6} color="#000000" />
      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 5, -6]} scale={[12, 2, 1]} />
        <Lightformer intensity={1.4} position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={1.4} position={[7, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" color="#c9a85b" intensity={1.2} position={[0, 3, 8]} scale={3} />
      </Environment>
    </Canvas>
  );
}
