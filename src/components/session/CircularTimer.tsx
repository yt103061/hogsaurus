"use client";

interface CircularTimerProps {
  timeLeft: number;
  duration: number;
  typeColor: string;
}

const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function CircularTimer({ timeLeft, duration, typeColor }: CircularTimerProps) {
  const progress = duration > 0 ? timeLeft / duration : 0;
  const offset = CIRCUMFERENCE * (1 - progress);
  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const strokeColor = isUrgent ? "#FF4B4B" : typeColor;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r={R} fill="none" stroke="#E5E5E5" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={R}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-black tabular-nums leading-none transition-colors duration-300"
          style={{ color: isUrgent ? "#FF4B4B" : typeColor }}
        >
          {timeLeft}
        </span>
        <span className="text-xs font-bold text-[#AAA] mt-0.5">秒</span>
      </div>
    </div>
  );
}
