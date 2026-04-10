"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPendingCheckin, completeCheckin, clearPendingCheckin, getUserData } from "@/lib/storage";
import { getDinosaur } from "@/lib/dinosaurs";

const FEEDBACK_OPTIONS = [
  { value: "great" as const, emoji: "😌", label: "かなり楽になった", xp: 150 },
  { value: "good" as const, emoji: "🙂", label: "少し楽になった", xp: 100 },
  { value: "neutral" as const, emoji: "😐", label: "変わらない", xp: 80 },
];

const NEXT_DAY_MESSAGES: Record<string, string> = {
  "首・後頭部が重い": "明日は首の深層筋からアプローチします",
  "肩・肩甲骨が固い": "明日は肩甲骨の可動域を広げるケアをします",
  "腰・お尻が重だるい": "明日は股関節まわりの循環改善に取り組みます",
  "目・頭が疲れている": "明日は眼精疲労と首のつながりをほぐします",
  "全体的にだるい": "明日は全身の血流を促すストレッチをします",
  "今日は割と元気": "明日もこの調子で維持しましょう",
};

export default function FeedbackPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"great" | "good" | "neutral" | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [themeColor, setThemeColor] = useState("#D4A843");
  const [symptoms, setSymptoms] = useState<string[]>([]);

  useEffect(() => {
    const pending = getPendingCheckin();
    if (!pending) {
      router.replace("/checkin");
      return;
    }
    setSymptoms(pending.symptoms);

    const data = getUserData();
    if (data) {
      const dino = getDinosaur(data.dinosaurCode);
      if (dino) setThemeColor(dino.themeColor);
    }
  }, [router]);

  function handleSelect(feedback: "great" | "good" | "neutral", xp: number) {
    if (selected) return;
    const pending = getPendingCheckin();
    if (!pending) return;

    completeCheckin(feedback, pending.symptoms, pending.intensity);
    clearPendingCheckin();

    const updated = getUserData();
    setStreakDays(updated?.streakDays ?? 1);
    setTotalXP(updated?.totalXP ?? xp);
    setEarnedXP(xp);
    setSelected(feedback);
  }

  const nextDayMessage =
    symptoms.length > 0
      ? NEXT_DAY_MESSAGES[symptoms[0]] ?? "明日もケアを続けましょう"
      : "明日もケアを続けましょう";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {!selected ? (
          <>
            <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: "#F5EDD8" }}>
              今どう？
            </h1>
            <p className="text-sm opacity-50 text-center mb-8">
              セッション後の体の感覚を教えてください
            </p>

            <div className="flex flex-col gap-4">
              {FEEDBACK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value, opt.xp)}
                  className="w-full py-5 px-6 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border"
                  style={{
                    borderColor: "rgba(212,168,67,0.2)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{opt.emoji}</span>
                      <span className="text-base font-medium" style={{ color: "#F5EDD8" }}>
                        {opt.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                    >
                      +{opt.xp} XP
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            {/* XP獲得 */}
            <div
              className="text-5xl font-bold mb-2"
              style={{ color: themeColor }}
            >
              +{earnedXP} XP!
            </div>
            <p className="text-sm opacity-50 mb-8">合計 {totalXP} XP</p>

            {/* ストリーク */}
            <div
              className="rounded-2xl p-6 mb-6"
              style={{
                backgroundColor: `${themeColor}15`,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: `${themeColor}30`,
              }}
            >
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-3xl font-bold mb-1" style={{ color: themeColor }}>
                {streakDays}日連続！
              </div>
              <p className="text-sm opacity-60">継続は力なり</p>
            </div>

            {/* 明日の予告 */}
            <div
              className="rounded-2xl p-5 mb-8"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-xs opacity-40 mb-2">明日のケア予告</p>
              <p className="text-sm" style={{ color: "#F5EDD8" }}>
                {nextDayMessage}
              </p>
            </div>

            <Link
              href="/"
              className="inline-block px-10 py-4 rounded-full text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: themeColor, color: "#100C05" }}
            >
              ホームへ
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
