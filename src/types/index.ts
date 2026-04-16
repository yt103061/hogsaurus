export interface DinosaurType {
  code: string;
  name: string;
  species: string;
  catchphrase: string;
  themeColor: string;
  axes: {
    bodyPart: "U" | "L";
    quality: "T" | "D";
    eye: "E" | "B";
    spread: "C" | "W";
  };
}

export interface DiagnosisQuestion {
  id: number;
  axis: "UL" | "TD" | "EB" | "CW";
  text: string;
  labelA: string; // A極（左）の説明
  labelB: string; // B極（右）の説明
  valueA: "U" | "T" | "E" | "C";
  valueB: "L" | "D" | "B" | "W";
}

export interface Exercise {
  name: string;
  duration: number;
  instruction: string;
  tip: string;
}

export interface CareProgram {
  title: string;
  reason: string;
  exercises: Exercise[];
  afterMessage: string;
}

export interface UserData {
  dinosaurCode: string;
  streakDays: number;
  lastCheckinDate: string; // YYYY-MM-DD
  totalXP: number;
  checkinHistory: CheckinRecord[];
  maxStreak?: number;
}

export interface CheckinRecord {
  date: string;
  symptoms: string[];
  intensity: number;
  feedback: "great" | "good" | "neutral";
}

export interface PendingCheckin {
  symptoms: string[];
  intensity: number;
  timeOfDay: "morning" | "noon" | "evening";
  program: CareProgram;
}


export interface Exercise {
  name: string;
  duration: number;
  instruction: string;
  tip: string;
}

export interface CareProgram {
  title: string;
  reason: string;
  exercises: Exercise[];
  afterMessage: string;
}

export interface UserData {
  dinosaurCode: string;
  streakDays: number;
  lastCheckinDate: string; // YYYY-MM-DD
  totalXP: number;
  checkinHistory: CheckinRecord[];
  maxStreak?: number;
}

export interface CheckinRecord {
  date: string;
  symptoms: string[];
  intensity: number;
  feedback: "great" | "good" | "neutral";
}

export interface PendingCheckin {
  symptoms: string[];
  intensity: number;
  timeOfDay: "morning" | "noon" | "evening";
  program: CareProgram;
}
