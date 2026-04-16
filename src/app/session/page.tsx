"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getPendingCheckin, getUserData } from "@/lib/storage";
import { getDinosaur } from "@/lib/dinosaurs";
import { applyTheme } from "@/lib/theme";
import { CareProgram, Exercise } from "@/types";
import { CircularTimer } from "@/components/session/CircularTimer";

// Three.js は SSR 不可のため dynamic import
const ExerciseModel = dynamic(
  () => import("@/components/session/ExerciseModel").then((m) => m.ExerciseModel),
  { ssr: false, loading: () => <div style={{ width: 220, height: 260, margin: "0 auto" }} /> }
);

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
  const [typeColor, setTypeColor] = useState("#FF9600");
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
      if (dino) { setTypeColor(dino.themeColor); applyTheme(dino.themeColor); }
    }
  }, [router]);

  useEffect(() => {
    if (!program || isFinished) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCurrentIndex((ci) => {
            const next = ci + 1;
            if (next >= program.exercises.length) { setIsFinished(true); return ci; }
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
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl animate-pulse">🦕</div>
      </main>
    );
  }

  const exercises: Exercise[] = program.exercises;

  if (isFinished) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#F7F7F7]">
        <div className="text-center">
          <div className="text-6xl mb-5 animate-nice-pop inline-block">🎉</div>
          <h1 className="text-3xl font-black mb-3" style={{ color: typeColor }}>完了！</h1>
          <p className="text-base font-semibold text-[#777] mb-8">{program.afterMessage}</p>
          <div className="max-w-xs mx-auto">
            <button onClick={() => router.push("/feedback")} className="btn-duo">
              フィードバックへ →
            </button>
          </div>
        </div>
      </main>
    );
  }

  const current = exercises[currentIndex];
  const coaching = getCoachingMessage(timeLeft, currentDuration);
  const totalDuration = exercises.reduce((sum, e) => sum + e.duration, 0);
  const elapsed =
    exercises.slice(0, currentIndex).reduce((sum, e) => sum + e.duration, 0) +
    currentDuration - timeLeft;
  const overallProgress = Math.min((elapsed / totalDuration) * 100, 100);

  return (
    <main className="min-h-screen flex flex-col px-4 py-8 bg-[#F7F7F7]">
      {/* 進捗ヘッダー */}
      <div className="w-full max-w-md mx-auto mb-4">
        <div className="flex justify-between text-xs font-extrabold text-[#AAA] mb-2">
          <span>{program.title}</span>
          <span>{currentIndex + 1} / {exercises.length}</span>
        </div>
        <div className="w-full h-4 rounded-full bg-[#E5E5E5] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${overallProgress}%`, backgroundColor: typeColor }}
          />
        </div>
        <div className="flex gap-1.5 mt-2 justify-center">
          {exercises.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? "24px" : "8px",
                backgroundColor: i < currentIndex ? typeColor : i === currentIndex ? `${typeColor}80` : "#E5E5E5",
              }}
            />
          ))}
        </div>
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto gap-4">
        <div className="w-full flex justify-end">
          <button
            onClick={handleSkip}
            className="text-xs font-extrabold text-[#AAA] hover:text-[#777] px-3 py-1 transition-colors"
          >
            スキップ
          </button>
        </div>

        {/* 3D モデル */}
        <ExerciseModel exerciseName={current.name} typeColor={typeColor} />

        {/* タイマー */}
        <CircularTimer timeLeft={timeLeft} duration={currentDuration} typeColor={typeColor} />

        {/* 種目名・説明 */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#1C1C1C] mb-2">{current.name}</h2>
          <p className="text-sm font-semibold text-[#777] leading-relaxed max-w-xs">{current.instruction}</p>
        </div>

        {/* コーチング */}
        <div
          className="px-5 py-2.5 rounded-full text-sm font-extrabold text-white"
          style={{ backgroundColor: typeColor }}
        >
          {coaching}
        </div>

        {/* ポイント */}
        <div className="duo-card w-full text-center">
          <p className="text-xs font-extrabold text-[#AAA] mb-1">意識するポイント</p>
          <p className="text-sm font-semibold text-[#1C1C1C]">💡 {current.tip}</p>
        </div>

        {showComplete && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 50 }}>
            <div
              className="text-4xl font-black animate-nice-pop px-8 py-4 rounded-2xl text-white shadow-lg"
              style={{ backgroundColor: typeColor }}
            >
              完了 ✓
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
