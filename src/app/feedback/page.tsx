"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPendingCheckin, completeCheckin, clearPendingCheckin, getUserData } from "@/lib/storage";
import { getDinosaur } from "@/lib/dinosaurs";

const FEEDBACK_OPTIONS = [
  { value: "great" as const, emoji: "😌", label: "かなり楽になった", xp: 150 },
  { value: "good" as const, emoji: "🙂", label: "少し楽になった", xp: 100 },
  { value: "neutral" as const, emoji: "😐", label: "変わらない", xp: 80 },
];

const NEXT_FOCUS: Record<string, string> = {
  "首・後頭部が重い": "首の深層筋",
  "肩・肩甲骨が固い": "肩甲骨の可動域",
  "腰・お尻が重だるい": "股関節まわり",
  "目・頭が疲れている": "眼精疲労と首のつながり",
  "全体的にだるい": "全身の血流促進",
  "今日は割と元気": "コンディション維持",
};

const MILESTONES = [7, 14, 21, 30, 60, 90];

interface CompletionData {
  earnedXP: number;
  streakDays: number;
  themeColor: string;
  dinosaurName: string;
  nextFocus: string;
}

export default function FeedbackPage() {
  const [completion, setCompletion] = useState<CompletionData | null>(null);
  const [themeColor, setThemeColor] = useState("#D4A843");

  useEffect(() => {
    const data = getUserData();
    if (data) {
      const dino = getDinosaur(data.dinosaurCode);
      if (dino) setThemeColor(dino.themeColor);
    }
    if (!getPendingCheckin()) {
      // pendingがなければホームへ（直接アクセス対策）
    }
  }, []);

  function handleSelect(feedback: "great" | "good" | "neutral", xp: number) {
    if (completion) return;
    const pending = getPendingCheckin();
    if (!pending) return;

    completeCheckin(feedback, pending.symptoms, pending.intensity);
    clearPendingCheckin();

    const updated = getUserData();
    const dino = getDinosaur(updated?.dinosaurCode ?? "");
    const nextFocusKey = pending.symptoms[0] ?? "";

    setCompletion({
      earnedXP: xp,
      streakDays: updated?.streakDays ?? 1,
      themeColor: dino?.themeColor ?? "#D4A843",
      dinosaurName: dino?.name ?? "あなたの恐竜",
      nextFocus: NEXT_FOCUS[nextFocusKey] ?? "全体的なリフレッシュ",
    });
  }

  if (completion) {
    return (
      <main className="min-h-screen flex items-center justify-center overflow-hidden">
        <CompletionScreen {...completion} />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
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
              style={{ borderColor: "rgba(212,168,67,0.2)", backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-base font-medium" style={{ color: "#F5EDD8" }}>{opt.label}</span>
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
      </div>
    </main>
  );
}

function CompletionScreen({ earnedXP, streakDays, themeColor, dinosaurName, nextFocus }: CompletionData) {
  const [phase, setPhase] = useState(0);
  const [xpDisplay, setXpDisplay] = useState(0);

  const nextMilestone = MILESTONES.find((m) => m > streakDays) ?? 100;

  // 紙吹雪 + 順次フェードイン
  useEffect(() => {
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.35 },
        colors: [themeColor, "#D4A843", "#F5EDD8", "#ffffff", themeColor + "99"],
      });
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 120, origin: { x: 0.1, y: 0.5 }, colors: [themeColor, "#D4A843"] });
        confetti({ particleCount: 60, spread: 120, origin: { x: 0.9, y: 0.5 }, colors: [themeColor, "#D4A843"] });
      }, 400);
    });

    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 1800),
      setTimeout(() => setPhase(5), 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [themeColor]);

  // XPカウントアップ
  useEffect(() => {
    if (phase < 2) return;
    const start = Date.now();
    const duration = 1000;
    const id = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setXpDisplay(Math.round(earnedXP * progress));
      if (progress >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [phase, earnedXP]);

  const visible = (n: number) => ({
    opacity: phase >= n ? 1 : 0,
    transition: "opacity 0.6s ease, transform 0.6s ease",
  });

  return (
    <div className="text-center px-6 py-8 max-w-sm mx-auto w-full">
      {/* ② ストリーク */}
      <div className="mb-5" style={{ ...visible(1), transform: phase >= 1 ? "scale(1)" : "scale(0.6)" }}>
        <p className="font-bold leading-tight" style={{ fontSize: "2.5rem", color: themeColor }}>
          🔥 {streakDays}日連続達成！
        </p>
      </div>

      {/* ③ XPカウントアップ */}
      <div className="mb-6" style={{ ...visible(2), transform: phase >= 2 ? "translateY(0)" : "translateY(16px)" }}>
        <span className="text-5xl font-bold tabular-nums" style={{ color: themeColor }}>
          +{xpDisplay}
        </span>
        <span className="text-2xl font-bold opacity-60 ml-1" style={{ color: themeColor }}> XP</span>
      </div>

      {/* ④ 恐竜（大きく・float） */}
      <div className="mb-6" style={{ ...visible(3), transform: phase >= 3 ? "scale(1)" : "scale(0.2)" }}>
        <div className={phase >= 3 ? "animate-float" : ""}>
          <span style={{ fontSize: "9rem", lineHeight: 1, display: "block" }}>🦕</span>
        </div>
        <p className="text-sm mt-2 font-medium" style={{ color: themeColor, opacity: 0.7 }}>{dinosaurName}</p>
      </div>

      {/* ⑤ 明日の予告 */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ ...visible(4), backgroundColor: "rgba(255,255,255,0.05)" }}
      >
        <p className="text-xs opacity-40 mb-1">明日のケア予告</p>
        <p className="text-sm" style={{ color: "#F5EDD8" }}>
          明日は<span style={{ color: themeColor }}>{nextFocus}</span>からアプローチします
        </p>
      </div>

      {/* ⑥ 次のマイルストーン */}
      <div className="mb-8" style={visible(5)}>
        <p className="text-xs" style={{ color: themeColor, opacity: 0.65 }}>
          🔓 あと{nextMilestone - streakDays}日で{dinosaurName}が進化（{nextMilestone}日達成）
        </p>
      </div>

      {/* ボタン */}
      <div style={visible(5)}>
        <Link
          href="/"
          className="inline-block px-10 py-4 rounded-full text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ backgroundColor: themeColor, color: "#100C05" }}
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
