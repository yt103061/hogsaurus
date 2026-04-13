"use client";

import { useEffect, useState } from "react";

interface XPCardProps {
  totalXP: number;
  typeColor: string;
}

const XP_PER_LEVEL = 300;

export function XPCard({ totalXP, typeColor }: XPCardProps) {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXP % XP_PER_LEVEL;
  const targetPct = (xpInLevel / XP_PER_LEVEL) * 100;
  const [barPct, setBarPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setBarPct(targetPct), 150);
    return () => clearTimeout(timer);
  }, [targetPct]);

  return (
    <div className="duo-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1.5 rounded-xl font-extrabold text-white text-base"
            style={{ backgroundColor: typeColor }}
          >
            Lv.{level}
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#AAA]">総XP</p>
            <p className="text-lg font-extrabold text-[#1C1C1C]">{totalXP.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-[#AAA]">次のレベルまで</p>
          <p className="text-base font-extrabold" style={{ color: typeColor }}>
            {XP_PER_LEVEL - xpInLevel} XP
          </p>
        </div>
      </div>
      <div className="w-full h-4 rounded-full bg-[#E5E5E5] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${barPct}%`, backgroundColor: typeColor }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-bold text-[#AAA]">{xpInLevel} XP</span>
        <span className="text-[10px] font-bold text-[#AAA]">{XP_PER_LEVEL} XP</span>
      </div>
    </div>
  );
}
