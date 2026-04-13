"use client";

import { CheckinRecord } from "@/types";

interface WeekCalendarProps {
  checkinHistory: CheckinRecord[];
  typeColor: string;
}

const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

function getWeekDates(): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function WeekCalendar({ checkinHistory, typeColor }: WeekCalendarProps) {
  const weekDates = getWeekDates();
  const todayStr = new Date().toLocaleDateString("sv");
  const checkedSet = new Set(checkinHistory.map((r) => r.date));

  return (
    <div>
      <p className="text-sm font-bold text-[#777] mb-3">今週のチェックイン</p>
      <div className="flex justify-between gap-1">
        {weekDates.map((date, i) => {
          const dateStr = date.toLocaleDateString("sv");
          const isToday = dateStr === todayStr;
          const checked = checkedSet.has(dateStr);
          const isFuture = dateStr > todayStr;

          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-[10px] font-extrabold text-[#AAA]">{DAY_LABELS[i]}</span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  checked ? "animate-bounce-in" : ""
                }`}
                style={{
                  backgroundColor: checked ? typeColor : "transparent",
                  border: checked
                    ? "none"
                    : isToday
                    ? `2px solid ${typeColor}`
                    : isFuture
                    ? "2px solid #E5E5E5"
                    : "2px solid #CCCCCC",
                }}
              >
                {checked ? (
                  <span className="text-white font-extrabold text-sm">✓</span>
                ) : (
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: isToday ? typeColor : "#CCCCCC" }}
                  >
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
