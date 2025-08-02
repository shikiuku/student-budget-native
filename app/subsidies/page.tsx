"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gift, MapPin, Calendar, ExternalLink, Search } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function SubsidiesPage() {
  return (
    <div className="min-h-screen bg-white pb-20 relative">
      {/* ぼかしオーバーレイ */}
      <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm"></div>
      
      {/* 近日公開メッセージ */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pb-20 pointer-events-none">
        <div className="text-center space-y-4 p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto bg-zaim-green-100 rounded-full flex items-center justify-center">
            <Gift className="h-8 w-8 text-zaim-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-black">学生向け補助金情報</h2>
          <p className="text-gray-600">奨学金や各種助成金の情報を</p>
          <p className="text-gray-600">準備中です</p>
          <div className="mt-6">
            <Badge className="bg-zaim-green-100 text-zaim-green-600 text-lg py-2 px-4">
              近日公開予定
            </Badge>
          </div>
        </div>
      </div>

      {/* 背景コンテンツ（ぼかし用） */}
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
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">全国</SelectItem>
                  <SelectItem value="tokyo" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">東京都</SelectItem>
                  <SelectItem value="osaka" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">大阪府</SelectItem>
                  <SelectItem value="kanagawa" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">神奈川県</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">すべて</SelectItem>
                  <SelectItem value="education" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">教育</SelectItem>
                  <SelectItem value="support" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">生活支援</SelectItem>
                  <SelectItem value="transport" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">交通</SelectItem>
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
          <div className="text-center text-gray-500 py-8">
            データを準備中...
          </div>
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

      <div className="relative z-30">
        <BottomNav currentPage="subsidies" />
      </div>
    </div>
  )
}
