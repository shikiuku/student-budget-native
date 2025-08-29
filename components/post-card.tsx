"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  Heart, 
  Bookmark, 
  User,
  MessageCircle,
  MoreHorizontal,
  Trash2
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { deletePost, type Post } from '@/lib/api/posts'
import { getPostComments, createComment, deleteComment, type Comment } from '@/lib/api/comments'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getCategoryIcon } from '@/lib/category-icons'
import { userProfileService } from '@/lib/database'
import { useEffect } from 'react'

interface PostCardProps {
  post: Post
  isLiked: boolean
  isBookmarked: boolean
  onLike: (postId: string, isCurrentlyLiked: boolean) => void
  onBookmark: (postId: string, isCurrentlyBookmarked: boolean) => void
  onDelete?: (postId: string) => void
  onCommentCountUpdate?: (postId: string, newCount: number) => void
}

// getCategoryIcon関数を削除（lib/category-iconsから使用）

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
    case '娯楽・趣味':
      return {
        bg: 'bg-category-entertainment-light',
        text: 'text-category-entertainment-dark',
        icon: 'text-category-entertainment'
      }
    case '教材・書籍':
      return {
        bg: 'bg-category-supplies-light',
        text: 'text-category-supplies-dark',
        icon: 'text-category-supplies'
      }
    case '衣類・雑貨':
      return {
        bg: 'bg-category-clothing-light',
        text: 'text-category-clothing-dark',
        icon: 'text-category-clothing'
      }
    case '通信費':
      return {
        bg: 'bg-category-other-light',
        text: 'text-category-other-dark',
        icon: 'text-category-other'
      }
    case 'その他':
    default:
      return {
        bg: 'bg-category-other-light',
        text: 'text-category-other-dark',
        icon: 'text-category-other'
      }
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return '数分前'
  if (diffInHours < 24) return `${diffInHours}時間前`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}日前`
  
  return date.toLocaleDateString('ja-JP')
}

export function PostCard({ post, isLiked, isBookmarked, onLike, onBookmark, onDelete, onCommentCountUpdate }: PostCardProps) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  
  const CategoryIcon = getCategoryIcon(post.category, post.user_profiles?.category_icons || undefined)
  const categoryColors = getCategoryColors(post.category)
  const isOwnPost = user?.id === post.user_id

  // 現在のユーザープロフィールを取得
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (!user) return
      try {
        const result = await userProfileService.getProfile(user.id)
        if (result.success && result.data) {
          setCurrentUserProfile(result.data)
        }
      } catch (error) {
        console.error('現在のユーザープロフィール取得エラー:', error)
      }
    }

    loadCurrentUserProfile()
  }, [user])


  const handleDelete = async () => {
    if (!isOwnPost || !onDelete) return
    
    setIsDeleting(true)
    try {
      const { error } = await deletePost(post.id)
      if (error) {
        console.error('投稿削除エラー:', error)
        alert('投稿の削除に失敗しました')
        return
      }
      
      onDelete(post.id)
    } catch (error) {
      console.error('投稿削除エラー:', error)
      alert('投稿の削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const loadComments = async () => {
    setIsLoadingComments(true)
    try {
      const { data, error } = await getPostComments(post.id)
      
      if (error) {
        console.error('コメント取得エラー:', error)
        setComments([])
        return 0
      }
      
      const commentsData = data || []
      setComments(commentsData)
      return commentsData.length
    } catch (error) {
      console.error('コメント取得エラー:', error)
      setComments([])
      return 0
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return
    
    setIsSubmittingComment(true)
    try {
      const { data, error } = await createComment(post.id, { content: newComment })
      if (error) {
        console.error('コメント作成エラー:', error)
        alert('コメントの投稿に失敗しました')
        return
      }
      
      setNewComment('')
      const newCommentCount = await loadComments()
      
      if (onCommentCountUpdate) {
        onCommentCountUpdate(post.id, newCommentCount)
      }
    } catch (error) {
      console.error('コメント作成エラー:', error)
      alert('コメントの投稿に失敗しました')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleCommentDelete = async (commentId: string) => {
    try {
      const { error } = await deleteComment(commentId)
      if (error) {
        console.error('コメント削除エラー:', error)
        alert('コメントの削除に失敗しました')
        return
      }
      
      const newCommentCount = await loadComments()
      
      if (onCommentCountUpdate) {
        onCommentCountUpdate(post.id, newCommentCount)
      }
    } catch (error) {
      console.error('コメント削除エラー:', error)
      alert('コメントの削除に失敗しました')
    }
  }



  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {post.user_profiles?.avatar_url ? (
              <img 
                src={post.user_profiles.avatar_url} 
                alt="プロフィール画像"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-800">
                {post.user_profiles?.name || '匿名ユーザー'}
              </h3>
              {post.user_profiles?.school_type && post.user_profiles?.grade && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-0">
                  {post.user_profiles.grade}
                </Badge>
              )}
              <span className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</span>
            </div>
            <h4 className="font-bold text-black mb-2">{post.title}</h4>
            <p className="text-sm text-gray-700 mb-3">{post.content}</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <CategoryIcon className={`h-4 w-4 ${categoryColors.icon}`} />
                <Badge className={`${categoryColors.bg} ${categoryColors.text} border-0`}>{post.category}</Badge>
              </div>
              {post.savings_effect && (
                <Badge className="bg-zaim-green-100 text-zaim-green-600">
                  {post.savings_effect}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onLike(post.id, isLiked)}
                  className={`flex items-center gap-1 text-sm ${
                    isLiked ? 'text-red-500' : 'text-gray-500'
                  } hover:text-red-500 transition-colors`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  {post.likes_count}
                </button>
                <Dialog open={isCommentsOpen} onOpenChange={(open) => {
                  setIsCommentsOpen(open)
                  if (open) {
                    loadComments()
                  }
                }}>
                  <DialogTrigger asChild>
                    <button 
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {post.comments_count}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[600px] bg-white border-gray-200">
                    <DialogHeader>
                      <DialogTitle className="text-black">コメント</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* コメント一覧 */}
                      <div className="max-h-[300px] overflow-y-auto space-y-3">
                        {isLoadingComments ? (
                          <div className="text-center py-4 text-gray-500">読み込み中...</div>
                        ) : comments.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">まだコメントがありません</div>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                              <div className="flex items-start gap-2 mb-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                  {comment.user_profiles?.avatar_url ? (
                                    <img 
                                      src={comment.user_profiles.avatar_url} 
                                      alt="プロフィール画像"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-4 w-4 text-gray-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-gray-800">
                                      {comment.user_profiles?.name || '匿名ユーザー'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(comment.created_at)}
                                    </span>
                                    {user?.id === comment.user_id && (
                                      <button
                                        onClick={() => handleCommentDelete(comment.id)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                      >
                                        削除
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* コメント投稿フォーム */}
                      {user && (
                        <div className="border-t pt-4">
                          <div className="flex gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                              {currentUserProfile?.avatar_url ? (
                                <img 
                                  src={currentUserProfile.avatar_url} 
                                  alt="プロフィール画像"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="コメントを入力..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zaim-blue-500 bg-white text-black resize-none"
                                rows={3}
                                maxLength={300}
                              />
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">{newComment.length}/300</span>
                                <Button
                                  onClick={handleCommentSubmit}
                                  disabled={!newComment.trim() || isSubmittingComment}
                                  className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white disabled:opacity-50"
                                  size="sm"
                                >
                                  {isSubmittingComment ? '投稿中...' : '投稿'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onBookmark(post.id, isBookmarked)}
                  className={`p-1 rounded ${
                    isBookmarked ? 'text-yellow-500' : 'text-gray-400'
                  } hover:text-yellow-500 transition-colors`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
                
                {isOwnPost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-gray-200">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-red-600 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-gray-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-black">投稿を削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              この操作は取り消すことができません。投稿が完全に削除されます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white text-black border-gray-300 hover:bg-gray-50">
                              キャンセル
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {isDeleting ? '削除中...' : '削除'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}