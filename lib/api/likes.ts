import { supabase } from '@/lib/supabase'

export interface PostLike {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

// 投稿にいいねする
export async function likePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { data, error } = await supabase
      .from('post_likes')
      .insert({
        user_id: user.id,
        post_id: postId
      })
      .select()
      .single()

    if (error) throw error

    return { data: data as PostLike, error: null }
  } catch (error) {
    console.error('いいねエラー:', error)
    return { data: null, error }
  }
}

// 投稿のいいねを取り消す
export async function unlikePost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('いいね取り消しエラー:', error)
    return { error }
  }
}

// ユーザーが投稿にいいねしているかチェック
export async function checkUserLikedPost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: false, error: null }
    }

    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 は "no rows returned" エラー
      throw error
    }

    return { data: !!data, error: null }
  } catch (error) {
    console.error('いいね状態確認エラー:', error)
    return { data: false, error }
  }
}

// ユーザーがいいねした投稿一覧を取得
export async function getUserLikedPosts(limit = 20, offset = 0) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { data, error } = await supabase
      .from('post_likes')
      .select(`
        created_at,
        posts:post_id (
          *,
          user_profiles:user_id (
            name,
            school_type,
            grade
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // いいねした投稿データを展開
    const likedPosts = data
      .filter(like => like.posts !== null)
      .map(like => ({
        ...like.posts,
        liked_at: like.created_at,
        is_liked: true
      }))

    return { data: likedPosts, error: null }
  } catch (error) {
    console.error('いいねした投稿取得エラー:', error)
    return { data: null, error }
  }
}

// 投稿のいいね数を取得
export async function getPostLikesCount(postId: string) {
  try {
    const { count, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (error) throw error

    return { data: count || 0, error: null }
  } catch (error) {
    console.error('いいね数取得エラー:', error)
    return { data: 0, error }
  }
}

// 複数の投稿に対するユーザーのいいね状態を一括取得
export async function checkUserLikedPosts(postIds: string[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || postIds.length === 0) {
      return { data: {}, error: null }
    }

    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds)

    if (error) throw error

    // 投稿IDをキーとした真偽値のオブジェクトを作成
    const likedStatus = postIds.reduce((acc: Record<string, boolean>, postId) => {
      acc[postId] = data.some(like => like.post_id === postId)
      return acc
    }, {})

    return { data: likedStatus, error: null }
  } catch (error) {
    console.error('複数投稿いいね状態確認エラー:', error)
    return { data: {}, error }
  }
}