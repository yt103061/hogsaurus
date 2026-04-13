"use client";

import Link from "next/link";
import { darkenColor } from "@/lib/theme";

interface ActionCardProps {
  isCheckedIn: boolean;
  streakDays: number;
  typeColor: string;
  dinosaurName: string;
  hour: number;
}

function getGreeting(hour: number, isCheckedIn: boolean) {
  if (!isCheckedIn && hour >= 21) return { emoji: "🔥", text: "今日まだ！やっちゃいましょう" };
  if (hour >= 5 && hour < 10) return { emoji: "☀️", text: "おはようございます" };
  if (hour < 17) return { emoji: "💪", text: "お疲れ様です" };
  return { emoji: "🌙", text: "今日もお疲れ様でした" };
}

export function ActionCard({ isCheckedIn, streakDays, typeColor, dinosaurName, hour }: ActionCardProps) {
  const greeting = getGreeting(hour, isCheckedIn);

  if (isCheckedIn) {
    return (
      <div className="duo-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{greeting.emoji}</span>
          <span className="text-sm font-semibold text-[#777]">{greeting.text}</span>
        </div>
        <p className="text-lg font-extrabold text-[#1C1C1C] mb-1">今日のケア完了！ ✅</p>
        <p className="text-sm font-semibold text-[#777]">
          {dinosaurName}と一緒に {streakDays} 日連続達成中 🔥
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: `linear-gradient(135deg, ${typeColor}15, ${typeColor}06)`,
        border: `2px solid ${typeColor}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{greeting.emoji}</span>
        <span className="text-sm font-bold text-[#777]">{greeting.text}</span>
      </div>
      <p className="text-xl font-extrabold text-[#1C1C1C] mb-1">今日のケアをはじめる</p>
      <p className="text-sm font-bold mb-5" style={{ color: typeColor }}>
        5分で首・肩・腰をリセット
      </p>
      <Link
        href="/checkin"
        className="btn-duo"
        style={
          {
            "--type-color": typeColor,
            "--type-color-dark": darkenColor(typeColor),
          } as React.CSSProperties
        }
      >
        スタート →
      </Link>
    </div>
  );
}
