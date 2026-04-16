import { DiagnosisQuestion } from "@/types";

// 10問、2〜3択混在
// スコア: +正=A側, -負=B側
// 軸ごとにスコアを合計 → 正またはゼロ=A, 負=B
export const QUESTIONS: DiagnosisQuestion[] = [
  // ── Axis UL: 首・肩(U) vs 腰・骨盤(L) ── 3問
  {
    id: 1,
    axis: "UL",
    text: "デスクワーク後、最初に「キてるな」と感じる場所は？",
    options: [
      { label: "首・肩がこって張る", score: 2 },
      { label: "腰・お尻が重だるくなる", score: -2 },
    ],
  },
  {
    id: 2,
    axis: "UL",
    text: "一番「もんでほしい」と感じる場所は？",
    options: [
      { label: "首〜肩甲骨あたり", score: 2 },
      { label: "どちらも同じくらい", score: 0 },
      { label: "腰〜臀部あたり", score: -2 },
    ],
  },
  {
    id: 3,
    axis: "UL",
    text: "「これが私の持病ポイント」と感じる部位は？",
    options: [
      { label: "首・肩・肩甲骨", score: 2 },
      { label: "腰・骨盤・坐骨まわり", score: -2 },
    ],
  },
  // ── Axis TD: 固まり(T) vs だるさ(D) ── 3問
  {
    id: 4,
    axis: "TD",
    text: "体の不調の感覚として近いのは？",
    options: [
      { label: "固まって・こわばって動かしにくい", score: 2 },
      { label: "だるくて・重くて力が出ない", score: -2 },
    ],
  },
  {
    id: 5,
    axis: "TD",
    text: "朝起きたとき、体はどんな状態？",
    options: [
      { label: "こわばってほぐれるまで時間がかかる", score: 2 },
      { label: "疲れが取れずもう一眠りしたい", score: -2 },
    ],
  },
  {
    id: 6,
    axis: "TD",
    text: "軽くストレッチをすると？",
    options: [
      { label: "動かすほど徐々に楽になる", score: 2 },
      { label: "あまり変わらない", score: 0 },
      { label: "動くとかえって疲れる", score: -2 },
    ],
  },
  // ── Axis EB: 眼精疲労(E) vs 体優位(B) ── 2問
  {
    id: 7,
    axis: "EB",
    text: "1日の終わりに最も強く感じるのは？",
    options: [
      { label: "目の奥の疲れ・頭の重さ", score: 2 },
      { label: "首・肩・腰のこりやだるさ", score: -2 },
    ],
  },
  {
    id: 8,
    axis: "EB",
    text: "スクリーンを長時間見ていると？",
    options: [
      { label: "目が疲れて頭や後頭部に響く", score: 2 },
      { label: "目より先に首・肩・腰がきつくなる", score: -2 },
    ],
  },
  // ── Axis CW: 局所(C) vs 全身(W) ── 2問
  {
    id: 9,
    axis: "CW",
    text: "不調の範囲は？",
    options: [
      { label: "特定の部位だけ集中して辛い", score: 2 },
      { label: "全身にじわじわ広がる感じ", score: -2 },
    ],
  },
  {
    id: 10,
    axis: "CW",
    text: "体調の波は？",
    options: [
      { label: "決まった部位だけが悪化する", score: 2 },
      { label: "部位も全身もどちらも出る", score: 0 },
      { label: "全身的に影響が出る", score: -2 },
    ],
  },
];

// 軸スコアから診断コードを生成
export function computeDinosaurCode(scores: number[]): string {
  const axisScores: Record<string, number> = { UL: 0, TD: 0, EB: 0, CW: 0 };
  QUESTIONS.forEach((q, i) => {
    axisScores[q.axis] += scores[i] ?? 0;
  });
  const ul = axisScores.UL >= 0 ? "U" : "L";
  const td = axisScores.TD >= 0 ? "T" : "D";
  const eb = axisScores.EB >= 0 ? "E" : "B";
  const cw = axisScores.CW >= 0 ? "C" : "W";
  return `${ul}${td}${eb}${cw}`;
}
