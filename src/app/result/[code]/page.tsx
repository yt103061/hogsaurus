"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getDinosaur } from "@/lib/dinosaurs";
import { DinosaurType } from "@/types";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const code = typeof params.code === "string" ? params.code.toUpperCase() : "";
  const [dinosaur, setDinosaur] = useState<DinosaurType | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dino = getDinosaur(code);
    if (!dino) {
      router.replace("/diagnosis");
      return;
    }
    setDinosaur(dino);
    // 診断完了時にlocalStorageへ保存
    import("@/lib/storage").then(({ setDinosaurCode }) => {
      setDinosaurCode(code);
    });
  }, [code, router]);

  async function handleShare() {
    if (!dinosaur) return;
    const text = `私の恐竜タイプは「${dinosaur.name}（${dinosaur.species}）」でした！\n\n${dinosaur.catchphrase}\n\n#ほぐサウルス #デスクワーカー\nhttps://hogsaurus.vercel.app/result/${dinosaur.code}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: テキストエリアを使ったコピー
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!dinosaur) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">🦕</div>
      </main>
    );
  }

  const axisLabels = {
    bodyPart: dinosaur.axes.bodyPart === "U" ? "首・肩" : "腰・骨盤",
    quality: dinosaur.axes.quality === "T" ? "固まり型" : "だるさ型",
    eye: dinosaur.axes.eye === "E" ? "眼精疲労あり" : "目は問題なし",
    spread: dinosaur.axes.spread === "C" ? "局所型" : "全身型",
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* 診断結果ラベル */}
        <p
          className="text-center text-xs tracking-widest uppercase mb-6 opacity-50"
        >
          診断結果
        </p>

        {/* キャラクターカード */}
        <div
          className="rounded-3xl p-8 mb-6 text-center"
          style={{
            backgroundColor: `${dinosaur.themeColor}20`,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: `${dinosaur.themeColor}50`,
          }}
        >
          <div className="text-7xl mb-4">🦕</div>

          <div
            className="text-xs font-bold tracking-widest uppercase mb-2 px-3 py-1 rounded-full inline-block"
            style={{
              backgroundColor: `${dinosaur.themeColor}30`,
              color: dinosaur.themeColor,
            }}
          >
            {dinosaur.code}
          </div>

          <h1
            className="text-3xl font-bold mt-3 mb-1"
            style={{ color: dinosaur.themeColor }}
          >
            {dinosaur.name}
          </h1>
          <p className="text-sm opacity-60 mb-6">{dinosaur.species}</p>

          <p
            className="text-base leading-relaxed italic"
            style={{ color: "#F5EDD8" }}
          >
            「{dinosaur.catchphrase}」
          </p>
        </div>

        {/* 診断軸 */}
        <div
          className="rounded-2xl p-6 mb-6 grid grid-cols-2 gap-3"
          style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
        >
          {Object.entries(axisLabels).map(([key, label]) => (
            <div key={key} className="text-center">
              <p className="text-xs opacity-40 mb-1">
                {key === "bodyPart"
                  ? "部位"
                  : key === "quality"
                  ? "性質"
                  : key === "eye"
                  ? "目の疲れ"
                  : "広がり"}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: dinosaur.themeColor }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: "#D4A843",
              color: "#100C05",
            }}
          >
            {copied ? "✓ コピーしました！" : "Xでシェアする（テキストをコピー）"}
          </button>

          <Link
            href="/checkin"
            className="w-full py-4 rounded-xl font-bold text-base text-center border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderColor: "rgba(212,168,67,0.3)",
              backgroundColor: "rgba(212,168,67,0.08)",
              color: "#F5EDD8",
            }}
          >
            今日のチェックインをする →
          </Link>

          <Link
            href="/diagnosis"
            className="w-full py-3 rounded-xl text-sm text-center opacity-50 hover:opacity-80 transition-opacity"
            style={{ color: "#F5EDD8" }}
          >
            もう一度診断する
          </Link>
        </div>
      </div>
    </main>
  );
}
