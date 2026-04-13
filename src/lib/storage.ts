import { UserData, CheckinRecord, PendingCheckin } from "@/types";

const STORAGE_KEY = "hogsaurus_user";
const PENDING_KEY = "hogsaurus_pending";

export function getTodayString(): string {
  // toLocaleDateString('sv') produces YYYY-MM-DD in local time (not UTC)
  // Prevents date mismatch for JST users between midnight and 9am UTC
  return new Date().toLocaleDateString("sv");
}

export function getUserData(): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserData;
  } catch {
    return null;
  }
}

export function saveUserData(data: UserData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getDinosaurCode(): string | null {
  return getUserData()?.dinosaurCode ?? null;
}

export function setDinosaurCode(code: string): void {
  const existing = getUserData();
  if (existing) {
    saveUserData({ ...existing, dinosaurCode: code });
  } else {
    saveUserData({
      dinosaurCode: code,
      streakDays: 0,
      lastCheckinDate: "",
      totalXP: 0,
      checkinHistory: [],
    });
  }
}

export function isCheckedInToday(): boolean {
  const data = getUserData();
  if (!data) return false;
  return data.lastCheckinDate === getTodayString();
}

export function updateStreak(data: UserData): UserData {
  const today = getTodayString();
  const last = data.lastCheckinDate;

  if (last === today) {
    return data;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let streakDays: number;
  if (last === yesterdayStr) {
    streakDays = data.streakDays + 1;
  } else {
    streakDays = 1;
  }

  const maxStreak = Math.max(data.maxStreak ?? data.streakDays, streakDays);
  return { ...data, streakDays, lastCheckinDate: today, maxStreak };
}

export function addXP(data: UserData, amount: number): UserData {
  return { ...data, totalXP: data.totalXP + amount };
}

export function savePendingCheckin(pending: PendingCheckin): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function getPendingCheckin(): PendingCheckin | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingCheckin;
  } catch {
    return null;
  }
}

export function clearPendingCheckin(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_KEY);
}

export function completeCheckin(
  feedback: "great" | "good" | "neutral",
  symptoms: string[],
  intensity: number
): void {
  const data = getUserData();
  if (!data) return;

  const xpMap = { great: 150, good: 100, neutral: 80 };
  const xp = xpMap[feedback];

  const record: CheckinRecord = {
    date: getTodayString(),
    symptoms,
    intensity,
    feedback,
  };

  const updated = updateStreak(data);
  const withXP = addXP(updated, xp);
  const withHistory = {
    ...withXP,
    checkinHistory: [...withXP.checkinHistory, record],
  };

  saveUserData(withHistory);
}
