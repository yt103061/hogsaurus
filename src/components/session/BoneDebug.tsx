"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

export function BoneDebug() {
  const { scene } = useGLTF("/models/ybot.glb");

  useEffect(() => {
    const bones: string[] = [];
    scene.traverse((obj) => {
      if (obj.type === "Bone") bones.push(obj.name);
    });
    console.log("Bones:", bones);
  }, [scene]);

  return null;
}
