"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserData, isCheckedInToday } from "@/lib/storage";
import { getDinosaur } from "@/lib/dinosaurs";
import { applyTheme } from "@/lib/theme";
import { UserData, DinosaurType } from "@/types";
import { ActionCard } from "@/components/home/ActionCard";
import { StreakBar } from "@/components/home/StreakBar";
import { WeekCalendar } from "@/components/home/WeekCalendar";
import { XPCard } from "@/components/home/XPCard";

const DEFAULT_COLOR = "#FF9600";

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
      const dino = getDinosaur(data.dinosaurCode);
      setDinosaur(dino ?? null);
      setCheckedInToday(isCheckedInToday());
      applyTheme(dino?.themeColor ?? DEFAULT_COLOR);
    } else {
      applyTheme(DEFAULT_COLOR);
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl animate-pulse">🦕</div>
      </main>
    );
  }

  // 未診断
  if (!userData || !dinosaur) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white">
        <div className="text-center mb-10">
          <div
            className="w-24 h-24 rounded-3xl mx-auto mb-5 flex items-center justify-center text-5xl"
            style={{ background: "#FFF0D4", border: "2px solid #FF960040" }}
          >
            🦕
          </div>
          <h1 className="text-4xl font-black mb-1" style={{ color: DEFAULT_COLOR }}>
            ほぐサウルス
          </h1>
          <p className="text-sm font-bold tracking-widest uppercase text-[#AAA] mb-5">Hogsaurus</p>
          <p className="text-xl font-bold leading-relaxed text-[#1C1C1C]">
            デスクワーカーの体を、<br />
            <span style={{ color: DEFAULT_COLOR }}>5分</span>で整える。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10 w-full max-w-sm">
          {[
            { emoji: "🎯", label: "16タイプ診断" },
            { emoji: "🤖", label: "AIケアプログラム" },
            { emoji: "🔥", label: "毎日の習慣化" },
          ].map((f) => (
            <div key={f.label} className="duo-card text-center py-4">
              <div className="text-2xl mb-1">{f.emoji}</div>
              <p className="text-xs font-bold text-[#777]">{f.label}</p>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm">
          <Link href="/diagnosis" className="btn-duo">
            恐竜タイプを診断する →
          </Link>
        </div>
        <p className="mt-4 text-xs font-bold text-[#AAA]">4問・約1分で診断完了</p>
      </main>
    );
  }

  const tc = dinosaur.themeColor;
  const totalCheckins = userData.checkinHistory.length;
  const maxStreak = userData.maxStreak ?? userData.streakDays;

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-4 py-8">
      <div className="max-w-md mx-auto flex flex-col gap-4">
        {/* Dino Badge Header */}
        <div className="flex items-center gap-4 py-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: `${tc}20`, border: `2px solid ${tc}40` }}
          >
            🦕
          </div>
          <div>
            <span
              className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-lg text-white"
              style={{ backgroundColor: tc }}
            >
              {dinosaur.code}
            </span>
            <p className="text-lg font-extrabold text-[#1C1C1C] mt-0.5">{dinosaur.name}</p>
            <p className="text-xs font-semibold text-[#777]">{dinosaur.species}</p>
          </div>
        </div>

        <ActionCard
          isCheckedIn={checkedInToday}
          streakDays={userData.streakDays}
          typeColor={tc}
          dinosaurName={dinosaur.name}
          hour={hour}
        />

        <div className="duo-card">
          <StreakBar streakDays={userData.streakDays} typeColor={tc} />
        </div>

        <div className="duo-card">
          <WeekCalendar checkinHistory={userData.checkinHistory} typeColor={tc} />
        </div>

        <XPCard totalXP={userData.totalXP} typeColor={tc} />

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: String(totalCheckins), label: "総チェックイン" },
            { value: `${maxStreak}日`, label: "最長ストリーク" },
          ].map((stat) => (
            <div key={stat.label} className="duo-card text-center py-4">
              <p className="text-2xl font-black" style={{ color: tc }}>{stat.value}</p>
              <p className="text-xs font-bold text-[#777] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center pb-4">
          <Link
            href="/diagnosis"
            className="text-xs font-bold text-[#AAA] hover:text-[#777] transition-colors"
          >
            恐竜タイプを診断し直す
          </Link>
        </div>
      </div>
    </main>
  );
}
