import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    console.log('AI API呼び出し開始');
    
    // 環境変数を直接設定
    const GEMINI_API_KEY = 'AIzaSyAuGVblKXSicbAp1VJDX3JJKVMLCaWGYO8';
    console.log('Gemini API Key設定完了');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('Gemini AI初期化完了');
    
    const { userProfile, model } = await request.json();
    console.log('受信したユーザープロフィール:', userProfile);
    console.log('選択されたモデル:', model);
    
    if (!userProfile) {
      console.log('ユーザープロフィールなし');
      return NextResponse.json(
        { error: 'ユーザープロフィールが必要です' },
        { status: 400 }
      );
    }
    
    console.log('Gemini model取得開始');
    const selectedModel = model || 'gemini-1.5-flash';
    const aiModel = genAI.getGenerativeModel({ model: selectedModel });
    console.log('Gemini model取得完了:', selectedModel);
    
    const prompt = `
あなたは節約・お得情報アドバイザーです。以下のユーザー情報をもとに、一般的で継続的に利用可能なお得な情報を3-4個提案してください。

【重要】最新の正確な情報については必ず公式サイトで確認するよう案内してください。

ユーザー情報：
- 都道府県: ${userProfile.prefecture || '未設定'}
- 年齢: ${userProfile.age || '未設定'}歳  
- 月間予算: ${userProfile.monthly_budget ? `${userProfile.monthly_budget.toLocaleString()}円` : '未設定'}

提案してほしい情報：
1. 年齢層向けの一般的な割引制度
2. 予算に応じた節約方法
3. 地域で一般的に利用可能な制度
4. 学生向けの継続的な支援制度

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

    console.log('Gemini API生成開始');
    const result = await aiModel.generateContent(prompt);
    console.log('Gemini API応答受信');
    
    const response = await result.response;
    const text = response.text();
    console.log('Gemini応答テキスト:', text.slice(0, 200) + '...');
    
    // JSONデータを抽出
    const jsonMatch = text.match(/\[\s*{[\s\S]*}\s*\]/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      console.log('JSON解析成功:', recommendations);
      return NextResponse.json({ recommendations });
    }
    
    console.log('JSON形式が見つかりませんでした。全文:', text);
    throw new Error('AI応答の形式が正しくありません');
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('AI推奨情報生成エラー詳細:', error);
    console.error('エラーメッセージ:', (error as any)?.message);
    console.error('エラースタック:', (error as any)?.stack);
    console.error('エラーコード:', (error as any)?.code);
    console.error('エラー原因:', (error as any)?.cause);
    
    return NextResponse.json(
      { 
        error: 'AI推奨情報の生成に失敗しました',
        details: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined,
        errorType: (error as any)?.constructor?.name
      },
      { status: 500 }
    );
  }
}