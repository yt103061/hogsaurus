"use client";

import Link from "next/link";

interface ActionCardProps {
  isCheckedIn: boolean;
  streakDays: number;
  themeColor: string;
  dinosaurName: string;
  hour: number;
}

function getGreeting(hour: number, isCheckedIn: boolean): { emoji: string; text: string } {
  if (!isCheckedIn && hour >= 21) return { emoji: "🔥", text: "今日まだ！やっちゃいましょう" };
  if (hour >= 5 && hour < 10) return { emoji: "☀️", text: "おはようございます" };
  if (hour < 17) return { emoji: "💪", text: "お疲れ様です" };
  return { emoji: "🌙", text: "今日もお疲れ様でした" };
}

export function ActionCard({ isCheckedIn, streakDays, themeColor, dinosaurName, hour }: ActionCardProps) {
  const greeting = getGreeting(hour, isCheckedIn);

  if (isCheckedIn) {
    return (
      <div
        className="w-full rounded-3xl p-6"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{greeting.emoji}</span>
          <p className="text-sm opacity-50">{greeting.text}</p>
        </div>
        <p className="text-lg font-bold mb-1" style={{ color: "#F5EDD8" }}>
          今日のケア完了！
        </p>
        <p className="text-sm opacity-40">
          {dinosaurName}と一緒に {streakDays} 日連続達成中 🔥
        </p>
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs opacity-30">明日もまた一緒にやろう</p>
        </div>
      </div>
    );
  }

  return (
    <Link href="/checkin" className="block w-full">
      <div
        className="w-full rounded-3xl p-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${themeColor}25 0%, ${themeColor}10 100%)`,
          border: `1px solid ${themeColor}40`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{greeting.emoji}</span>
          <p className="text-sm opacity-60">{greeting.text}</p>
        </div>
        <p className="text-xl font-bold mb-1" style={{ color: "#F5EDD8" }}>
          今日のケアをはじめる
        </p>
        <p className="text-sm mb-4" style={{ color: themeColor, opacity: 0.8 }}>
          5分で首・肩・腰をリセット
        </p>
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
          style={{ backgroundColor: themeColor, color: "#100C05" }}
        >
          スタート →
        </div>
      </div>
    </Link>
  );
}
