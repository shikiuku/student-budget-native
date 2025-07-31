"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Receipt } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function MapPage() {
  const locations = [
    {
      id: 1,
      name: "セブンイレブン 駅前店",
      lat: 35.6762,
      lng: 139.6503,
      expenses: [
        { amount: 500, category: "食費", description: "コンビニ弁当", date: "2024-01-15" },
        { amount: 150, category: "食費", description: "ドリンク", date: "2024-01-14" },
      ],
    },
    {
      id: 2,
      name: "JR山手線 新宿駅",
      lat: 35.6896,
      lng: 139.7006,
      expenses: [{ amount: 300, category: "交通費", description: "電車代", date: "2024-01-15" }],
    },
    {
      id: 3,
      name: "TOHOシネマズ",
      lat: 35.658,
      lng: 139.7016,
      expenses: [{ amount: 1200, category: "娯楽", description: "映画鑑賞", date: "2024-01-14" }],
    },
  ]

  const categoryColors = {
    食費: "bg-orange-100 text-orange-800 border-orange-200",
    交通費: "bg-zaim-blue-100 text-zaim-blue-600 border-zaim-blue-200",
    娯楽: "bg-purple-100 text-purple-800 border-purple-200",
    学用品: "bg-zaim-green-100 text-zaim-green-600 border-zaim-green-200",
    衣類: "bg-pink-100 text-pink-800 border-pink-200",
    その他: "bg-gray-100 text-gray-800 border-gray-200",
  }

  return (
    <div className="min-h-screen bg-white pb-20">
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

          {locations.map((location) => (
            <div key={location.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 text-base font-bold text-black mb-4">
                <MapPin className="h-4 w-4 text-zaim-blue-500" />
                {location.name}
              </div>
              <div className="space-y-3">
                {location.expenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={categoryColors[expense.category as keyof typeof categoryColors]}>
                          {expense.category}
                        </Badge>
                        <span className="font-bold text-black">¥{expense.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{expense.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {expense.date}
                      </div>
                    </div>
                    <Receipt className="h-4 w-4 text-gray-400" />
                  </div>
                ))}

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">この場所での合計</span>
                    <span className="font-bold text-black">
                      ¥{location.expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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

      <BottomNav currentPage="map" />
    </div>
  )
}
