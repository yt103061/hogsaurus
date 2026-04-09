import { GoogleGenerativeAI } from "@google/generative-ai";
import { CareProgram } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export async function generateCareProgram(input: {
  dinosaurCode: string;
  symptoms: string[];
  intensity: number;
  timeOfDay: "morning" | "noon" | "evening";
}): Promise<CareProgram> {
  const prompt = `
    ユーザーの恐竜タイプ: ${input.dinosaurCode}
    今日の症状: ${input.symptoms.join("・")}
    辛さレベル: ${input.intensity}/5
    時間帯: ${input.timeOfDay}

    上記に最適な5分のストレッチプログラムをJSON形式で返してください。
    {
      "title": "今日のプログラム名",
      "reason": "なぜこのプログラムか（1文）",
      "exercises": [
        {
          "name": "種目名",
          "duration": 秒数,
          "instruction": "やり方（1〜2文）",
          "tip": "意識するポイント"
        }
      ],
      "afterMessage": "終わった後への一言"
    }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  // JSONブロックを抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini response did not contain valid JSON");
  }
  return JSON.parse(jsonMatch[0]) as CareProgram;
}
