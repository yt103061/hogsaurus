"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserData, isCheckedInToday } from "@/lib/storage";
import { getDinosaur } from "@/lib/dinosaurs";
import { UserData, DinosaurType } from "@/types";
import { ActionCard } from "@/components/home/ActionCard";
import { StreakBar } from "@/components/home/StreakBar";
import { WeekCalendar } from "@/components/home/WeekCalendar";
import { XPCard } from "@/components/home/XPCard";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dinosaur, setDinosaur] = useState<DinosaurType | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [hour] = useState(() => new Date().getHours());

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
    if (data) {
      setDinosaur(getDinosaur(data.dinosaurCode) ?? null);
      setCheckedInToday(isCheckedInToday());
    }
    setMounted(true);
  }, []);

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
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#D4A843" }}>ほぐサウルス</h1>
          <p className="text-sm tracking-widest uppercase opacity-60 mb-6">Hogsaurus</p>
          <p className="text-xl font-medium leading-relaxed" style={{ color: "#F5EDD8" }}>
            デスクワーカーの体を、<br />
            <span style={{ color: "#D4A843" }}>5分</span>で整える。
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-12 text-center max-w-sm w-full">
          <div><div className="text-2xl mb-1">🎯</div><p className="text-xs opacity-70">16タイプ診断</p></div>
          <div><div className="text-2xl mb-1">🤖</div><p className="text-xs opacity-70">AIケアプログラム</p></div>
          <div><div className="text-2xl mb-1">🔥</div><p className="text-xs opacity-70">毎日の習慣化</p></div>
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

  const themeColor = dinosaur.themeColor;
  const totalCheckins = userData.checkinHistory.length;
  const maxStreak = userData.maxStreak ?? userData.streakDays;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-5">
        {/* キャラクターヘッダー */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ backgroundColor: `${themeColor}18`, border: `1px solid ${themeColor}30` }}
          >
            🦕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
              >
                {dinosaur.code}
              </span>
            </div>
            <p className="text-lg font-bold mt-0.5" style={{ color: themeColor }}>{dinosaur.name}</p>
            <p className="text-xs opacity-40">{dinosaur.species}</p>
          </div>
        </div>

        {/* アクションカード */}
        <ActionCard
          isCheckedIn={checkedInToday}
          streakDays={userData.streakDays}
          themeColor={themeColor}
          dinosaurName={dinosaur.name}
          hour={hour}
        />

        {/* ストリークバー */}
        <div
          className="w-full rounded-3xl p-5"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <StreakBar streakDays={userData.streakDays} themeColor={themeColor} />
        </div>

        {/* ウィークカレンダー */}
        <div
          className="w-full rounded-3xl p-5"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <WeekCalendar checkinHistory={userData.checkinHistory} themeColor={themeColor} />
        </div>

        {/* XP カード */}
        <XPCard totalXP={userData.totalXP} themeColor={themeColor} />

        {/* スタッツ */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-2xl font-bold" style={{ color: themeColor }}>{totalCheckins}</p>
            <p className="text-xs opacity-40 mt-0.5">総チェックイン</p>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-2xl font-bold" style={{ color: themeColor }}>{maxStreak}</p>
            <p className="text-xs opacity-40 mt-0.5">最長ストリーク</p>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center pb-2">
          <Link href="/diagnosis" className="text-xs opacity-20 hover:opacity-50 transition-opacity">
            恐竜タイプを診断し直す
          </Link>
        </div>
      </div>
    </main>
  );
}
