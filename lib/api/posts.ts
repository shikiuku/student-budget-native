import { supabase } from '@/lib/supabase'

// 投稿の型定義
export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  savings_effect: string | null
  savings_amount: number | null
  likes_count: number
  comments_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
  // リレーション
  user_profiles?: {
    id: string
    name: string | null
    school_type: string | null
    grade: string | null
    category_icons?: Record<string, string> | null
    avatar_url?: string | null
  }
  is_liked?: boolean
  is_bookmarked?: boolean
}

export interface PostCreateData {
  title: string
  content: string
  category: string
  savings_effect?: string | null
  savings_amount?: number
}

export interface PostsFilters {
  category?: string
  featured?: boolean
  user_id?: string
  limit?: number
  offset?: number
}

// 投稿一覧を取得
export async function getPosts(filters?: PostsFilters) {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    // フィルターを適用
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters?.featured) {
      query = query.eq('is_featured', true)
    }
    
    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1)
    }

    console.log('投稿取得クエリを実行中...')
    const { data: postsData, error } = await query
    console.log('投稿取得結果:', { postsData, error })

    if (error) {
      console.error('投稿取得クエリエラー:', error)
      throw error
    }

    // 投稿に関連するユーザープロフィールといいね数を取得
    if (postsData && postsData.length > 0) {
      console.log('投稿データ存在、プロフィール取得開始')
      const userIds = [...new Set(postsData.map(post => post.user_id))]
      const postIds = postsData.map(post => post.id)

      try {
        console.log('プロフィール取得対象ユーザーID:', userIds)
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, name, school_type, grade, avatar_url')
          .in('id', userIds)

        console.log('プロフィール取得結果:', { profilesData, profilesError })

        if (profilesError) {
          console.error('プロフィール取得エラー:', profilesError)
        }

        // 各投稿のいいね数とコメント数を取得
        const [likeCountsResult, commentCountsResult] = await Promise.all([
          supabase
            .from('post_likes')
            .select('post_id')
            .in('post_id', postIds),
          supabase
            .from('post_comments')
            .select('post_id')
            .in('post_id', postIds)
        ])

        // 投稿ごとのいいね数を集計
        const likeCountMap: Record<string, number> = {}
        postIds.forEach(postId => {
          likeCountMap[postId] = likeCountsResult.data?.filter(like => like.post_id === postId).length || 0
        })

        // 投稿ごとのコメント数を集計
        const commentCountMap: Record<string, number> = {}
        postIds.forEach(postId => {
          commentCountMap[postId] = commentCountsResult.data?.filter(comment => comment.post_id === postId).length || 0
        })

        // 投稿データにプロフィール情報といいね数、コメント数を結合
        const postsWithProfiles = postsData.map(post => {
          const profile = profilesData?.find(profile => profile.id === post.user_id)
          return {
            ...post,
            user_profiles: profile || null,
            likes_count: likeCountMap[post.id] || 0,
            comments_count: commentCountMap[post.id] || 0
          }
        })

        console.log('最終的な投稿データ:', postsWithProfiles)
        return { data: postsWithProfiles as Post[], error: null }
      } catch (profileError) {
        console.error('プロフィール関連処理エラー:', profileError)
        // プロフィール取得に失敗してもpostsDataは返す
        return { data: postsData as Post[], error: null }
      }
    }

    console.log('投稿データなし、空配列を返す')
    return { data: postsData as Post[], error: null }
  } catch (error) {
    console.error('投稿取得メインエラー:', error)
    console.error('エラー詳細:', {
      message: (error as any)?.message,
      code: (error as any)?.code,
      details: (error as any)?.details
    })
    return { data: null, error }
  }
}

// おすすめ投稿を取得
export async function getFeaturedPosts() {
  return getPosts({ featured: true, limit: 5 })
}

// 特定の投稿を取得
export async function getPost(id: string) {
  try {
    const { data: postData, error } = await supabase
      .from('posts')
      .select(`
        *,
        user_profiles (
          id,
          name,
          school_type,
          grade,
          category_icons,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return { data: postData as Post, error: null }
  } catch (error) {
    console.error('投稿取得エラー:', error)
    return { data: null, error }
  }
}

// 投稿を作成
export async function createPost(postData: PostCreateData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        ...postData
      })
      .select()
      .single()

    if (error) throw error

    return { data: data as Post, error: null }
  } catch (error) {
    console.error('投稿作成エラー:', error)
    return { data: null, error }
  }
}

// 投稿を更新
export async function updatePost(id: string, postData: Partial<PostCreateData>) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data: data as Post, error: null }
  } catch (error) {
    console.error('投稿更新エラー:', error)
    return { data: null, error }
  }
}

// 投稿を削除
export async function deletePost(id: string) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('投稿削除エラー:', error)
    return { error }
  }
}

// カテゴリ別投稿数を取得
export async function getPostsCountByCategory() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .not('category', 'is', null)

    if (error) throw error

    // カテゴリ別にカウント
    const counts = data.reduce((acc: Record<string, number>, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1
      return acc
    }, {})

    return { data: counts, error: null }
  } catch (error) {
    console.error('カテゴリ別投稿数取得エラー:', error)
    return { data: null, error }
  }
}

// ユーザーの投稿一覧を取得
export async function getUserPosts(userId: string, limit?: number) {
  return getPosts({ user_id: userId, limit })
}

// ユーザーがいいねした投稿一覧を取得
export async function getUserLikedPosts(userId: string, limit?: number) {
  try {
    const { data: likesData, error: likesError } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit || 20)

    if (likesError) throw likesError

    if (!likesData || likesData.length === 0) {
      return { data: [], error: null }
    }

    const postIds = likesData.map(like => like.post_id)
    
    // getUserPostsと同じ方法でgetPosts()を使用
    const result = await getPosts({ limit: postIds.length })
    
    if (result.error || !result.data) {
      return result
    }
    
    // いいねした投稿のみをフィルタリング
    const likedPosts = result.data.filter(post => postIds.includes(post.id))
    
    return { data: likedPosts, error: null }
  } catch (error) {
    console.error('いいねした投稿取得エラー:', error)
    return { data: null, error }
  }
}

// ユーザーがブックマークした投稿一覧を取得
export async function getUserBookmarkedPosts(userId: string, limit?: number) {
  try {
    const { data: bookmarksData, error: bookmarksError } = await supabase
      .from('post_bookmarks')
      .select('post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit || 20)

    if (bookmarksError) throw bookmarksError

    if (!bookmarksData || bookmarksData.length === 0) {
      return { data: [], error: null }
    }

    const postIds = bookmarksData.map(bookmark => bookmark.post_id)
    
    // getUserPostsと同じ方法でgetPosts()を使用
    const result = await getPosts({ limit: postIds.length })
    
    if (result.error || !result.data) {
      return result
    }
    
    // ブックマークした投稿のみをフィルタリング
    const bookmarkedPosts = result.data.filter(post => postIds.includes(post.id))
    
    return { data: bookmarkedPosts, error: null }
  } catch (error) {
    console.error('ブックマークした投稿取得エラー:', error)
    return { data: null, error }
  }
}