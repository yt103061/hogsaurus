"use client";

const MILESTONES = [7, 14, 21, 30];

interface StreakBarProps {
  streakDays: number;
  typeColor: string;
}

export function StreakBar({ streakDays, typeColor }: StreakBarProps) {
  const maxDisplay = 30;
  const progress = Math.min((streakDays / maxDisplay) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-[#777]">ストリーク</p>
        <div
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-extrabold text-sm"
          style={{ background: "#FFF0D4", color: "#FF9600" }}
        >
          🔥 {streakDays}日
        </div>
      </div>
      <div className="relative w-full h-4 rounded-full bg-[#E5E5E5]">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, backgroundColor: typeColor }}
        />
        {MILESTONES.map((m) => {
          const pos = (m / maxDisplay) * 100;
          const reached = streakDays >= m;
          return (
            <div
              key={m}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white transition-all duration-500"
              style={{
                left: `${pos}%`,
                backgroundColor: reached ? typeColor : "#CCCCCC",
              }}
            />
          );
        })}
      </div>
      <div className="relative w-full mt-2">
        {MILESTONES.map((m) => {
          const pos = (m / maxDisplay) * 100;
          const reached = streakDays >= m;
          return (
            <span
              key={m}
              className="absolute text-[10px] font-extrabold -translate-x-1/2"
              style={{ left: `${pos}%`, color: reached ? typeColor : "#BBBBBB" }}
            >
              {m}日
            </span>
          );
        })}
      </div>
    </div>
  );
}
