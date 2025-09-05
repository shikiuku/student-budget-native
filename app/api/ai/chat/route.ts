import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1日の使用制限を管理するためのメモリストレージ（本番環境ではRedisなどを使用）
const dailyUsage = new Map<string, { count: number; date: string }>();

export async function POST(request: NextRequest) {
  try {
    console.log('AI Chat API呼び出し開始');
    
    const GEMINI_API_KEY = 'AIzaSyAuGVblKXSicbAp1VJDX3JJKVMLCaWGYO8';
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    const body = await request.json();
    const { message, userProfile, conversationHistory, userId } = body;
    
    console.log('受信したデータ:', { 
      message, 
      userProfile, 
      userId,
      conversationHistoryLength: conversationHistory?.length || 0
    });
    
    if (!message || !userProfile || !userId) {
      return NextResponse.json(
        { error: 'メッセージ、ユーザープロフィール、ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // 1日の使用制限チェック（5回まで）
    const today = new Date().toISOString().split('T')[0];
    const userUsage = dailyUsage.get(userId);
    
    if (userUsage) {
      if (userUsage.date === today) {
        if (userUsage.count >= 5) {
          return NextResponse.json(
            { 
              error: '1日の使用制限に達しました',
              resetTime: '明日の00:00にリセットされます'
            },
            { status: 429 }
          );
        }
        userUsage.count += 1;
      } else {
        // 新しい日になったらリセット
        userUsage.count = 1;
        userUsage.date = today;
      }
    } else {
      // 初回使用
      dailyUsage.set(userId, { count: 1, date: today });
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // 会話履歴を整形（最新10件まで）
    const historyText = conversationHistory && conversationHistory.length > 0
      ? conversationHistory.slice(-10).map((msg: any) => 
          `${msg.type === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
        ).join('\n')
      : '';

    const prompt = `
あなたはMoney MomentのAIアシスタントです。ユーザーからの質問に対して、親しみやすく丁寧に答えてください。

ユーザー情報：
- お名前: ${userProfile.name || '未設定'}さん
- 都道府県: ${userProfile.prefecture || '未設定'}
- 年齢: ${userProfile.age || '未設定'}歳  
- 月間予算: ${userProfile.monthly_budget ? userProfile.monthly_budget.toLocaleString() + '円' : '未設定'}

${historyText ? `これまでの会話履歴：
${historyText}

` : ''}現在のメッセージ: ${message}

会話の文脈を理解して、自然で親しみやすい日本語で答えてください。100-200文字程度でお願いします。
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