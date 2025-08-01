"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SwitchVariants } from "@/components/ui/switch-variants"
import { Bell, AlertTriangle, Target, Gift, Lightbulb, Check, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "warning",
      title: "使いすぎアラート",
      message: "今月の食費が予算の85%に達しました",
      time: "2時間前",
      read: false,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
    {
      id: 2,
      type: "achievement",
      title: "目標達成！",
      message: "今週の節約目標を達成しました！",
      time: "1日前",
      read: false,
      icon: Target,
      color: "text-green-600 bg-green-50",
    },
    {
      id: 3,
      type: "subsidy",
      title: "新しい補助金情報",
      message: "あなたの地域で新しい学習支援金が開始されました",
      time: "2日前",
      read: true,
      icon: Gift,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: 4,
      type: "tip",
      title: "節約アイディア",
      message: "冬の光熱費を30%削減する方法をチェック！",
      time: "3日前",
      read: true,
      icon: Lightbulb,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      id: 5,
      type: "reminder",
      title: "支出記録のリマインダー",
      message: "今日の支出をまだ記録していません",
      time: "1週間前",
      read: true,
      icon: Bell,
      color: "text-purple-600 bg-purple-50",
    },
  ]

  const notificationSettings = [
    {
      id: "spending",
      title: "使いすぎアラート",
      description: "予算の80%を超えた時に通知",
      enabled: true,
    },
    {
      id: "goals",
      title: "目標達成通知",
      description: "節約目標の達成時に通知",
      enabled: true,
    },
    {
      id: "subsidies",
      title: "補助金情報",
      description: "新しい補助金情報の通知",
      enabled: false,
    },
    {
      id: "tips",
      title: "節約アイディア",
      description: "おすすめの節約術の通知",
      enabled: true,
    },
    {
      id: "reminders",
      title: "記録リマインダー",
      description: "支出記録の忘れ防止通知",
      enabled: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">通知・リマインダー</h1>
          <p className="text-gray-600 text-sm">大切な情報をお知らせ</p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 border-zaim-blue-200 text-zaim-blue-600 hover:bg-zaim-blue-50">
            <Check className="h-4 w-4 mr-1" />
            すべて既読
          </Button>
          <Button variant="outline" size="sm" className="flex-1 border-zaim-blue-200 text-zaim-blue-600 hover:bg-zaim-blue-50">
            <X className="h-4 w-4 mr-1" />
            すべて削除
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800">最近の通知</h2>

          {notifications.map((notification) => {
            const IconComponent = notification.icon
            return (
              <Card
                key={notification.id}
                className={`border border-gray-200 shadow-sm ${notification.read ? "bg-gray-50" : "bg-white"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${notification.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`font-bold ${notification.read ? "text-gray-600" : "text-gray-800"}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                      </div>
                      <p className={`text-sm mb-2 ${notification.read ? "text-gray-500" : "text-gray-700"}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-zaim-blue-600 hover:bg-zaim-blue-50">
                              既読にする
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-red-600 hover:bg-red-50">
                            削除
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Notification Settings */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-orange-600" />
              通知設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{setting.title}</p>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <SwitchVariants variant="solid5" defaultChecked={setting.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notification Schedule */}
        <Card className="bg-blue-50 border border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">通知スケジュール</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-sm font-medium text-gray-700">朝の通知</div>
                <div className="text-lg font-bold text-purple-600">8:00</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-sm font-medium text-gray-700">夜の通知</div>
                <div className="text-lg font-bold text-pink-600">20:00</div>
              </div>
            </div>
            <Button variant="outline" className="w-full border-zaim-blue-200 text-zaim-blue-600 hover:bg-zaim-blue-50">
              時間を変更
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="bg-gray-50 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">通知統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-lg font-bold text-blue-600">12</div>
                <div className="text-xs text-gray-600">今月の通知</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-lg font-bold text-green-600">8</div>
                <div className="text-xs text-gray-600">目標達成</div>
              </div>
              <div className="text-center p-3 bg-white/60 rounded-lg">
                <div className="text-lg font-bold text-orange-600">3</div>
                <div className="text-xs text-gray-600">アラート</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav currentPage="notifications" />
    </div>
  )
}
