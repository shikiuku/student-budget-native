import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    console.log('AI Chat API呼び出し開始');
    
    const GEMINI_API_KEY = 'AIzaSyAuGVblKXSicbAp1VJDX3JJKVMLCaWGYO8';
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    const body = await request.json();
    const { message, userProfile } = body;
    
    console.log('受信したデータ:', { message, userProfile });
    
    if (!message || !userProfile) {
      return NextResponse.json(
        { error: 'メッセージとユーザープロフィールが必要です' },
        { status: 400 }
      );
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
あなたはMoney MomentのAIアシスタントです。ユーザーからの質問に対して、親しみやすく丁寧に答えてください。

ユーザー情報：
- お名前: ${userProfile.name || '未設定'}さん
- 都道府県: ${userProfile.prefecture || '未設定'}
- 年齢: ${userProfile.age || '未設定'}歳  
- 月間予算: ${userProfile.monthly_budget ? userProfile.monthly_budget.toLocaleString() + '円' : '未設定'}

ユーザーのメッセージ: ${message}

自然で親しみやすい日本語で答えてください。100-200文字程度でお願いします。
`;
    
    console.log('Gemini API呼び出し開始');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini応答:', text);
    
    return NextResponse.json({ 
      response: text.trim()
    });
    
  } catch (error) {
    console.error('AI Chat エラー:', error);
    
    return NextResponse.json(
      { 
        error: 'AI応答の生成に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}