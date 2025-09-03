"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Heart, 
  Star, 
  Share, 
  Bookmark, 
  TrendingUp, 
  Utensils, 
  GraduationCap, 
  Smartphone, 
  Bike,
  PlusCircle,
  User,
  Car,
  Gift,
  BookOpen,
  Shirt,
  MessageCircle,
  Tag,
  Gamepad2
} from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { createPost, getPosts, updatePost, type Post } from '@/lib/api/posts'
import { likePost, unlikePost, checkUserLikedPosts } from '@/lib/api/likes'
import { bookmarkPost, unbookmarkPost, checkUserBookmarkedPosts } from '@/lib/api/bookmarks'
import { PostCard } from '@/components/post-card'
import { userProfileService } from '@/lib/database'
import type { UserProfile } from '@/lib/types'
import { useAuth } from '@/components/auth-provider'
import { PostListSkeleton } from '@/components/skeleton'

// カテゴリー別カラーヘルパー関数（post-card.tsxと統一）
const getCategoryColors = (category: string) => {
  switch (category) {
    case '食費': 
      return {
        bg: 'bg-category-food-light',
        text: 'text-category-food-dark',
        icon: 'text-category-food'
      }
    case '交通費':
      return {
        bg: 'bg-category-transport-light',
        text: 'text-category-transport-dark', 
        icon: 'text-category-transport'
      }
    case '娯楽':
      return {
        bg: 'bg-category-entertainment-light',
        text: 'text-category-entertainment-dark',
        icon: 'text-category-entertainment'
      }
    case '学用品':
      return {
        bg: 'bg-category-supplies-light',
        text: 'text-category-supplies-dark',
        icon: 'text-category-supplies'
      }
    case '衣類':
      return {
        bg: 'bg-category-clothing-light',
        text: 'text-category-clothing-dark',
        icon: 'text-category-clothing'
      }
    default:
      return {
        bg: 'bg-category-other-light',
        text: 'text-category-other-dark',
        icon: 'text-category-other'
      }
  }
}

export default function TipsPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [savingsEffect, setSavingsEffect] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({})
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // データ取得
  useEffect(() => {
    loadPosts()
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return
    try {
      const result = await userProfileService.getProfile(user.id)
      if (result.success && result.data) {
        setUserProfile(result.data)
      }
    } catch (error) {
      console.error('ユーザープロフィール取得エラー:', error)
    }
  }

  const loadPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await getPosts({ limit: 20 })
      
      if (error) {
        console.error('投稿取得エラー:', error)
        return
      }
      
      if (data) {
        setPosts(data)
        
        // いいね・ブックマーク状態を取得
        const postIds = data.map(post => post.id)
        const [likedResult, bookmarkedResult] = await Promise.all([
          checkUserLikedPosts(postIds),
          checkUserBookmarkedPosts(postIds)
        ])
        
        if (likedResult.data) {
          setLikedPosts(likedResult.data)
        }
        
        if (bookmarkedResult.data) {
          setBookmarkedPosts(bookmarkedResult.data)
        }
      }
    } catch (error) {
      console.error('投稿読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // 投稿作成
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedCategory) {
      alert('タイトル、内容、カテゴリを入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await createPost({
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        savings_effect: savingsEffect.trim() || undefined
      })

      if (error) {
        console.error('投稿作成エラー:', error)
        alert('投稿の作成に失敗しました')
        return
      }

      // フォームをリセット
      setTitle('')
      setContent('')
      setSelectedCategory('')
      setSavingsEffect('')
      setIsDialogOpen(false)

      // 投稿一覧を再読み込み
      loadPosts()
      
      alert('投稿が作成されました！')
    } catch (error) {
      console.error('投稿作成エラー:', error)
      alert('投稿の作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // いいね処理
  const handleLike = async (postId: string, isCurrentlyLiked: boolean) => {
    try {
      if (isCurrentlyLiked) {
        await unlikePost(postId)
        setLikedPosts(prev => ({ ...prev, [postId]: false }))
        // 投稿のいいね数を更新
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count - 1 }
            : post
        ))
      } else {
        await likePost(postId)
        setLikedPosts(prev => ({ ...prev, [postId]: true }))
        // 投稿のいいね数を更新
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ))
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
        setBookmarkedPosts(prev => ({ ...prev, [postId]: false }))
      } else {
        await bookmarkPost(postId)
        setBookmarkedPosts(prev => ({ ...prev, [postId]: true }))
      }
    } catch (error) {
      console.error('ブックマーク処理エラー:', error)
    }
  }

  // 投稿削除処理
  const handleDelete = (postId: string) => {
    // 投稿一覧から削除
    setPosts(prev => prev.filter(post => post.id !== postId))
    // いいね・ブックマーク状態からも削除
    setLikedPosts(prev => {
      const newState = { ...prev }
      delete newState[postId]
      return newState
    })
    setBookmarkedPosts(prev => {
      const newState = { ...prev }
      delete newState[postId]
      return newState
    })
  }

  // コメント数更新処理
  const handleCommentCountUpdate = (postId: string, newCount: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments_count: newCount }
        : post
    ))
  }

  // 投稿編集処理
  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setTitle(post.title)
    setContent(post.content)
    setSelectedCategory(post.category)
    setSavingsEffect(post.savings_effect || '')
    setIsEditDialogOpen(true)
  }

  // 投稿更新処理
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim() || !selectedCategory || !editingPost) {
      alert('タイトル、内容、カテゴリを入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await updatePost(editingPost.id, {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        savings_effect: savingsEffect.trim() || undefined
      })

      if (error) {
        console.error('投稿更新エラー:', error)
        alert('投稿の更新に失敗しました')
        return
      }

      // フォームをリセット
      setTitle('')
      setContent('')
      setSelectedCategory('')
      setSavingsEffect('')
      setEditingPost(null)
      setIsEditDialogOpen(false)

      // 投稿一覧を再読み込み
      loadPosts()
      
      alert('投稿が更新されました！')
    } catch (error) {
      console.error('投稿更新エラー:', error)
      alert('投稿の更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 編集ダイアログのキャンセル処理
  const handleEditCancel = () => {
    setTitle('')
    setContent('')
    setSelectedCategory('')
    setSavingsEffect('')
    setEditingPost(null)
    setIsEditDialogOpen(false)
  }


  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-6 py-4 space-y-6 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">節約アイディア</h1>
          {user && (
            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="プロフィール画像"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
            </div>
          )}
        </div>


        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-black">みんなの節約アイディア</h2>
          
          {loading ? (
            <PostListSkeleton count={5} />
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">まだ投稿がありません</div>
              <div className="text-sm text-gray-400 mt-1">最初の節約アイディアを投稿してみませんか？</div>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const isLiked = likedPosts[post.id] || false;
                const isBookmarked = bookmarkedPosts[post.id] || false;
                
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    isLiked={isLiked}
                    isBookmarked={isBookmarked}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onCommentCountUpdate={handleCommentCountUpdate}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Create Post Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button className="fixed bottom-24 right-4 w-14 h-14 bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white rounded-full shadow-lg z-40 flex items-center justify-center transition-colors">
            <PlusCircle className="h-6 w-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black">節約アイディアを投稿</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-black mb-1 block">タイトル</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：お弁当作りで食費節約"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-black">内容</label>
                <span className="text-xs text-gray-500">{content.length}/500</span>
              </div>
              <textarea 
                rows={4}
                maxLength={500}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="詳しい節約方法やコツを教えてください..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black resize-none modal-textarea"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#f8f9fa #ffffff'
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1 block">カテゴリを選択</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '食費', icon: Utensils, label: '食費' },
                  { value: '交通費', icon: Car, label: '交通費' },
                  { value: '娯楽', icon: Gamepad2, label: '娯楽・趣味' },
                  { value: '学用品', icon: BookOpen, label: '教材・書籍' },
                  { value: '衣類', icon: Shirt, label: '衣類・雑貨' },
                  { value: 'その他', icon: Tag, label: 'その他' }
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <label key={category.value} className="flex flex-col items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="category" 
                        value={category.value}
                        className="peer sr-only"
                        checked={selectedCategory === category.value}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      />
                      <div className={`w-full p-3 border-2 rounded-lg transition-colors ${
                        selectedCategory === category.value 
                          ? `${getCategoryColors(category.value).bg} border-current`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex flex-col items-center space-y-1">
                          <Icon className={`h-5 w-5 ${
                            selectedCategory === category.value 
                              ? getCategoryColors(category.value).icon
                              : 'text-gray-600'
                          }`} />
                          <span className={`text-xs ${
                            selectedCategory === category.value 
                              ? getCategoryColors(category.value).text
                              : 'text-gray-700'
                          }`}>{category.label}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1 block">節約効果</label>
              <input 
                type="text" 
                value={savingsEffect}
                onChange={(e) => setSavingsEffect(e.target.value)}
                placeholder="月1,000円"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black"
              />
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white disabled:opacity-50"
            >
              {isSubmitting ? '投稿中...' : '投稿する'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleEditCancel()
        }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black">投稿を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-black mb-1 block">タイトル</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：お弁当作りで食費節約"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-black">内容</label>
                <span className="text-xs text-gray-500">{content.length}/500</span>
              </div>
              <textarea 
                rows={4}
                maxLength={500}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="詳しい節約方法やコツを教えてください..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black resize-none modal-textarea"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#f8f9fa #ffffff'
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1 block">カテゴリを選択</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '食費', icon: Utensils, label: '食費' },
                  { value: '交通費', icon: Car, label: '交通費' },
                  { value: '娯楽', icon: Gamepad2, label: '娯楽・趣味' },
                  { value: '学用品', icon: BookOpen, label: '教材・書籍' },
                  { value: '衣類', icon: Shirt, label: '衣類・雑貨' },
                  { value: 'その他', icon: Tag, label: 'その他' }
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <label key={category.value} className="flex flex-col items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="edit-category" 
                        value={category.value}
                        className="peer sr-only"
                        checked={selectedCategory === category.value}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      />
                      <div className={`w-full p-3 border-2 rounded-lg transition-colors ${
                        selectedCategory === category.value 
                          ? `${getCategoryColors(category.value).bg} border-current`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex flex-col items-center space-y-1">
                          <Icon className={`h-5 w-5 ${
                            selectedCategory === category.value 
                              ? getCategoryColors(category.value).icon
                              : 'text-gray-600'
                          }`} />
                          <span className={`text-xs ${
                            selectedCategory === category.value 
                              ? getCategoryColors(category.value).text
                              : 'text-gray-700'
                          }`}>{category.label}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1 block">節約効果</label>
              <input 
                type="text" 
                value={savingsEffect}
                onChange={(e) => setSavingsEffect(e.target.value)}
                placeholder="月1,000円"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleEditCancel}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="flex-1 bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white disabled:opacity-50"
              >
                {isSubmitting ? '更新中...' : '更新する'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative z-30">
        <BottomNav currentPage="tips" />
      </div>
    </div>
  )
}
