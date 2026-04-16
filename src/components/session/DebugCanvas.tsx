"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { BoneDebug } from "./BoneDebug";

/**
 * 1×1px の非表示 Canvas で BoneDebug を動かし、
 * コンソールにボーン名を出力する一時デバッグ用コンポーネント。
 */
export function DebugCanvas() {
  return (
    <div
      style={{
        position: "fixed",
        top: -1,
        left: -1,
        width: 1,
        height: 1,
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      <Canvas>
        <Suspense fallback={null}>
          <BoneDebug />
        </Suspense>
      </Canvas>
    </div>
  );
}
