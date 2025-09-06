import { supabase } from './supabase';

// 投稿の型定義
export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  savings_effect: string | null;
  savings_amount: number | null;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // リレーション
  user_profiles?: {
    id: string;
    name: string | null;
    school_type: string | null;
    grade: string | null;
    category_icons?: Record<string, string> | null;
    avatar_url?: string | null;
  };
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface PostsFilters {
  category?: string;
  featured?: boolean;
  user_id?: string;
  limit?: number;
  offset?: number;
}

// 投稿一覧を取得
export async function getPosts(filters?: PostsFilters) {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    // フィルターを適用
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }
    
    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1);
    }

    const { data: postsData, error } = await query;

    if (error) {
      console.error('投稿取得クエリエラー:', error);
      throw error;
    }

    // 投稿に関連するユーザープロフィールといいね数を取得
    if (postsData && postsData.length > 0) {
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const postIds = postsData.map(post => post.id);

      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, name, school_type, grade, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('プロフィール取得エラー:', profilesError);
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
        ]);

        // 投稿ごとのいいね数を集計
        const likeCountMap: Record<string, number> = {};
        postIds.forEach(postId => {
          likeCountMap[postId] = likeCountsResult.data?.filter(like => like.post_id === postId).length || 0;
        });

        // 投稿ごとのコメント数を集計
        const commentCountMap: Record<string, number> = {};
        postIds.forEach(postId => {
          commentCountMap[postId] = commentCountsResult.data?.filter(comment => comment.post_id === postId).length || 0;
        });

        // 投稿データにプロフィール情報といいね数、コメント数を結合
        const postsWithProfiles = postsData.map(post => {
          const profile = profilesData?.find(profile => profile.id === post.user_id);
          return {
            ...post,
            user_profiles: profile || null,
            likes_count: likeCountMap[post.id] || 0,
            comments_count: commentCountMap[post.id] || 0
          };
        });

        return { data: postsWithProfiles as Post[], error: null };
      } catch (profileError) {
        console.error('プロフィール関連処理エラー:', profileError);
        // プロフィール取得に失敗してもpostsDataは返す
        return { data: postsData as Post[], error: null };
      }
    }

    return { data: postsData as Post[], error: null };
  } catch (error) {
    console.error('投稿取得メインエラー:', error);
    return { data: null, error };
  }
}

// ユーザーの投稿一覧を取得
export async function getUserPosts(userId: string, limit?: number) {
  return getPosts({ user_id: userId, limit });
}

// ユーザーがいいねした投稿一覧を取得
export async function getUserLikedPosts(userId: string, limit?: number) {
  try {
    const { data: likesData, error: likesError } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit || 20);

    if (likesError) throw likesError;

    if (!likesData || likesData.length === 0) {
      return { data: [], error: null };
    }

    const postIds = likesData.map(like => like.post_id);
    
    // 特定の投稿IDで投稿を直接取得
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('id', postIds)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    if (!postsData || postsData.length === 0) {
      return { data: [], error: null };
    }

    // 投稿に関連するユーザープロフィールといいね数、コメント数を取得
    const userIds = [...new Set(postsData.map(post => post.user_id))];

    const { data: profilesData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, name, school_type, grade, avatar_url')
      .in('id', userIds);

    if (profileError) {
      console.error('プロフィール取得エラー:', profileError);
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
    ]);

    // 投稿ごとのいいね数を集計
    const likeCountMap: Record<string, number> = {};
    postIds.forEach(postId => {
      likeCountMap[postId] = likeCountsResult.data?.filter(like => like.post_id === postId).length || 0;
    });

    // 投稿ごとのコメント数を集計
    const commentCountMap: Record<string, number> = {};
    postIds.forEach(postId => {
      commentCountMap[postId] = commentCountsResult.data?.filter(comment => comment.post_id === postId).length || 0;
    });

    // 投稿データにプロフィール情報といいね数、コメント数を結合
    const likedPosts = postsData.map(post => ({
      ...post,
      user_profiles: profilesData?.find(profile => profile.id === post.user_id) || null,
      likes_count: likeCountMap[post.id] || 0,
      comments_count: commentCountMap[post.id] || 0
    }));

    // いいね順序を保持するためソート
    const sortedLikedPosts = likedPosts.sort((a, b) => {
      const aIndex = postIds.indexOf(a.id);
      const bIndex = postIds.indexOf(b.id);
      return aIndex - bIndex;
    });
    
    return { data: sortedLikedPosts, error: null };
  } catch (error) {
    console.error('いいねした投稿取得エラー:', error);
    return { data: null, error };
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
      .limit(limit || 20);

    if (bookmarksError) throw bookmarksError;

    if (!bookmarksData || bookmarksData.length === 0) {
      return { data: [], error: null };
    }

    const postIds = bookmarksData.map(bookmark => bookmark.post_id);
    
    // 特定の投稿IDで投稿を直接取得
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('id', postIds)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    if (!postsData || postsData.length === 0) {
      return { data: [], error: null };
    }

    // 投稿に関連するユーザープロフィールといいね数、コメント数を取得
    const userIds = [...new Set(postsData.map(post => post.user_id))];

    const { data: profilesData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, name, school_type, grade, avatar_url')
      .in('id', userIds);

    if (profileError) {
      console.error('プロフィール取得エラー:', profileError);
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
    ]);

    // 投稿ごとのいいね数を集計
    const likeCountMap: Record<string, number> = {};
    postIds.forEach(postId => {
      likeCountMap[postId] = likeCountsResult.data?.filter(like => like.post_id === postId).length || 0;
    });

    // 投稿ごとのコメント数を集計
    const commentCountMap: Record<string, number> = {};
    postIds.forEach(postId => {
      commentCountMap[postId] = commentCountsResult.data?.filter(comment => comment.post_id === postId).length || 0;
    });

    // 投稿データにプロフィール情報といいね数、コメント数を結合
    const bookmarkedPosts = postsData.map(post => ({
      ...post,
      user_profiles: profilesData?.find(profile => profile.id === post.user_id) || null,
      likes_count: likeCountMap[post.id] || 0,
      comments_count: commentCountMap[post.id] || 0
    }));

    // ブックマーク順序を保持するためソート
    const sortedBookmarkedPosts = bookmarkedPosts.sort((a, b) => {
      const aIndex = postIds.indexOf(a.id);
      const bIndex = postIds.indexOf(b.id);
      return aIndex - bIndex;
    });
    
    return { data: sortedBookmarkedPosts, error: null };
  } catch (error) {
    console.error('ブックマークした投稿取得エラー:', error);
    return { data: null, error };
  }
}