import { DiagnosisQuestion } from "@/types";

// 11問 × 5択スペクトラム（MBTI方式）
// スコア: +2/+1/0/-1/-2 → 軸ごとに集計 → 正=A, 負=B
export const QUESTIONS: DiagnosisQuestion[] = [
  // ── Axis UL: 首・肩(U) vs 腰・骨盤(L) ── 3問
  {
    id: 1,
    axis: "UL",
    text: "仕事中、最初に「キてるな」と感じる場所は？",
    labelA: "首・肩が\nこって張る",
    labelB: "腰・お尻が\n重だるくなる",
    valueA: "U",
    valueB: "L",
  },
  {
    id: 2,
    axis: "UL",
    text: "マッサージや入浴で、特に「効く」と感じる場所は？",
    labelA: "首〜\n肩甲骨周辺",
    labelB: "腰〜\n臀部周辺",
    valueA: "U",
    valueB: "L",
  },
  {
    id: 3,
    axis: "UL",
    text: "「ここが私の持病ポイント」と感じる部位は？",
    labelA: "首・肩・\n肩甲骨あたり",
    labelB: "腰・骨盤・\n坐骨あたり",
    valueA: "U",
    valueB: "L",
  },
  // ── Axis TD: 固まり(T) vs だるさ(D) ── 3問
  {
    id: 4,
    axis: "TD",
    text: "体の不調の感じ方として近いのは？",
    labelA: "固まって\nこわばる感じ",
    labelB: "だるくて\n力が出ない感じ",
    valueA: "T",
    valueB: "D",
  },
  {
    id: 5,
    axis: "TD",
    text: "朝起きたとき、体の状態は？",
    labelA: "こわばって\nほぐれるまで時間がかかる",
    labelB: "疲れが取れず\nもう一眠りしたい",
    valueA: "T",
    valueB: "D",
  },
  {
    id: 6,
    axis: "TD",
    text: "軽くストレッチをすると？",
    labelA: "動かすほど\n徐々に楽になる",
    labelB: "動いても\nだるさは変わらない",
    valueA: "T",
    valueB: "D",
  },
  // ── Axis EB: 眼精疲労(E) vs 体優位(B) ── 2問
  {
    id: 7,
    axis: "EB",
    text: "1日の終わりに最も強く感じるのは？",
    labelA: "目の奥の疲れ・\n頭の重さ",
    labelB: "首・肩・腰の\nこりやだるさ",
    valueA: "E",
    valueB: "B",
  },
  {
    id: 8,
    axis: "EB",
    text: "長時間スクリーンを見ていると？",
    labelA: "目が疲れて\n頭や後頭部に響く",
    labelB: "目より先に\n首・肩・腰がきつくなる",
    valueA: "E",
    valueB: "B",
  },
  // ── Axis CW: 局所(C) vs 全身(W) ── 3問
  {
    id: 9,
    axis: "CW",
    text: "不調を感じる範囲は？",
    labelA: "特定の部位だけ\n集中している",
    labelB: "全身に\nじわじわ広がる",
    valueA: "C",
    valueB: "W",
  },
  {
    id: 10,
    axis: "CW",
    text: "ストレッチや運動の後は？",
    labelA: "特定の部位だけ\nスッキリした",
    labelB: "全身が\n軽くなった感じ",
    valueA: "C",
    valueB: "W",
  },
  {
    id: 11,
    axis: "CW",
    text: "天気が悪い日・気圧が下がる日は？",
    labelA: "決まった部位が\nズーンと悪化する",
    labelB: "全体的に\n重だるくなる",
    valueA: "C",
    valueB: "W",
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
