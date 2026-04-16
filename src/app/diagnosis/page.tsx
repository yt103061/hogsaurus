"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, computeDinosaurCode } from "@/lib/questions";
import { applyTheme } from "@/lib/theme";

const DEFAULT_COLOR = "#FF9600";

// スコア: +2(強くA) +1(やや A) 0(中立) -1(やや B) -2(強く B)
const SCORE_VALUES = [2, 1, 0, -1, -2] as const;

// 軸ラベル表示用
const AXIS_LABELS: Record<string, string> = {
  UL: "部位",
  TD: "症状の性質",
  EB: "疲れの出方",
  CW: "広がり方",
};

const SECTION_TITLES: Record<string, string> = {
  UL: "どこが辛いですか？",
  TD: "どんな感じですか？",
  EB: "疲れの出方は？",
  CW: "広がり方は？",
};

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [pendingScore, setPendingScore] = useState<number | null>(null);

  useEffect(() => {
    applyTheme(DEFAULT_COLOR);
  }, []);

  const question = QUESTIONS[currentStep];
  const progress = ((currentStep) / QUESTIONS.length) * 100;

  // 前の軸と現在の軸が変わったかどうか（セクション区切り表示用）
  const prevAxis = currentStep > 0 ? QUESTIONS[currentStep - 1].axis : null;
  const isNewSection = prevAxis !== question.axis;

  function handleAnswer(score: number) {
    if (pendingScore !== null) return; // 連打防止
    setPendingScore(score);
    const newScores = [...scores, score];

    setTimeout(() => {
      setScores(newScores);
      setPendingScore(null);
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        const code = computeDinosaurCode(newScores);
        router.push(`/result/${code}`);
      }
    }, 280);
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
              Q{currentStep + 1} / {QUESTIONS.length}
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

        {/* セクション見出し（軸が変わるとき） */}
        {isNewSection && (
          <p className="text-xs font-extrabold tracking-widest text-[#AAA] uppercase mb-3 text-center">
            {SECTION_TITLES[question.axis]}
          </p>
        )}

        {/* 質問カード */}
        <div className="duo-card mb-8">
          <h2 className="text-xl font-extrabold text-[#1C1C1C] leading-relaxed text-center mb-8">
            {question.text}
          </h2>

          {/* スペクトラム選択UI */}
          <div className="flex items-start gap-3">
            {/* A極 */}
            <div className="flex-1 text-right">
              <p className="text-xs font-bold text-[#555] leading-tight whitespace-pre-line">
                {question.labelA}
              </p>
            </div>

            {/* 5択ドット */}
            <div className="flex items-center gap-2.5 pt-0.5">
              {SCORE_VALUES.map((score, i) => {
                const isSelected = pendingScore === score;
                const isPast = scores[currentStep] === score;
                const active = isSelected || isPast;
                // 外側ほど大きい
                const sizes = ["w-9 h-9", "w-7 h-7", "w-6 h-6", "w-7 h-7", "w-9 h-9"];
                return (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className={`${sizes[i]} rounded-full border-2 transition-all duration-200 flex-shrink-0`}
                    style={{
                      borderColor: active ? DEFAULT_COLOR : "#D0D0D0",
                      backgroundColor: active ? DEFAULT_COLOR : "white",
                      transform: active ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                );
              })}
            </div>

            {/* B極 */}
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-[#555] leading-tight whitespace-pre-line">
                {question.labelB}
              </p>
            </div>
          </div>

          {/* 補足ラベル */}
          <div className="flex justify-between mt-3 px-1">
            <span className="text-[10px] font-bold text-[#AAA]">強くそう</span>
            <span className="text-[10px] font-bold text-[#AAA]">どちらとも</span>
            <span className="text-[10px] font-bold text-[#AAA]">強くそう</span>
          </div>
        </div>

        {/* ステップドット */}
        <div className="flex justify-center gap-1.5 flex-wrap">
          {QUESTIONS.map((q, i) => (
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

        <p className="text-center text-xs font-semibold text-[#AAA] mt-4">
          全{QUESTIONS.length}問 · 所要時間 約3分
        </p>
      </div>
    </main>
  );
}
