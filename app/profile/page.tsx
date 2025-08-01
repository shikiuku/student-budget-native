"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { userProfileService } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SwitchVariants } from "@/components/ui/switch-variants"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, School, Bell, Shield, Target } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { useToast } from "@/hooks/use-toast"
import type { UserProfile, SchoolType } from "@/lib/types"

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
]

// 都道府県ごとの主要市区町村データ（一部抜粋）
const CITIES_BY_PREFECTURE: Record<string, string[]> = {
  "東京都": [
    "千代田区", "中央区", "港区", "新宿区", "文京区", "台東区", "墨田区", "江東区",
    "品川区", "目黒区", "大田区", "世田谷区", "渋谷区", "中野区", "杉並区", "豊島区",
    "北区", "荒川区", "板橋区", "練馬区", "足立区", "葛飾区", "江戸川区",
    "八王子市", "立川市", "武蔵野市", "三鷹市", "青梅市", "府中市", "昭島市", "調布市",
    "町田市", "小金井市", "小平市", "日野市", "東村山市", "国分寺市", "国立市"
  ],
  "神奈川県": [
    "横浜市鶴見区", "横浜市神奈川区", "横浜市西区", "横浜市中区", "横浜市南区", "横浜市保土ケ谷区",
    "横浜市磯子区", "横浜市金沢区", "横浜市港北区", "横浜市戸塚区", "横浜市港南区", "横浜市旭区",
    "横浜市緑区", "横浜市瀬谷区", "横浜市栄区", "横浜市泉区", "横浜市青葉区", "横浜市都筑区",
    "川崎市川崎区", "川崎市幸区", "川崎市中原区", "川崎市高津区", "川崎市多摩区", "川崎市宮前区", "川崎市麻生区",
    "相模原市緑区", "相模原市中央区", "相模原市南区", "横須賀市", "平塚市", "鎌倉市", "藤沢市", "小田原市", "茅ヶ崎市", "逗子市"
  ],
  "大阪府": [
    "大阪市都島区", "大阪市福島区", "大阪市此花区", "大阪市西区", "大阪市港区", "大阪市大正区",
    "大阪市天王寺区", "大阪市浪速区", "大阪市西淀川区", "大阪市東淀川区", "大阪市東成区", "大阪市生野区",
    "大阪市旭区", "大阪市城東区", "大阪市阿倍野区", "大阪市住吉区", "大阪市東住吉区", "大阪市西成区",
    "大阪市淀川区", "大阪市鶴見区", "大阪市住之江区", "大阪市平野区", "大阪市北区", "大阪市中央区",
    "堺市堺区", "堺市中区", "堺市東区", "堺市西区", "堺市南区", "堺市北区", "堺市美原区",
    "岸和田市", "豊中市", "池田市", "吹田市", "泉大津市", "高槻市", "貝塚市", "守口市", "枚方市", "茨木市", "八尾市", "泉佐野市", "富田林市", "寝屋川市", "河内長野市", "松原市", "大東市", "和泉市", "箕面市", "柏原市", "羽曳野市", "門真市", "摂津市", "高石市", "藤井寺市", "東大阪市", "泉南市", "四條畷市", "交野市", "大阪狭山市", "阪南市"
  ],
  // その他の都道府県の主要都市を追加
  "北海道": ["札幌市中央区", "札幌市北区", "札幌市東区", "札幌市白石区", "札幌市豊平区", "札幌市南区", "札幌市西区", "札幌市厚別区", "札幌市手稲区", "札幌市清田区", "函館市", "小樽市", "旭川市", "室蘭市", "釧路市", "帯広市", "北見市", "夕張市", "岩見沢市", "網走市", "留萌市", "苫小牧市", "稚内市", "美唄市", "芦別市", "江別市", "赤平市", "紋別市", "士別市", "名寄市", "三笠市", "根室市", "千歳市", "滝川市", "砂川市", "深川市", "富良野市", "登別市", "恵庭市", "伊達市", "北広島市", "石狩市", "北斗市"],
  "愛知県": ["名古屋市千種区", "名古屋市東区", "名古屋市北区", "名古屋市西区", "名古屋市中村区", "名古屋市中区", "名古屋市昭和区", "名古屋市瑞穂区", "名古屋市熱田区", "名古屋市中川区", "名古屋市港区", "名古屋市南区", "名古屋市守山区", "名古屋市緑区", "名古屋市名東区", "名古屋市天白区", "豊橋市", "岡崎市", "一宮市", "瀬戸市", "半田市", "春日井市", "豊川市", "津島市", "碧南市", "刈谷市", "豊田市", "安城市", "西尾市", "蒲郡市", "犬山市", "常滑市", "江南市", "小牧市", "稲沢市", "新城市", "東海市", "大府市", "知多市", "知立市", "尾張旭市", "高浜市", "岩倉市", "豊明市", "日進市", "田原市", "愛西市", "清須市", "北名古屋市", "弥富市", "みよし市", "あま市", "長久手市"],
  "福岡県": ["北九州市門司区", "北九州市若松区", "北九州市戸畑区", "北九州市小倉北区", "北九州市小倉南区", "北九州市八幡東区", "北九州市八幡西区", "福岡市東区", "福岡市博多区", "福岡市中央区", "福岡市南区", "福岡市西区", "福岡市城南区", "福岡市早良区", "大牟田市", "久留米市", "直方市", "飯塚市", "田川市", "柳川市", "八女市", "筑後市", "大川市", "行橋市", "豊前市", "中間市", "小郡市", "筑紫野市", "春日市", "大野城市", "宗像市", "太宰府市", "古賀市", "福津市", "うきは市", "宮若市", "嘉麻市", "朝倉市", "みやま市", "糸島市", "那珂川市"],
  // デフォルトの市区町村（選択されていない場合）
  "": []
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // フォーム状態
  const [formData, setFormData] = useState({
    name: "",
    age: 15,
    school_type: "middle_school" as SchoolType,
    prefecture: "",
    city: "",
    school_name: "",
    grade: "",
    monthly_budget: 30000
  })
  
  const [notifications, setNotifications] = useState({
    spending: true,
    savings: true,
    subsidies: false,
    tips: true,
  })

  // ユーザーデータを読み込み
  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const result = await userProfileService.getProfile(user.id)
      if (result.success && result.data) {
        setUserProfile(result.data)
        setFormData({
          name: result.data.name || "",
          age: result.data.age || 15,
          school_type: result.data.school_type || "middle_school",
          prefecture: result.data.prefecture || "",
          city: result.data.city || "",
          school_name: result.data.school_name || "",
          grade: result.data.grade || "",
          monthly_budget: result.data.monthly_budget || 30000
        })
      }
    } catch (error) {
      toast({
        title: "データ読み込みエラー",
        description: "プロフィール情報の読み込みに失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // フォームデータ更新
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 都道府県が変更されたときに市区町村をリセット
  const handlePrefectureChange = (prefecture: string) => {
    setFormData(prev => ({ ...prev, prefecture, city: "" }))
  }

  // プロフィール保存
  const handleSaveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const result = await userProfileService.updateProfile(user.id, formData)
      if (result.success) {
        toast({
          title: "保存完了",
          description: "プロフィール情報を更新しました。",
        })
        loadUserProfile() // データを再読み込み
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "保存エラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zaim-blue-500 mx-auto"></div>
          <p className="text-gray-600">プロフィール情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6 pt-6">

        {/* Profile Summary */}
        <div className="bg-zaim-blue-50 border border-zaim-blue-500 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-200">
              <User className="h-8 w-8 text-zaim-blue-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-black">{formData.name || "未設定"}</h2>
              <p className="text-gray-600">{formData.grade || "未設定"}</p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-zaim-blue-100 text-zaim-blue-600 border-zaim-blue-200">
                  {formData.prefecture || "未設定"}
                </Badge>
                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                  {formData.age}歳
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-black mb-4">
            <User className="h-5 w-5 text-zaim-blue-500" />
            基本情報
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-black font-medium">名前</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="田中 太郎"
                className="mt-1 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black" 
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-black font-medium">年齢</Label>
              <Select value={formData.age.toString()} onValueChange={(value) => handleInputChange('age', parseInt(value))}>
                <SelectTrigger className="mt-1 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200" position="popper" side="bottom" align="start" avoidCollisions={false} sticky="always">
                  {Array.from({ length: 8 }, (_, i) => i + 12).map((age) => (
                    <SelectItem key={age} value={age.toString()} className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">
                      {age}歳
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade" className="text-black font-medium">学年</Label>
              <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                <SelectTrigger className="mt-1 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="学年を選択" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200" position="popper" side="bottom" align="start" avoidCollisions={false} sticky="always">
                  <SelectItem value="中学1年生" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">中学1年生</SelectItem>
                  <SelectItem value="中学2年生" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">中学2年生</SelectItem>
                  <SelectItem value="中学3年生" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">中学3年生</SelectItem>
                  <SelectItem value="高校1年生" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">高校1年生</SelectItem>
                  <SelectItem value="高校2年生" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">高校2年生</SelectItem>
                  <SelectItem value="高校3年生" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">高校3年生</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-black mb-4">
            <MapPin className="h-5 w-5 text-zaim-green-500" />
            住所情報
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="prefecture" className="text-black font-medium">都道府県</Label>
              <Select value={formData.prefecture} onValueChange={handlePrefectureChange}>
                <SelectTrigger className="mt-1 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="都道府県を選択" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200" position="popper" side="bottom" align="start" avoidCollisions={false} sticky="always">
                  {PREFECTURES.map(prefecture => (
                    <SelectItem key={prefecture} value={prefecture} className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">
                      {prefecture}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city" className="text-black font-medium">市区町村</Label>
              <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                <SelectTrigger className="mt-1 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="市区町村を選択" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200" position="popper" side="bottom" align="start" avoidCollisions={false} sticky="always">
                  {formData.prefecture && CITIES_BY_PREFECTURE[formData.prefecture] ? 
                    CITIES_BY_PREFECTURE[formData.prefecture].map(city => (
                      <SelectItem key={city} value={city} className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">
                        {city}
                      </SelectItem>
                    )) : 
                    <SelectItem value="" disabled className="bg-white text-gray-400">都道府県を選択してください</SelectItem>
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-zaim-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-zaim-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zaim-yellow-800">プライバシーについて</p>
                  <p className="text-xs text-zaim-yellow-700 mt-1">
                    住所情報は補助金情報の表示にのみ使用され、第三者に共有されることはありません。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* School Information */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-black mb-4">
            <School className="h-5 w-5 text-zaim-blue-500" />
            学校情報
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schoolName" className="text-black font-medium">学校名</Label>
              <Input 
                id="schoolName" 
                value={formData.school_name}
                onChange={(e) => handleInputChange('school_name', e.target.value)}
                placeholder="○○高等学校" 
                className="mt-1 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black" 
              />
            </div>

            <div>
              <Label htmlFor="schoolType" className="text-black font-medium">学校種別</Label>
              <Select value={formData.school_type} onValueChange={(value) => handleInputChange('school_type', value)}>
                <SelectTrigger className="mt-1 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="学校種別を選択" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200" position="popper" side="bottom" align="start" avoidCollisions={false} sticky="always">
                  <SelectItem value="middle_school" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">中学校</SelectItem>
                  <SelectItem value="high_school" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">高等学校</SelectItem>
                  <SelectItem value="vocational_school" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">専門学校</SelectItem>
                  <SelectItem value="university" className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">大学</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Budget Settings */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-black mb-4">
            <Target className="h-5 w-5 text-purple-600" />
            予算設定
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyBudget" className="text-black font-medium">月の予算</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                <Input 
                  id="monthlyBudget" 
                  type="number" 
                  value={formData.monthly_budget}
                  onChange={(e) => handleInputChange('monthly_budget', parseInt(e.target.value) || 0)}
                  placeholder="30000" 
                  className="pl-8 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">お小遣いやアルバイト代など、月に使える金額</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-black mb-4">
            <Bell className="h-5 w-5 text-orange-600" />
            通知設定
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">使いすぎアラート</p>
                <p className="text-sm text-gray-600">予算の80%を超えた時に通知</p>
              </div>
              <SwitchVariants
                variant="solid5"
                checked={notifications.spending}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, spending: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">節約目標通知</p>
                <p className="text-sm text-gray-600">目標達成時や進捗の通知</p>
              </div>
              <SwitchVariants
                variant="solid5"
                checked={notifications.savings}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, savings: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">補助金情報</p>
                <p className="text-sm text-gray-600">新しい補助金情報の通知</p>
              </div>
              <SwitchVariants
                variant="solid5"
                checked={notifications.subsidies}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, subsidies: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">節約アイディア</p>
                <p className="text-sm text-gray-600">おすすめの節約術の通知</p>
              </div>
              <SwitchVariants
                variant="solid5"
                checked={notifications.tips}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, tips: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full h-12 bg-zaim-green-500 hover:bg-zaim-green-600 text-white disabled:opacity-50"
        >
          {saving ? "保存中..." : "設定を保存"}
        </Button>
      </div>

      <BottomNav currentPage="profile" />
    </div>
  )
}
