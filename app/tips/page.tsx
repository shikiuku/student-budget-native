"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Heart, 
  Star, 
  Share, 
  Bookmark, 
  TrendingUp, 
  Utensils, 
  GraduationCap, 
  Smartphone, 
  Bike,
  PlusCircle,
  User,
  Car,
  Gift,
  BookOpen,
  Shirt,
  MessageCircle,
  Tag
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [content, setContent] = useState('')

  // サンプル投稿データ
  const posts = [
    {
      id: 1,
      title: "お弁当作りで食費を半分に！",
      content: "コンビニ弁当を毎日買ってたけど、お弁当を作るようになって月3,000円も節約できました！最初は面倒だったけど、慣れたら10分で作れます。冷凍食品を活用するのがコツです。",
      category: "食費",
      savings: "月3,000円",
      author: "田中さん",
      school: "高校2年生",
      timeAgo: "2時間前",
      likes: 24,
      comments: 5,
      isLiked: false,
      isBookmarked: true,
    },
    {
      id: 2,
      title: "自転車通学で交通費ゼロ！",
      content: "電車通学をやめて自転車にしました。雨の日は大変だけど、月2,000円の節約と運動不足解消で一石二鳥です！",
      category: "交通費",
      savings: "月2,000円",
      author: "佐藤さん",
      school: "大学1年生",
      timeAgo: "1日前",
      likes: 18,
      comments: 3,
      isLiked: true,
      isBookmarked: false,
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '食費': return Utensils
      case '交通費': return Car
      case '娯楽': return Gift
      case '学用品': return BookOpen
      case '衣類': return Shirt
      default: return PlusCircle
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6 pt-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-black">節約アイディア</h1>
        </div>

        {/* Featured Tip */}
        <div className="bg-zaim-blue-50 border border-zaim-blue-500 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-zaim-yellow-500" />
            <h2 className="text-lg font-bold text-black">今週のおすすめ</h2>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Utensils className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-black mb-1">お弁当作りで月3,000円節約！</h3>
              <p className="text-sm text-gray-700 mb-3">
                コンビニ弁当を週3回お弁当に変えるだけで大幅節約。簡単レシピも紹介！
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800">食費</Badge>
                <Badge className="bg-zaim-green-100 text-zaim-green-600">月3,000円節約</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-black">みんなの節約アイディア</h2>
          <div className="space-y-4">
            {posts.map((post) => {
              const CategoryIcon = getCategoryIcon(post.category);
              return (
                <Card key={post.id} className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-black">{post.author}</h3>
                          <Badge variant="secondary" className="text-xs">{post.school}</Badge>
                          <span className="text-xs text-gray-500">{post.timeAgo}</span>
                        </div>
                        <h4 className="font-bold text-black mb-2">{post.title}</h4>
                        <p className="text-sm text-gray-700 mb-3">{post.content}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <CategoryIcon className="h-4 w-4 text-gray-600" />
                            <Badge className="bg-gray-100 text-gray-800">{post.category}</Badge>
                          </div>
                          <Badge className="bg-zaim-green-100 text-zaim-green-600">{post.savings}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button className={`flex items-center gap-1 text-sm ${post.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}>
                              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                              {post.likes}
                            </button>
                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                              <MessageCircle className="h-4 w-4" />
                              {post.comments}
                            </button>
                          </div>
                          <button className={`p-1 rounded ${post.isBookmarked ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500 transition-colors`}>
                            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Create Post Button */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="fixed bottom-24 right-4 w-14 h-14 bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white rounded-full shadow-lg z-40 flex items-center justify-center transition-colors">
            <PlusCircle className="h-6 w-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black">節約アイディアを投稿</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-black mb-1 block">タイトル</label>
              <input 
                type="text" 
                placeholder="例：お弁当作りで食費節約"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-black">内容</label>
                <span className="text-xs text-gray-500">{content.length}/500</span>
              </div>
              <textarea 
                rows={4}
                maxLength={500}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="詳しい節約方法やコツを教えてください..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black resize-none modal-textarea"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#f8f9fa #ffffff'
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1 block">カテゴリを選択</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '食費', icon: Utensils, label: '食費' },
                  { value: '交通費', icon: Car, label: '交通費' },
                  { value: '娯楽', icon: Gift, label: '娯楽' },
                  { value: '学用品', icon: BookOpen, label: '学用品' },
                  { value: '衣類', icon: Shirt, label: '衣類' },
                  { value: 'その他', icon: Tag, label: 'その他' }
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <label key={category.value} className="flex flex-col items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="category" 
                        value={category.value}
                        className="peer sr-only"
                        checked={selectedCategory === category.value}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      />
                      <div className="w-full p-3 border-2 border-gray-200 rounded-lg peer-checked:border-zaim-blue-500 peer-checked:bg-zaim-blue-50 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col items-center space-y-1">
                          <Icon className="h-5 w-5 text-gray-600 peer-checked:text-zaim-blue-600" />
                          <span className="text-xs text-gray-700 peer-checked:text-zaim-blue-700">{category.label}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1 block">節約効果</label>
              <input 
                type="text" 
                placeholder="月1,000円"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black"
              />
            </div>
            <Button className="w-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white">
              投稿する
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative z-30">
        <BottomNav currentPage="tips" />
      </div>
    </div>
  )
}
