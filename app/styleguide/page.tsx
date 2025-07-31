'use client';

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  EyeOff
} from "lucide-react"

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">UIスタイルガイド</h1>
          <p className="text-black mb-6">学生向け節約アプリで使用中のUIコンポーネント一覧</p>
          
          {/* Table of Contents */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-black mb-4">目次</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <a href="#colors" className="text-zaim-green-600 hover:text-zaim-green-700">カラーパレット</a>
              <a href="#typography" className="text-zaim-green-600 hover:text-zaim-green-700">タイポグラフィ</a>
              <a href="#buttons" className="text-zaim-green-600 hover:text-zaim-green-700">ボタン</a>
              <a href="#progress" className="text-zaim-green-600 hover:text-zaim-green-700">プログレスバー</a>
              <a href="#cards" className="text-zaim-green-600 hover:text-zaim-green-700">カード</a>
              <a href="#lists" className="text-zaim-green-600 hover:text-zaim-green-700">リストアイテム</a>
              <a href="#charts" className="text-zaim-green-600 hover:text-zaim-green-700">チャート</a>
              <a href="#icons" className="text-zaim-green-600 hover:text-zaim-green-700">アイコン</a>
              <a href="#dialogs" className="text-zaim-green-600 hover:text-zaim-green-700">ダイアログ</a>
              <a href="#spacing" className="text-zaim-green-600 hover:text-zaim-green-700">スペーシング</a>
              <a href="#forms" className="text-zaim-green-600 hover:text-zaim-green-700">フォーム要素</a>
            </div>
          </div>
        </div>

        {/* Colors */}
        <section id="colors">
          <h2 className="text-2xl font-bold mb-4 text-black">カラーパレット</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      </div>
    </div>
  )
}