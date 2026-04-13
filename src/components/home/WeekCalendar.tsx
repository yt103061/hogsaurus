"use client";

import { CheckinRecord } from "@/types";

interface WeekCalendarProps {
  checkinHistory: CheckinRecord[];
  themeColor: string;
}

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

function getWeekDates(): Date[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7)); // 今週の月曜日
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateStr(d: Date): string {
  return d.toLocaleDateString("sv");
}

export function WeekCalendar({ checkinHistory, themeColor }: WeekCalendarProps) {
  const weekDates = getWeekDates();
  const todayStr = new Date().toLocaleDateString("sv");
  const checkedSet = new Set(checkinHistory.map((r) => r.date));

  return (
    <div className="w-full">
      <p className="text-xs opacity-40 mb-3">今週のチェックイン</p>
      <div className="flex justify-between gap-1">
        {weekDates.map((date, i) => {
          const dateStr = toDateStr(date);
          const isToday = dateStr === todayStr;
          const checked = checkedSet.has(dateStr);
          const isFuture = dateStr > todayStr;

          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-[10px] opacity-30">{DAY_LABELS[i]}</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: checked
                    ? themeColor
                    : isToday
                    ? `${themeColor}20`
                    : "transparent",
                  border: isToday && !checked
                    ? `2px solid ${themeColor}60`
                    : isFuture
                    ? "2px solid rgba(255,255,255,0.06)"
                    : checked
                    ? "none"
                    : "2px solid rgba(255,255,255,0.1)",
                }}
              >
                {checked ? (
                  <span className="text-xs font-bold" style={{ color: "#100C05" }}>✓</span>
                ) : (
                  <span className="text-[10px]" style={{ color: isToday ? themeColor : "rgba(245,237,216,0.15)" }}>
                    {date.getDate()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
