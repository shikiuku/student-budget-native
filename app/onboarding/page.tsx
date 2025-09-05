"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { userProfileService } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { SchoolType, UserOnboardingForm } from "@/lib/types"
import { CITIES_BY_PREFECTURE } from "@/lib/prefecture-data"
import { CheckCircle } from "lucide-react"

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
]

const SCHOOL_TYPES: { value: SchoolType; label: string }[] = [
  { value: 'middle_school', label: '中学校' },
  { value: 'high_school', label: '高等学校' },
]

function OnboardingContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showEmailSuccess, setShowEmailSuccess] = useState(false)
  
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

  // メール確認成功の確認
  useEffect(() => {
    const emailConfirmed = searchParams.get('email_confirmed')
    if (emailConfirmed === 'true') {
      setShowEmailSuccess(true)
      // 5秒後に成功メッセージを自動で非表示
      setTimeout(() => setShowEmailSuccess(false), 5000)
      
      // URLからパラメータを削除
      const url = new URL(window.location.href)
      url.searchParams.delete('email_confirmed')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

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

    if (formData.monthly_budget < 0) {
      toast({
        title: "入力エラー",
        description: "予算金額は0円以上を入力してください。",
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
                <Label htmlFor="name" className="text-black">ユーザー名</Label>
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
                  <SelectContent className="bg-white border-gray-200">
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
                <SelectContent className="bg-white border-gray-200">
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
                <SelectContent className="bg-white border-gray-200">
                  {formData.prefecture && CITIES_BY_PREFECTURE[formData.prefecture] ? 
                    CITIES_BY_PREFECTURE[formData.prefecture].map(city => (
                      <SelectItem key={city} value={city} className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">
                        {city}
                      </SelectItem>
                    )) : 
                    <SelectItem value="placeholder" disabled className="bg-white text-gray-400">都道府県を選択してください</SelectItem>
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
    router.push('/login')
    return (
      <div className="min-h-screen bg-white px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-6 pt-6">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                {i < 3 && <div className="w-16 h-1 bg-gray-200 animate-pulse" />}
              </div>
            ))}
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      {/* メール確認成功メッセージ */}
      {showEmailSuccess && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">メール認証が完了しました！</div>
              <div className="text-sm">アカウントの作成が正常に完了しました。初期設定を続けましょう。</div>
            </div>
            <button 
              onClick={() => setShowEmailSuccess(false)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto space-y-6 pt-6">
        <div className="text-center space-y-2">
          <img 
            src="/logo.png" 
            alt="家計簿アプリロゴ" 
            className="w-20 h-20 mx-auto mb-4"
          />
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

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <img 
            src="/logo.png" 
            alt="家計簿アプリロゴ" 
            className="w-16 h-16 mx-auto animate-pulse"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zaim-blue-500 mx-auto"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}