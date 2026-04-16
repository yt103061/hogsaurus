"use client";

import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ────────────── 座りベースポーズ ──────────────
const SIT_POSE: Record<string, { x?: number; y?: number; z?: number }> = {
  mixamorig_LeftUpLeg:  { x: -1.3 },
  mixamorig_RightUpLeg: { x: -1.3 },
  mixamorig_LeftLeg:    { x: 1.1 },
  mixamorig_RightLeg:   { x: 1.1 },
  mixamorig_LeftFoot:   { x: 0.3 },
  mixamorig_RightFoot:  { x: 0.3 },
};

// ────────────── ポーズ定義 ──────────────
const EXERCISE_POSES: Record<string, {
  bones: Record<string, { x?: number; y?: number; z?: number }>;
  duration: number;
}> = {
  "neck-side": {
    bones: { mixamorig_Neck: { z: 0.35 }, mixamorig_Head: { z: 0.15 } },
    duration: 2,
  },
  "neck-rotation": {
    bones: { mixamorig_Neck: { y: 0.5 } },
    duration: 2.5,
  },
  "shoulder-open": {
    bones: {
      mixamorig_LeftArm: { z: -0.6, x: -0.2 },
      mixamorig_RightArm: { z: 0.6, x: -0.2 },
      mixamorig_Spine2: { x: -0.15 },
    },
    duration: 2.5,
  },
  "spine-twist": {
    bones: {
      mixamorig_Spine: { y: 0.3 },
      mixamorig_Spine1: { y: 0.3 },
      mixamorig_Spine2: { y: 0.2 },
    },
    duration: 2.5,
  },
  "forward-bend": {
    bones: {
      mixamorig_Spine: { x: 0.3 },
      mixamorig_Spine1: { x: 0.3 },
      mixamorig_Spine2: { x: 0.2 },
      mixamorig_Neck: { x: 0.1 },
    },
    duration: 2.5,
  },
  "overhead": {
    bones: {
      mixamorig_LeftArm: { z: -1.4 },
      mixamorig_RightArm: { z: 1.4 },
      mixamorig_Spine2: { x: -0.1 },
    },
    duration: 2.5,
  },
  "idle": { bones: {}, duration: 2.5 },
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
  const { scene } = useGLTF("/models/character.glb");
  const bonesRef = useRef<Record<string, THREE.Bone>>({});
  const originalRotations = useRef<Record<string, THREE.Euler>>({});
  const timeRef = useRef(0);

  // リングフィット風 3段階トゥーングラデーション
  const gradientMap = useMemo(() => {
    const tex = new THREE.DataTexture(
      new Uint8Array([64, 128, 255]),
      3, 1,
      THREE.RedFormat
    );
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    // ボーン収集＋デバッグログ
    const boneNames: string[] = [];
    scene.traverse((obj) => {
      if (obj.type === "Bone") {
        const bone = obj as THREE.Bone;
        bonesRef.current[bone.name] = bone;
        originalRotations.current[bone.name] = bone.rotation.clone();
        boneNames.push(bone.name);
      }
    });
    console.log("[ExerciseModel] bone names:", boneNames);

    // 座りベースポーズを適用
    Object.entries(SIT_POSE).forEach(([boneName, target]) => {
      const bone = bonesRef.current[boneName];
      if (!bone) return;
      const orig = originalRotations.current[boneName];
      if (target.x !== undefined) bone.rotation.x = (orig?.x ?? 0) + target.x;
      if (target.y !== undefined) bone.rotation.y = (orig?.y ?? 0) + target.y;
      if (target.z !== undefined) bone.rotation.z = (orig?.z ?? 0) + target.z;
    });

    // マテリアル + アウトラインメッシュを追加
    const outlineMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#1C1C1C"),
      side: THREE.BackSide,
    });

    scene.traverse((obj) => {
      if (!(obj instanceof THREE.SkinnedMesh)) return;

      // トゥーンマテリアル
      obj.material = new THREE.MeshToonMaterial({
        color: new THREE.Color(typeColor),
        gradientMap,
      });
      obj.castShadow = true;

      // BackSide SkinnedMesh でアウトライン（スケルトン共有）
      if (!obj.getObjectByName("__outline__")) {
        const outline = new THREE.SkinnedMesh(obj.geometry, outlineMat);
        outline.name = "__outline__";
        outline.skeleton = obj.skeleton;
        outline.bindMatrix = obj.bindMatrix.clone();
        outline.bindMatrixInverse = obj.bindMatrixInverse.clone();
        outline.scale.setScalar(1.04);
        obj.add(outline);
      }
    });
  }, [scene, typeColor, gradientMap]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const pose = EXERCISE_POSES[poseKey] ?? EXERCISE_POSES["idle"];
    const t = Math.sin(timeRef.current * (Math.PI / pose.duration));

    Object.entries(pose.bones).forEach(([boneName, target]) => {
      const bone = bonesRef.current[boneName];
      const orig = originalRotations.current[boneName];
      if (!bone || !orig) return;
      const sitOffset = SIT_POSE[boneName] ?? {};
      bone.rotation.x = orig.x + (sitOffset.x ?? 0) + (target.x ?? 0) * t;
      bone.rotation.y = orig.y + (sitOffset.y ?? 0) + (target.y ?? 0) * t;
      bone.rotation.z = orig.z + (sitOffset.z ?? 0) + (target.z ?? 0) * t;
    });
  });

  return <primitive object={scene} scale={0.013} position={[0, -0.8, 0]} />;
}

// ────────────── 公開コンポーネント ──────────────
interface ExerciseModelProps {
  exerciseName: string;
  typeColor: string;
}

export function ExerciseModel({ exerciseName, typeColor }: ExerciseModelProps) {
  const poseKey = getPoseKey(exerciseName);
  return (
    <div style={{ width: 220, height: 260, margin: "0 auto" }}>
      <Canvas
        camera={{ position: [1.2, 1.5, 2.8], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[0, 3, 4]} intensity={2.5} />
        <directionalLight position={[0, -2, 2]} intensity={0.3} />
        {/* useGLTF はサスペンドするため Suspense が必須 */}
        <Suspense fallback={null}>
          <PosedModel poseKey={poseKey} typeColor={typeColor} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/character.glb");
