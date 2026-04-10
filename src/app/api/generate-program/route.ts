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

const TIME_LABEL: Record<string, string> = {
  morning: "朝（穏やかな強度）",
  noon: "昼（活性化系）",
  evening: "夜（回復・リラックス系）",
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(DEFAULT_PROGRAM);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `あなたはデスクワーカーの体の不調を解消するプロフェッショナルなストレッチ指導者です。

ユーザー情報:
- 恐竜タイプ: ${typeDescription}
- 今日の症状: ${symptoms.join("・")}
- 辛さレベル: ${intensity}/5
- 時間帯: ${TIME_LABEL[timeOfDay] ?? timeOfDay}

以下のJSON形式で今日の5分プログラムを返してください。他のテキストは一切含めないでください。

{
  "title": "今日のプログラム名（15文字以内）",
  "reason": "なぜこのプログラムか（40文字以内、体の状態を言語化）",
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

条件:
- 種目は3〜5個
- 合計時間が240〜360秒になるよう調整
- 器具不要・自宅や職場でできる動き
- 時間帯に合わせた強度（朝は穏やか、夜は回復系）`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(DEFAULT_PROGRAM);
    }

    const program = JSON.parse(jsonMatch[0]) as CareProgram;
    return Response.json(program);
  } catch {
    return Response.json(DEFAULT_PROGRAM);
  }
}
