// @refresh reset
'use client';

import React, { useState } from 'react';
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { SwitchVariants } from "@/components/ui/switch-variants"
import { 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  BarChart3, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Home,
  Wallet,
  Target,
  Lightbulb,
  Gift,
  BookOpen,
  Shirt,
  Upload,
  Settings,
  User,
  Bell,
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Star,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

// インタラクティブなカレンダーコンポーネント
function CalendarWithExpenseComponent() {
  const [selectedDate, setSelectedDate] = useState(15);
  
  // 支出データのサンプル
  const expenseData = {
    3: [{ name: "昼食", time: "12:00", amount: 800, icon: "🍜", color: "bg-orange-500" }],
    8: [
      { name: "電車代", time: "08:30", amount: 300, icon: "🚊", color: "bg-blue-500" },
      { name: "コーヒー", time: "10:15", amount: 450, icon: "☕", color: "bg-green-500" }
    ],
    10: [{ name: "本", time: "15:00", amount: 1200, icon: "📚", color: "bg-purple-500" }],
    15: [
      { name: "ランチ", time: "12:30", amount: 1200, icon: "🍜", color: "bg-orange-500" },
      { name: "電車代", time: "18:15", amount: 500, icon: "🚊", color: "bg-blue-500" },
      { name: "カフェ", time: "15:45", amount: 1500, icon: "☕", color: "bg-green-500" }
    ],
    18: [{ name: "映画", time: "19:00", amount: 1800, icon: "🎬", color: "bg-red-500" }],
    22: [
      { name: "夕食", time: "19:30", amount: 2500, icon: "🍽️", color: "bg-orange-500" },
      { name: "タクシー", time: "22:00", amount: 1200, icon: "🚖", color: "bg-yellow-500" }
    ],
    25: [{ name: "買い物", time: "14:00", amount: 3200, icon: "🛍️", color: "bg-pink-500" }],
    28: [{ name: "友達とランチ", time: "12:00", amount: 2800, icon: "🍽️", color: "bg-orange-500" }]
  };

  const totalMonthExpense = Object.values(expenseData).flat().reduce((sum, item) => sum + item.amount, 0);
  const selectedDayExpenses = expenseData[selectedDate as keyof typeof expenseData] || [];
  const selectedDayTotal = selectedDayExpenses.reduce((sum, item) => sum + item.amount, 0);

  const handleDateClick = (date: number) => {
    setSelectedDate(date);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
      {/* 上部: 月間支出サマリー - 写真風にシンプルなカード形式 */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-xs text-gray-600 mb-1">収入</div>
          <div className="text-lg font-bold text-blue-600">¥300,000</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-xs text-gray-600 mb-1">支出</div>
          <div className="text-lg font-bold text-red-600">¥{totalMonthExpense.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-xs text-gray-600 mb-1">残高</div>
          <div className="text-lg font-bold text-green-600">¥{(300000 - totalMonthExpense).toLocaleString()}</div>
        </div>
      </div>

      {/* カレンダー部分 */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
          <div key={day} className={`text-center text-sm font-medium py-2 ${
            i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
          }`}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px mb-6">
        {[...Array(35)].map((_, i) => {
          const date = i - 2;
          const isToday = date === 24; // 今日は24日とする
          const hasExpense = expenseData[date as keyof typeof expenseData];
          const isSelected = date === selectedDate;
          
          return (
            <div key={i} className="text-center py-3 h-16 flex items-center justify-center">
              {date > 0 && date <= 31 && (
                <button 
                  onClick={() => handleDateClick(date)}
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-xl cursor-pointer transition-all hover:scale-105 ${
                    isSelected ? 'bg-blue-100 border-2 border-blue-400 text-blue-700' : 
                    isToday ? 'font-bold text-gray-800' : 
                    hasExpense ? 'bg-blue-50 text-blue-700' :
                    (i + 2) % 7 === 0 ? 'text-red-500 hover:bg-red-50' : 
                    (i + 2) % 7 === 6 ? 'text-blue-500 hover:bg-blue-50' : 
                    'text-gray-700 hover:bg-gray-100'
                  } font-medium`}>
                  {date}
                  {hasExpense && (
                    <div className="absolute mt-8 text-xs text-blue-600 font-bold">
                      •
                    </div>
                  )}
                </button>
              )}
              {date <= 0 && (
                <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-400 font-medium">
                  {date + 31}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 下部: 選択日の支出詳細 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800">8月{selectedDate}日の支出</h4>
          <div className="text-sm font-bold text-red-600">合計: ¥{selectedDayTotal.toLocaleString()}</div>
        </div>
        
        {selectedDayExpenses.length > 0 ? (
          <div className="space-y-2">
            {selectedDayExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 ${expense.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs">{expense.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{expense.name}</div>
                    <div className="text-xs text-gray-500">{expense.time}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900">¥{expense.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">この日は支出がありません</div>
        )}
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  // スイッチの状態管理
  const [switchStates, setSwitchStates] = useState({
    basic1: true,
    basic2: false,
    notification1: true,
    notification2: false,
    solid1: true,
    solid2: false,
    solid3: true,
    solid4: false,
    solid5: true,
    solid6: false,
    solid7: true,
    solid8: false,
    showPassword1: false,
    showPassword2: false
  });

  const handleSwitchToggle = (key: string) => {
    console.log(`Toggle switch: ${key}`); // デバッグ用
    setSwitchStates(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">27 UIスタイルガイド</h1>
          <p className="text-black mb-6">学生向け節約アプリで使用中のUIコンポーネント一覧</p>
          
          {/* Table of Contents */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-black mb-4">目次</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <a href="#colors" className="text-gray-600 hover:text-gray-700">カラーパレット</a>
              <a href="#typography" className="text-gray-600 hover:text-gray-700">タイポグラフィ</a>
              <a href="#buttons" className="text-gray-600 hover:text-gray-700">ボタン</a>
              <a href="#progress" className="text-gray-600 hover:text-gray-700">プログレスバー</a>
              <a href="#cards" className="text-gray-600 hover:text-gray-700">カード</a>
              <a href="#lists" className="text-gray-600 hover:text-gray-700">リストアイテム</a>
              <a href="#charts" className="text-gray-600 hover:text-gray-700">チャート</a>
              <a href="#icons" className="text-gray-600 hover:text-gray-700">アイコン</a>
              <a href="#dialogs" className="text-gray-600 hover:text-gray-700">ダイアログ</a>
              <a href="#spacing" className="text-gray-600 hover:text-gray-700">スペーシング</a>
              <a href="#forms" className="text-gray-600 hover:text-gray-700">フォーム要素</a>
              <a href="#switches" className="text-gray-600 hover:text-gray-700">スイッチ</a>
              <a href="#badges" className="text-gray-600 hover:text-gray-700">バッジ</a>
              <a href="#alerts" className="text-gray-600 hover:text-gray-700">アラート</a>
              <a href="#statistics" className="text-gray-600 hover:text-gray-700">統計カード</a>
              <a href="#auth" className="text-gray-600 hover:text-gray-700">認証UI</a>
              <a href="#onboarding" className="text-gray-600 hover:text-gray-700">オンボーディング</a>
              <a href="#notifications" className="text-gray-600 hover:text-gray-700">通知・完了メッセージ</a>
            </div>
          </div>
        </div>

        {/* Colors */}
        <section id="colors">
          <h2 className="text-2xl font-bold mb-4 text-black">カラーパレット</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-black">Switch Gray</h3>
              <div className="space-y-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs font-mono text-black">gray-50</div>
                  <div className="text-xs text-gray-500 font-mono">#f9fafb</div>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-xs font-mono text-black">gray-100</div>
                  <div className="text-xs text-gray-500 font-mono">#f3f4f6</div>
                </div>
                <div className="bg-gray-300 p-3 rounded text-white">
                  <div className="text-xs font-mono">gray-300</div>
                  <div className="text-xs opacity-80 font-mono">#d1d5db</div>
                </div>
                <div className="bg-gray-600 p-3 rounded text-white">
                  <div className="text-xs font-mono">gray-600</div>
                  <div className="text-xs opacity-80 font-mono">#4b5563</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-black">Calm Blue</h3>
              <div className="space-y-1">
                <div className="bg-zaim-blue-50 p-3 rounded border border-zaim-blue-200">
                  <div className="text-xs font-mono text-black">zaim-blue-50</div>
                  <div className="text-xs text-gray-500 font-mono">#f8fafc</div>
                </div>
                <div className="bg-zaim-blue-100 p-3 rounded">
                  <div className="text-xs font-mono text-black">zaim-blue-100</div>
                  <div className="text-xs text-gray-500 font-mono">#f1f5f9</div>
                </div>
                <div className="bg-zaim-blue-500 p-3 rounded text-white">
                  <div className="text-xs font-mono">zaim-blue-500</div>
                  <div className="text-xs opacity-80 font-mono">#64748b</div>
                </div>
                <div className="bg-zaim-blue-600 p-3 rounded text-white">
                  <div className="text-xs font-mono">zaim-blue-600</div>
                  <div className="text-xs opacity-80 font-mono">#475569</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-black">Soft Green</h3>
              <div className="space-y-1">
                <div className="bg-zaim-green-50 p-3 rounded border border-zaim-green-200">
                  <div className="text-xs font-mono text-black">zaim-green-50</div>
                  <div className="text-xs text-gray-500 font-mono">#f0f9f0</div>
                </div>
                <div className="bg-zaim-green-100 p-3 rounded">
                  <div className="text-xs font-mono text-black">zaim-green-100</div>
                  <div className="text-xs text-gray-500 font-mono">#e0f2e0</div>
                </div>
                <div className="bg-zaim-green-500 p-3 rounded text-white">
                  <div className="text-xs font-mono">zaim-green-500</div>
                  <div className="text-xs opacity-80 font-mono">#5a9c5a</div>
                </div>
                <div className="bg-zaim-green-600 p-3 rounded text-white">
                  <div className="text-xs font-mono">zaim-green-600</div>
                  <div className="text-xs opacity-80 font-mono">#4a8a4a</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-black">Muted Yellow</h3>
              <div className="space-y-1">
                <div className="bg-zaim-yellow-50 p-3 rounded border border-zaim-yellow-200">
                  <div className="text-xs font-mono text-black">zaim-yellow-50</div>
                  <div className="text-xs text-gray-500 font-mono">#fcfcf0</div>
                </div>
                <div className="bg-zaim-yellow-100 p-3 rounded">
                  <div className="text-xs font-mono text-black">zaim-yellow-100</div>
                  <div className="text-xs text-gray-500 font-mono">#f9f9e0</div>
                </div>
                <div className="bg-zaim-yellow-500 p-3 rounded text-white">
                  <div className="text-xs font-mono">zaim-yellow-500</div>
                  <div className="text-xs opacity-80 font-mono">#cccc5a</div>
                </div>
                <div className="bg-zaim-yellow-600 p-3 rounded text-white">
                  <div className="text-xs font-mono">zaim-yellow-600</div>
                  <div className="text-xs opacity-80 font-mono">#b8b84a</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-black">Gentle Red</h3>
              <div className="space-y-1">
                <div className="bg-zaim-red-50 p-3 rounded border border-zaim-red-200">
                  <div className="text-xs font-mono text-black">zaim-red-50</div>
                  <div className="text-xs text-gray-500 font-mono">#fcf0f0</div>
                </div>
                <div className="bg-zaim-red-100 p-3 rounded">
                  <div className="text-xs font-mono text-black">zaim-red-100</div>
                  <div className="text-xs text-gray-500 font-mono">#f9e0e0</div>
                </div>
                <div className="bg-zaim-red-500 p-3 rounded text-white">
                  <div className="text-xs font-mono">zaim-red-500</div>
                  <div className="text-xs opacity-80 font-mono">#cc5a5a</div>
                </div>
                <div className="bg-zaim-red-600 p-3 rounded text-white">
                  <div className="text-xs font-mono">zaim-red-600</div>
                  <div className="text-xs opacity-80 font-mono">#b84a4a</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Typography */}
        <section id="typography">
          <h2 className="text-2xl font-bold mb-4 text-black">タイポグラフィ</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-black mb-4">フォントサイズとウェイト</h3>
              <div className="text-3xl font-bold text-black">見出し1 <span className="text-sm font-normal text-gray-500">(text-3xl font-bold)</span></div>
              <div className="text-2xl font-bold text-black">見出し2 <span className="text-sm font-normal text-gray-500">(text-2xl font-bold)</span></div>
              <div className="text-xl font-bold text-black">見出し3 <span className="text-sm font-normal text-gray-500">(text-xl font-bold)</span></div>
              <div className="text-lg font-medium text-black">見出し4 <span className="text-sm font-normal text-gray-500">(text-lg font-medium)</span></div>
              <div className="text-base font-medium text-black">見出し5 <span className="text-sm font-normal text-gray-500">(text-base font-medium)</span></div>
              <div className="text-sm text-black">本文テキスト <span className="text-xs text-gray-500">(text-sm)</span></div>
              <div className="text-xs text-gray-500">キャプション <span className="text-xs text-gray-400">(text-xs text-gray-500)</span></div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-black mb-4">数値表示</h3>
              <div className="text-3xl font-bold text-black">¥15,000</div>
              <div className="text-2xl font-bold text-zaim-green-600">+¥2,500</div>
              <div className="text-2xl font-bold text-zaim-red-500">-¥8,500</div>
              <div className="text-lg font-medium text-gray-600">57%</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-black mb-4">フォントファミリー</h3>
              <div className="space-y-3">
                <div className="font-sans text-black">
                  <span className="font-medium">Sans (デフォルト): </span>
                  <span>M PLUS Rounded 1c - 丸いフォント、日本語対応</span>
                </div>
                <div className="font-rounded text-black">
                  <span className="font-medium">Rounded: </span>
                  <span>M PLUS Rounded 1c - 丸いフォント、特別な要素に使用</span>
                </div>
                <div className="font-mono text-black">
                  <span className="font-medium">Mono: </span>
                  <span>コード、カラーコード表示用</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Buttons */}
        <section id="buttons">
          <h2 className="text-2xl font-bold mb-4 text-black">ボタン</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white">
                Primary Button
              </Button>
              <Button className="bg-zaim-green-500 hover:bg-zaim-green-600 text-white">
                Secondary Button
              </Button>
              <Button className="bg-zaim-yellow-500 hover:bg-zaim-yellow-600 text-white">
                Ghost Button
              </Button>
              <Button className="bg-zaim-red-500 hover:bg-zaim-red-600 text-white">
                Danger Button
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small Button</Button>
              <Button>Default Button</Button>
              <Button size="lg">Large Button</Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="border border-black bg-white text-black hover:bg-gray-50">
                Black Outlined
              </Button>
              <Button className="border border-gray-400 bg-white text-gray-800 hover:bg-gray-50">
                Gray Outlined
              </Button>
              <Button className="border border-zaim-blue-500 bg-white text-zaim-blue-600 hover:bg-zaim-blue-50">
                Blue Outlined
              </Button>
              <Button className="border border-zaim-green-500 bg-white text-zaim-green-600 hover:bg-zaim-green-50">
                Green Outlined
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <Button className="h-16 bg-zaim-green-500 hover:bg-zaim-green-600 text-white">
                <div className="text-center">
                  <Target className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">目標設定</div>
                </div>
              </Button>
              <Button className="h-16 bg-gray-600 hover:bg-gray-700 text-white">
                <div className="text-center">
                  <Gift className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">補助金</div>
                </div>
              </Button>
            </div>
          </div>
        </section>

        {/* Progress Bars */}
        <section id="progress">
          <h2 className="text-2xl font-bold mb-4 text-black">プログレスバー</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <div className="text-sm mb-2 text-black">予算使用率: 57%</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-zaim-blue-500 h-3 rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>
            <div>
              <div className="text-sm mb-2 text-black">緑色バー (余裕)</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-zaim-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="text-sm mb-2 text-black">黄色バー (注意)</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-zaim-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="text-sm mb-2 text-black">赤色バー (危険)</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-zaim-red-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards (Legacy) */}
        <section id="cards">
          <h2 className="text-2xl font-bold mb-4 text-black">カード (旧デザイン)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  今月の収支
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">¥15,000</div>
                  <div className="text-sm text-gray-600">残り予算</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zaim-green-50 border border-zaim-green-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-zaim-yellow-600" />
                  節約アドバイス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">お弁当を作ると月3,000円節約できるよ！</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* List Items (Zaim Style) */}
        <section id="lists">
          <h2 className="text-2xl font-bold mb-4 text-black">リストアイテム (Zaimスタイル)</h2>
          
          {/* 予算ステータスカード */}
          <div className="space-y-4 max-w-md mb-6">
            <div className="bg-zaim-green-50 border border-zaim-green-500 rounded-lg p-4">
              <div className="text-center space-y-3">
                <div className="flex justify-center items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-zaim-green-500"></div>
                  <span className="text-sm font-medium text-zaim-green-700">余裕あり</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">¥6,500</div>
                <div className="text-sm text-gray-600">今月使える金額</div>
              </div>
            </div>

            <div className="bg-zaim-yellow-50 border border-zaim-yellow-500 rounded-lg p-4">
              <div className="text-center space-y-3">
                <div className="flex justify-center items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-zaim-yellow-500"></div>
                  <span className="text-sm font-medium text-zaim-yellow-700">注意</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">¥3,000</div>
                <div className="text-sm text-gray-600">今月使える金額</div>
              </div>
            </div>
          </div>

          {/* リスト形式 */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-md">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-black">カテゴリ別支出</h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Utensils className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-black">食費</span>
                </div>
                <span className="text-sm font-bold text-black">¥3,500</span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Car className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-black">交通費</span>
                </div>
                <span className="text-sm font-bold text-black">¥2,000</span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-black">娯楽</span>
                </div>
                <span className="text-sm font-bold text-black">¥2,000</span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section id="charts">
          <h2 className="text-2xl font-bold mb-4 text-black">チャート - デザイン案</h2>
          <div className="space-y-12">
            
            {/* デザイン案1: ドーナツチャート（細め） */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">案1: ドーナツチャート（細いリング）</h3>
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {/* 食費 40% */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray="201.06 502.65" strokeDashoffset="0"/>
                    {/* 交通費 25% */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="125.66 502.65" strokeDashoffset="-201.06"/>
                    {/* 娯楽 20% */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="16" strokeDasharray="100.53 502.65" strokeDashoffset="-326.72"/>
                    {/* 学用品 10% */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#22c55e" strokeWidth="16" strokeDasharray="50.27 502.65" strokeDashoffset="-427.25"/>
                    {/* その他 5% */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#6b7280" strokeWidth="16" strokeDasharray="25.13 502.65" strokeDashoffset="-477.52"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">¥10,000</div>
                      <div className="text-sm text-gray-600">合計支出</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-black w-16">食費</span>
                    <span className="text-sm text-gray-600">40% (¥4,000)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-black w-16">交通費</span>
                    <span className="text-sm text-gray-600">25% (¥2,500)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-black w-16">娯楽</span>
                    <span className="text-sm text-gray-600">20% (¥2,000)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-black w-16">学用品</span>
                    <span className="text-sm text-gray-600">10% (¥1,000)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-black w-16">その他</span>
                    <span className="text-sm text-gray-600">5% (¥500)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* デザイン案2: 太いドーナツチャート */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-black mb-4">案2: ドーナツチャート（太いリング）</h3>
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {/* 食費 40% */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#f97316" strokeWidth="40" strokeDasharray="175.93 439.82" strokeDashoffset="0"/>
                    {/* 交通費 25% */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#3b82f6" strokeWidth="40" strokeDasharray="109.96 439.82" strokeDashoffset="-175.93"/>
                    {/* 娯楽 20% */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#a855f7" strokeWidth="40" strokeDasharray="87.96 439.82" strokeDashoffset="-285.89"/>
                    {/* 学用品 10% */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#22c55e" strokeWidth="40" strokeDasharray="43.98 439.82" strokeDashoffset="-373.85"/>
                    {/* その他 5% */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#6b7280" strokeWidth="40" strokeDasharray="21.99 439.82" strokeDashoffset="-417.83"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-black">合計</div>
                      <div className="text-lg font-bold text-black">¥10,000</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-black">食費</span>
                    </div>
                    <div className="text-lg font-bold text-black">¥4,000</div>
                    <div className="text-xs text-gray-600">40%</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-black">交通費</span>
                    </div>
                    <div className="text-lg font-bold text-black">¥2,500</div>
                    <div className="text-xs text-gray-600">25%</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-black">娯楽</span>
                    </div>
                    <div className="text-lg font-bold text-black">¥2,000</div>
                    <div className="text-xs text-gray-600">20%</div>
                  </div>
                </div>
              </div>
            </div>



          </div>
        </section>

        {/* Icons */}
        <section id="icons">
          <h2 className="text-2xl font-bold mb-4 text-black">アイコン</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">カテゴリアイコン</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { icon: Utensils, name: "食費", color: "text-white", bg: "bg-orange-500" },
                  { icon: Car, name: "交通費", color: "text-white", bg: "bg-blue-500" },
                  { icon: ShoppingBag, name: "娯楽", color: "text-white", bg: "bg-purple-500" },
                  { icon: BookOpen, name: "学用品", color: "text-white", bg: "bg-green-500" },
                  { icon: Shirt, name: "衣類", color: "text-white", bg: "bg-pink-500" },
                  { icon: Home, name: "その他", color: "text-white", bg: "bg-gray-500" },
                ].map(({ icon: Icon, name, color, bg }) => (
                  <div key={name} className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="text-xs text-gray-600 font-medium">{name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black mb-4">システムアイコン</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: TrendingUp, name: "上昇トレンド", color: "text-zaim-green-600" },
                  { icon: TrendingDown, name: "下降トレンド", color: "text-red-600" },
                  { icon: PlusCircle, name: "追加", color: "text-zaim-green-600" },
                  { icon: BarChart3, name: "グラフ", color: "text-blue-600" },
                  { icon: Wallet, name: "財布", color: "text-blue-600" },
                  { icon: Target, name: "目標", color: "text-zaim-green-600" },
                  { icon: Lightbulb, name: "アイデア", color: "text-yellow-600" },
                  { icon: Gift, name: "プレゼント", color: "text-gray-600" },
                  { icon: Upload, name: "アップロード", color: "text-gray-600" },
                  { icon: Settings, name: "設定", color: "text-gray-600" },
                  { icon: User, name: "ユーザー", color: "text-gray-600" },
                  { icon: Bell, name: "通知", color: "text-gray-600" },
                  { icon: Calendar, name: "カレンダー", color: "text-gray-600" },
                  { icon: MapPin, name: "場所", color: "text-gray-600" },
                  { icon: Pencil, name: "編集", color: "text-gray-600" },
                  { icon: Trash2, name: "削除", color: "text-red-500" },
                ].map(({ icon: Icon, name, color }) => (
                  <div key={name} className="text-center p-3 border border-gray-200 rounded-lg">
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
                    <div className="text-xs text-gray-600">{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dialog Sample */}
        <section id="dialogs">
          <h2 className="text-2xl font-bold mb-4 text-black">ダイアログ</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>ダイアログを開く</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>サンプルダイアログ</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-sm text-gray-600">これはダイアログのサンプルです。</p>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Spacing Guide */}
        <section id="spacing">
          <h2 className="text-2xl font-bold mb-4 text-black">スペーシング</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">パディング (Padding)</h3>
              <div className="space-y-3">
                <div className="bg-gray-100 p-2 rounded">
                  <div className="bg-zaim-green-500 h-4 rounded"></div>
                  <div className="text-xs mt-1 font-mono">p-2 (8px)</div>
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <div className="bg-zaim-green-500 h-4 rounded"></div>
                  <div className="text-xs mt-1 font-mono">p-3 (12px)</div>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <div className="bg-zaim-green-500 h-4 rounded"></div>
                  <div className="text-xs mt-1 font-mono">p-4 (16px) - 標準</div>
                </div>
                <div className="bg-gray-100 p-6 rounded">
                  <div className="bg-zaim-green-500 h-4 rounded"></div>
                  <div className="text-xs mt-1 font-mono">p-6 (24px)</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black mb-4">マージン (Gap/Space)</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="text-xs font-mono">gap-1 (4px)</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="text-xs font-mono">gap-2 (8px)</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="text-xs font-mono">gap-3 (12px) - 標準</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="text-xs font-mono">gap-4 (16px)</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="w-4 h-4 bg-zaim-green-500 rounded"></div>
                  <div className="text-xs font-mono">gap-6 (24px)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Forms */}
        <section id="forms">
          <h2 className="text-2xl font-bold mb-4 text-black">フォーム要素</h2>
          <div className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">入力フィールド</label>
              <input
                type="text"
                placeholder="プレースホルダーテキスト"
                className="w-full px-3 py-2 border border-zaim-blue-200 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">数値入力</label>
              <input
                type="number"
                min="0"
                placeholder="1000"
                className="w-full px-3 py-2 border border-zaim-blue-200 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">セレクト</label>
              <select className="w-full px-3 py-2 border border-zaim-blue-200 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                <option>選択してください</option>
                <option>食費</option>
                <option>交通費</option>
                <option>娯楽</option>
                <option>学用品</option>
                <option>衣類</option>
                <option>その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">テキストエリア</label>
              <textarea
                placeholder="詳細を入力してください"
                rows={3}
                className="w-full px-3 py-2 border border-zaim-blue-200 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
              />
            </div>
          </div>
        </section>

        {/* Switches */}
        <section id="switches">
          <h2 className="text-2xl font-bold mb-4 text-black">スイッチ</h2>
          
          {/* 基本スイッチ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">基本スイッチ（インタラクティブ）</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">
                    オン/オフ切り替え ({switchStates.basic1 ? 'ON' : 'OFF'})
                  </span>
                  <Switch 
                    checked={switchStates.basic1} 
                    onCheckedChange={() => handleSwitchToggle('basic1')} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">
                    別のスイッチ ({switchStates.basic2 ? 'ON' : 'OFF'})
                  </span>
                  <Switch 
                    checked={switchStates.basic2} 
                    onCheckedChange={() => handleSwitchToggle('basic2')} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">通知設定例</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">プッシュ通知</p>
                    <p className="text-sm text-gray-600">アプリからの通知を受け取る</p>
                  </div>
                  <Switch 
                    checked={switchStates.notification1} 
                    onCheckedChange={() => handleSwitchToggle('notification1')} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">メール通知</p>
                    <p className="text-sm text-gray-600">重要な情報をメールで受け取る</p>
                  </div>
                  <Switch 
                    checked={switchStates.notification2} 
                    onCheckedChange={() => handleSwitchToggle('notification2')} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* グレースイッチのみ */}
          <h3 className="text-xl font-bold mb-4 text-black">✨ スイッチ（メインカラー）</h3>
          <div className="max-w-md">
            {/* グレー */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-black">グレースイッチ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black">
                    状態: {switchStates.solid5 ? 'ON' : 'OFF'}
                  </span>
                  <SwitchVariants 
                    variant="solid5"
                    checked={switchStates.solid5} 
                    onCheckedChange={() => handleSwitchToggle('solid5')} 
                  />
                </div>
                <p className="text-xs text-gray-600">グレー単色（メインカラー）</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section id="badges">
          <h2 className="text-2xl font-bold mb-4 text-black">バッジ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">基本バッジ</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">デフォルト</span>
                <span className="px-3 py-1 bg-zaim-blue-100 text-zaim-blue-800 text-sm rounded-full">情報</span>
                <span className="px-3 py-1 bg-zaim-green-100 text-zaim-green-800 text-sm rounded-full">成功</span>
                <span className="px-3 py-1 bg-zaim-yellow-100 text-zaim-yellow-800 text-sm rounded-full">警告</span>
                <span className="px-3 py-1 bg-zaim-red-100 text-zaim-red-800 text-sm rounded-full">エラー</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">カテゴリバッジ</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">食費</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">交通費</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">娯楽</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">学用品</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">衣類</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black mb-4">ステータスバッジ</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-zaim-green-500 text-white text-sm rounded-full">申請可能</span>
                <span className="px-3 py-1 bg-zaim-red-500 text-white text-sm rounded-full">受付終了</span>
                <span className="px-3 py-1 bg-gray-500 text-white text-sm rounded-full">準備中</span>
                <span className="px-3 py-1 bg-zaim-yellow-500 text-white text-sm rounded-full">審査中</span>
              </div>
            </div>
          </div>
        </section>

        {/* Alert Cards */}
        <section id="alerts">
          <h2 className="text-2xl font-bold mb-4 text-black">アラート・通知カード</h2>
          <div className="space-y-4 max-w-2xl">
            <div className="bg-zaim-yellow-50 border border-zaim-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-zaim-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-black mb-1">プロフィール設定のお願い</h4>
                  <p className="text-sm text-gray-700 mb-3">より適切な補助金情報をお届けするため、プロフィール設定をお願いします。</p>
                  <Button size="sm" className="bg-zaim-yellow-500 hover:bg-zaim-yellow-600 text-white">
                    設定する
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-zaim-blue-50 border border-zaim-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-zaim-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-black mb-1">新しい節約アドバイス</h4>
                  <p className="text-sm text-gray-700">あなたの支出パターンから、月3,000円の節約方法を見つけました。</p>
                </div>
              </div>
            </div>

            <div className="bg-zaim-green-50 border border-zaim-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-zaim-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-black mb-1">目標達成おめでとう！</h4>
                  <p className="text-sm text-gray-700">今月の節約目標を達成しました。素晴らしいです！</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Cards */}
        <section id="statistics">
          <h2 className="text-2xl font-bold mb-4 text-black">統計カード</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">基本統計</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-black mb-1">¥15,000</div>
                  <div className="text-sm text-gray-600">今月の支出</div>
                </div>
                <div className="bg-zaim-green-50 border border-zaim-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-zaim-green-600 mb-1">¥3,500</div>
                  <div className="text-sm text-gray-600">節約額</div>
                </div>
                <div className="bg-zaim-blue-50 border border-zaim-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-zaim-blue-600 mb-1">12</div>
                  <div className="text-sm text-gray-600">利用した補助金</div>
                </div>
                <div className="bg-zaim-yellow-50 border border-zaim-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-zaim-yellow-600 mb-1">8</div>
                  <div className="text-sm text-gray-600">実践したアドバイス</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black mb-4">詳細統計</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-black">通知設定</h4>
                    <Settings className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">プッシュ通知</span>
                      <span className="text-sm font-medium text-zaim-green-600">ON</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">メール通知</span>
                      <span className="text-sm font-medium text-gray-400">OFF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">週次レポート</span>
                      <span className="text-sm font-medium text-zaim-green-600">ON</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-black">支出分析</h4>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">食費</span>
                      </div>
                      <span className="text-sm font-medium text-black">40%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">交通費</span>
                      </div>
                      <span className="text-sm font-medium text-black">25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">娯楽</span>
                      </div>
                      <span className="text-sm font-medium text-black">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication UI */}
        <section id="auth">
          <h2 className="text-2xl font-bold mb-4 text-black">認証UI</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">認証ボタン（現在のデザイン）</h3>
              <div className="space-y-6">
                
                {/* 現在のデザイン */}
                <div>
                  <h4 className="font-medium text-black mb-3">現在のデザイン（丸いソリッド青）</h4>
                  <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-8 h-32">
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button className="rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6">
                        サインイン
                      </Button>
                      <Button className="rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6">
                        ログイン
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">右上に固定された認証ボタン（サインイン + ログイン）</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-black mb-3">ログイン済み状態</h4>
                  <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-8 h-32">
                    <div className="absolute top-4 right-4">
                      <Button className="rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6">
                        ログアウト
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">ログイン済みの場合はログアウトボタンのみ表示</p>
                  </div>
                </div>

              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black mb-4">ログインフォーム</h3>
              <div className="max-w-md space-y-4 bg-white border border-gray-200 rounded-lg p-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">メールアドレス</label>
                  <input
                    type="email"
                    placeholder="example@student.ac.jp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">パスワード</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                  />
                </div>
                <Button className="w-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white">
                  ログイン
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">または</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full border border-gray-300 bg-white text-black hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Googleでログイン
                  </Button>
                  <Button className="w-full border border-gray-300 bg-white text-black hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#000000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                    </svg>
                    Appleでログイン
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    アカウントをお持ちでない場合は{" "}
                    <a href="#" className="text-zaim-blue-600 hover:text-zaim-blue-700 underline">
                      新規登録
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black mb-4">新規登録フォーム</h3>
              <div className="max-w-md space-y-4 bg-white border border-gray-200 rounded-lg p-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">メールアドレス</label>
                  <input
                    type="email"
                    placeholder="example@student.ac.jp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">パスワード</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">パスワード確認</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 rounded border-gray-300 text-zaim-blue-600 focus:ring-zaim-blue-400"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    <a href="#" className="text-zaim-blue-600 hover:text-zaim-blue-700 underline">利用規約</a>
                    と
                    <a href="#" className="text-zaim-blue-600 hover:text-zaim-blue-700 underline">プライバシーポリシー</a>
                    に同意します
                  </label>
                </div>

                <Button className="w-full rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6">
                  新規登録
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">または</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full border border-gray-300 bg-white text-black hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Googleで新規登録
                  </Button>
                  <Button className="w-full border border-gray-300 bg-white text-black hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#000000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                    </svg>
                    Appleで新規登録
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    すでにアカウントをお持ちの場合は{" "}
                    <a href="#" className="text-zaim-blue-600 hover:text-zaim-blue-700 underline">
                      ログイン
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding Forms */}
        <section id="onboarding">
          <h2 className="text-2xl font-bold mb-4 text-black">オンボーディング（初期設定）</h2>
          <div className="space-y-8">
            
            {/* 基本情報入力 */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">基本情報入力</h3>
              <div className="max-w-2xl bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">名前</label>
                      <input
                        type="text"
                        placeholder="田中太郎"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">年齢</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                        <option>選択してください</option>
                        <option>15歳</option>
                        <option>16歳</option>
                        <option>17歳</option>
                        <option>18歳</option>
                        <option>19歳</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">学校種別</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button className="border border-gray-300 bg-white text-black hover:bg-zaim-blue-50 hover:border-zaim-blue-400">
                        中学校
                      </Button>
                      <Button className="border border-zaim-blue-500 bg-zaim-blue-50 text-zaim-blue-700">
                        高等学校
                      </Button>
                      <Button className="border border-gray-300 bg-white text-black hover:bg-zaim-blue-50 hover:border-zaim-blue-400">
                        専門学校
                      </Button>
                      <Button className="border border-gray-300 bg-white text-black hover:bg-zaim-blue-50 hover:border-zaim-blue-400">
                        大学
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 学校情報入力 */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">学校情報入力</h3>
              <div className="max-w-2xl bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">都道府県</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                      <option>選択してください</option>
                      <option>北海道</option>
                      <option>青森県</option>
                      <option>岩手県</option>
                      <option>宮城県</option>
                      <option>秋田県</option>
                      <option>山形県</option>
                      <option>福島県</option>
                      <option>茨城県</option>
                      <option>栃木県</option>
                      <option>群馬県</option>
                      <option>埼玉県</option>
                      <option>千葉県</option>
                      <option>東京都</option>
                      <option>神奈川県</option>
                      <option>新潟県</option>
                      <option>富山県</option>
                      <option>石川県</option>
                      <option>福井県</option>
                      <option>山梨県</option>
                      <option>長野県</option>
                      <option>岐阜県</option>
                      <option>静岡県</option>
                      <option>愛知県</option>
                      <option>三重県</option>
                      <option>滋賀県</option>
                      <option>京都府</option>
                      <option>大阪府</option>
                      <option>兵庫県</option>
                      <option>奈良県</option>
                      <option>和歌山県</option>
                      <option>鳥取県</option>
                      <option>島根県</option>
                      <option>岡山県</option>
                      <option>広島県</option>
                      <option>山口県</option>
                      <option>徳島県</option>
                      <option>香川県</option>
                      <option>愛媛県</option>
                      <option>高知県</option>
                      <option>福岡県</option>
                      <option>佐賀県</option>
                      <option>長崎県</option>
                      <option>熊本県</option>
                      <option>大分県</option>
                      <option>宮崎県</option>
                      <option>鹿児島県</option>
                      <option>沖縄県</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">学校名</label>
                    <input
                      type="text"
                      placeholder="○○高等学校"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">学年</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button className="border border-gray-300 bg-white text-black hover:bg-zaim-blue-50 hover:border-zaim-blue-400">
                        1年生
                      </Button>
                      <Button className="border border-zaim-blue-500 bg-zaim-blue-50 text-zaim-blue-700">
                        2年生
                      </Button>
                      <Button className="border border-gray-300 bg-white text-black hover:bg-zaim-blue-50 hover:border-zaim-blue-400">
                        3年生
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 予算設定 */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">予算設定</h3>
              <div className="max-w-2xl bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">月の総予算</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">¥</span>
                      <input
                        type="number"
                        placeholder="30000"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">お小遣いやアルバイト代など、月に使える金額を入力してください</p>
                  </div>

                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">進行ボタン</h3>
              <div className="max-w-2xl space-y-4">
                <div className="flex gap-3">
                  <Button className="border border-gray-300 bg-white text-black hover:bg-gray-50">
                    戻る
                  </Button>
                  <Button className="flex-1 bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white">
                    次へ進む
                  </Button>
                </div>
                <Button className="w-full bg-zaim-green-500 hover:bg-zaim-green-600 text-white">
                  設定完了
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 節約投稿コンポーネント */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-black">節約投稿コンポーネント</h2>
          
          {/* 投稿カード */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">投稿カード</h3>
            <div className="space-y-4">
              {/* 基本投稿カード */}
              <div className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-zaim-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-zaim-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-black">田中さん</span>
                      <span className="text-sm text-gray-500">高校2年生</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">2時間前</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-orange-500" />
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">食費</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">月3,000円節約</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-bold text-black text-lg mb-2">お弁当作りで食費を半分に！</h4>
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                  コンビニ弁当を毎日買ってたけど、お弁当を作るようになって月3,000円も節約できました！
                  最初は面倒だったけど、慣れたら10分で作れます。冷凍食品を活用するのがコツです。
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>24</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>5</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-500 transition-colors">
                      <Share className="h-4 w-4" />
                      <span>シェア</span>
                    </button>
                  </div>
                  <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* いいね済み投稿カード */}
              <div className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-zaim-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-zaim-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-black">佐藤さん</span>
                      <span className="text-sm text-gray-500">大学1年生</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">1日前</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-blue-500" />
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">交通費</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">月2,000円節約</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-bold text-black text-lg mb-2">自転車通学で交通費ゼロ！</h4>
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                  電車通学をやめて自転車にしました。雨の日は大変だけど、月2,000円の節約と運動不足解消で一石二鳥です！
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm text-red-500 transition-colors">
                      <Heart className="h-4 w-4 fill-current" />
                      <span>18</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>3</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-500 transition-colors">
                      <Share className="h-4 w-4" />
                      <span>シェア</span>
                    </button>
                  </div>
                  <button className="text-yellow-500">
                    <Bookmark className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 投稿作成フォーム */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">投稿作成フォーム</h3>
            
            {/* バリエーション1: 基本フォーム */}
            <div className="mb-8">
              <h4 className="text-md font-medium text-black mb-3">バリエーション1: 基本フォーム</h4>
              <div className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-zaim-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-zaim-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-black">あなたの節約アイディアを投稿</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">タイトル</label>
                    <input
                      type="text"
                      placeholder="節約アイディアのタイトルを入力"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">内容</label>
                    <textarea
                      placeholder="節約方法の詳細、コツ、体験談などを教えてください"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">カテゴリ</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                        <option>選択してください</option>
                        <option>食費</option>
                        <option>交通費</option>
                        <option>娯楽</option>
                        <option>学用品</option>
                        <option>衣類</option>
                        <option>その他</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">節約効果</label>
                      <input
                        type="text"
                        placeholder="月1,000円"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                      下書き保存
                    </Button>
                    <Button className="flex-1 bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white">
                      投稿する
                    </Button>
                  </div>
                </div>
              </div>
            </div>

{/* 投稿作成フォーム（採用版） */}
            <div>
              <h4 className="text-md font-bold text-black mb-4">投稿作成フォーム（採用版）</h4>
                <div className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">タイトル</label>
                      <input
                        type="text"
                        placeholder="節約アイディアのタイトルを入力"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">内容</label>
                      <textarea
                        placeholder="節約方法の詳細、コツ、体験談などを教えてください"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">カテゴリを選択</label>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="relative">
                          <input type="radio" name="category-form3" className="peer sr-only" />
                          <div className="p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-zaim-blue-400 hover:bg-gray-50 peer-checked:border-zaim-blue-500 peer-checked:bg-zaim-blue-50 transition-all">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <Utensils className="h-5 w-5 text-gray-600 peer-checked:text-zaim-blue-600" />
                              <span className="text-xs text-gray-700 peer-checked:text-zaim-blue-700">食費</span>
                            </div>
                          </div>
                        </label>
                        <label className="relative">
                          <input type="radio" name="category-form3" className="peer sr-only" checked />
                          <div className="p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-zaim-blue-400 hover:bg-gray-50 peer-checked:border-zaim-blue-500 peer-checked:bg-zaim-blue-50 transition-all">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <Car className="h-5 w-5 text-zaim-blue-600" />
                              <span className="text-xs text-zaim-blue-700">交通費</span>
                            </div>
                          </div>
                        </label>
                        <label className="relative">
                          <input type="radio" name="category-form3" className="peer sr-only" />
                          <div className="p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-zaim-blue-400 hover:bg-gray-50 peer-checked:border-zaim-blue-500 peer-checked:bg-zaim-blue-50 transition-all">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <Gift className="h-5 w-5 text-gray-600 peer-checked:text-zaim-blue-600" />
                              <span className="text-xs text-gray-700 peer-checked:text-zaim-blue-700">娯楽</span>
                            </div>
                          </div>
                        </label>
                        <label className="relative">
                          <input type="radio" name="category-form3" className="peer sr-only" />
                          <div className="p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-zaim-blue-400 hover:bg-gray-50 peer-checked:border-zaim-blue-500 peer-checked:bg-zaim-blue-50 transition-all">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <BookOpen className="h-5 w-5 text-gray-600 peer-checked:text-zaim-blue-600" />
                              <span className="text-xs text-gray-700 peer-checked:text-zaim-blue-700">学用品</span>
                            </div>
                          </div>
                        </label>
                        <label className="relative">
                          <input type="radio" name="category-form3" className="peer sr-only" />
                          <div className="p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-zaim-blue-400 hover:bg-gray-50 peer-checked:border-zaim-blue-500 peer-checked:bg-zaim-blue-50 transition-all">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <Shirt className="h-5 w-5 text-gray-600 peer-checked:text-zaim-blue-600" />
                              <span className="text-xs text-gray-700 peer-checked:text-zaim-blue-700">衣類</span>
                            </div>
                          </div>
                        </label>
                        <label className="relative">
                          <input type="radio" name="category-form3" className="peer sr-only" />
                          <div className="p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-zaim-blue-400 hover:bg-gray-50 peer-checked:border-zaim-blue-500 peer-checked:bg-zaim-blue-50 transition-all">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <PlusCircle className="h-5 w-5 text-gray-600 peer-checked:text-zaim-blue-600" />
                              <span className="text-xs text-gray-700 peer-checked:text-zaim-blue-700">その他</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">節約効果</label>
                      <input
                        type="text"
                        placeholder="月1,000円"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                        下書き保存
                      </Button>
                      <Button className="flex-1 bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white">
                        投稿する
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

          </div>

          {/* いいねボタンバリエーション */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">いいねボタン</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors">
                  <Heart className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">いいね</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-300 rounded-lg text-red-600">
                  <Heart className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">24</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <MessageCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">コメント</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors">
                  <Bookmark className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">保存</span>
                </button>
              </div>
            </div>
          </div>

          {/* コメントコンポーネント */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">コメント</h3>
            <div className="max-w-2xl space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-zaim-green-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-zaim-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-black">山田さん</span>
                      <span className="text-xs text-gray-500">30分前</span>
                    </div>
                    <p className="text-sm text-gray-700">すごく参考になります！私も今度試してみます。</p>
                    <button className="text-xs text-zaim-blue-600 hover:text-zaim-blue-700 mt-1">
                      返信
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-zaim-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-zaim-blue-600" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="コメントを入力..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black text-sm"
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white">
                        投稿
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* マイページコンポーネント */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-black">マイページコンポーネント</h2>

          {/* プロフィールヘッダー */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">プロフィールヘッダー</h3>
            <div className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-zaim-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-zaim-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-black mb-1">田中太郎さん</h3>
                  <p className="text-sm text-gray-600 mb-2">高校2年生・東京都</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <PlusCircle className="h-4 w-4 text-zaim-blue-500" />
                      <span className="text-gray-700">投稿 <span className="font-bold text-black">12</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-gray-700">いいね <span className="font-bold text-black">89</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-700">保存 <span className="font-bold text-black">24</span></span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-zaim-green-600">¥15,200</div>
                  <div className="text-xs text-gray-600">今月の節約額</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-zaim-blue-600">32日</div>
                  <div className="text-xs text-gray-600">連続記録日数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">Lv.5</div>
                  <div className="text-xs text-gray-600">節約レベル</div>
                </div>
              </div>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">タブナビゲーション</h3>
            <div className="max-w-2xl">
              <div className="flex border-b border-gray-200">
                <button className="px-4 py-2 text-sm font-medium text-zaim-blue-600 border-b-2 border-zaim-blue-600 bg-zaim-blue-50">
                  投稿した記事
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-zaim-blue-600 hover:bg-zaim-blue-50">
                  いいねした記事
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-zaim-blue-600 hover:bg-zaim-blue-50">
                  保存した記事
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-zaim-blue-600 hover:bg-zaim-blue-50">
                  フォロー中
                </button>
              </div>
            </div>
          </div>

          {/* 投稿した記事一覧 */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">投稿した記事一覧</h3>
            <div className="max-w-2xl space-y-3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Utensils className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-black">お弁当作りで食費を半分に！</h4>
                      <span className="text-xs text-gray-500">2時間前</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      コンビニ弁当を毎日買ってたけど、お弁当を作るようになって月3,000円も節約できました...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          24
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          5
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          156
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          編集
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50">
                          削除
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-black">学割定期で通学費節約術</h4>
                      <span className="text-xs text-gray-500">1日前</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      意外と知られていない学割定期の裏技を紹介します。これで月2,000円節約できます...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          18
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          3
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          89
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          編集
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50">
                          削除
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* いいねした記事一覧 */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">いいねした記事一覧</h3>
            <div className="max-w-2xl space-y-3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-zaim-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-zaim-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-black">佐藤花子さん</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">大学1年生</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">3時間前</span>
                    </div>
                    <h4 className="font-bold text-black mb-2">フリマアプリで教科書代を回収</h4>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      使い終わった教科書をフリマアプリで売って、新しい教科書代に充てています...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-red-500">
                          <Heart className="h-4 w-4 fill-current" />
                          32
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <MessageCircle className="h-4 w-4" />
                          7
                        </span>
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-purple-500" />
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">学用品</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">いいね済み</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-zaim-yellow-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-zaim-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-black">山田次郎さん</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">高校3年生</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">5時間前</span>
                    </div>
                    <h4 className="font-bold text-black mb-2">家族割引で通信費大幅カット</h4>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      家族でまとめて格安SIMに変更したら、月4,000円も安くなりました...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-red-500">
                          <Heart className="h-4 w-4 fill-current" />
                          45
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <MessageCircle className="h-4 w-4" />
                          12
                        </span>
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-green-500" />
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">通信費</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">いいね済み</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 保存した記事一覧（コンパクト表示） */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">保存した記事一覧（コンパクト表示）</h3>
            <div className="max-w-2xl space-y-2">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                      <Utensils className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">コンビニ活用術で節約</h4>
                      <p className="text-xs text-gray-500">田中さん • 2日前</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">保存済み</span>
                    <button className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">古着屋巡りでファッション代節約</h4>
                      <p className="text-xs text-gray-500">鈴木さん • 1週間前</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">保存済み</span>
                    <button className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">図書館活用で参考書代ゼロ</h4>
                      <p className="text-xs text-gray-500">高橋さん • 2週間前</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">保存済み</span>
                    <button className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 統計カード */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">活動統計カード</h3>
            <div className="max-w-2xl grid grid-cols-2 gap-4">
              <div className="bg-zaim-blue-50 border border-zaim-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-zaim-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">今月の投稿</h4>
                    <p className="text-sm text-gray-600">前月比 +2件</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-zaim-blue-600">5件</div>
                <div className="text-xs text-gray-600 mt-1">累計: 12件</div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">もらったいいね</h4>
                    <p className="text-sm text-gray-600">今週 +15件</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">89件</div>
                <div className="text-xs text-gray-600 mt-1">平均: 7.4件/投稿</div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Bookmark className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">保存した記事</h4>
                    <p className="text-sm text-gray-600">今月 +8件</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">24件</div>
                <div className="text-xs text-gray-600 mt-1">未読: 3件</div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">節約達成率</h4>
                    <p className="text-sm text-gray-600">目標: 月20,000円</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">76%</div>
                <div className="text-xs text-gray-600 mt-1">¥15,200 / ¥20,000</div>
              </div>
            </div>
          </div>

          {/* 空の状態 */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">空の状態（Empty State）</h3>
            <div className="max-w-2xl space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="font-bold text-black mb-2">まだ投稿がありません</h4>
                <p className="text-sm text-gray-600 mb-4">
                  あなたの節約アイディアを投稿して、他のユーザーと共有しましょう！
                </p>
                <Button className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white">
                  最初の投稿を作成
                </Button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="font-bold text-black mb-2">いいねした記事がありません</h4>
                <p className="text-sm text-gray-600 mb-4">
                  気に入った節約術があったら、ハートボタンを押してみましょう！
                </p>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  投稿を探す
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications and Completion Messages */}
        <section id="notifications">
          <h2 className="text-2xl font-bold mb-4 text-black">通知・完了メッセージ</h2>
          <div className="space-y-6">
            
            {/* Email Confirmation Messages */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">メール認証完了メッセージ</h3>
              <div className="space-y-4">
                
                {/* Success Message - Email Confirmed */}
                <div>
                  <h4 className="font-medium text-black mb-3">認証成功（初期設定ページ用）</h4>
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5" />
                      <div>
                        <div className="font-medium">メール認証が完了しました！</div>
                        <div className="text-sm">アカウントの作成が正常に完了しました。初期設定を続けましょう。</div>
                      </div>
                      <button className="ml-auto text-green-500 hover:text-green-700">
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                {/* Success Message - Home Page Style */}
                <div>
                  <h4 className="font-medium text-black mb-3">認証成功（ホームページ用）</h4>
                  <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg shadow-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5" />
                      <div>
                        <div className="font-medium">メール認証完了！</div>
                        <div className="text-sm">アカウントが有効化されました。ログインできます。</div>
                      </div>
                      <button className="ml-auto text-gray-400 hover:text-gray-600">
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Message - Verification Failed */}
                <div>
                  <h4 className="font-medium text-black mb-3">認証失敗</h4>
                  <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg shadow-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5" />
                      <div>
                        <div className="font-medium">メール認証に失敗しました</div>
                        <div className="text-sm">確認リンクが無効または期限切れです。再度お試しください。</div>
                      </div>
                      <button className="ml-auto text-gray-400 hover:text-gray-600">
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Notification Styles */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">一般的な通知スタイル</h3>
              <div className="space-y-4">
                
                {/* Success Notification */}
                <div>
                  <h4 className="font-medium text-black mb-3">成功通知</h4>
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">操作が完了しました</div>
                        <div className="text-sm text-green-700">データが正常に保存されました。</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Notification */}
                <div>
                  <h4 className="font-medium text-black mb-3">警告通知</h4>
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-medium">注意が必要です</div>
                        <div className="text-sm text-yellow-700">予算の80%を使用しています。</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Notification */}
                <div>
                  <h4 className="font-medium text-black mb-3">エラー通知</h4>
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="font-medium">エラーが発生しました</div>
                        <div className="text-sm text-red-700">ネットワーク接続を確認してください。</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toast-style Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">トースト通知（固定位置）</h3>
              <div className="space-y-4">
                <div className="relative bg-gray-100 border border-gray-200 rounded-lg p-8 h-40">
                  <div className="absolute top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">支出を記録しました</div>
                        <div className="text-sm">カテゴリ: 食費 / 金額: ¥500</div>
                      </div>
                      <button className="text-green-500 hover:text-green-700 ml-2">
                        ×
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">右上に表示されるトースト通知の例</p>
                </div>
              </div>
            </div>

            {/* Inline Validation Messages */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">インラインバリデーション</h3>
              <div className="space-y-4 max-w-md">
                
                {/* Success Field */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">メールアドレス</label>
                  <input
                    type="email"
                    value="user@example.com"
                    className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white text-black"
                    readOnly
                  />
                  <div className="flex items-center gap-2 mt-1 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>有効なメールアドレスです</span>
                  </div>
                </div>

                {/* Error Field */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">パスワード</label>
                  <input
                    type="password"
                    value="123"
                    className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white text-black"
                    readOnly
                  />
                  <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                    <XCircle className="h-4 w-4" />
                    <span>パスワードは6文字以上で入力してください</span>
                  </div>
                </div>

                {/* Password Input with Toggle */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">パスワード（表示切替付き）</label>
                  <div className="relative">
                    <input
                      type={switchStates.showPassword1 ? "text" : "password"}
                      value="password123"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => handleSwitchToggle('showPassword1')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {switchStates.showPassword1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">右端のアイコンで表示/非表示を切り替え</div>
                </div>

                {/* Password Confirmation with Toggle */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">パスワード確認</label>
                  <div className="relative">
                    <input
                      type={switchStates.showPassword2 ? "text" : "password"}
                      value="password123"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => handleSwitchToggle('showPassword2')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {switchStates.showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* カレンダーデザインバリエーション */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">カレンダーデザインバリエーション（カード型ベース）</h2>
          
          <div className="space-y-8">
            {/* バリエーション1: ベーシックカード型 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">1. ベーシックカード型（オリジナル）</h3>
              <div className="bg-gray-50 rounded-lg p-6 max-w-2xl">
                <div className="grid grid-cols-7 gap-px">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div key={day} className={`text-center text-sm font-bold py-2 ${
                      i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-gray-700'
                    }`}>{day}</div>
                  ))}
                  {[...Array(35)].map((_, i) => {
                    const date = i - 2;
                    const hasExpense = [3, 10, 15, 22, 28].includes(date);
                    const isToday = date === 15;
                    return (
                      <div key={i} className={`
                        ${isToday ? 'bg-blue-500 text-white' : 'bg-white'} rounded border border-gray-200 p-3 min-h-[80px] cursor-pointer
                        ${date < 1 || date > 31 ? 'opacity-30' : ''}
                        hover:border-gray-300 transition-colors
                      `}>
                        {date > 0 && date <= 31 && (
                          <>
                            <div className={`text-lg font-semibold ${
                              isToday ? 'text-white' : 
                              (i + 2) % 7 === 0 ? 'text-red-600' : 
                              (i + 2) % 7 === 6 ? 'text-blue-600' : 
                              'text-gray-800'
                            }`}>{date}</div>
                            {hasExpense && (
                              <div className="mt-0.5">
                                <div className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-green-600'}`}>¥{(date * 300 / 1000).toFixed(1)}k</div>
                                <div className={`text-[10px] ${isToday ? 'text-blue-100' : 'text-gray-500'}`}>{Math.floor(date / 7) + 1}件</div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>


            {/* バリエーション6: 支出表示付きカレンダー */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">6. 支出表示付きカレンダー（インタラクティブ）</h3>
              <CalendarWithExpenseComponent />
            </div>

            {/* バリエーション7: ミニマル（円形強調なし） */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">7. ミニマル（円形強調なし）</h3>
              <div className="bg-gray-50 p-6 max-w-2xl">
                <div className="grid grid-cols-7 gap-px mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div key={day} className={`text-center text-sm font-medium py-2 ${
                      i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
                    }`}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {[...Array(35)].map((_, i) => {
                    const date = i - 2;
                    const isToday = date === 15;
                    return (
                      <div key={i} className="text-center py-3 h-16 flex items-center justify-center">
                        {date > 0 && date <= 31 && (
                          <div className={`text-xl font-medium ${
                            isToday ? 'bg-blue-500 text-white px-2 py-1 rounded' : 
                            (i + 2) % 7 === 0 ? 'text-red-500' : 
                            (i + 2) % 7 === 6 ? 'text-blue-500' : 
                            'text-gray-800'
                          }`}>
                            {date}
                          </div>
                        )}
                        {date <= 0 && (
                          <div className="text-xl text-gray-300 font-medium">
                            {date + 31}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* バリエーション8: カラフル強調 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">8. カラフル強調</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
                <div className="grid grid-cols-7 gap-px mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div key={day} className={`text-center text-sm font-bold py-2 rounded-md ${
                      i === 0 ? 'bg-red-50 text-red-600' : 
                      i === 6 ? 'bg-blue-50 text-blue-600' : 
                      'bg-gray-50 text-gray-700'
                    }`}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {[...Array(35)].map((_, i) => {
                    const date = i - 2;
                    const isToday = date === 15;
                    return (
                      <div key={i} className="text-center h-16 flex items-center justify-center">
                        {date > 0 && date <= 31 && (
                          <div className={`w-12 h-12 flex items-center justify-center text-xl font-semibold rounded-lg transition-all hover:scale-110 ${
                            isToday ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 
                            (i + 2) % 7 === 0 ? 'text-red-500 hover:bg-red-50' : 
                            (i + 2) % 7 === 6 ? 'text-blue-500 hover:bg-blue-50' : 
                            'text-gray-700 hover:bg-gray-100'
                          }`}>
                            {date}
                          </div>
                        )}
                        {date <= 0 && (
                          <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-300">
                            {date + 31}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* バリエーション9: 点線グリッド */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">9. 点線グリッド</h3>
              <div className="bg-white p-6 max-w-2xl" style={{backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)', backgroundSize: '15px 15px'}}>
                <div className="grid grid-cols-7 gap-px mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div key={day} className={`text-center text-sm font-medium py-2 px-2 rounded-full ${
                      i === 0 ? 'bg-red-500 text-white' : 
                      i === 6 ? 'bg-blue-500 text-white' : 
                      'bg-gray-100 text-gray-700'
                    }`}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {[...Array(35)].map((_, i) => {
                    const date = i - 2;
                    const isToday = date === 15;
                    return (
                      <div key={i} className="text-center h-16 flex items-center justify-center">
                        {date > 0 && date <= 31 && (
                          <div className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-full border-2 transition-all ${
                            isToday ? 'bg-green-500 text-white border-green-500 shadow-md' : 
                            'bg-white border-dashed border-gray-300 text-gray-700 hover:border-solid hover:border-gray-500'
                          } ${
                            (i + 2) % 7 === 0 ? 'text-red-500' : 
                            (i + 2) % 7 === 6 ? 'text-blue-500' : 
                            ''
                          }`}>
                            {date}
                          </div>
                        )}
                        {date <= 0 && (
                          <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-300">
                            {date + 31}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* バリエーション10: フラット & クリーン */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">10. フラット & クリーン</h3>
              <div className="bg-white p-6 max-w-2xl">
                <div className="grid grid-cols-7 gap-px mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div key={day} className={`text-center text-sm font-bold py-2 ${
                      i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-gray-500'
                    }`}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {[...Array(35)].map((_, i) => {
                    const date = i - 2;
                    const isToday = date === 15;
                    return (
                      <div key={i} className="text-center h-16 flex items-center justify-center">
                        {date > 0 && date <= 31 && (
                          <div className={`w-12 h-12 flex items-center justify-center text-xl font-semibold transition-all cursor-pointer rounded ${
                            isToday ? 'text-white bg-black' : 
                            (i + 2) % 7 === 0 ? 'text-red-600 hover:bg-red-50' : 
                            (i + 2) % 7 === 6 ? 'text-blue-600 hover:bg-blue-50' : 
                            'text-gray-800 hover:bg-gray-100'
                          } hover:scale-110`}>
                            {date}
                          </div>
                        )}
                        {date <= 0 && (
                          <div className="text-xl text-gray-300">
                            {date + 31}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* バリエーション11: ネオン風 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">11. ネオン風</h3>
              <div className="bg-gray-900 p-6 rounded-lg max-w-2xl">
                <div className="grid grid-cols-7 gap-px mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div key={day} className={`text-center text-sm font-bold py-2 ${
                      i === 0 ? 'text-pink-400' : i === 6 ? 'text-cyan-400' : 'text-gray-300'
                    }`}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {[...Array(35)].map((_, i) => {
                    const date = i - 2;
                    const isToday = date === 15;
                    return (
                      <div key={i} className="text-center h-16 flex items-center justify-center">
                        {date > 0 && date <= 31 && (
                          <div className={`w-12 h-12 flex items-center justify-center text-xl font-bold rounded-full border transition-all ${
                            isToday ? 'text-black bg-yellow-400 border-yellow-400 shadow-yellow-400 shadow-lg' : 
                            'text-gray-300 border-gray-600 hover:border-white hover:text-white hover:shadow-white hover:shadow-sm'
                          } ${
                            (i + 2) % 7 === 0 ? 'text-pink-400 border-pink-400 hover:shadow-pink-400 hover:shadow-sm' : 
                            (i + 2) % 7 === 6 ? 'text-cyan-400 border-cyan-400 hover:shadow-cyan-400 hover:shadow-sm' : 
                            ''
                          }`}>
                            {date}
                          </div>
                        )}
                        {date <= 0 && (
                          <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-600">
                            {date + 31}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* バリエーション12: 紙風 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">12. 紙風</h3>
              <div className="bg-yellow-50 border-2 border-yellow-200 p-6 relative max-w-2xl">
                {/* 紙の穴 */}
                <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full border border-yellow-300 bg-white"></div>
                  ))}
                </div>
                <div className="ml-6">
                  <div className="grid grid-cols-7 gap-px mb-2 border-b border-yellow-300 pb-1">
                    {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                      <div key={day} className={`text-center text-sm font-bold py-2 ${
                        i === 0 ? 'text-red-700' : i === 6 ? 'text-blue-700' : 'text-gray-800'
                      }`}>{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-px">
                    {[...Array(35)].map((_, i) => {
                      const date = i - 2;
                      const isToday = date === 15;
                      return (
                        <div key={i} className="text-center h-16 flex items-center justify-center relative">
                          {date > 0 && date <= 31 && (
                            <div className={`w-12 h-12 flex items-center justify-center text-xl font-bold cursor-pointer rounded ${
                              isToday ? 'bg-red-600 text-white transform rotate-1' : 
                              (i + 2) % 7 === 0 ? 'text-red-700 hover:bg-red-50' : 
                              (i + 2) % 7 === 6 ? 'text-blue-700 hover:bg-blue-50' : 
                              'text-gray-800 hover:bg-gray-50'
                            } hover:transform hover:scale-110 transition-all`}>
                              {date}
                            </div>
                          )}
                          {date <= 0 && (
                            <div className="text-xl text-gray-400 font-bold">
                              {date + 31}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}