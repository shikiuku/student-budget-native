import { supabase } from '@/lib/supabase'

export interface PostComment {
  id: string
  user_id: string
  post_id: string
  content: string
  parent_comment_id: string | null
  created_at: string
  updated_at: string
  // リレーション
  user_profiles?: {
    name: string | null
    school_type: string | null
    grade: string | null
  }
  replies?: PostComment[]
}

export interface CommentCreateData {
  content: string
  parent_comment_id?: string | null
}

// 投稿のコメント一覧を取得
export async function getPostComments(postId: string) {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user_profiles:user_id (
          name,
          school_type,
          grade
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // 親コメントと返信コメントを整理
    const comments = data as PostComment[]
    const parentComments = comments.filter(comment => !comment.parent_comment_id)
    const replyComments = comments.filter(comment => comment.parent_comment_id)

    // 親コメントに返信を紐づけ
    const commentsWithReplies = parentComments.map(parent => ({
      ...parent,
      replies: replyComments.filter(reply => reply.parent_comment_id === parent.id)
    }))

    return { data: commentsWithReplies, error: null }
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
        user_id: user.id,
        post_id: postId,
        content: commentData.content,
        parent_comment_id: commentData.parent_comment_id || null
      })
      .select(`
        *,
        user_profiles:user_id (
          name,
          school_type,
          grade
        )
      `)
      .single()

    if (error) throw error

    return { data: data as PostComment, error: null }
  } catch (error) {
    console.error('コメント作成エラー:', error)
    return { data: null, error }
  }
}

// コメントを更新
export async function updateComment(commentId: string, content: string) {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .update({ content })
      .eq('id', commentId)
      .select(`
        *,
        user_profiles:user_id (
          name,
          school_type,
          grade
        )
      `)
      .single()

    if (error) throw error

    return { data: data as PostComment, error: null }
  } catch (error) {
    console.error('コメント更新エラー:', error)
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

// 投稿のコメント数を取得
export async function getPostCommentsCount(postId: string) {
  try {
    const { count, error } = await supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .is('parent_comment_id', null) // 親コメントのみカウント

    if (error) throw error

    return { data: count || 0, error: null }
  } catch (error) {
    console.error('コメント数取得エラー:', error)
    return { data: 0, error }
  }
}

// ユーザーのコメント一覧を取得
export async function getUserComments(limit = 20, offset = 0) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        posts:post_id (
          id,
          title,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { data: data as (PostComment & { posts: any })[], error: null }
  } catch (error) {
    console.error('ユーザーコメント取得エラー:', error)
    return { data: null, error }
  }
}

// 特定のコメントを取得
export async function getComment(commentId: string) {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user_profiles:user_id (
          name,
          school_type,
          grade
        ),
        posts:post_id (
          id,
          title
        )
      `)
      .eq('id', commentId)
      .single()

    if (error) throw error

    return { data: data as PostComment, error: null }
  } catch (error) {
    console.error('コメント取得エラー:', error)
    return { data: null, error }
  }
}