"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPendingCheckin, getUserData } from "@/lib/storage";
import { getDinosaur } from "@/lib/dinosaurs";
import { CareProgram, Exercise } from "@/types";
import { CircularTimer } from "@/components/session/CircularTimer";
import { BodySilhouette, getHighlightedPart } from "@/components/session/BodySilhouette";

function getCoachingMessage(timeLeft: number, duration: number): string {
  const ratio = timeLeft / duration;
  if (ratio > 0.6) return "💡 ポイントを意識して";
  if (ratio > 0.3) return "😊 いい感じ！";
  if (timeLeft > 3) return "💪 もう少し！";
  return "🎉 ナイス！";
}

export default function SessionPage() {
  const router = useRouter();
  const [program, setProgram] = useState<CareProgram | null>(null);
  const [themeColor, setThemeColor] = useState("#D4A843");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const pending = getPendingCheckin();
    if (!pending) { router.replace("/checkin"); return; }
    setProgram(pending.program);
    const first = pending.program.exercises[0];
    setTimeLeft(first?.duration ?? 30);
    setCurrentDuration(first?.duration ?? 30);
    const data = getUserData();
    if (data) {
      const dino = getDinosaur(data.dinosaurCode);
      if (dino) setThemeColor(dino.themeColor);
    }
  }, [router]);

  useEffect(() => {
    if (!program || isFinished) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCurrentIndex((ci) => {
            const next = ci + 1;
            if (next >= program.exercises.length) {
              setIsFinished(true);
              return ci;
            }
            const nextEx = program.exercises[next];
            setCurrentDuration(nextEx.duration);
            setTimeLeft(nextEx.duration);
            setShowComplete(true);
            setTimeout(() => setShowComplete(false), 800);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [program, isFinished, currentIndex]);

  function handleSkip() {
    if (!program) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const next = currentIndex + 1;
    if (next >= program.exercises.length) {
      setIsFinished(true);
    } else {
      const nextEx = program.exercises[next];
      setCurrentIndex(next);
      setCurrentDuration(nextEx.duration);
      setTimeLeft(nextEx.duration);
    }
  }

  if (!program) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">🦕</div>
      </main>
    );
  }

  const exercises: Exercise[] = program.exercises;

  if (isFinished) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: themeColor }}>完了！</h1>
          <p className="text-base opacity-60 mb-4">{program.afterMessage}</p>
          <button
            onClick={() => router.push("/feedback")}
            className="px-10 py-4 rounded-full text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95 mt-4"
            style={{ backgroundColor: themeColor, color: "#100C05" }}
          >
            フィードバックへ →
          </button>
        </div>
      </main>
    );
  }

  const current = exercises[currentIndex];
  const highlight = getHighlightedPart(current.name);
  const coaching = getCoachingMessage(timeLeft, currentDuration);

  const totalDuration = exercises.reduce((sum, e) => sum + e.duration, 0);
  const elapsed =
    exercises.slice(0, currentIndex).reduce((sum, e) => sum + e.duration, 0) +
    currentDuration - timeLeft;
  const overallProgress = Math.min((elapsed / totalDuration) * 100, 100);

  return (
    <main className="min-h-screen flex flex-col px-4 py-8">
      {/* ヘッダー：プログレスバー + 種目カウント */}
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="flex justify-between text-xs opacity-40 mb-2">
          <span>{program.title}</span>
          <span>{currentIndex + 1} / {exercises.length}</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(212,168,67,0.15)" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${overallProgress}%`, backgroundColor: themeColor }}
          />
        </div>
        {/* 種目ドット */}
        <div className="flex gap-1.5 mt-2 justify-center">
          {exercises.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? "24px" : "8px",
                backgroundColor:
                  i < currentIndex ? themeColor
                  : i === currentIndex ? `${themeColor}90`
                  : "rgba(212,168,67,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto gap-6">
        {/* スキップボタン */}
        <div className="w-full flex justify-end">
          <button onClick={handleSkip} className="text-xs opacity-30 hover:opacity-60 transition-opacity px-3 py-1">
            スキップ
          </button>
        </div>

        {/* ボディシルエット + タイマー横並び */}
        <div className="flex items-center justify-center gap-8 w-full">
          <BodySilhouette highlight={highlight} themeColor={themeColor} />
          <CircularTimer timeLeft={timeLeft} duration={currentDuration} themeColor={themeColor} />
        </div>

        {/* 種目名 */}
        <div className="text-center">
          <h2
            className="text-2xl font-bold mb-2 transition-all duration-300"
            style={{ color: "#F5EDD8", opacity: showComplete ? 0 : 1 }}
          >
            {current.name}
          </h2>
          <p className="text-sm opacity-70 leading-relaxed max-w-xs">{current.instruction}</p>
        </div>

        {/* コーチングバブル */}
        <div
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-500"
          style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
        >
          {coaching}
        </div>

        {/* ポイント */}
        <div
          className="w-full rounded-2xl p-4 text-center"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs opacity-40 mb-1">意識するポイント</p>
          <p className="text-sm" style={{ color: "#F5EDD8" }}>💡 {current.tip}</p>
        </div>

        {/* 完了オーバーレイ */}
        {showComplete && (
          <div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 50 }}
          >
            <div
              className="text-5xl font-bold animate-pop-in"
              style={{ color: themeColor }}
            >
              完了 ✓
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
