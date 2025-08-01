"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { userProfileService } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { SchoolType, UserOnboardingForm } from "@/lib/types"

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

const SCHOOL_TYPES: { value: SchoolType; label: string }[] = [
  { value: 'middle_school', label: '中学校' },
  { value: 'high_school', label: '高等学校' },
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<UserOnboardingForm>({
    name: "",
    age: 15,
    school_type: "middle_school",
    prefecture: "",
    city: "",
    school_name: "",
    grade: "",
    monthly_budget: 30000,
  })

  const handleInputChange = (field: keyof UserOnboardingForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSchoolTypeSelect = (schoolType: SchoolType) => {
    setFormData(prev => ({ ...prev, school_type: schoolType, grade: "" }))
  }

  const handleGradeSelect = (grade: string) => {
    setFormData(prev => ({ ...prev, grade }))
  }

  // 都道府県が変更されたときに市区町村をリセット
  const handlePrefectureChange = (prefecture: string) => {
    setFormData(prev => ({ ...prev, prefecture, city: "" }))
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.age) {
        toast({
          title: "入力エラー",
          description: "すべての項目を入力してください。",
          variant: "destructive",
        })
        return
      }
    } else if (step === 2) {
      if (!formData.prefecture || !formData.school_name || !formData.grade) {
        toast({
          title: "入力エラー",
          description: "すべての項目を入力してください。",
          variant: "destructive",
        })
        return
      }
    }
    setStep(step + 1)
  }

  const handlePrevStep = () => {
    setStep(step - 1)
  }

  const handleComplete = async () => {
    if (!user) {
      toast({
        title: "認証エラー",
        description: "ユーザー情報が見つかりません。再度ログインしてください。",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    if (!formData.monthly_budget || formData.monthly_budget <= 0) {
      toast({
        title: "入力エラー",
        description: "有効な予算金額を入力してください。",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await userProfileService.createProfile(user.id, formData)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "プロフィール作成完了",
        description: "アプリの利用を開始できます。",
        variant: "success",
      })

      router.push('/')
    } catch (error) {
      toast({
        title: "プロフィール作成エラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">基本情報を入力してください</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-black">名前</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="田中太郎"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-black">年齢</Label>
                <Select value={formData.age.toString()} onValueChange={(value) => handleInputChange('age', parseInt(value))}>
                  <SelectTrigger className="mt-1 border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200" position="popper" side="bottom" align="start" avoidCollisions={false} sticky="always">
                    {Array.from({ length: 7 }, (_, i) => i + 12).map(age => (
                      <SelectItem key={age} value={age.toString()} className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">
                        {age}歳
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-black mb-2 block">学校種別</Label>
              <div className="grid grid-cols-2 gap-2">
                {SCHOOL_TYPES.map(({ value, label }) => (
                  <Button
                    key={value}
                    type="button"
                    onClick={() => handleSchoolTypeSelect(value)}
                    className={`border ${
                      formData.school_type === value
                        ? "border-zaim-blue-500 bg-zaim-blue-50 text-zaim-blue-700"
                        : "border-gray-300 bg-white text-black hover:bg-zaim-blue-50 hover:border-zaim-blue-400"
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">学校情報を入力してください</h2>
            
            <div>
              <Label htmlFor="prefecture" className="text-black">都道府県</Label>
              <Select value={formData.prefecture} onValueChange={handlePrefectureChange}>
                <SelectTrigger className="mt-1 border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="選択してください" />
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
              <Label htmlFor="city" className="text-black">市区町村</Label>
              <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                <SelectTrigger className="mt-1 border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="選択してください" />
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
            
            <div>
              <Label htmlFor="school_name" className="text-black">学校名</Label>
              <Input
                id="school_name"
                type="text"
                placeholder="○○高等学校"
                value={formData.school_name}
                onChange={(e) => handleInputChange('school_name', e.target.value)}
                className="mt-1 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400"
              />
            </div>

            <div>
              <Label className="text-black mb-2 block">学年</Label>
              <div className="grid grid-cols-3 gap-2">
                {(formData.school_type === 'middle_school' 
                  ? ['中学1年生', '中学2年生', '中学3年生']
                  : ['高校1年生', '高校2年生', '高校3年生']
                ).map(grade => (
                  <Button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeSelect(grade)}
                    className={`border ${
                      formData.grade === grade
                        ? "border-zaim-blue-500 bg-zaim-blue-50 text-zaim-blue-700"
                        : "border-gray-300 bg-white text-black hover:bg-zaim-blue-50 hover:border-zaim-blue-400"
                    }`}
                  >
                    {grade}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-black">予算設定</h2>
            
            <div>
              <Label htmlFor="monthly_budget" className="text-black">月の総予算</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                <Input
                  id="monthly_budget"
                  type="number"
                  placeholder="30000"
                  value={formData.monthly_budget}
                  onChange={(e) => handleInputChange('monthly_budget', parseInt(e.target.value) || 0)}
                  className="pl-8 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">お小遣いやアルバイト代など、月に使える金額を入力してください</p>
            </div>

            <div className="bg-zaim-blue-50 border border-zaim-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-black mb-2">設定内容の確認</h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-black">
                <div><strong>名前:</strong> {formData.name}</div>
                <div><strong>年齢:</strong> {formData.age}歳</div>
                <div><strong>学校:</strong> {SCHOOL_TYPES.find(s => s.value === formData.school_type)?.label}</div>
                <div><strong>都道府県:</strong> {formData.prefecture}</div>
                <div><strong>市区町村:</strong> {formData.city}</div>
                <div><strong>学校名:</strong> {formData.school_name}</div>
                <div><strong>学年:</strong> {formData.grade}</div>
              </div>
              <div className="mt-2 text-black">
                <strong>月予算:</strong> ¥{formData.monthly_budget.toLocaleString()}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zaim-blue-500 mx-auto"></div>
          <p className="text-gray-600">認証確認中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-black">初期設定</h1>
          <p className="text-gray-600">アプリを使い始めるための設定を行います</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step ? 'bg-zaim-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {i}
              </div>
              {i < 3 && <div className={`w-16 h-1 ${i < step ? 'bg-zaim-blue-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {renderStepContent()}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <Button
              onClick={handlePrevStep}
              className="border border-gray-300 bg-white text-black hover:bg-gray-50"
              disabled={loading}
            >
              戻る
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={handleNextStep}
              className="flex-1 rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6"
              disabled={loading}
            >
              次へ進む
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="flex-1 rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6"
              disabled={loading}
            >
              {loading ? "設定完了中..." : "設定完了"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}