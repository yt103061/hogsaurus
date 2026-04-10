"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPendingCheckin } from "@/lib/storage";
import { getDinosaur } from "@/lib/dinosaurs";
import { getUserData } from "@/lib/storage";
import { CareProgram, Exercise } from "@/types";

export default function SessionPage() {
  const router = useRouter();
  const [program, setProgram] = useState<CareProgram | null>(null);
  const [themeColor, setThemeColor] = useState("#D4A843");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const pending = getPendingCheckin();
    if (!pending) {
      router.replace("/checkin");
      return;
    }
    setProgram(pending.program);
    setTimeLeft(pending.program.exercises[0]?.duration ?? 30);

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
          // 次の種目へ
          setCurrentIndex((ci) => {
            const next = ci + 1;
            if (next >= program.exercises.length) {
              setIsFinished(true);
              return ci;
            }
            setTimeLeft(program.exercises[next].duration);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [program, isFinished, currentIndex]);

  function handleSkip() {
    if (!program) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const next = currentIndex + 1;
    if (next >= program.exercises.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex(next);
      setTimeLeft(program.exercises[next].duration);
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
  const totalDuration = exercises.reduce((sum, e) => sum + e.duration, 0);
  const elapsed =
    exercises.slice(0, currentIndex).reduce((sum, e) => sum + e.duration, 0) +
    (exercises[currentIndex]?.duration ?? 0) -
    timeLeft;
  const overallProgress = Math.min((elapsed / totalDuration) * 100, 100);

  if (isFinished) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: themeColor }}>
            完了！
          </h1>
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

  return (
    <main className="min-h-screen flex flex-col px-4 py-12">
      {/* 全体プログレスバー */}
      <div className="w-full max-w-md mx-auto mb-8">
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
      </div>

      {/* メインカード */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
        {/* スキップボタン */}
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-xs opacity-30 hover:opacity-60 transition-opacity px-3 py-1"
          >
            スキップ
          </button>
        </div>

        <div
          className="w-full rounded-3xl p-8 text-center mb-6"
          style={{
            backgroundColor: `${themeColor}12`,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: `${themeColor}30`,
          }}
        >
          {/* カウントダウン */}
          <div className="text-7xl font-bold mb-2" style={{ color: themeColor }}>
            {timeLeft}
          </div>
          <p className="text-xs opacity-40 mb-6">秒</p>

          {/* 種目名 */}
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#F5EDD8" }}>
            {current.name}
          </h2>

          {/* やり方 */}
          <p className="text-sm leading-relaxed opacity-80 mb-4">
            {current.instruction}
          </p>

          {/* ポイント */}
          <div
            className="inline-block px-4 py-2 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            💡 {current.tip}
          </div>
        </div>

        {/* 種目リスト（ミニ） */}
        <div className="w-full flex gap-2 justify-center">
          {exercises.map((ex, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i < currentIndex
                    ? themeColor
                    : i === currentIndex
                    ? `${themeColor}80`
                    : "rgba(212,168,67,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
