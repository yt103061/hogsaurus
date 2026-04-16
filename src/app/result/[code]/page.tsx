"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getDinosaur } from "@/lib/dinosaurs";
import { DinosaurType } from "@/types";
import { applyTheme } from "@/lib/theme";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const code = typeof params.code === "string" ? params.code.toUpperCase() : "";
  const [dinosaur, setDinosaur] = useState<DinosaurType | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dino = getDinosaur(code);
    if (!dino) { router.replace("/diagnosis"); return; }
    setDinosaur(dino);
    applyTheme(dino.themeColor);
    import("@/lib/storage").then(({ setDinosaurCode }) => {
      setDinosaurCode(code);
    });
  }, [code, router]);

  async function handleShare() {
    if (!dinosaur) return;
    const text = `私の恐竜タイプは「${dinosaur.name}（${dinosaur.species}）」でした！\n\n${dinosaur.catchphrase}\n\n#ほぐサウルス #デスクワーカー\nhttps://hogsaurus.vercel.app/result/${dinosaur.code}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!dinosaur) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl animate-pulse">🦕</div>
      </main>
    );
  }

  const tc = dinosaur.themeColor;
  const axisLabels: Record<string, string> = {
    部位: dinosaur.axes.bodyPart === "U" ? "首・肩" : "腰・骨盤",
    性質: dinosaur.axes.quality === "T" ? "固まり型" : "だるさ型",
    目: dinosaur.axes.eye === "E" ? "眼精疲労あり" : "目は問題なし",
    広がり: dinosaur.axes.spread === "C" ? "局所型" : "全身型",
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[#F7F7F7]">
      <div className="w-full max-w-md">
        <p className="text-center text-xs font-extrabold tracking-widest text-[#AAA] mb-2 uppercase">
          あなたのパートナー恐竜
        </p>
        <p className="text-center text-sm font-bold text-[#777] mb-6">
          あなたの不調パターンに最も合う恐竜が決まりました
        </p>

        {/* Dino Badge */}
        <div className="text-center mb-6">
          <div
            className="w-32 h-32 rounded-3xl mx-auto mb-4 flex items-center justify-center text-6xl animate-pop-in"
            style={{ background: `${tc}18`, border: `3px solid ${tc}40` }}
          >
            🦕
          </div>
          <span
            className="text-xs font-extrabold tracking-wider px-3 py-1.5 rounded-xl text-white"
            style={{ backgroundColor: tc }}
          >
            {dinosaur.code}
          </span>
          <p className="text-xs font-bold text-[#AAA] mt-3 mb-0.5">あなたのパートナー</p>
          <h1 className="text-3xl font-black mb-1" style={{ color: tc }}>
            {dinosaur.name}
          </h1>
          <p className="text-sm font-semibold text-[#777]">{dinosaur.species}</p>
          <p className="text-base font-bold mt-4 text-[#1C1C1C] leading-relaxed">
            「{dinosaur.catchphrase}」
          </p>
        </div>

        {/* Axis grid */}
        <div className="duo-card mb-4">
          <p className="text-xs font-extrabold text-[#AAA] mb-3">あなたの診断軸</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(axisLabels).map(([key, label]) => (
              <div
                key={key}
                className="text-center p-3 rounded-xl"
                style={{ backgroundColor: `${tc}10` }}
              >
                <p className="text-[10px] font-extrabold text-[#AAA] mb-1">{key}</p>
                <p className="text-sm font-extrabold" style={{ color: tc }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={handleShare} className="btn-duo">
            {copied ? "✓ コピーしました！" : "Xでシェア（テキストをコピー）"}
          </button>
          <Link href="/checkin" className="btn-duo-outline text-center block">
            {dinosaur.name}と一緒にケアを始める →
          </Link>
          <Link
            href="/diagnosis"
            className="text-center text-xs font-bold text-[#AAA] hover:text-[#777] transition-colors py-2 block"
          >
            もう一度診断する
          </Link>
        </div>
      </div>
    </main>
  );
}
