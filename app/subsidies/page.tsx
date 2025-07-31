"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gift, MapPin, Calendar, ExternalLink, Search } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function SubsidiesPage() {
  const subsidies = [
    {
      id: 1,
      title: "高校生等奨学給付金",
      description: "高校生の教育費を支援する給付金制度",
      amount: "年額32,300円〜138,000円",
      deadline: "2024年7月31日",
      region: "全国",
      category: "教育",
      requirements: ["高校生", "住民税非課税世帯"],
      status: "申請可能",
    },
    {
      id: 2,
      title: "子育て世帯生活支援特別給付金",
      description: "18歳以下の子どもがいる世帯への給付金",
      amount: "児童1人あたり5万円",
      deadline: "2024年3月31日",
      region: "東京都",
      category: "生活支援",
      requirements: ["18歳以下", "住民税非課税世帯"],
      status: "受付終了",
    },
    {
      id: 3,
      title: "学習塾代助成",
      description: "中学3年生の学習塾費用を助成",
      amount: "月額2万円まで",
      deadline: "随時受付",
      region: "大阪府",
      category: "教育",
      requirements: ["中学3年生", "世帯年収400万円以下"],
      status: "申請可能",
    },
    {
      id: 4,
      title: "高校生通学費補助",
      description: "公共交通機関の通学定期代を補助",
      amount: "月額5,000円まで",
      deadline: "2024年4月30日",
      region: "神奈川県",
      category: "交通",
      requirements: ["高校生", "通学距離2km以上"],
      status: "申請可能",
    },
  ]

  const categoryColors = {
    教育: "bg-zaim-blue-100 text-zaim-blue-600",
    生活支援: "bg-zaim-green-100 text-zaim-green-600",
    交通: "bg-purple-100 text-purple-600",
    医療: "bg-zaim-red-100 text-zaim-red-600",
  }

  const statusColors = {
    申請可能: "bg-zaim-green-100 text-zaim-green-600",
    受付終了: "bg-gray-100 text-gray-600",
    準備中: "bg-zaim-yellow-100 text-zaim-yellow-600",
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6 pt-6">

        {/* Search and Filter */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input placeholder="補助金を検索..." className="w-full border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black" />
              </div>
              <Button size="icon" variant="outline" className="border-zaim-blue-200 text-zaim-blue-600 hover:bg-zaim-blue-50">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select>
                <SelectTrigger className="border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="地域を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全国</SelectItem>
                  <SelectItem value="tokyo">東京都</SelectItem>
                  <SelectItem value="osaka">大阪府</SelectItem>
                  <SelectItem value="kanagawa">神奈川県</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="education">教育</SelectItem>
                  <SelectItem value="support">生活支援</SelectItem>
                  <SelectItem value="transport">交通</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Profile Setup Notice */}
        <div className="bg-zaim-yellow-50 border border-zaim-yellow-500 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-black">プロフィール設定</h3>
              <p className="text-sm text-gray-600">年齢・地域を設定してパーソナライズ</p>
            </div>
            <Button className="bg-zaim-yellow-500 hover:bg-zaim-yellow-600 text-white">
              設定する
            </Button>
          </div>
        </div>

        {/* Subsidies List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-black">利用可能な補助金</h2>

          {subsidies.map((subsidy) => (
            <Card key={subsidy.id} className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{subsidy.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={categoryColors[subsidy.category as keyof typeof categoryColors]}>
                        {subsidy.category}
                      </Badge>
                      <Badge className={statusColors[subsidy.status as keyof typeof statusColors]}>
                        {subsidy.status}
                      </Badge>
                    </div>
                  </div>
                  <Gift className="h-5 w-5 text-zaim-green-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{subsidy.description}</p>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-zaim-green-50 rounded-lg">
                    <span className="text-sm font-medium text-black">支給額</span>
                    <span className="font-bold text-zaim-green-600">{subsidy.amount}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>締切: {subsidy.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{subsidy.region}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-black mb-2">対象条件</h4>
                  <div className="flex flex-wrap gap-1">
                    {subsidy.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-zaim-green-500 hover:bg-zaim-green-600 text-white" size="sm">
                    詳細を見る
                  </Button>
                  <Button variant="outline" size="sm" className="border-zaim-blue-200 text-zaim-blue-600 hover:bg-zaim-blue-50 hover:text-zaim-blue-700">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    申請サイト
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <div className="bg-zaim-blue-50 border border-zaim-blue-500 rounded-lg p-4">
          <h3 className="text-lg font-bold text-black mb-4">あなたの補助金活用状況</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-lg font-bold text-zaim-blue-600">2</div>
              <div className="text-xs text-gray-600">申請可能</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-lg font-bold text-zaim-green-600">1</div>
              <div className="text-xs text-gray-600">申請済み</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-lg font-bold text-purple-600">¥50,000</div>
              <div className="text-xs text-gray-600">受給予定額</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav currentPage="subsidies" />
    </div>
  )
}
