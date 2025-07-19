"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, School, Bell, Shield, Target } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function ProfilePage() {
  const [notifications, setNotifications] = useState({
    spending: true,
    savings: true,
    subsidies: false,
    tips: true,
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
          <p className="text-gray-600 text-sm">あなたに合った情報をお届け</p>
        </div>

        {/* Profile Summary */}
        <Card className="bg-blue-50 border border-blue-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">田中 太郎</h2>
                <p className="text-gray-600">高校2年生</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">東京都</Badge>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">17歳</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-indigo-600" />
              基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">名前（姓）</Label>
                <Input id="firstName" defaultValue="田中" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lastName">名前（名）</Label>
                <Input id="lastName" defaultValue="太郎" className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="age">年齢</Label>
              <Select defaultValue="17">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => i + 13).map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age}歳
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade">学年</Label>
              <Select defaultValue="high2">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior1">中学1年生</SelectItem>
                  <SelectItem value="junior2">中学2年生</SelectItem>
                  <SelectItem value="junior3">中学3年生</SelectItem>
                  <SelectItem value="high1">高校1年生</SelectItem>
                  <SelectItem value="high2">高校2年生</SelectItem>
                  <SelectItem value="high3">高校3年生</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-green-600" />
              住所情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prefecture">都道府県</Label>
              <Select defaultValue="tokyo">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tokyo">東京都</SelectItem>
                  <SelectItem value="osaka">大阪府</SelectItem>
                  <SelectItem value="kanagawa">神奈川県</SelectItem>
                  <SelectItem value="saitama">埼玉県</SelectItem>
                  <SelectItem value="chiba">千葉県</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">市区町村</Label>
              <Input id="city" placeholder="渋谷区" className="mt-1" />
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">プライバシーについて</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    住所情報は補助金情報の表示にのみ使用され、第三者に共有されることはありません。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Information */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <School className="h-5 w-5 text-blue-600" />
              学校情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schoolName">学校名</Label>
              <Input id="schoolName" placeholder="○○高等学校" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="schoolType">学校種別</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public-junior">公立中学校</SelectItem>
                  <SelectItem value="private-junior">私立中学校</SelectItem>
                  <SelectItem value="public-high">公立高等学校</SelectItem>
                  <SelectItem value="private-high">私立高等学校</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Budget Settings */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-purple-600" />
              予算設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="monthlyBudget">月の予算</Label>
              <Input id="monthlyBudget" type="number" placeholder="15000" className="mt-1" defaultValue="15000" />
            </div>

            <div>
              <Label htmlFor="savingsGoal">月の貯金目標</Label>
              <Input id="savingsGoal" type="number" placeholder="5000" className="mt-1" defaultValue="5000" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="foodBudget">食費予算</Label>
                <Input id="foodBudget" type="number" placeholder="8000" className="mt-1" defaultValue="8000" />
              </div>
              <div>
                <Label htmlFor="entertainmentBudget">娯楽予算</Label>
                <Input id="entertainmentBudget" type="number" placeholder="4000" className="mt-1" defaultValue="4000" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-orange-600" />
              通知設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">使いすぎアラート</p>
                <p className="text-sm text-gray-600">予算の80%を超えた時に通知</p>
              </div>
              <Switch
                checked={notifications.spending}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, spending: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">節約目標通知</p>
                <p className="text-sm text-gray-600">目標達成時や進捗の通知</p>
              </div>
              <Switch
                checked={notifications.savings}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, savings: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">補助金情報</p>
                <p className="text-sm text-gray-600">新しい補助金情報の通知</p>
              </div>
              <Switch
                checked={notifications.subsidies}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, subsidies: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">節約アイディア</p>
                <p className="text-sm text-gray-600">おすすめの節約術の通知</p>
              </div>
              <Switch
                checked={notifications.tips}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, tips: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white">設定を保存</Button>
      </div>

      <BottomNav currentPage="profile" />
    </div>
  )
}
