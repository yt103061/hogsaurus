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
  optionA: { label: string; value: string };
  optionB: { label: string; value: string };
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
