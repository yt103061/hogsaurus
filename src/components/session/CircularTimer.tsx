"use client";

interface CircularTimerProps {
  timeLeft: number;
  duration: number;
  themeColor: string;
}

const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function CircularTimer({ timeLeft, duration, themeColor }: CircularTimerProps) {
  const progress = duration > 0 ? timeLeft / duration : 0;
  const offset = CIRCUMFERENCE * (1 - progress);
  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const strokeColor = isUrgent ? "#FF4444" : themeColor;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        {/* 背景リング */}
        <circle
          cx="64" cy="64" r={R}
          fill="none"
          stroke={`${themeColor}18`}
          strokeWidth="8"
        />
        {/* 進捗リング */}
        <circle
          cx="64" cy="64" r={R}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
        />
      </svg>
      {/* 中央テキスト */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tabular-nums leading-none transition-colors duration-300"
          style={{ color: isUrgent ? "#FF4444" : themeColor }}
        >
          {timeLeft}
        </span>
        <span className="text-xs opacity-30 mt-0.5">秒</span>
      </div>
    </div>
  );
}
