import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    console.log('AI Chat API呼び出し開始');
    
    // 環境変数を直接設定
    const GEMINI_API_KEY = 'AIzaSyAuGVblKXSicbAp1VJDX3JJKVMLCaWGYO8';
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    const { message, userProfile, model, chatHistory } = await request.json();
    console.log('受信したメッセージ:', message);
    console.log('選択されたモデル:', model);
    
    if (!message || !userProfile) {
      return NextResponse.json(
        { error: 'メッセージとユーザープロフィールが必要です' },
        { status: 400 }
      );
    }
    
    const selectedModel = 'gemini-1.5-flash';
    const aiModel = genAI.getGenerativeModel({ model: selectedModel });
    
    // チャット履歴から文脈を構築
    const conversationContext = chatHistory
      .slice(-5) // 最新5件のメッセージのみ使用
      .map((msg: any) => `${msg.type === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`)
      .join('\n');

    // メッセージに応じて異なる応答を生成
    let prompt = '';
    let shouldReturnRecommendations = false;

    // お得情報や補助金に関するキーワードをチェック
    const dealKeywords = ['お得', '割引', '補助金', '特典', '安い', '節約', '助成'];
    const hasDealKeywords = dealKeywords.some(keyword => message.includes(keyword));

    if (hasDealKeywords) {
      shouldReturnRecommendations = true;
      prompt = `
あなたはMoney MomentのAIアシスタントです。ユーザーからの質問に対して、親しみやすく丁寧に答えてください。

【重要】お得情報を提供する場合は、必ず「最新の正確な情報については公式サイトで確認してください」と案内してください。

ユーザー情報：
- お名前: ${userProfile.name || '未設定'}さん
- 都道府県: ${userProfile.prefecture || '未設定'}
- 年齢: ${userProfile.age || '未設定'}歳  
- 月間予算: ${userProfile.monthly_budget ? `${userProfile.monthly_budget.toLocaleString()}円` : '未設定'}

会話履歴：
${conversationContext}

ユーザーのメッセージ: ${message}

【応答形式】
以下のJSON形式で応答してください：
{
  "response": "ユーザーへの親しみやすい返答メッセージ（100-200文字）",
  "recommendations": [
    {
      "title": "具体的なタイトル",
      "description": "詳細説明（80文字以内）",
      "category": "subsidy",
      "amount": "具体的な金額",
      "deadline": "期限（あれば）",
      "source": "情報源"
    }
  ]
}

categoryは "subsidy", "discount", "benefit", "tip" のいずれかを使用してください。
recommendationsは2-3個程度にしてください。`;
    } else {
      prompt = `
あなたはMoney MomentのAIアシスタントです。家計管理、節約、学生生活に関するアドバイスを親しみやすく提供してください。

ユーザー情報：
- お名前: ${userProfile.name || '未設定'}さん
- 都道府県: ${userProfile.prefecture || '未設定'}
- 年齢: ${userProfile.age || '未設定'}歳  
- 月間予算: ${userProfile.monthly_budget ? `${userProfile.monthly_budget.toLocaleString()}円` : '未設定'}

会話履歴：
${conversationContext}

ユーザーのメッセージ: ${message}

【応答形式】
以下のJSON形式で応答してください：
{
  "response": "ユーザーへの親しみやすい返答メッセージ（100-200文字）"
}

自然で親しみやすい日本語で答えてください。絵文字も適度に使って構いません。`;
    }

    console.log('Gemini API生成開始');
    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini応答テキスト:', text.slice(0, 200) + '...');
    
    // JSONデータを抽出
    const jsonMatch = text.match(/\{\s*"response"[\s\S]*?\}/);
    if (jsonMatch) {
      const aiResponse = JSON.parse(jsonMatch[0]);
      console.log('JSON解析成功:', aiResponse);
      return NextResponse.json(aiResponse);
    }
    
    // JSON形式でない場合は、テキストをそのまま返す
    console.log('JSON形式が見つかりません。テキスト応答として処理');
    return NextResponse.json({ 
      response: text.trim() || 'すみません、うまく応答できませんでした。もう一度お試しください。' 
    });
    
  } catch (error) {
    console.error('AI Chat エラー詳細:', error);
    
    return NextResponse.json(
      { 
        error: 'AI応答の生成に失敗しました',
        details: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
      },
      { status: 500 }
    );
  }
}