'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "@/components/post-card"
import type { Post } from '@/lib/api/posts'
import { EmptyPosts, EmptyExpenses, EmptyLikes } from "@/components/empty-state"
import { 
  Home, 
  CreditCard, 
  Lightbulb, 
  User, 
  Gift, 
  Upload,
  TrendingUp,
  Target,
  Heart,
  Bookmark,
  MessageCircle,
  Settings,
  PlusCircle,
  BarChart3,
  Calendar,
  Eye,
  Palette,
  Code,
  Smartphone,
  Monitor,
  AlertCircle,
  ArrowRight,
  Star,
  CheckCircle
} from "lucide-react"

export default function DevGuidePage() {
  const [activeTab, setActiveTab] = useState("overview")

  const samplePost: Post = {
    id: '1',
    title: 'コンビニ弁当をやめて自炊に挑戦！',
    content: '毎日コンビニ弁当を買っていたのですが、自炊を始めることで月15,000円の節約に成功しました。簡単なレシピから始めて...',
    category: '食費',
    savings_effect: '月15,000円の節約',
    savings_amount: 15000,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'demo-user',
    user_profiles: {
      id: 'demo-user',
      name: 'サンプルユーザー',
      school_type: 'university',
      grade: '2年生',
      category_icons: undefined,
      avatar_url: null
    },
    likes_count: 42,
    comments_count: 8,
    is_liked: true,
    is_bookmarked: false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-zaim-blue-500 via-zaim-blue-600 to-zaim-blue-700">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center text-white space-y-6">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-4">
              <Code className="h-6 w-6" />
              <span className="font-medium">開発者ドキュメント</span>
              <Badge variant="secondary" className="bg-white/90 text-zaim-blue-700">v0.1.0</Badge>
            </div>
            <h1 className="text-5xl font-bold mb-4">Money Moment</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              学生向け家計管理・節約支援アプリの完全開発ガイド
            </p>
            <p className="text-lg opacity-80 max-w-3xl mx-auto">
              Next.js + Supabase + TypeScriptで構築された、学生のお金の悩みを総合的にサポートするWebアプリケーション
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Button 
                className="bg-white text-zaim-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold"
                onClick={() => setActiveTab("overview")}
              >
                機能概要を見る
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold"
                onClick={() => setActiveTab("tech")}
              >
                技術仕様
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-16 rounded-none border-b-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-zaim-blue-500 data-[state=active]:text-zaim-blue-600 rounded-none h-full font-semibold"
              >
                機能概要
              </TabsTrigger>
              <TabsTrigger 
                value="pages" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-zaim-blue-500 data-[state=active]:text-zaim-blue-600 rounded-none h-full font-semibold"
              >
                ページ構成
              </TabsTrigger>
              <TabsTrigger 
                value="design" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-zaim-blue-500 data-[state=active]:text-zaim-blue-600 rounded-none h-full font-semibold"
              >
                デザインシステム
              </TabsTrigger>
              <TabsTrigger 
                value="tech" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-zaim-blue-500 data-[state=active]:text-zaim-blue-600 rounded-none h-full font-semibold"
              >
                技術仕様
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="py-12">
              <div className="max-w-6xl mx-auto px-6">
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                      <BarChart3 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">家計管理</h3>
                    <p className="text-gray-600 leading-relaxed">
                      支出記録・予算管理・分析機能を提供。PayPay連携で簡単データ取り込み。
                    </p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Lightbulb className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">節約情報共有</h3>
                    <p className="text-gray-600 leading-relaxed">
                      学生同士で節約術を投稿・共有。いいね・ブックマーク・コメント機能。
                    </p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Gift className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">学生支援</h3>
                    <p className="text-gray-600 leading-relaxed">
                      奨学金・助成金情報を地域別・学年別で検索・提供。
                    </p>
                  </div>
                </div>

                {/* Target Users Section */}
                <div className="bg-white rounded-2xl p-8 mb-16 border border-gray-200">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">ターゲットユーザー</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      お金の管理に不慣れな学生が、楽しく節約を学べるプラットフォーム
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-xl">
                      <div className="text-2xl mb-2">🎓</div>
                      <h4 className="font-semibold text-gray-900 mb-2">大学生</h4>
                      <p className="text-sm text-gray-600">一人暮らしで初めての家計管理</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-xl">
                      <div className="text-2xl mb-2">📚</div>
                      <h4 className="font-semibold text-gray-900 mb-2">高校生</h4>
                      <p className="text-sm text-gray-600">アルバイト代の賢い使い方を学習</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-xl">
                      <div className="text-2xl mb-2">💰</div>
                      <h4 className="font-semibold text-gray-900 mb-2">節約初心者</h4>
                      <p className="text-sm text-gray-600">同世代の節約術を参考にしたい</p>
                    </div>
                  </div>
                </div>

                {/* App Purpose */}
                <div className="text-center max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">アプリの特徴</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg text-gray-800">家計管理＋ソーシャル機能</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg text-gray-800">学生に特化した使いやすさ</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg text-gray-800">モバイルファースト設計</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg text-gray-800">リアルタイム情報共有</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg text-gray-800">学生向け支援情報提供</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        <span className="text-lg text-gray-800">PayPay連携で簡単記録</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pages" className="py-12">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">ページ構成</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    各ページの機能と実装されているUIコンポーネントの詳細
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                  {/* Home Page */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-zaim-blue-100 rounded-xl flex items-center justify-center">
                        <Home className="h-6 w-6 text-zaim-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">ホームページ</h3>
                        <p className="text-gray-600">/ (root)</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      ダッシュボード機能を提供する中心的なページ
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• 予算・支出状況の可視化</div>
                      <div>• カテゴリ別支出円グラフ</div>
                      <div>• 貯金残高表示</div>
                      <div>• 月末自動貯金機能</div>
                    </div>
                  </div>

                  {/* Expenses Page */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">支出管理</h3>
                        <p className="text-gray-600">/expenses</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      支出の記録・編集・分析を行うページ
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>• 支出記録フォーム</div>
                      <div>• カテゴリ別集計</div>
                      <div>• 期間別分析</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">空状態コンポーネント:</p>
                      <div className="scale-50 transform-origin-top-left">
                        <EmptyExpenses />
                      </div>
                    </div>
                  </div>

                  {/* Tips Page */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Lightbulb className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">節約投稿</h3>
                        <p className="text-gray-600">/tips</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      節約術の投稿・閲覧・交流ができるソーシャル機能
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>• 投稿作成・編集・削除</div>
                      <div>• いいね・ブックマーク</div>
                      <div>• コメント機能</div>
                      <div>• カテゴリ別検索</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">投稿カードサンプル:</p>
                      <div className="scale-75 transform-origin-top-left">
                        <PostCard 
                          post={samplePost} 
                          isLiked={false}
                          isBookmarked={false}
                          onLike={() => {}}
                          onBookmark={() => {}}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Page */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">プロフィール</h3>
                        <p className="text-gray-600">/profile</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      ユーザー情報管理とアクティビティ確認
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>• 投稿タブ - 自分の投稿一覧</div>
                      <div>• いいねタブ - いいねした投稿</div>
                      <div>• 保存済みタブ - ブックマーク</div>
                      <div>• 設定タブ - アカウント設定</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">空状態例（いいねタブ）:</p>
                      <div className="scale-50 transform-origin-top-left">
                        <EmptyLikes />
                      </div>
                    </div>
                  </div>

                  {/* Subsidies Page */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Gift className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">補助金情報</h3>
                        <p className="text-gray-600">/subsidies</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      学生向け奨学金・助成金情報の提供
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• 地域別フィルタリング</div>
                      <div>• 学年別適用条件</div>
                      <div>• 金額・期間情報</div>
                      <div>• 申請リンク提供</div>
                    </div>
                  </div>

                  {/* PayPay Page */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Upload className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">PayPay連携</h3>
                        <p className="text-gray-600">/paypay</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      CSVファイルアップロードによる支出データの自動取り込み
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>1. CSVファイル選択・アップロード</div>
                      <div>2. データ解析・カテゴリ自動分類</div>
                      <div>3. 支出データベースへの登録</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="py-12">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">デザインシステム</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    一貫性のあるユーザー体験を提供するデザイン原則とコンポーネント
                  </p>
                </div>
                
                {/* Design Principles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Eye className="h-8 w-8 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">学生に親しみやすい</h3>
                    <p className="text-gray-600">丸いフォントとやわらかい色使い</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Target className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">直感的な操作</h3>
                    <p className="text-gray-600">アイコンと日本語ラベルで分かりやすく</p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Smartphone className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">モバイル最適化</h3>
                    <p className="text-gray-600">片手操作可能なボトムナビゲーション</p>
                  </div>
                </div>

                {/* Color System */}
                <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="h-6 w-6 text-pink-500" />
                    <h3 className="text-2xl font-bold text-gray-900">カラーシステム</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-4 text-gray-800">プライマリカラー (zaim-blue)</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="w-full h-16 bg-zaim-blue-400 rounded-lg mb-2"></div>
                          <span className="text-xs text-gray-600">zaim-blue-400</span>
                        </div>
                        <div className="text-center">
                          <div className="w-full h-16 bg-zaim-blue-500 rounded-lg mb-2"></div>
                          <span className="text-xs font-bold text-gray-800">zaim-blue-500</span>
                        </div>
                        <div className="text-center">
                          <div className="w-full h-16 bg-zaim-blue-600 rounded-lg mb-2"></div>
                          <span className="text-xs text-gray-600">zaim-blue-600</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-4 text-gray-800">グレースケール</h4>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="w-full h-12 bg-gray-100 rounded-lg mb-1"></div>
                          <span className="text-xs text-gray-600">gray-100</span>
                        </div>
                        <div className="text-center">
                          <div className="w-full h-12 bg-gray-300 rounded-lg mb-1"></div>
                          <span className="text-xs text-gray-600">gray-300</span>
                        </div>
                        <div className="text-center">
                          <div className="w-full h-12 bg-gray-600 rounded-lg mb-1"></div>
                          <span className="text-xs text-gray-600">gray-600</span>
                        </div>
                        <div className="text-center">
                          <div className="w-full h-12 bg-gray-900 rounded-lg mb-1"></div>
                          <span className="text-xs text-gray-600">gray-900</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Monitor className="h-6 w-6 text-green-500" />
                    <h3 className="text-2xl font-bold text-gray-900">タイポグラフィ</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-800">フォント: M PLUS Rounded 1c</h4>
                      <p className="text-gray-700 mb-6">日本語に最適化された丸いフォント</p>
                      
                      <div className="space-y-4">
                        <div className="text-4xl font-bold text-gray-900">見出し 1 (4xl/bold)</div>
                        <div className="text-2xl font-bold text-gray-800">見出し 2 (2xl/bold)</div>
                        <div className="text-xl font-semibold text-gray-800">見出し 3 (xl/semibold)</div>
                        <div className="text-base text-gray-700">本文テキスト (base)</div>
                        <div className="text-sm text-gray-600">キャプション (sm/gray-600)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Component Examples */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="h-6 w-6 text-gray-500" />
                    <h3 className="text-2xl font-bold text-gray-900">UIコンポーネント</h3>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-semibold mb-4 text-gray-800">ボタンコンポーネント</h4>
                      <div className="flex flex-wrap gap-3">
                        <Button className="rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600">プライマリ</Button>
                        <Button variant="outline" className="rounded-full">セカンダリ</Button>
                        <Button variant="ghost" className="rounded-full">ゴースト</Button>
                        <Button size="sm" className="rounded-full">小サイズ</Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-4 text-gray-800">カードコンポーネント</h4>
                      <div className="max-w-sm">
                        <Card className="border-gray-200">
                          <CardHeader>
                            <CardTitle className="text-gray-900">サンプルカード</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600">
                              統一されたボーダーラジアスとシャドウを使用
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tech" className="py-12">
              <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">技術仕様</h2>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Code className="h-5 w-5 text-blue-500" />
                      <h3 className="text-xl font-semibold text-gray-800">技術スタック</h3>
                    </div>
                    
                    <div className="ml-7 space-y-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">フロントエンド</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Next.js 14 (App Router)</li>
                          <li>• TypeScript</li>
                          <li>• Tailwind CSS</li>
                          <li>• shadcn/ui (Radix UI)</li>
                          <li>• Lucide React Icons</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">バックエンド</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Supabase (PostgreSQL)</li>
                          <li>• Supabase Auth</li>
                          <li>• Row Level Security (RLS)</li>
                          <li>• リアルタイム機能</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-purple-700 mb-2">インフラ</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Vercel (ホスティング)</li>
                          <li>• GitHub (バージョン管理)</li>
                          <li>• Google OAuth認証</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <h3 className="text-xl font-semibold text-gray-800">アーキテクチャ</h3>
                    </div>
                    
                    <div className="ml-7 space-y-4">
                      <div>
                        <h4 className="font-medium mb-3 text-gray-800">ディレクトリ構造</h4>
                        <div className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono">
                          <div>app/</div>
                          <div>├── api/           # API Routes</div>
                          <div>├── expenses/      # 支出管理</div>
                          <div>├── tips/         # 節約投稿</div>
                          <div>├── profile/      # プロフィール</div>
                          <div>├── subsidies/    # 補助金情報</div>
                          <div>└── paypay/       # PayPay連携</div>
                          <div className="mt-2">components/</div>
                          <div>├── ui/           # shadcn/ui</div>
                          <div>├── auth-*        # 認証関連</div>
                          <div>└── post-card.tsx # 投稿カード</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-red-500" />
                      <h3 className="text-xl font-semibold text-gray-800">パフォーマンス指標</h3>
                    </div>
                    
                    <div className="ml-7 space-y-4">
                      <div>
                        <h4 className="font-medium mb-3 text-gray-800">Lighthouse目標値</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Performance</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                              </div>
                              <span className="text-sm font-medium">90+</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Accessibility</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                              </div>
                              <span className="text-sm font-medium">95+</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Best Practices</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                              </div>
                              <span className="text-sm font-medium">100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <h3 className="text-xl font-semibold text-gray-800">セキュリティ</h3>
                    </div>
                    
                    <div className="ml-7 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">認証・認可</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Supabase Authによる認証</li>
                          <li>• Google OAuth対応</li>
                          <li>• Row Level Security (RLS)による認可</li>
                          <li>• セッション管理</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">データ保護</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• HTTPSによる暗号化通信</li>
                          <li>• 個人情報の最小限の収集</li>
                          <li>• CSRF対策</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Smartphone className="h-5 w-5 text-purple-500" />
                      <h3 className="text-xl font-semibold text-gray-800">開発・デプロイ</h3>
                    </div>
                    
                    <div className="ml-7 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">開発環境</h4>
                        <p className="text-gray-700 mb-2">開発サーバー起動コマンド:</p>
                        <div className="bg-gray-900 text-white p-3 rounded text-sm font-mono">
                          npm run dev
                        </div>
                        <p className="text-gray-700 mt-2">http://localhost:3000 でアクセス</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">デプロイ</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Vercelによる自動デプロイ</li>
                          <li>• プレビューブランチ対応</li>
                          <li>• プロダクション環境の自動SSL設定</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Developer Notes - Outside of tabs */}
      <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">開発者向け注意事項</h3>
        </div>
        <div className="space-y-2 text-gray-700">
          <p>• このページは開発者専用です。一般ユーザーには表示されません。</p>
          <p>• 実際のUIコンポーネントを使用して機能を説明しています。</p>
          <p>• スタイルガイドページ (/styleguide) も併せてご確認ください。</p>
        </div>
      </div>
    </div>
  )
}