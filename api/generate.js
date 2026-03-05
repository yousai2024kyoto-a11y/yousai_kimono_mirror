// api/generate.js
import { GoogleGenAI } from "@google/genai";

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageBase64, promptText } = req.body;

  if (!imageBase64 || !promptText) {
    return res.status(400).json({ error: '画像データまたはプロンプトがありません' });
  }

  try {
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = "image/jpeg";
    let pureBase64 = imageBase64;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      pureBase64 = matches[2];
    } else if (imageBase64.includes(',')) {
      pureBase64 = imageBase64.split(',')[1];
    }

    const ai = new GoogleGenAI({});
    const prompt = [
      { text: promptText },
      { inlineData: { mimeType: mimeType, data: pureBase64 } },
    ];

    console.log("⏳ [Backend] Geminiへリクエストを送信します...");

    // 🌟 最強の自動リトライ機能（最大2回まで挑戦する）
    let response;
    let attempt = 1;
    while (attempt <= 2) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image-preview",
          contents: prompt,
        });
        break; // 成功したらループを抜け出す！
      } catch (err) {
        console.error(`🔥 [Backend] 試行 ${attempt} 回目でエラー:`, err.message);
        if (attempt === 2) throw err; // 2回目もダメなら諦めてエラーを投げる
        
        console.log("🔄 [Backend] 1秒待機して自動再挑戦します...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待つ
        attempt++;
      }
    }

    console.log("✅ [Backend] Geminiからレスポンスが返ってきました！");

    let generatedImageBase64 = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        generatedImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (generatedImageBase64) {
      res.status(200).json({ newImage: generatedImageBase64 });
    } else {
      res.status(500).json({ error: '画像の抽出に失敗しました' });
    }

  } catch (error) {
    console.error("🔥 [Backend] 最終エラー:", error);
    res.status(500).json({ error: 'Gemini API Error', message: error.message });
  }
}