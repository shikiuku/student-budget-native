import { supabase } from '@/lib/supabase'

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user_profiles?: {
    id: string
    name: string | null
    school_type: string | null
    grade: string | null
    avatar_url: string | null
  }
}

export interface CommentCreateData {
  content: string
}

// 投稿のコメント一覧を取得
export async function getPostComments(postId: string) {
  try {
    console.log('Supabaseクエリ開始 - Post ID:', postId)
    
    // まずコメントを取得
    const { data: commentsData, error: commentsError } = await supabase
      .from('post_comments')
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        updated_at
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('コメント取得エラー:', commentsError)
      throw commentsError
    }

    if (!commentsData || commentsData.length === 0) {
      return { data: [], error: null }
    }

    // ユーザーIDのリストを取得
    const userIds = [...new Set(commentsData.map(comment => comment.user_id))]
    
    // ユーザープロフィールを別途取得（avatar_urlも含める）
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, name, school_type, grade, avatar_url')
      .in('id', userIds)

    if (profilesError) {
      console.error('プロフィール取得エラー:', profilesError)
      // プロフィール取得に失敗してもコメントは表示する
    }

    // コメントとプロフィールを結合
    const commentsWithProfiles = commentsData.map(comment => {
      const userProfile = userProfiles?.find(profile => profile.id === comment.user_id)
      return {
        ...comment,
        user_profiles: userProfile || null
      }
    })

    console.log('Supabaseクエリ結果:', { 
      comments: commentsWithProfiles.length,
      firstComment: commentsWithProfiles[0]
    })

    return { data: commentsWithProfiles as Comment[], error: null }
  } catch (error) {
    console.error('コメント取得エラー:', error)
    return { data: null, error }
  }
}

// コメントを作成
export async function createComment(postId: string, commentData: CommentCreateData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: commentData.content.trim()
      })
      .select()
      .single()

    if (error) throw error

    return { data: data as Comment, error: null }
  } catch (error) {
    console.error('コメント作成エラー:', error)
    return { data: null, error }
  }
}

// コメントを削除
export async function deleteComment(commentId: string) {
  try {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('コメント削除エラー:', error)
    return { error }
  }
}

// コメント数を取得
export async function getCommentCount(postId: string) {
  try {
    const { count, error } = await supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (error) throw error

    return { count: count || 0, error: null }
  } catch (error) {
    console.error('コメント数取得エラー:', error)
    return { count: 0, error }
  }
}