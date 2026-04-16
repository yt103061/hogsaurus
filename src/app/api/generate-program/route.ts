import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDinosaur } from "@/lib/dinosaurs";
import { CareProgram } from "@/types";

const DEFAULT_PROGRAM: CareProgram = {
  title: "基本リフレッシュ",
  reason: "全身の緊張をほぐして、体をリセットします",
  exercises: [
    {
      name: "首回し",
      duration: 30,
      instruction: "ゆっくり首を左右に回します",
      tip: "肩を下げたまま行う",
    },
    {
      name: "肩甲骨寄せ",
      duration: 30,
      instruction: "肩甲骨を背中の中心に寄せて10秒キープします",
      tip: "胸を開くイメージで",
    },
    {
      name: "腰ひねり",
      duration: 40,
      instruction: "椅子に座ったまま上体をゆっくり左右にひねります",
      tip: "呼吸を止めない",
    },
    {
      name: "深呼吸",
      duration: 30,
      instruction: "鼻から4秒吸って、口から8秒かけてゆっくり吐きます",
      tip: "お腹を膨らませるように",
    },
  ],
  afterMessage: "お疲れさまでした！体が少し楽になりましたか？",
};

// 症状ごとの重点アプローチ
const SYMPTOM_APPROACH: Record<string, string> = {
  "首・後頭部が重い": "首の前後左右のストレッチ、後頭下筋群のほぐし、胸鎖乳突筋のリリース",
  "肩・肩甲骨が固い": "肩甲骨の内転・外転、胸椎の回旋、大胸筋・小胸筋のストレッチ",
  "腰・お尻が重だるい": "股関節屈筋群（腸腰筋）のリリース、梨状筋ストレッチ、骨盤の前後傾",
  "目・頭が疲れている": "眼球運動、後頭部・側頭筋のほぐし、首の前面ストレッチ、深呼吸",
  "全体的にだるい": "全身の血流促進、体幹の緩やかな活性化、末端の血行改善、呼吸法",
  "今日は割と元気": "コンディション維持、体の軽い活性化、予防的なストレッチ",
};

const TIME_GUIDANCE: Record<string, string> = {
  morning: "朝：体を穏やかに覚醒させる動き。急激な負荷や深い前屈は避け、血流を促す軽めの動きで。",
  noon: "昼：集中力を回復させ眠気を覚ます動き。少し活動的な動きで覚醒を維持。",
  evening: "夜：副交感神経を優位にする回復系。ゆっくりとした動き、深い呼吸を多めに。",
};

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const {
      dinosaurCode,
      symptoms,
      intensity,
      timeOfDay,
    }: {
      dinosaurCode: string;
      symptoms: string[];
      intensity: number;
      timeOfDay: "morning" | "noon" | "evening";
    } = body;

    const dinosaur = getDinosaur(dinosaurCode);
    const typeDescription = dinosaur
      ? `${dinosaur.name}（${dinosaur.species}）- ${dinosaur.catchphrase}`
      : dinosaurCode;

    console.log("[generate-program] request:", { dinosaurCode, symptoms, intensity, timeOfDay });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[generate-program] GEMINI_API_KEY not set → DEFAULT");
      return Response.json({ ...DEFAULT_PROGRAM, _source: "default:no-key" });
    }
    console.log("[generate-program] API key found, calling Gemini...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 1.0,
      },
    });

    // 症状ごとの重点アプローチを組み立て
    const approachList = symptoms
      .map((s) => SYMPTOM_APPROACH[s])
      .filter(Boolean)
      .map((a, i) => `  ${i + 1}. ${symptoms[i]}：${a}`)
      .join("\n");

    const dateStr = new Date().toLocaleDateString("ja-JP", {
      month: "long",
      day: "numeric",
      weekday: "long",
    });

    const prompt = `あなたはデスクワーカーの体のケアを専門とするストレッチ指導者です。
今日（${dateStr}）のパーソナライズされたケアプログラムを作成してください。

【ユーザー状態】
- 恐竜タイプ: ${typeDescription}
- 今日の症状: ${symptoms.join("・")}
- 辛さレベル: ${intensity}/5（5が最も辛い）
- 実施時間帯: ${TIME_GUIDANCE[timeOfDay]}

【症状別の重点アプローチ（必ず反映してください）】
${approachList || "  全身のリフレッシュ、血流促進"}

【プログラム作成の指針】
- 症状に直接対応する種目を優先的に選ぶ
- 辛さ4〜5の場合は強度を下げ、丁寧でゆっくりした動きにする
- 辛さ1〜2の場合はしっかり効かせる動きにする
- 職場・在宅どちらでも椅子・デスクを使ってできる動き（床に寝転ぶのはNG）

以下のJSON形式のみを返してください。他のテキストは一切含めないでください。

{
  "title": "今日のプログラム名（15文字以内）",
  "reason": "なぜこのプログラムか（40文字以内、症状と体の状態を言語化）",
  "exercises": [
    {
      "name": "種目名（10文字以内）",
      "duration": 秒数（20〜60の整数）,
      "instruction": "やり方（50文字以内）",
      "tip": "意識するポイント（30文字以内）"
    }
  ],
  "afterMessage": "終わった後への一言（30文字以内）"
}

条件：種目は3〜5個、合計240〜360秒`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("[generate-program] Gemini raw response (first 300 chars):", text.slice(0, 300));

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("[generate-program] no JSON found in response → DEFAULT");
      return Response.json({ ...DEFAULT_PROGRAM, _source: "default:no-json" });
    }

    const program = JSON.parse(jsonMatch[0]) as CareProgram;
    console.log("[generate-program] SUCCESS title:", program.title, "exercises:", program.exercises.length);
    return Response.json(program);
  } catch (error) {
    console.error("[generate-program] API error → DEFAULT:", error);
    return Response.json({ ...DEFAULT_PROGRAM, _source: "default:error" });
  }
}
