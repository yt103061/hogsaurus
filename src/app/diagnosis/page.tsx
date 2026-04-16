"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, computeDinosaurCode } from "@/lib/questions";
import { applyTheme } from "@/lib/theme";

const DEFAULT_COLOR = "#FF9600";

const AXIS_LABELS: Record<string, string> = {
  UL: "部位",
  TD: "症状の性質",
  EB: "疲れの出方",
  CW: "広がり方",
};

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    applyTheme(DEFAULT_COLOR);
  }, []);

  const question = QUESTIONS[currentStep];
  const progress = (currentStep / QUESTIONS.length) * 100;

  function handleAnswer(score: number) {
    const newScores = [...scores, score];
    setScores(newScores);
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push(`/result/${computeDinosaurCode(newScores)}`);
    }
  }

  function handleBack() {
    if (currentStep === 0) { router.push("/"); return; }
    setScores(scores.slice(0, -1));
    setCurrentStep(currentStep - 1);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[#F7F7F7]">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="text-sm font-bold text-[#777] hover:text-[#1C1C1C] transition-colors mb-4 flex items-center gap-1"
          >
            ← 戻る
          </button>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-extrabold text-[#AAA]">
              {currentStep + 1} / {QUESTIONS.length}
            </span>
            <span
              className="text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded-lg text-white"
              style={{ backgroundColor: DEFAULT_COLOR }}
            >
              {AXIS_LABELS[question.axis]}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#E5E5E5] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: DEFAULT_COLOR }}
            />
          </div>
        </div>

        {/* 質問カード */}
        <div className="duo-card mb-6">
          <h2 className="text-xl font-extrabold text-[#1C1C1C] leading-relaxed mb-6">
            {question.text}
          </h2>
          <div className="flex flex-col gap-3">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt.score)}
                className="w-full py-4 px-5 rounded-2xl text-left font-bold border-2 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: "#E5E5E5",
                  backgroundColor: `${DEFAULT_COLOR}08`,
                  boxShadow: "0 2px 0 #E5E5E5",
                  color: "#1C1C1C",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ステップドット */}
        <div className="flex justify-center gap-1.5 flex-wrap">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentStep ? "18px" : "7px",
                height: "7px",
                backgroundColor:
                  i < currentStep
                    ? DEFAULT_COLOR
                    : i === currentStep
                    ? `${DEFAULT_COLOR}80`
                    : "#E5E5E5",
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
