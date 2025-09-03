import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateRecommendations(userProfile: {
  name: string | null;
  prefecture: string | null;
  age?: number | null;
  monthly_budget?: number | null;
}) {
  try {
    console.log('Gemini API Key確認:', process.env.GEMINI_API_KEY ? 'あり' : 'なし');
    console.log('ユーザープロフィール:', userProfile);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
あなたは節約・お得情報アドバイザーです。以下のユーザー情報をもとに、2025年9月時点で利用できるお得な情報を3-4個提案してください。

ユーザー情報：
- 都道府県: ${userProfile.prefecture || '未設定'}
- 年齢: ${userProfile.age || '未設定'}歳
- 月間予算: ${userProfile.monthly_budget ? `${userProfile.monthly_budget.toLocaleString()}円` : '未設定'}

提案してほしい情報：
1. 年齢に応じた割引情報（携帯・交通・娯楽など）
2. 予算に合わせた節約アドバイス
3. 地域特有のお得情報・支援制度
4. 2025年9月現在利用可能な補助金・給付金

必ずJSON配列形式のみで回答してください：
[
  {
    "title": "具体的なタイトル",
    "description": "詳細説明（100文字以内）",
    "category": "subsidy",
    "amount": "具体的な金額",
    "deadline": "期限（あれば）",
    "source": "情報源"
  },
  {
    "title": "具体的なタイトル", 
    "description": "詳細説明（100文字以内）",
    "category": "discount",
    "amount": "具体的な割引額",
    "source": "情報源"
  }
]

categoryは "subsidy", "discount", "benefit", "tip" のいずれかを使用してください。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSONデータを抽出
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      return recommendations;
    }
    
    throw new Error('AI応答の形式が正しくありません');
  } catch (error) {
    console.error('Gemini API エラー:', error);
    throw error;
  }
}