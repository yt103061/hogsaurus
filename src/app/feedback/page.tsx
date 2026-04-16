"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPendingCheckin, completeCheckin, clearPendingCheckin, getUserData } from "@/lib/storage";
import { getDinosaur } from "@/lib/dinosaurs";
import { applyTheme } from "@/lib/theme";

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
  typeColor: string;
  dinosaurName: string;
  nextFocus: string;
}

export default function FeedbackPage() {
  const [completion, setCompletion] = useState<CompletionData | null>(null);
  const [typeColor, setTypeColor] = useState("#FF9600");

  useEffect(() => {
    const data = getUserData();
    if (data) {
      const dino = getDinosaur(data.dinosaurCode);
      if (dino) { setTypeColor(dino.themeColor); applyTheme(dino.themeColor); }
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
    setCompletion({
      earnedXP: xp,
      streakDays: updated?.streakDays ?? 1,
      typeColor: dino?.themeColor ?? typeColor,
      dinosaurName: dino?.name ?? "あなたの恐竜",
      nextFocus: NEXT_FOCUS[pending.symptoms[0] ?? ""] ?? "全体的なリフレッシュ",
    });
  }

  if (completion) {
    return (
      <main className="min-h-screen flex items-center justify-center overflow-hidden bg-white">
        <CompletionScreen {...completion} />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[#F7F7F7]">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-black text-center text-[#1C1C1C] mb-2">今どう？</h1>
        <p className="text-sm font-semibold text-[#777] text-center mb-8">
          セッション後の体の感覚を教えてください
        </p>
        <div className="flex flex-col gap-3">
          {FEEDBACK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value, opt.xp)}
              className="w-full py-5 px-5 rounded-2xl text-left border-2 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "white", borderColor: "#E5E5E5", boxShadow: "0 2px 0 #E5E5E5" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-base font-extrabold text-[#1C1C1C]">{opt.label}</span>
                </div>
                <span
                  className="text-xs font-extrabold px-3 py-1.5 rounded-xl text-white"
                  style={{ backgroundColor: typeColor }}
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

function CompletionScreen({ earnedXP, streakDays, typeColor, dinosaurName, nextFocus }: CompletionData) {
  const [phase, setPhase] = useState(0);
  const [xpDisplay, setXpDisplay] = useState(0);
  const nextMilestone = MILESTONES.find((m) => m > streakDays) ?? 100;

  useEffect(() => {
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({
        particleCount: 140, spread: 90, origin: { y: 0.35 },
        colors: [typeColor, "#FF9600", "#2DB841", "#1CB0F6", "#8549BA", "#ffffff"],
      });
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 120, origin: { x: 0.1, y: 0.5 }, colors: [typeColor, "#FF9600"] });
        confetti({ particleCount: 60, spread: 120, origin: { x: 0.9, y: 0.5 }, colors: [typeColor, "#FF9600"] });
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
  }, [typeColor]);

  useEffect(() => {
    if (phase < 2) return;
    const start = Date.now();
    const id = setInterval(() => {
      const progress = Math.min((Date.now() - start) / 1000, 1);
      setXpDisplay(Math.round(earnedXP * progress));
      if (progress >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [phase, earnedXP]);

  const vis = (n: number) => ({
    opacity: phase >= n ? 1 : 0,
    transform: phase >= n ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  });

  return (
    <div className="text-center px-6 py-8 max-w-sm mx-auto w-full">
      <div className="mb-5" style={vis(1)}>
        <p className="font-black leading-tight" style={{ fontSize: "2.5rem", color: typeColor }}>
          🔥 {streakDays}日連続達成！
        </p>
      </div>

      <div className="mb-6" style={vis(2)}>
        <p className="text-xs font-extrabold text-[#AAA] mb-1">{dinosaurName} が獲得</p>
        <span className="text-5xl font-black tabular-nums" style={{ color: typeColor }}>
          +{xpDisplay}
        </span>
        <span className="text-2xl font-bold text-[#AAA] ml-1"> XP</span>
      </div>

      <div className="mb-6" style={vis(3)}>
        <div
          className="w-28 h-28 rounded-3xl mx-auto flex items-center justify-center mb-2"
          style={{ background: `${typeColor}18`, border: `3px solid ${typeColor}40` }}
        >
          <span className="text-6xl animate-float inline-block">🦕</span>
        </div>
        <p className="text-[10px] font-extrabold text-[#AAA] mb-0.5">あなたのパートナー</p>
        <p className="text-sm font-extrabold" style={{ color: typeColor }}>{dinosaurName}</p>
      </div>

      <div className="duo-card mb-4 text-left" style={vis(4)}>
        <p className="text-xs font-extrabold text-[#AAA] mb-1">明日のケア予告</p>
        <p className="text-sm font-semibold text-[#1C1C1C]">
          明日は<span className="font-extrabold" style={{ color: typeColor }}>{nextFocus}</span>からアプローチします
        </p>
      </div>

      <div className="mb-8" style={vis(5)}>
        <p className="text-xs font-extrabold" style={{ color: typeColor }}>
          🔓 あと{nextMilestone - streakDays}日で{dinosaurName}が進化（{nextMilestone}日達成）
        </p>
      </div>

      <div style={vis(5)}>
        <Link href="/" className="btn-duo">ホームに戻る</Link>
      </div>
    </div>
  );
}
