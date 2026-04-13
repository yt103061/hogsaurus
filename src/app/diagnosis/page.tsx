"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/questions";
import { applyTheme } from "@/lib/theme";

const DEFAULT_COLOR = "#FF9600";

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    applyTheme(DEFAULT_COLOR);
  }, []);

  const question = QUESTIONS[currentStep];
  const progress = (currentStep / QUESTIONS.length) * 100;

  function handleAnswer(value: string) {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push(`/result/${newAnswers.join("")}`);
    }
  }

  function handleBack() {
    if (currentStep === 0) { router.push("/"); return; }
    setAnswers(answers.slice(0, -1));
    setCurrentStep(currentStep - 1);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[#F7F7F7]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="text-sm font-bold text-[#777] hover:text-[#1C1C1C] transition-colors mb-4 flex items-center gap-1"
          >
            ← 戻る
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold text-[#AAA]">
              {currentStep + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="w-full h-4 rounded-full bg-[#E5E5E5] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: DEFAULT_COLOR }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="duo-card mb-6">
          <div className="text-xs font-extrabold tracking-widest text-[#AAA] mb-3">
            Q{question.id}. {question.axis}
          </div>
          <h2 className="text-xl font-extrabold text-[#1C1C1C] leading-relaxed mb-6">
            {question.text}
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { option: question.optionA, label: "A" },
              { option: question.optionB, label: "B" },
            ].map(({ option, label }) => (
              <button
                key={label}
                onClick={() => handleAnswer(option.value)}
                className="w-full py-4 px-5 rounded-2xl text-left font-bold border-2 flex items-center gap-3 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: "#E5E5E5",
                  backgroundColor: `${DEFAULT_COLOR}08`,
                  boxShadow: "0 2px 0 #E5E5E5",
                  color: "#1C1C1C",
                }}
              >
                <span
                  className="text-xs font-extrabold w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: DEFAULT_COLOR }}
                >
                  {label}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentStep ? "20px" : "8px",
                height: "8px",
                backgroundColor: i <= currentStep ? DEFAULT_COLOR : "#E5E5E5",
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
