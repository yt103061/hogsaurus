"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDinosaur } from "@/lib/dinosaurs";
import { getUserData, savePendingCheckin } from "@/lib/storage";
import { applyTheme } from "@/lib/theme";
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

const TIME_OPTIONS = [
  { value: "morning" as const, label: "朝（5〜11時）", emoji: "☀️" },
  { value: "noon" as const, label: "昼（11〜17時）", emoji: "💼" },
  { value: "evening" as const, label: "夜（17〜24時）", emoji: "🌙" },
];

export default function CheckinPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "noon" | "evening">(detectTimeOfDay());
  const [isLoading, setIsLoading] = useState(false);
  const [dinosaurName, setDinosaurName] = useState("あなた");
  const [typeColor, setTypeColor] = useState("#FF9600");

  useEffect(() => {
    const data = getUserData();
    if (!data) { router.replace("/"); return; }
    const dino = getDinosaur(data.dinosaurCode);
    if (dino) {
      setDinosaurName(dino.name);
      setTypeColor(dino.themeColor);
      applyTheme(dino.themeColor);
    }
  }, [router]);

  function toggleSymptom(s: string) {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function handleSubmit() {
    setIsLoading(true);
    try {
      const data = getUserData();
      const res = await fetch("/api/generate-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dinosaurCode: data?.dinosaurCode ?? "", symptoms, intensity, timeOfDay }),
      });
      const program: CareProgram = await res.json();
      savePendingCheckin({ symptoms, intensity, timeOfDay, program });
      router.push("/session");
    } catch {
      setIsLoading(false);
    }
  }

  const trackStyle = {
    background: `linear-gradient(to right, ${typeColor} 0%, ${typeColor} ${((intensity - 1) / 4) * 100}%, #E5E5E5 ${((intensity - 1) / 4) * 100}%, #E5E5E5 100%)`,
  };

  return (
    <main className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <button
            onClick={() => (step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : router.push("/"))}
            className="text-sm font-bold text-[#777] hover:text-[#1C1C1C] transition-colors mb-4 flex items-center gap-1"
          >
            ← 戻る
          </button>
          <div className="w-full h-4 rounded-full bg-[#E5E5E5] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%`, backgroundColor: typeColor }}
            />
          </div>
          <p className="text-xs font-extrabold text-[#AAA] mt-2">STEP {step} / 3</p>
        </div>

        <h1 className="text-2xl font-extrabold mb-1 text-[#1C1C1C]">
          今日の調子はどう？
        </h1>
        <p className="text-sm font-semibold mb-6" style={{ color: typeColor }}>
          あなたの状態を<span className="font-extrabold">{dinosaurName}</span>に伝えましょう
        </p>

        {step === 1 && (
          <div>
            <p className="text-sm font-semibold text-[#777] mb-3">今日の不調を選んでください（複数可）</p>
            <div className="flex flex-col gap-2.5 mb-6">
              {SYMPTOMS.map((s) => {
                const selected = symptoms.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className="w-full py-4 px-5 rounded-2xl text-left font-bold border-2 transition-all duration-150"
                    style={{
                      borderColor: selected ? typeColor : "#E5E5E5",
                      backgroundColor: selected ? `${typeColor}12` : "white",
                      color: selected ? typeColor : "#1C1C1C",
                      boxShadow: selected ? "none" : "0 2px 0 #E5E5E5",
                    }}
                  >
                    <span className="mr-2">{selected ? "✓" : "　"}</span>{s}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep(2)} disabled={symptoms.length === 0} className="btn-duo">
              次へ →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm font-semibold text-[#777] mb-6">今日の辛さはどのくらい？</p>
            <div className="text-center mb-4">
              <span className="text-8xl font-black" style={{ color: typeColor }}>{intensity}</span>
              <span className="text-3xl font-bold text-[#AAA]"> / 5</span>
            </div>
            <div className="flex justify-between text-xs font-extrabold text-[#AAA] mb-2">
              <span>余裕あり</span><span>かなり辛い</span>
            </div>
            <input
              type="range" min={1} max={5} step={1} value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full mb-8" style={trackStyle}
            />
            <button onClick={() => setStep(3)} className="btn-duo">次へ →</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm font-semibold text-[#777] mb-4">今の時間帯は？</p>
            <div className="flex flex-col gap-2.5 mb-6">
              {TIME_OPTIONS.map((opt) => {
                const sel = timeOfDay === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTimeOfDay(opt.value)}
                    className="w-full py-4 px-5 rounded-2xl text-left font-bold border-2 flex items-center gap-3 transition-all duration-150"
                    style={{
                      borderColor: sel ? typeColor : "#E5E5E5",
                      backgroundColor: sel ? `${typeColor}12` : "white",
                      color: sel ? typeColor : "#1C1C1C",
                      boxShadow: sel ? "none" : "0 2px 0 #E5E5E5",
                    }}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                    {sel && <span className="ml-auto font-extrabold">✓</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={handleSubmit} disabled={isLoading} className="btn-duo">
              {isLoading ? "プログラムを生成中..." : "今日のケアを始める →"}
            </button>
            {isLoading && (
              <p className="text-center text-xs font-semibold text-[#AAA] mt-3">
                AIがあなたの状態に合わせたプログラムを作成しています
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
