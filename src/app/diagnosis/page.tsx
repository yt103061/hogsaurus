"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/questions";

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const question = QUESTIONS[currentStep];
  const progress = (currentStep / QUESTIONS.length) * 100;

  function handleAnswer(value: string) {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 4文字コードを組み立てる
      const code = newAnswers.join("");
      router.push(`/result/${code}`);
    }
  }

  function handleBack() {
    if (currentStep === 0) {
      router.push("/");
      return;
    }
    setAnswers(answers.slice(0, -1));
    setCurrentStep(currentStep - 1);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* ヘッダー */}
      <div className="w-full max-w-md mb-8">
        <button
          onClick={handleBack}
          className="text-sm opacity-60 hover:opacity-100 transition-opacity mb-6 flex items-center gap-1"
        >
          ← 戻る
        </button>

        {/* プログレスバー */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs opacity-50">
            {currentStep + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(212,168,67,0.2)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: "#D4A843",
            }}
          />
        </div>
      </div>

      {/* 質問カード */}
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8 mb-6"
          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="text-xs tracking-widest uppercase mb-4 opacity-50"
          >
            Q{question.id}. {question.axis}
          </div>
          <h2
            className="text-2xl font-bold leading-relaxed mb-8"
            style={{ color: "#F5EDD8" }}
          >
            {question.text}
          </h2>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleAnswer(question.optionA.value)}
              className="w-full py-4 px-6 rounded-xl text-left font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border"
              style={{
                borderColor: "rgba(212,168,67,0.3)",
                backgroundColor: "rgba(212,168,67,0.08)",
                color: "#F5EDD8",
              }}
            >
              <span
                className="text-xs font-bold mr-3 px-2 py-0.5 rounded"
                style={{ backgroundColor: "#D4A843", color: "#100C05" }}
              >
                A
              </span>
              {question.optionA.label}
            </button>

            <button
              onClick={() => handleAnswer(question.optionB.value)}
              className="w-full py-4 px-6 rounded-xl text-left font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border"
              style={{
                borderColor: "rgba(212,168,67,0.3)",
                backgroundColor: "rgba(212,168,67,0.08)",
                color: "#F5EDD8",
              }}
            >
              <span
                className="text-xs font-bold mr-3 px-2 py-0.5 rounded"
                style={{ backgroundColor: "#D4A843", color: "#100C05" }}
              >
                B
              </span>
              {question.optionB.label}
            </button>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="flex justify-center gap-2">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i < currentStep
                    ? "#D4A843"
                    : i === currentStep
                    ? "#D4A843"
                    : "rgba(212,168,67,0.2)",
                opacity: i <= currentStep ? 1 : 0.4,
                transform: i === currentStep ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
