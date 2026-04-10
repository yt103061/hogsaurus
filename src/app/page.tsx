"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserData, isCheckedInToday } from "@/lib/storage";
import { getDinosaur } from "@/lib/dinosaurs";
import { UserData } from "@/types";
import { DinosaurType } from "@/types";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dinosaur, setDinosaur] = useState<DinosaurType | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
    if (data) {
      const dino = getDinosaur(data.dinosaurCode);
      setDinosaur(dino ?? null);
      setCheckedInToday(isCheckedInToday());
    }
    setMounted(true);
  }, []);

  // SSRちらつき防止
  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">🦕</div>
      </main>
    );
  }

  // 未診断
  if (!userData || !dinosaur) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🦕</div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#D4A843" }}>
            ほぐサウルス
          </h1>
          <p className="text-sm tracking-widest uppercase opacity-60 mb-6">Hogsaurus</p>
          <p className="text-xl font-medium leading-relaxed" style={{ color: "#F5EDD8" }}>
            デスクワーカーの体を、
            <br />
            <span style={{ color: "#D4A843" }}>5分</span>で整える。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12 text-center max-w-sm w-full">
          <div>
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-xs opacity-70">16タイプ診断</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🤖</div>
            <p className="text-xs opacity-70">AIケアプログラム</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🔥</div>
            <p className="text-xs opacity-70">毎日の習慣化</p>
          </div>
        </div>

        <Link
          href="/diagnosis"
          className="px-10 py-4 rounded-full text-lg font-bold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ backgroundColor: "#D4A843", color: "#100C05" }}
        >
          恐竜タイプを診断する →
        </Link>
        <p className="mt-6 text-xs opacity-40">4問・約1分で診断完了</p>

        <div className="fixed bottom-8 left-8 text-4xl opacity-10 rotate-[-15deg] select-none">🦖</div>
        <div className="fixed top-8 right-8 text-3xl opacity-10 rotate-[10deg] select-none">🦕</div>
      </main>
    );
  }

  // 診断済み
  const themeColor = dinosaur.themeColor;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* キャラクターカード */}
        <div
          className="rounded-3xl p-8 mb-6 text-center"
          style={{
            backgroundColor: `${themeColor}15`,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: `${themeColor}35`,
          }}
        >
          <div className="text-5xl mb-4">🦕</div>
          <div
            className="text-xs font-bold tracking-widest uppercase mb-2 px-3 py-1 rounded-full inline-block"
            style={{ backgroundColor: `${themeColor}25`, color: themeColor }}
          >
            {dinosaur.code}
          </div>
          <h1 className="text-3xl font-bold mt-2 mb-1" style={{ color: themeColor }}>
            {dinosaur.name}
          </h1>
          <p className="text-sm opacity-50 mb-4">{dinosaur.species}</p>

          {/* ストリーク */}
          <div className="flex items-center justify-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
            >
              🔥 {userData.streakDays}日連続
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#F5EDD8" }}
            >
              ⚡ {userData.totalXP} XP
            </div>
          </div>
        </div>

        {/* チェックインCTA */}
        {checkedInToday ? (
          <div
            className="w-full py-5 rounded-2xl text-center font-bold text-base border"
            style={{
              borderColor: `${themeColor}30`,
              backgroundColor: `${themeColor}10`,
              color: themeColor,
            }}
          >
            今日は完了 ✅
          </div>
        ) : (
          <Link
            href="/checkin"
            className="block w-full py-5 rounded-2xl text-center font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: themeColor, color: "#100C05" }}
          >
            今日のチェックインをする →
          </Link>
        )}

        {/* 再診断リンク */}
        <div className="mt-6 text-center">
          <Link
            href="/diagnosis"
            className="text-xs opacity-30 hover:opacity-60 transition-opacity"
          >
            恐竜タイプを診断し直す
          </Link>
        </div>
      </div>

      <div className="fixed bottom-8 left-8 text-4xl opacity-10 rotate-[-15deg] select-none">🦖</div>
      <div className="fixed top-8 right-8 text-3xl opacity-10 rotate-[10deg] select-none">🦕</div>
    </main>
  );
}
