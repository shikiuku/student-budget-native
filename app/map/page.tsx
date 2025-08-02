"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Receipt } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function MapPage() {
  return (
    <div className="min-h-screen bg-white pb-20 relative">
      {/* ぼかしオーバーレイ */}
      <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm"></div>
      
      {/* 近日公開メッセージ */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pb-20 pointer-events-none">
        <div className="text-center space-y-4 p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-black">支出マップ</h2>
          <p className="text-gray-600">支出場所を地図で確認できる</p>
          <p className="text-gray-600">機能を準備中です</p>
          <div className="mt-6">
            <Badge className="bg-purple-100 text-purple-600 text-lg py-2 px-4">
              近日公開予定
            </Badge>
          </div>
        </div>
      </div>

      {/* 背景コンテンツ（ぼかし用） */}
      <div className="p-4 space-y-6 pt-6">

        {/* Map Placeholder */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-zaim-blue-500 mx-auto mb-2" />
              <p className="text-black font-medium">インタラクティブマップ</p>
              <p className="text-sm text-gray-500">支出場所をピンで表示</p>
            </div>

            {/* Sample pins */}
            <div className="absolute top-4 left-8 w-4 h-4 bg-zaim-blue-500 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute top-12 right-12 w-4 h-4 bg-zaim-blue-500 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute bottom-8 left-1/3 w-4 h-4 bg-zaim-blue-500 rounded-full border-2 border-white shadow-lg" />
          </div>
        </div>

        {/* Location List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-black">支出場所一覧</h2>
          <div className="text-center text-gray-500 py-8">
            支出場所データを準備中...
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-zaim-blue-50 border border-zaim-blue-500 rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-black mb-4">支出パターン分析</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-lg font-bold text-zaim-blue-600">3</div>
                <div className="text-sm text-gray-600">よく行く場所</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-lg font-bold text-purple-600">駅周辺</div>
                <div className="text-sm text-gray-600">最多支出エリア</div>
              </div>
            </div>
            <div className="p-3 bg-white/60 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>アドバイス:</strong> コンビニでの支出が多いです。お弁当を作ると節約できそう！
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-30">
        <BottomNav currentPage="map" />
      </div>
    </div>
  )
}
