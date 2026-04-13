"use client";

const MILESTONES = [7, 14, 21, 30];

interface StreakBarProps {
  streakDays: number;
  themeColor: string;
}

export function StreakBar({ streakDays, themeColor }: StreakBarProps) {
  const maxDisplay = 30;
  const progress = Math.min((streakDays / maxDisplay) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs opacity-40">ストリーク</p>
        <p className="text-xs font-bold" style={{ color: themeColor }}>
          🔥 {streakDays}日
        </p>
      </div>
      <div className="relative w-full h-2 rounded-full" style={{ backgroundColor: "rgba(212,168,67,0.12)" }}>
        {/* 進捗バー */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, backgroundColor: themeColor }}
        />
        {/* マイルストーンドット */}
        {MILESTONES.map((m) => {
          const pos = (m / maxDisplay) * 100;
          const reached = streakDays >= m;
          return (
            <div
              key={m}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 transition-all duration-500"
              style={{
                left: `${pos}%`,
                backgroundColor: reached ? themeColor : "#100C05",
                borderColor: reached ? themeColor : "rgba(212,168,67,0.3)",
              }}
            />
          );
        })}
      </div>
      {/* マイルストーンラベル */}
      <div className="relative w-full mt-1.5">
        {MILESTONES.map((m) => {
          const pos = (m / maxDisplay) * 100;
          const reached = streakDays >= m;
          return (
            <span
              key={m}
              className="absolute text-[10px] -translate-x-1/2"
              style={{
                left: `${pos}%`,
                color: reached ? themeColor : "rgba(245,237,216,0.2)",
              }}
            >
              {m}日
            </span>
          );
        })}
      </div>
    </div>
  );
}
