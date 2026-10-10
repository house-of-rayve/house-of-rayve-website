"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import Sunglasses, { frameMetrics } from "@/components/three/Sunglasses";
import { photoView } from "./faceShape";

const EYE_SPAN_CM = 9.2; // outer eye corner to outer eye corner on an average adult
const FRAME_WIDTH_CM = 14.5; // typical sunglasses front

// Landmark indices: outer and inner eye corners, top of forehead, chin
const EYE_OUT_R = 33;
const EYE_OUT_L = 263;
const EYE_IN_R = 133;
const EYE_IN_L = 362;
const TOP = 10;
const CHIN = 152;

/**
 * Places the glasses on the tracked face. Works in canvas pixels (orthographic camera, 1 unit = 1px);
 * the face group is scaled so its children can be modelled in centimetres.
 */
function FaceRig({ face, frame }) {
  const group = useRef(null);
  const { size } = useThree();
  const lensColor = useMemo(() => new THREE.Color(frame.lens), [frame.lens]);
  const v = useMemo(
    () => ({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      c: new THREE.Vector3(),
      d: new THREE.Vector3(),
      top: new THREE.Vector3(),
      chin: new THREE.Vector3(),
      x: new THREE.Vector3(),
      y: new THREE.Vector3(),
      z: new THREE.Vector3(),
      center: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
    }),
    [],
  );

  useFrame(() => {
    const g = group.current;
    const f = face.current;
    if (!g) return;
    if (!f) {
      g.visible = false;
      return;
    }
    // Same layout as the media underneath: the camera fills the stage (cover); photos are framed on the face
    let s, ox, oy;
    if (f.photo) ({ s, ox, oy } = photoView(size.width, size.height, f.w, f.h, f.focus));
    else {
      s = Math.max(size.width / f.w, size.height / f.h);
      ox = (size.width - f.w * s) / 2;
      oy = (size.height - f.h * s) / 2;
    }
    const L = f.landmarks;
    const P = (i, out) => out.set(L[i].x * f.w * s + ox - size.width / 2, size.height / 2 - (L[i].y * f.h * s + oy), -L[i].z * f.w * s);

    P(EYE_OUT_R, v.a);
    P(EYE_OUT_L, v.b);
    P(EYE_IN_R, v.c);
    P(EYE_IN_L, v.d);
    P(TOP, v.top);
    P(CHIN, v.chin);

    // Head orientation from the eye line and the forehead–chin line
    v.x.subVectors(v.b, v.a).normalize();
    v.y.subVectors(v.top, v.chin);
    v.y.addScaledVector(v.x, -v.y.dot(v.x)).normalize();
    v.z.crossVectors(v.x, v.y);
    v.m.makeBasis(v.x, v.y, v.z);
    v.q.setFromRotationMatrix(v.m);

    v.center.copy(v.a).add(v.b).add(v.c).add(v.d).multiplyScalar(0.25);
    const pxPerCm = v.a.distanceTo(v.b) / EYE_SPAN_CM;

    // Ease towards the new pose to hide tracking jitter; snap when the face first appears
    const k = g.visible ? 0.55 : 1;
    g.position.lerp(v.center, k);
    g.quaternion.slerp(v.q, k);
    g.scale.setScalar(THREE.MathUtils.lerp(g.visible ? g.scale.x : pxPerCm, pxPerCm, k));
    g.visible = true;
  });

  const { width } = frameMetrics(frame.shape);
  return (
    <group ref={group} visible={false}>
      {/* Invisible head: writes depth only, so the arms disappear where they pass behind the head */}
      <mesh position={[0, 1.5, -9.8]} scale={[7.3, 10, 9.2]} renderOrder={-1}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial colorWrite={false} />
      </mesh>
      <group position={[0, -0.2, 1.3]} scale={FRAME_WIDTH_CM / width}>
        <Sunglasses shape={frame.shape} lensColor={lensColor} frameColor={frame.hex} metal={frame.metal} lensGlow={0.06} lensOpacity={0.82} />
      </group>
    </group>
  );
}

export default function TryOnScene({ face, frame, onCanvas }) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1500], zoom: 1, near: 1, far: 4000 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => onCanvas?.(gl.domElement)}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[200, 400, 800]} intensity={1.6} />
      <FaceRig face={face} frame={frame} />
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 5, 6]} scale={[12, 2, 1]} />
        <Lightformer intensity={1.2} position={[-7, 1, 3]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={1.2} position={[7, 1, 3]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
