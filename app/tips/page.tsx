"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star, Share, Bookmark, TrendingUp, Utensils, GraduationCap, Smartphone, Bike } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function TipsPage() {
  const tips = [
    {
      id: 1,
      title: "お弁当作りで月3,000円節約！",
      description: "コンビニ弁当を週3回お弁当に変えるだけで大幅節約。簡単レシピも紹介！",
      category: "食費",
      difficulty: "簡単",
      savings: "月3,000円",
      likes: 124,
      bookmarked: true,
      icon: Utensils,
    },
    {
      id: 2,
      title: "学割を最大活用する方法",
      description: "映画館、カラオケ、交通機関など学割が使える場所をまとめました。",
      category: "娯楽",
      difficulty: "簡単",
      savings: "月2,000円",
      likes: 89,
      bookmarked: false,
      icon: GraduationCap,
    },
    {
      id: 3,
      title: "フリマアプリで不用品を現金化",
      description: "使わなくなった教科書や服をフリマアプリで売って小遣い稼ぎ！",
      category: "収入",
      difficulty: "普通",
      savings: "月5,000円",
      likes: 156,
      bookmarked: true,
      icon: Smartphone,
    },
    {
      id: 4,
      title: "自転車通学で交通費ゼロ",
      description: "電車やバス代を節約。健康にも良くて一石二鳥！雨の日対策も解説。",
      category: "交通費",
      difficulty: "普通",
      savings: "月4,000円",
      likes: 67,
      bookmarked: false,
      icon: Bike,
    },
  ]

  const campaigns = [
    {
      id: 1,
      title: "学生限定！スマホ料金半額キャンペーン",
      description: "大手キャリアの学割プランで通信費を大幅削減",
      deadline: "2024年3月31日まで",
      savings: "月2,000円",
      provider: "○○モバイル",
    },
    {
      id: 2,
      title: "教科書買取キャンペーン",
      description: "使い終わった教科書を高価買取。春の新学期前がチャンス！",
      deadline: "2024年2月29日まで",
      savings: "最大10,000円",
      provider: "○○ブックス",
    },
  ]

  const categoryColors = {
    食費: "bg-orange-100 text-orange-800",
    娯楽: "bg-purple-100 text-purple-800",
    収入: "bg-green-100 text-green-800",
    交通費: "bg-blue-100 text-blue-800",
    学用品: "bg-yellow-100 text-yellow-800",
  }

  const difficultyColors = {
    簡単: "bg-green-100 text-green-800",
    普通: "bg-yellow-100 text-yellow-800",
    難しい: "bg-red-100 text-red-800",
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">節約アイディア</h1>
          <p className="text-gray-600 text-sm">学生向けの節約術をチェック！</p>
        </div>

        {/* Featured Tip */}
        <Card className="bg-blue-50 border border-blue-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">今週のおすすめ</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Utensils className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">お弁当作りで月3,000円節約！</h3>
                <p className="text-sm text-gray-700 mb-3">
                  コンビニ弁当を週3回お弁当に変えるだけで大幅節約。簡単レシピも紹介！
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">食費</Badge>
                  <Badge className="bg-green-100 text-green-800">月3,000円節約</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">期間限定キャンペーン</h2>

          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-orange-50 border border-orange-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{campaign.title}</h3>
                    <p className="text-sm text-gray-700 mb-2">{campaign.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>提供: {campaign.provider}</span>
                      <span>•</span>
                      <span>{campaign.deadline}</span>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800 ml-2">{campaign.savings}</Badge>
                </div>
                <Button size="sm" className="w-full">
                  詳細を見る
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">節約アイディア一覧</h2>

          {tips.map((tip) => {
            const IconComponent = tip.icon
            return (
              <Card key={tip.id} className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{tip.title}</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {tip.bookmarked ? (
                            <Bookmark className="h-4 w-4 fill-current text-yellow-600" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{tip.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={categoryColors[tip.category as keyof typeof categoryColors]}>
                          {tip.category}
                        </Badge>
                        <Badge className={difficultyColors[tip.difficulty as keyof typeof difficultyColors]}>
                          {tip.difficulty}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {tip.savings}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
                            <Heart className="h-4 w-4" />
                            {tip.likes}
                          </button>
                          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                            <Share className="h-4 w-4" />
                            シェア
                          </button>
                        </div>
                        <Button size="sm" variant="outline">
                          詳細を見る
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Categories */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">カテゴリ別に探す</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(categoryColors).map(([category, colorClass]) => (
                <Button
                  key={category}
                  variant="outline"
                  className={`h-12 ${colorClass} border-current hover:opacity-80`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav currentPage="tips" />
    </div>
  )
}
