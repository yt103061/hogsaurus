"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ────────────── ポーズ定義 ──────────────
const EXERCISE_POSES: Record<string, {
  bones: Record<string, { x?: number; y?: number; z?: number }>;
  duration: number;
}> = {
  "neck-side": {
    bones: { mixamorig_Neck: { z: 0.35 }, mixamorig_Head: { z: 0.15 } },
    duration: 3,
  },
  "neck-rotation": {
    bones: { mixamorig_Neck: { y: 0.5 } },
    duration: 4,
  },
  "shoulder-open": {
    bones: {
      mixamorig_LeftArm: { z: -0.6, x: -0.2 },
      mixamorig_RightArm: { z: 0.6, x: -0.2 },
      mixamorig_Spine2: { x: -0.15 },
    },
    duration: 4,
  },
  "spine-twist": {
    bones: {
      mixamorig_Spine: { y: 0.3 },
      mixamorig_Spine1: { y: 0.3 },
      mixamorig_Spine2: { y: 0.2 },
    },
    duration: 4,
  },
  "forward-bend": {
    bones: {
      mixamorig_Spine: { x: 0.3 },
      mixamorig_Spine1: { x: 0.3 },
      mixamorig_Spine2: { x: 0.2 },
      mixamorig_Neck: { x: 0.1 },
    },
    duration: 4,
  },
  "overhead": {
    bones: {
      mixamorig_LeftArm: { z: -1.4 },
      mixamorig_RightArm: { z: 1.4 },
      mixamorig_Spine2: { x: -0.1 },
    },
    duration: 4,
  },
  "idle": { bones: {}, duration: 3 },
};

// ────────────── 種目名 → ポーズ ──────────────
function getPoseKey(exerciseName: string): string {
  if (/首.*横|横.*倒|傾け|サイド/.test(exerciseName)) return "neck-side";
  if (/首.*回|頸椎|首.*伸/.test(exerciseName)) return "neck-rotation";
  if (/肩甲骨|胸.*開|肩.*開|肩.*後/.test(exerciseName)) return "shoulder-open";
  if (/腰.*ひね|ツイスト|体.*回/.test(exerciseName)) return "spine-twist";
  if (/前屈|前.*傾|体.*倒/.test(exerciseName)) return "forward-bend";
  if (/万歳|腕.*上|上.*伸|バンザイ/.test(exerciseName)) return "overhead";
  if (/首/.test(exerciseName)) return "neck-side";
  if (/肩/.test(exerciseName)) return "shoulder-open";
  if (/腰/.test(exerciseName)) return "spine-twist";
  return "idle";
}

// ────────────── Canvas 内部コンポーネント ──────────────
interface PosedModelProps {
  poseKey: string;
  typeColor: string;
}

function PosedModel({ poseKey, typeColor }: PosedModelProps) {
  const { scene } = useGLTF("/models/ybot.glb");
  const bonesRef = useRef<Record<string, THREE.Bone>>({});
  const originalRotations = useRef<Record<string, THREE.Euler>>({});
  const timeRef = useRef(0);

  useEffect(() => {
    // ボーン収集
    scene.traverse((obj) => {
      if (obj.type === "Bone") {
        const bone = obj as THREE.Bone;
        bonesRef.current[bone.name] = bone;
        originalRotations.current[bone.name] = bone.rotation.clone();
      }
    });
    // マテリアルをtypeColorで上書き
    scene.traverse((obj) => {
      if (obj instanceof THREE.SkinnedMesh) {
        obj.material = new THREE.MeshToonMaterial({
          color: new THREE.Color(typeColor),
        });
      }
    });
  }, [scene, typeColor]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const pose = EXERCISE_POSES[poseKey] ?? EXERCISE_POSES["idle"];
    // sin 波で 0 → 1 → 0 ループ
    const t = Math.sin(timeRef.current * (Math.PI / pose.duration));

    Object.entries(pose.bones).forEach(([boneName, target]) => {
      const bone = bonesRef.current[boneName];
      const orig = originalRotations.current[boneName];
      if (!bone || !orig) return;
      bone.rotation.x = orig.x + (target.x ?? 0) * t;
      bone.rotation.y = orig.y + (target.y ?? 0) * t;
      bone.rotation.z = orig.z + (target.z ?? 0) * t;
    });
  });

  return <primitive object={scene} scale={0.015} position={[0, -1.2, 0]} />;
}

// ────────────── 公開コンポーネント ──────────────
interface ExerciseModelProps {
  exerciseName: string;
  typeColor: string;
}

export function ExerciseModel({ exerciseName, typeColor }: ExerciseModelProps) {
  const poseKey = getPoseKey(exerciseName);
  return (
    <div style={{ width: 180, height: 220, margin: "0 auto" }}>
      <Canvas
        camera={{ position: [0, 1, 3], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 4, 2]} intensity={1} />
        <PosedModel poseKey={poseKey} typeColor={typeColor} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/ybot.glb");
