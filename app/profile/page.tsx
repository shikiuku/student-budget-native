"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { userProfileService } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SwitchVariants } from "@/components/ui/switch-variants"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, School, Bell, Shield, Target, Heart, Bookmark, FileText, Settings, Palette } from "lucide-react"
import { CategoryIconSelector } from "@/components/category-icon-selector"
import { getCategoryIcon } from "@/lib/category-icons"
import { BottomNav } from "@/components/bottom-nav"
import { useToast } from "@/hooks/use-toast"
import type { UserProfile, SchoolType } from "@/lib/types"
import { CITIES_BY_PREFECTURE } from "@/lib/prefecture-data"
import { getUserPosts, getUserLikedPosts, getUserBookmarkedPosts, type Post } from '@/lib/api/posts'
import { PostCard } from '@/components/post-card'
import { likePost, unlikePost, checkUserLikedPosts } from '@/lib/api/likes'
import { bookmarkPost, unbookmarkPost, checkUserBookmarkedPosts } from '@/lib/api/bookmarks'

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
]

// カテゴリー背景色を取得する関数
const getCategoryBgColor = (categoryName: string): string => {
  switch (categoryName) {
    case '食費': return '#FFF3E0'
    case '交通費': return '#E0F8F8'
    case '娯楽・趣味': return '#FFF9C4'
    case '教材・書籍': return '#E8F5E8'
    case '衣類・雑貨': return '#F8E8E8'
    case '通信費': return '#F0EDFF'
    case 'その他': return '#F3F4F6'
    default: return '#F3F4F6'
  }
}

// カテゴリーアイコン色を取得する関数
const getCategoryIconColor = (categoryName: string): string => {
  switch (categoryName) {
    case '食費': return '#FF6B35'
    case '交通費': return '#4ECDC4'
    case '娯楽・趣味': return '#FFD23F'
    case '教材・書籍': return '#6A994E'
    case '衣類・雑貨': return '#BC4749'
    case '通信費': return '#9C88FF'
    case 'その他': return '#6B7280'
    default: return '#6B7280'
  }
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // タブ状態
  const [activeTab, setActiveTab] = useState('posts')
  
  // 投稿関連の状態
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [likedPostsState, setLikedPostsState] = useState<Record<string, boolean>>({})
  const [bookmarkedPostsState, setBookmarkedPostsState] = useState<Record<string, boolean>>({})
  
  // フォーム状態
  const [formData, setFormData] = useState({
    name: "",
    age: 15,
    school_type: "middle_school" as SchoolType,
    prefecture: "",
    city: "",
    school_name: "",
    grade: "",
    monthly_budget: 30000,
    savings_balance: 0
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
      loadUserPosts()
    }
  }, [user])

  // タブが変更されたときの投稿読み込み
  useEffect(() => {
    if (user && activeTab !== 'settings') {
      loadPostsForTab(activeTab)
    }
  }, [activeTab, user])

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
          monthly_budget: result.data.monthly_budget || 30000,
          savings_balance: result.data.savings_balance || 0
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

  // ユーザーの投稿データを読み込み
  const loadUserPosts = async () => {
    if (!user) return
    
    setPostsLoading(true)
    try {
      const { data } = await getUserPosts(user.id, 20)
      if (data) {
        setUserPosts(data)
        await loadLikeBookmarkStates(data)
      }
    } catch (error) {
      console.error('ユーザー投稿読み込みエラー:', error)
    } finally {
      setPostsLoading(false)
    }
  }

  // タブに応じた投稿データを読み込み
  const loadPostsForTab = async (tabName: string) => {
    if (!user) return

    setPostsLoading(true)
    try {
      let data: Post[] = []
      
      switch (tabName) {
        case 'posts':
          const userPostsResult = await getUserPosts(user.id, 20)
          data = userPostsResult.data || []
          setUserPosts(data)
          break
        case 'liked':
          const likedResult = await getUserLikedPosts(user.id, 20)
          console.log('いいねした投稿取得結果:', likedResult)
          data = likedResult.data || []
          setLikedPosts(data)
          console.log('いいねした投稿データ:', data)
          break
        case 'bookmarked':
          const bookmarkedResult = await getUserBookmarkedPosts(user.id, 20)
          data = bookmarkedResult.data || []
          setBookmarkedPosts(data)
          break
      }
      
      if (data.length > 0) {
        await loadLikeBookmarkStates(data)
      }
    } catch (error) {
      console.error('投稿読み込みエラー:', error)
    } finally {
      setPostsLoading(false)
    }
  }

  // いいね・ブックマーク状態を読み込み
  const loadLikeBookmarkStates = async (posts: Post[]) => {
    if (!posts.length) return

    const postIds = posts.map(post => post.id)
    const [likedResult, bookmarkedResult] = await Promise.all([
      checkUserLikedPosts(postIds),
      checkUserBookmarkedPosts(postIds)
    ])

    if (likedResult.data) {
      setLikedPostsState(likedResult.data)
    }

    if (bookmarkedResult.data) {
      setBookmarkedPostsState(bookmarkedResult.data)
    }
  }

  // いいね処理
  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    try {
      if (isCurrentlyLiked) {
        await unlikePost(postId)
        setLikedPostsState(prev => ({ ...prev, [postId]: false }))
        // 投稿のいいね数を更新
        updatePostLikesCount(postId, -1)
      } else {
        await likePost(postId)
        setLikedPostsState(prev => ({ ...prev, [postId]: true }))
        // 投稿のいいね数を更新
        updatePostLikesCount(postId, 1)
      }
    } catch (error) {
      console.error('いいね処理エラー:', error)
    }
  }

  // ブックマーク処理
  const handleBookmark = async (postId: string, isCurrentlyBookmarked: boolean) => {
    try {
      if (isCurrentlyBookmarked) {
        await unbookmarkPost(postId)
        setBookmarkedPostsState(prev => ({ ...prev, [postId]: false }))
      } else {
        await bookmarkPost(postId)
        setBookmarkedPostsState(prev => ({ ...prev, [postId]: true }))
      }
    } catch (error) {
      console.error('ブックマーク処理エラー:', error)
    }
  }

  // 投稿削除処理
  const handleDelete = (postId: string) => {
    // 全ての投稿配列から削除
    setUserPosts(prev => prev.filter(post => post.id !== postId))
    setLikedPosts(prev => prev.filter(post => post.id !== postId))
    setBookmarkedPosts(prev => prev.filter(post => post.id !== postId))
    
    // 状態からも削除
    setLikedPostsState(prev => {
      const newState = { ...prev }
      delete newState[postId]
      return newState
    })
    setBookmarkedPostsState(prev => {
      const newState = { ...prev }
      delete newState[postId]
      return newState
    })
  }

  // 投稿のいいね数を更新
  const updatePostLikesCount = (postId: string, change: number) => {
    const updatePosts = (posts: Post[]) => 
      posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + change }
          : post
      )
    
    setUserPosts(prev => updatePosts(prev))
    setLikedPosts(prev => updatePosts(prev))
    setBookmarkedPosts(prev => updatePosts(prev))
  }

  // フォームデータ更新
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 都道府県が変更されたときに市区町村をリセット
  const handlePrefectureChange = (prefecture: string) => {
    setFormData(prev => ({ ...prev, prefecture, city: "" }))
  }

  // アイコン変更処理
  const handleIconChanged = (categoryName: string, newIcon: string) => {
    // ユーザープロフィールの状態を更新
    setUserProfile(prev => {
      if (!prev) return prev
      
      const updatedCategoryIcons = { ...prev.category_icons, [categoryName]: newIcon }
      return { ...prev, category_icons: updatedCategoryIcons }
    })
  }

  // プロフィール保存
  const handleSaveProfile = async () => {
    if (!user) return
    
    if (formData.monthly_budget < 0) {
      toast({
        title: "入力エラー",
        description: "予算金額は0円以上を入力してください。",
        variant: "destructive",
      })
      return
    }
    
    setSaving(true)
    try {
      const result = await userProfileService.updateProfile(user.id, formData)
      if (result.success) {
        toast({
          title: "保存完了",
          description: "プロフィール情報を更新しました。",
          variant: "success",
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

  // 投稿リストを表示するヘルパー関数
  const renderPostsList = (posts: Post[], emptyMessage: string) => {
    if (postsLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zaim-blue-500 mx-auto mb-2"></div>
          <div className="text-gray-500">読み込み中...</div>
        </div>
      )
    }

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500">{emptyMessage}</div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => {
          const isLiked = likedPostsState[post.id] || false
          const isBookmarked = bookmarkedPostsState[post.id] || false
          
          return (
            <PostCard
              key={post.id}
              post={post}
              isLiked={isLiked}
              isBookmarked={isBookmarked}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onDelete={handleDelete}
            />
          )
        })}
      </div>
    )
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

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger 
              value="posts" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-zaim-blue-600"
            >
              <FileText className="h-4 w-4" />
              投稿
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              <Heart className="h-4 w-4" />
              いいね
            </TabsTrigger>
            <TabsTrigger 
              value="bookmarked" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-yellow-600"
            >
              <Bookmark className="h-4 w-4" />
              保存済み
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-800"
            >
              <Settings className="h-4 w-4" />
              設定
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-black">自分の投稿</h2>
              {renderPostsList(userPosts, "まだ投稿がありません")}
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-black">いいねした投稿</h2>
              {renderPostsList(likedPosts, "いいねした投稿がありません")}
            </div>
          </TabsContent>

          <TabsContent value="bookmarked" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-black">保存した投稿</h2>
              {renderPostsList(bookmarkedPosts, "保存した投稿がありません")}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">

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
                <SelectContent className="bg-white border-gray-200">
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
                <SelectContent className="bg-white border-gray-200">
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
              <Label htmlFor="city" className="text-black font-medium">市区町村</Label>
              <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                <SelectTrigger className="mt-1 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="市区町村を選択" />
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
                <SelectContent className="bg-white border-gray-200">
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
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">お小遣いやアルバイト代など、月に使える金額</p>
            </div>
            
            <div>
              <Label htmlFor="savingsBalance" className="text-black font-medium">貯金残高</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                <Input 
                  id="savingsBalance" 
                  type="number" 
                  value={formData.savings_balance === 0 ? '' : formData.savings_balance}
                  onChange={(e) => handleInputChange('savings_balance', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  placeholder="0" 
                  className="pl-8 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">現在の貯金額。毎月の余った予算は自動でここに追加されます</p>
            </div>
          </div>
        </div>

        {/* Category Icon Settings */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-black mb-4">
            <Palette className="h-5 w-5 text-purple-600" />
            カテゴリーアイコン設定
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            各カテゴリーのアイコンをお好みに変更できます。設定したアイコンは節約ページの投稿でも表示されます。
          </p>
          
          <div className="space-y-3">
            {['食費', '交通費', '娯楽・趣味', '教材・書籍', '衣類・雑貨', '通信費', 'その他'].map((category) => {
              const IconComponent = getCategoryIcon(category, userProfile?.category_icons || undefined)
              
              return (
                <div key={category} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: getCategoryBgColor(category),
                      }}
                    >
                      {React.createElement(IconComponent, { 
                        className: "h-5 w-5",
                        style: { color: getCategoryIconColor(category) }
                      })}
                    </div>
                    <div>
                      <p className="font-medium text-black">{category}</p>
                    </div>
                  </div>
                  
                  <CategoryIconSelector
                    categoryName={category}
                    currentIcon={userProfile?.category_icons?.[category]}
                    userCategoryIcons={userProfile?.category_icons || undefined}
                    onIconChanged={handleIconChanged}
                  />
                </div>
              )
            })}
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
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav currentPage="profile" />
    </div>
  )
}
