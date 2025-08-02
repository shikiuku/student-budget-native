import { supabase } from '@/lib/supabase'

export interface PostBookmark {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

// 投稿をブックマークする
export async function bookmarkPost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { data, error } = await supabase
      .from('post_bookmarks')
      .insert({
        user_id: user.id,
        post_id: postId
      })
      .select()
      .single()

    if (error) throw error

    return { data: data as PostBookmark, error: null }
  } catch (error) {
    console.error('ブックマークエラー:', error)
    return { data: null, error }
  }
}

// 投稿のブックマークを取り消す
export async function unbookmarkPost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { error } = await supabase
      .from('post_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('ブックマーク取り消しエラー:', error)
    return { error }
  }
}

// ユーザーが投稿をブックマークしているかチェック
export async function checkUserBookmarkedPost(postId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: false, error: null }
    }

    const { data, error } = await supabase
      .from('post_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 は "no rows returned" エラー
      throw error
    }

    return { data: !!data, error: null }
  } catch (error) {
    console.error('ブックマーク状態確認エラー:', error)
    return { data: false, error }
  }
}

// ユーザーのブックマーク投稿一覧を取得
export async function getUserBookmarkedPosts(limit = 20, offset = 0) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { data, error } = await supabase
      .from('post_bookmarks')
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

    // ブックマークした投稿データを展開
    const bookmarkedPosts = data
      .filter(bookmark => bookmark.posts !== null)
      .map(bookmark => ({
        ...bookmark.posts,
        bookmarked_at: bookmark.created_at,
        is_bookmarked: true
      }))

    return { data: bookmarkedPosts, error: null }
  } catch (error) {
    console.error('ブックマークした投稿取得エラー:', error)
    return { data: null, error }
  }
}

// 複数の投稿に対するユーザーのブックマーク状態を一括取得
export async function checkUserBookmarkedPosts(postIds: string[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || postIds.length === 0) {
      return { data: {}, error: null }
    }

    const { data, error } = await supabase
      .from('post_bookmarks')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds)

    if (error) throw error

    // 投稿IDをキーとした真偽値のオブジェクトを作成
    const bookmarkedStatus = postIds.reduce((acc: Record<string, boolean>, postId) => {
      acc[postId] = data.some(bookmark => bookmark.post_id === postId)
      return acc
    }, {})

    return { data: bookmarkedStatus, error: null }
  } catch (error) {
    console.error('複数投稿ブックマーク状態確認エラー:', error)
    return { data: {}, error }
  }
}

// ユーザーのブックマーク数を取得
export async function getUserBookmarksCount() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { count, error } = await supabase
      .from('post_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (error) throw error

    return { data: count || 0, error: null }
  } catch (error) {
    console.error('ブックマーク数取得エラー:', error)
    return { data: 0, error }
  }
}