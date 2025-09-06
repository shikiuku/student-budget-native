import { supabase } from './supabase';

// コメントの型定義
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    id: string;
    name: string | null;
    avatar_url?: string | null;
    school_type?: string | null;
    grade?: string | null;
  };
}

// 投稿のコメント一覧を取得
export async function getPostComments(postId: string) {
  try {
    const { data: commentsData, error: commentsError } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    if (!commentsData || commentsData.length === 0) {
      return { data: [], error: null };
    }

    // コメントのユーザー情報を取得
    const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, name, avatar_url, school_type, grade')
      .in('id', userIds);

    if (profilesError) {
      console.error('プロフィール取得エラー:', profilesError);
    }

    // コメントにプロフィール情報を結合
    const commentsWithProfiles = commentsData.map(comment => ({
      ...comment,
      user_profiles: profilesData?.find(profile => profile.id === comment.user_id) || null
    }));

    return { data: commentsWithProfiles as Comment[], error: null };
  } catch (error) {
    console.error('コメント取得エラー:', error);
    return { data: null, error };
  }
}

// コメントを投稿
export async function createComment(postId: string, content: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    const { data: commentData, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return { data: commentData, error: null };
  } catch (error) {
    console.error('コメント作成エラー:', error);
    return { data: null, error };
  }
}

// コメントを削除
export async function deleteComment(commentId: string) {
  try {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('コメント削除エラー:', error);
    return { error };
  }
}

// 投稿のコメント数を取得
export async function getCommentsCount(postId: string) {
  try {
    const { count, error } = await supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;

    return { data: count || 0, error: null };
  } catch (error) {
    console.error('コメント数取得エラー:', error);
    return { data: 0, error };
  }
}