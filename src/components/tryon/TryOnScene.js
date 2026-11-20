"use client";

import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import Sunglasses, { frameMetrics } from "@/components/three/Sunglasses";
import { photoView } from "./faceShape";

const EYE_SPAN_CM = 9.2; // outer eye corner to outer eye corner on an average adult
const FRAME_WIDTH_CM = 14.5; // typical sunglasses front
// A photo frame is sized to the face: its front a touch wider than the face at the temples, as sunglasses sit
const CUTOUT_FIT = 1.04;
const CUTOUT_BASE_CM = 14; // modelled at this width, then scaled to the face
const WRAP_RADIUS_CM = 15; // how much the front curves round the face
const TEMPLE_CM = 10.5;

// Landmark indices: outer and inner eye corners, top of forehead, chin, the sides of the face at eye level
const FACE_R = 234;
const FACE_L = 454;
const EYE_OUT_R = 33;
const EYE_OUT_L = 263;
const EYE_IN_R = 133;
const EYE_IN_L = 362;
const TOP = 10;
const CHIN = 152;

// Bends a flat plate round the face, like a real frame front
function wrapped(width, height) {
  const geo = new THREE.PlaneGeometry(width, height, 40, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, -(x * x) / (2 * WRAP_RADIUS_CM));
  }
  pos.needsUpdate = true;
  return geo;
}

// The real frame: its front photo, cut out, bent slightly round the face, with a soft shadow on the skin and 3D
// temples running back to the ears (hidden where they pass behind the head). Scaled each frame to the face's width.
function CutoutFrame({ cutout, fit, look }) {
  const group = useRef(null);
  const front = useRef(null);
  const shadow = useRef(null);
  const map = useTexture(cutout.src, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
  const h = CUTOUT_BASE_CM / cutout.aspect;
  const plate = useMemo(() => wrapped(CUTOUT_BASE_CM, h), [h]);
  const end = CUTOUT_BASE_CM / 2 - 0.35;
  const endZ = -(end * end) / (2 * WRAP_RADIUS_CM);

  useFrame(() => {
    const g = group.current;
    if (!g || !fit.current) return;
    const s = THREE.MathUtils.clamp((fit.current * CUTOUT_FIT) / CUTOUT_BASE_CM, 0.8, 1.35);
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x || s, s, 0.3));
    // Match the face's light: a dim room dims the frame (the photo was taken in a bright studio)
    const { light, yaw } = look.current;
    const k = light == null ? 1 : THREE.MathUtils.clamp(light / 0.55, 0.45, 1.05);
    front.current?.color.lerp(new THREE.Color().setScalar(k), 0.2);
    // A flat photo can't show a frame from the side, so it fades as the head turns into profile
    const o = THREE.MathUtils.clamp(1 - (yaw - 0.6) / 0.3, 0.2, 1);
    if (front.current) front.current.opacity = THREE.MathUtils.lerp(front.current.opacity, o, 0.2);
    if (shadow.current) shadow.current.opacity = 0.22 * front.current.opacity;
  });

  return (
    <group ref={group}>
      {/* Shadow on the skin, just behind and below the frame */}
      <mesh geometry={plate} position={[0, -0.35, -0.25]} renderOrder={0}>
        <meshBasicMaterial ref={shadow} map={map} color="#000" transparent opacity={0.22} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={plate} renderOrder={2}>
        <meshBasicMaterial ref={front} map={map} transparent alphaTest={0.02} toneMapped={false} depthWrite={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * end, h * 0.18, endZ - TEMPLE_CM / 2]} rotation={[-0.08, side * 0.04, 0]} renderOrder={1}>
          <boxGeometry args={[0.28, 0.42, TEMPLE_CM]} />
          <meshStandardMaterial color={cutout.temple} roughness={0.55} metalness={0.05} transparent={cutout.templeOpacity < 1} opacity={cutout.templeOpacity} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Places the glasses on the tracked face. Works in canvas pixels (orthographic camera, 1 unit = 1px);
 * the face group is scaled so its children can be modelled in centimetres.
 */
function FaceRig({ face, frame }) {
  const group = useRef(null);
  const faceWidth = useRef(0); // cm, side to side at eye level
  const look = useRef({ light: null, yaw: 0 }); // the face's brightness and how far it is turned, for the photo frame
  const { size } = useThree();
  const lensColor = useMemo(() => new THREE.Color(frame.lens), [frame.lens]);
  const v = useMemo(
    () => ({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      c: new THREE.Vector3(),
      d: new THREE.Vector3(),
      top: new THREE.Vector3(),
      fr: new THREE.Vector3(),
      fl: new THREE.Vector3(),
      chin: new THREE.Vector3(),
      x: new THREE.Vector3(),
      y: new THREE.Vector3(),
      z: new THREE.Vector3(),
      center: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      pm: new THREE.Matrix4(),
      pq: new THREE.Quaternion(),
      ps: new THREE.Vector3(),
      pp: new THREE.Vector3(),
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
    P(FACE_R, v.fr);
    P(FACE_L, v.fl);

    // Head orientation from the eye line and the forehead–chin line
    v.x.subVectors(v.b, v.a).normalize();
    v.y.subVectors(v.top, v.chin);
    v.y.addScaledVector(v.x, -v.y.dot(v.x)).normalize();
    v.z.crossVectors(v.x, v.y);
    v.m.makeBasis(v.x, v.y, v.z);
    v.q.setFromRotationMatrix(v.m);
    // The tracker's head pose, when it gives one, reads turns more fully than the landmarks' depth
    if (f.pose) v.pm.fromArray(f.pose).decompose(v.pp, v.q, v.ps);

    v.center.copy(v.a).add(v.b).add(v.c).add(v.d).multiplyScalar(0.25);
    const pxPerCm = v.a.distanceTo(v.b) / EYE_SPAN_CM;
    faceWidth.current = v.fr.distanceTo(v.fl) / pxPerCm;
    look.current.light = f.light;
    look.current.yaw = Math.abs(v.x.set(0, 0, 1).applyQuaternion(v.q).x); // sideways part of the face's forward direction

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
      {frame.cutout ? (
        // The lenses sit slightly below the middle of the photo's height, on the eye line
        <group position={[0, -0.3, 1.1]}>
          <Suspense fallback={null}>
            <CutoutFrame cutout={frame.cutout} fit={faceWidth} look={look} />
          </Suspense>
        </group>
      ) : (
        <group position={[0, -0.2, 1.3]} scale={FRAME_WIDTH_CM / width}>
          <Sunglasses shape={frame.shape} lensColor={lensColor} frameColor={frame.hex} metal={frame.metal} lensGlow={0.06} lensOpacity={0.82} />
        </group>
      )}
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
