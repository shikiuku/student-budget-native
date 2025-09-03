"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  Plus,
  Trash2,
  MessageCircle,
  History
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

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
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
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return `session_${Date.now()}`
  })
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('money-moment-chat-sessions')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return parsed.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }))
        } catch (error) {
          console.error('チャットセッション履歴の読み込みエラー:', error)
        }
      }
    }
    return []
  })
  const [showChatList, setShowChatList] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // 既存の単一履歴から新形式に移行
    if (typeof window !== 'undefined') {
      const oldSaved = localStorage.getItem('money-moment-chat-history')
      if (oldSaved) {
        try {
          const parsed = JSON.parse(oldSaved)
          const oldMessages = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
          // 旧形式のデータを削除
          localStorage.removeItem('money-moment-chat-history')
          return oldMessages
        } catch (error) {
          console.error('旧チャット履歴の読み込みエラー:', error)
        }
      }
    }
    return []
  })
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const selectedModel = 'gemini-1.5-flash'
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // セッションとメッセージの保存
  const saveCurrentSession = useCallback(() => {
    if (messages.length === 0 || typeof window === 'undefined') return
    
    // ユーザーからのメッセージが1つでもあるかチェック（ウェルカムメッセージ以外）
    const hasUserMessage = messages.some(msg => msg.type === 'user')
    if (!hasUserMessage) {
      // ユーザーメッセージがない場合は保存しない
      return
    }
    
    const sessionTitle = messages.find(msg => msg.type === 'user')?.content.slice(0, 30) + '...' || '新しい会話'
    const now = new Date()
    
    setChatSessions(prev => {
      const currentSession: ChatSession = {
        id: currentSessionId,
        title: sessionTitle,
        messages: messages,
        createdAt: prev.find(s => s.id === currentSessionId)?.createdAt || now,
        updatedAt: now
      }
      
      const updatedSessions = prev.filter(s => s.id !== currentSessionId)
      updatedSessions.unshift(currentSession)
      
      // 最新20セッションまで保持
      const limitedSessions = updatedSessions.slice(0, 20)
      
      localStorage.setItem('money-moment-chat-sessions', JSON.stringify(limitedSessions))
      return limitedSessions
    })
  }, [messages, currentSessionId])

  // messages が変更されたときに自動保存
  useEffect(() => {
    if (messages.length > 0) {
      saveCurrentSession()
    }
  }, [messages, saveCurrentSession])

  // ユーザープロフィール取得と初期メッセージ
  useEffect(() => {
    if (user) {
      loadUserProfile()
      // 履歴がない場合のみウェルカムメッセージを追加
      setMessages(prev => {
        if (prev.length === 0) {
          const welcomeMessage: ChatMessage = {
            id: 'welcome',
            type: 'ai',
            content: 'こんにちは！私はMoney MomentのAIアシスタントです。お得情報の検索、節約アドバイス、家計管理のご相談など、何でもお気軽にお話しください！',
            timestamp: new Date()
          }
          return [welcomeMessage]
        }
        return prev
      })
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
          userProfile
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

  // 新しい会話を開始
  const startNewChat = () => {
    // 現在のセッションを保存してから新しいセッションを開始
    // ただし、ユーザーメッセージがある場合のみ保存
    if (messages.length > 0) {
      const hasUserMessage = messages.some(msg => msg.type === 'user')
      if (hasUserMessage) {
        saveCurrentSession()
      }
    }
    
    const newSessionId = `session_${Date.now()}`
    setCurrentSessionId(newSessionId)
    setMessages([])
    setShowChatList(false)
    
    // ウェルカムメッセージを表示
    if (user) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: 'こんにちは！私はMoney MomentのAIアシスタントです。お得情報の検索、節約アドバイス、家計管理のご相談など、何でもお気軽にお話しください！',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }

  // 過去のセッションを読み込み
  const loadSession = (session: ChatSession) => {
    // 現在のセッションを保存
    // ただし、ユーザーメッセージがある場合のみ保存
    if (messages.length > 0) {
      const hasUserMessage = messages.some(msg => msg.type === 'user')
      if (hasUserMessage) {
        saveCurrentSession()
      }
    }
    
    setCurrentSessionId(session.id)
    setMessages(session.messages)
    setShowChatList(false)
  }

  // セッションを削除
  const deleteSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId)
    setChatSessions(updatedSessions)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('money-moment-chat-sessions', JSON.stringify(updatedSessions))
    }
    
    // 現在のセッションが削除された場合は新しい会話を開始
    if (sessionId === currentSessionId) {
      startNewChat()
    }
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
    <div className="min-h-screen bg-gray-50 pb-20 flex">
      {/* Left Sidebar - Chat History */}
      {showChatList && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">会話履歴</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChatList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            <Button
              onClick={startNewChat}
              className="w-full mt-3 bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white"
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              新しい会話
            </Button>
          </div>
          
          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {chatSessions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">まだ会話履歴がありません</p>
              ) : (
                chatSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`rounded-lg border p-3 hover:bg-gray-50 transition-colors ${
                      session.id === currentSessionId ? 'bg-zaim-blue-50 border-zaim-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => loadSession(session)}
                      className="w-full justify-start text-left h-auto p-0 hover:bg-transparent"
                    >
                      <div className="flex flex-col items-start w-full">
                        <span className="text-sm font-medium text-gray-800 truncate w-full">
                          {session.title}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {session.updatedAt.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} {session.updatedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSession(session.id)}
                      className="text-gray-400 hover:text-red-500 mt-2 w-full"
                      title="削除"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      削除
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-zaim-blue-500" />
              <h1 className="text-lg font-bold text-gray-800">AIアシスタント</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChatList(!showChatList)}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                title="会話履歴"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={startNewChat}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                title="新しい会話"
              >
                <MessageCircle className="h-4 w-4" />
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
        </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : message.type === 'system' ? 'justify-center' : 'justify-start'}`}>
            {message.type === 'ai' && (
              <div className="w-10 h-10 bg-zaim-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0 shadow-md">
                <Brain className="h-5 w-5 text-white" />
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full overflow-hidden flex items-center justify-center ml-3 mt-1 flex-shrink-0 shadow-md border-2 border-white">
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt="プロフィール画像"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-blue-700" />
                )}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-10 h-10 bg-zaim-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0 shadow-md">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-zaim-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-zaim-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-zaim-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
    </div>
  )
}