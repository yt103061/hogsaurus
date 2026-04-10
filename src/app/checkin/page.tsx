"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDinosaur } from "@/lib/dinosaurs";
import { getUserData, savePendingCheckin } from "@/lib/storage";
import { CareProgram } from "@/types";

const SYMPTOMS = [
  "首・後頭部が重い",
  "肩・肩甲骨が固い",
  "腰・お尻が重だるい",
  "目・頭が疲れている",
  "全体的にだるい",
  "今日は割と元気",
];

function detectTimeOfDay(): "morning" | "noon" | "evening" {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "noon";
  return "evening";
}

const TIME_OPTIONS: { value: "morning" | "noon" | "evening"; label: string }[] = [
  { value: "morning", label: "朝（5〜11時）" },
  { value: "noon", label: "昼（11〜17時）" },
  { value: "evening", label: "夜（17〜24時）" },
];

export default function CheckinPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "noon" | "evening">(detectTimeOfDay());
  const [isLoading, setIsLoading] = useState(false);
  const [dinosaurName, setDinosaurName] = useState("あなた");
  const [themeColor, setThemeColor] = useState("#D4A843");

  useEffect(() => {
    const data = getUserData();
    if (!data) {
      router.replace("/");
      return;
    }
    const dino = getDinosaur(data.dinosaurCode);
    if (dino) {
      setDinosaurName(dino.name);
      setThemeColor(dino.themeColor);
    }
  }, [router]);

  function toggleSymptom(s: string) {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit() {
    setIsLoading(true);
    try {
      const data = getUserData();
      const dinosaurCode = data?.dinosaurCode ?? "";

      const res = await fetch("/api/generate-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dinosaurCode, symptoms, intensity, timeOfDay }),
      });

      const program: CareProgram = await res.json();
      savePendingCheckin({ symptoms, intensity, timeOfDay, program });
      router.push("/session");
    } catch {
      setIsLoading(false);
    }
  }

  const canProceedStep1 = symptoms.length > 0;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => (step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : router.push("/"))}
            className="text-sm opacity-60 hover:opacity-100 transition-opacity mb-4 flex items-center gap-1"
          >
            ← 戻る
          </button>
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(212,168,67,0.2)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%`, backgroundColor: themeColor }}
            />
          </div>
          <p className="text-xs opacity-40 mt-2">STEP {step} / 3</p>
        </div>

        {/* タイトル */}
        <h1 className="text-2xl font-bold mb-8" style={{ color: "#F5EDD8" }}>
          今日の
          <span style={{ color: themeColor }}>{dinosaurName}</span>
          はどう？
        </h1>

        {/* STEP 1: 症状選択 */}
        {step === 1 && (
          <div>
            <p className="text-sm opacity-60 mb-4">今日の不調を選んでください（複数可）</p>
            <div className="flex flex-col gap-3 mb-8">
              {SYMPTOMS.map((s) => {
                const selected = symptoms.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className="w-full py-4 px-5 rounded-xl text-left font-medium transition-all duration-150 border"
                    style={{
                      borderColor: selected ? themeColor : "rgba(212,168,67,0.2)",
                      backgroundColor: selected ? `${themeColor}20` : "rgba(255,255,255,0.04)",
                      color: selected ? themeColor : "#F5EDD8",
                    }}
                  >
                    {selected ? "✓ " : "　"}{s}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: themeColor, color: "#100C05" }}
            >
              次へ →
            </button>
          </div>
        )}

        {/* STEP 2: 辛さレベル */}
        {step === 2 && (
          <div>
            <p className="text-sm opacity-60 mb-8">今日の辛さはどのくらい？</p>
            <div className="text-center mb-6">
              <span className="text-7xl font-bold" style={{ color: themeColor }}>
                {intensity}
              </span>
              <span className="text-2xl opacity-40"> / 5</span>
            </div>
            <div className="mb-3 flex justify-between text-xs opacity-40">
              <span>余裕あり</span>
              <span>かなり辛い</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full mb-10"
              style={{ accentColor: themeColor }}
            />
            <button
              onClick={() => setStep(3)}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: themeColor, color: "#100C05" }}
            >
              次へ →
            </button>
          </div>
        )}

        {/* STEP 3: 時間帯 */}
        {step === 3 && (
          <div>
            <p className="text-sm opacity-60 mb-6">今の時間帯は？</p>
            <div className="flex flex-col gap-3 mb-8">
              {TIME_OPTIONS.map((opt) => {
                const selected = timeOfDay === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTimeOfDay(opt.value)}
                    className="w-full py-4 px-5 rounded-xl text-left font-medium transition-all duration-150 border"
                    style={{
                      borderColor: selected ? themeColor : "rgba(212,168,67,0.2)",
                      backgroundColor: selected ? `${themeColor}20` : "rgba(255,255,255,0.04)",
                      color: selected ? themeColor : "#F5EDD8",
                    }}
                  >
                    {selected ? "✓ " : "　"}{opt.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{ backgroundColor: themeColor, color: "#100C05" }}
            >
              {isLoading ? "プログラムを生成中..." : "今日のケアを始める →"}
            </button>
            {isLoading && (
              <p className="text-center text-xs opacity-40 mt-3">
                AIがあなたの状態に合わせたプログラムを作成しています
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
