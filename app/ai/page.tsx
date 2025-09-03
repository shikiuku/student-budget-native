"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain,
  MapPin,
  Calendar,
  GraduationCap,
  Sparkles,
  Gift,
  DollarSign,
  Info,
  User,
  ChevronRight,
  Loader2,
  Send,
  Settings,
  Plus
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { useAuth } from "@/components/auth-provider"
import { userProfileService } from '@/lib/database'
import type { UserProfile } from '@/lib/types'

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  recommendations?: AIRecommendation[]
}

interface AIRecommendation {
  id: string
  title: string
  description: string
  category: 'subsidy' | 'discount' | 'benefit' | 'tip'
  amount?: string
  deadline?: string
  url?: string
  source: string
}

export default function AIPage() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash')
  const [showModelSelector, setShowModelSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ユーザープロフィール取得と初期メッセージ
  useEffect(() => {
    if (user) {
      loadUserProfile()
      // 初期ウェルカムメッセージ
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: 'こんにちは！私はMoney MomentのAIアシスタントです。お得情報の検索、節約アドバイス、家計管理のご相談など、何でもお気軽にお話しください！',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return
    try {
      const result = await userProfileService.getProfile(user.id)
      if (result.success && result.data) {
        setUserProfile(result.data)
      }
    } catch (error) {
      console.error('ユーザープロフィール取得エラー:', error)
    }
  }

  // メッセージ送信
  const sendMessage = async (content: string) => {
    if (!content.trim() || !userProfile) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content,
          userProfile, 
          model: selectedModel,
          chatHistory: messages 
        }),
      });

      if (!response.ok) {
        throw new Error('AI応答の取得に失敗しました');
      }

      const { response: aiResponse, recommendations } = await response.json();
      
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        recommendations
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI応答エラー:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: '申し訳ございません。現在AIサービスに問題が発生しています。しばらくお待ちください。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // クイック返信用の関数
  const sendQuickReply = (message: string) => {
    sendMessage(message)
  }

  // Enter キー送信
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'subsidy':
        return { 
          label: '補助金・奨学金', 
          color: 'bg-green-100 text-green-700',
          icon: Gift 
        }
      case 'discount':
        return { 
          label: '割引情報', 
          color: 'bg-blue-100 text-blue-700',
          icon: DollarSign 
        }
      case 'benefit':
        return { 
          label: '特典', 
          color: 'bg-purple-100 text-purple-700',
          icon: Sparkles 
        }
      case 'tip':
        return { 
          label: 'アドバイス', 
          color: 'bg-orange-100 text-orange-700',
          icon: Info 
        }
      default:
        return { 
          label: 'その他', 
          color: 'bg-gray-100 text-gray-700',
          icon: Info 
        }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-zaim-blue-500" />
            <h1 className="text-lg font-bold text-gray-800">AIアシスタント</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">ログインが必要です</h2>
            <p className="text-gray-600">
              ログインしてパーソナライズされたAIアシスタントとチャットしましょう
            </p>
          </div>
        </div>

        <div className="relative z-30">
          <BottomNav currentPage="ai" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-zaim-blue-500" />
            <h1 className="text-lg font-bold text-gray-800">AIアシスタント</h1>
            <Badge className="bg-green-100 text-green-700 text-xs">{selectedModel}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="プロフィール画像"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
            </div>
          </div>
        </div>

        {/* Model Selection (collapsible) */}
        {showModelSelector && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-black mb-2">AIモデル選択</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="gemini-flash"
                  name="model"
                  value="gemini-1.5-flash"
                  checked={selectedModel === 'gemini-1.5-flash'}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-3 h-3 text-zaim-blue-600"
                />
                <label htmlFor="gemini-flash" className="text-xs text-black">
                  Flash 1.5 <Badge className="ml-1 bg-green-100 text-green-700 text-xs px-1 py-0">高速</Badge>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="gemini-pro"
                  name="model"
                  value="gemini-1.5-pro"
                  checked={selectedModel === 'gemini-1.5-pro'}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-3 h-3 text-zaim-blue-600"
                />
                <label htmlFor="gemini-pro" className="text-xs text-black">
                  Pro 1.5 <Badge className="ml-1 bg-blue-100 text-blue-700 text-xs px-1 py-0">高性能</Badge>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="gemini-flash-8b"
                  name="model"
                  value="gemini-1.5-flash-8b"
                  checked={selectedModel === 'gemini-1.5-flash-8b'}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-3 h-3 text-zaim-blue-600"
                />
                <label htmlFor="gemini-flash-8b" className="text-xs text-black">
                  Flash 8B <Badge className="ml-1 bg-orange-100 text-orange-700 text-xs px-1 py-0">最高速</Badge>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="gemini-2-flash"
                  name="model"
                  value="gemini-2.0-flash-exp"
                  checked={selectedModel === 'gemini-2.0-flash-exp'}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-3 h-3 text-zaim-blue-600"
                />
                <label htmlFor="gemini-2-flash" className="text-xs text-black">
                  Flash 2.0 <Badge className="ml-1 bg-purple-100 text-purple-700 text-xs px-1 py-0">実験版</Badge>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : message.type === 'system' ? 'justify-center' : 'justify-start'}`}>
            {message.type === 'ai' && (
              <div className="w-8 h-8 bg-zaim-blue-500 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <Brain className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${
              message.type === 'user' 
                ? 'bg-zaim-blue-500 text-white rounded-lg rounded-br-none' 
                : message.type === 'system'
                ? 'bg-gray-200 text-gray-700 rounded-lg mx-4'
                : 'bg-white border border-gray-200 rounded-lg rounded-bl-none text-gray-800'
            } p-3 shadow-sm`}>
              <div className="text-sm">{message.content}</div>
              
              {/* Recommendations in chat */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.recommendations.map((rec) => {
                    const categoryInfo = getCategoryInfo(rec.category)
                    const CategoryIcon = categoryInfo.icon
                    return (
                      <div key={rec.id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-start gap-2">
                          <CategoryIcon className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-800 text-sm">{rec.title}</h4>
                              <Badge className={`${categoryInfo.color} text-xs px-1 py-0`}>
                                {categoryInfo.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-700 mb-2">{rec.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-600">
                                {rec.amount && <span className="font-medium text-zaim-green-600">{rec.amount}</span>}
                                {rec.deadline && <span className="text-red-600 ml-2">期限: {rec.deadline}</span>}
                              </div>
                              {rec.url && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(rec.url, '_blank')}
                                  className="text-xs h-6 px-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  詳細
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt="プロフィール画像"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-gray-600" />
                )}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-zaim-blue-500 rounded-full flex items-center justify-center mr-2 mt-1">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state with quick actions */}
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-zaim-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-zaim-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">AI会話を開始</h3>
              <p className="text-gray-600 mb-4 text-sm">
                {userProfile?.name}さん、何についてお話ししましょうか？
              </p>
              
              {/* Quick action buttons */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendQuickReply('お得な割引情報を教えて')}
                  className="w-full text-left justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  お得な割引情報を教えて
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendQuickReply('節約のコツを教えて')}
                  className="w-full text-left justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  節約のコツを教えて
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendQuickReply('学生向けの補助金を調べて')}
                  className="w-full text-left justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  学生向けの補助金を調べて
                </Button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input (Fixed Bottom) */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={userProfile ? `${userProfile.name}さん、何かお聞きしたいことはありますか？` : 'メッセージを入力...'}
              disabled={isTyping}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-500"
            />
          </div>
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isTyping}
            size="sm"
            className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white rounded-full w-12 h-12 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative z-30">
        <BottomNav currentPage="ai" />
      </div>
    </div>
  )
}