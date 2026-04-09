import { DiagnosisQuestion } from "@/types";

export const QUESTIONS: DiagnosisQuestion[] = [
  {
    id: 1,
    axis: "UL",
    text: "一番つらいのはどこですか？",
    optionA: {
      label: "首・肩まわり",
      value: "U",
    },
    optionB: {
      label: "腰・骨盤まわり",
      value: "L",
    },
  },
  {
    id: 2,
    axis: "TD",
    text: "その不調の感じ方は？",
    optionA: {
      label: "固まる・こわばる感じ",
      value: "T",
    },
    optionB: {
      label: "だるい・重い感じ",
      value: "D",
    },
  },
  {
    id: 3,
    axis: "EB",
    text: "目の疲れはありますか？",
    optionA: {
      label: "目がしょぼしょぼ・頭が重い",
      value: "E",
    },
    optionB: {
      label: "目はそんなに気にならない",
      value: "B",
    },
  },
  {
    id: 4,
    axis: "CW",
    text: "不調の広がり方は？",
    optionA: {
      label: "ピンポイントで局所的",
      value: "C",
    },
    optionB: {
      label: "体全体にじわじわ広がる",
      value: "W",
    },
  },
];
