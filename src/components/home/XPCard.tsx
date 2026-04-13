"use client";

import { useEffect, useState } from "react";

interface XPCardProps {
  totalXP: number;
  themeColor: string;
}

const XP_PER_LEVEL = 300;

export function XPCard({ totalXP, themeColor }: XPCardProps) {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXP % XP_PER_LEVEL;
  const targetPct = (xpInLevel / XP_PER_LEVEL) * 100;
  const [barPct, setBarPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setBarPct(targetPct), 100);
    return () => clearTimeout(timer);
  }, [targetPct]);

  return (
    <div
      className="w-full rounded-3xl p-5"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-xs opacity-40">レベル</p>
          <p className="text-2xl font-bold" style={{ color: themeColor }}>Lv.{level}</p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-40">総XP</p>
          <p className="text-lg font-bold" style={{ color: "#F5EDD8" }}>{totalXP.toLocaleString()}</p>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${themeColor}15` }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${barPct}%`, backgroundColor: themeColor }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <p className="text-[10px] opacity-30">{xpInLevel} XP</p>
        <p className="text-[10px] opacity-30">Lv.{level + 1} まで {XP_PER_LEVEL - xpInLevel} XP</p>
      </div>
    </div>
  );
}
