import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { getCategoryIcon, getCategoryColor, getCategoryBackgroundColor } from '../../utils/categoryIcons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

// 元のWebアプリと同じ型定義
interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  savings_effect?: string;
  user_id: string;
  user_profiles?: {
    id: string;
    name: string;
    school_type?: string;
    grade?: string;
  };
  likes_count: number;
  created_at: string;
  updated_at: string;
}

interface PostForm {
  title: string;
  content: string;
  category: string;
  savings_effect: string;
}

// 統一されたカテゴリ定義
const categories = ['食費', '交通費', '娯楽', '学用品', '衣類', 'その他'] as const;

// ソート・フィルター用の型定義
type SortType = 'latest' | 'likes' | 'category';

// 学年表示用ヘルパー関数
const getDisplayGrade = (schoolType: string, grade: string): string => {
  console.log('getDisplayGrade called with:', { schoolType, grade }); // デバッグログ
  
  // gradeに既に学校名が含まれているかチェック
  if (grade && (
    grade.includes('高校') ||
    grade.includes('中学') ||
    grade.includes('小学') ||
    grade.includes('大学') ||
    grade.includes('大学院')
  )) {
    // 既に完全な形式で入っている場合はそのまま返す
    return grade;
  }
  
  let displaySchoolType = '';
  
  switch (schoolType) {
    case 'elementary':
      displaySchoolType = '小学校';
      break;
    case 'junior_high':
      displaySchoolType = '中学校';
      break;
    case 'high_school':
      displaySchoolType = '高校';
      break;
    case 'university':
      displaySchoolType = '大学';
      break;
    case 'graduate_school':
      displaySchoolType = '大学院';
      break;
    default:
      displaySchoolType = '学校';
      break;
  }
  
  // 学年のフォーマットも整理
  let displayGrade = grade;
  if (grade && !grade.includes('年')) {
    // "一年"、"1年"などの形式に変換
    displayGrade = grade.replace(/[0-9]+/, (match) => {
      const gradeNumber = parseInt(match);
      const kanjiNumbers = ['一', '二', '三', '四', '五', '六'];
      return kanjiNumbers[gradeNumber - 1] || match;
    });
    if (!displayGrade.includes('年')) {
      displayGrade += '年生';
    }
  }
  
  const result = `${displaySchoolType}${displayGrade}`;
  console.log('getDisplayGrade result:', result); // デバッグログ
  return result;
};

export default function TipsScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  const [newPost, setNewPost] = useState<PostForm>({
    title: '',
    content: '',
    category: '',
    savings_effect: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('latest');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [editOptionsPost, setEditOptionsPost] = useState<Post | null>(null);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadPosts();
      loadUserInteractions();
      loadCurrentUserProfile();
    }
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;
      
      // 投稿に関連するユーザープロフィールといいね数を取得
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map(post => post.user_id))];
        const postIds = postsData.map(post => post.id);
        
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('id, name, school_type, grade, avatar_url')
          .in('id', userIds);
        
        console.log('Profile data loaded:', profilesData); // デバッグ用

        // 各投稿のいいね数を取得
        const { data: likeCounts } = await supabase
          .from('post_likes')
          .select('post_id')
          .in('post_id', postIds);

        // 投稿ごとのいいね数を集計
        const likeCountMap: Record<string, number> = {};
        postIds.forEach(postId => {
          likeCountMap[postId] = likeCounts?.filter(like => like.post_id === postId).length || 0;
        });

        // 投稿データにプロフィール情報といいね数を結合
        const postsWithProfiles = postsData.map(post => ({
          ...post,
          user_profiles: profilesData?.find(profile => profile.id === post.user_id) || null,
          likes_count: likeCountMap[post.id] || 0
        }));

        setPosts(postsWithProfiles || []);
      } else {
        setPosts(postsData || []);
      }


    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('エラー', '投稿の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const loadUserInteractions = async () => {
    if (!user) return;

    try {
      console.log('ユーザーインタラクション読み込み開始:', user.id);
      
      // いいね状態を取得
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (likesError) {
        console.error('いいね取得エラー:', likesError);
        throw likesError;
      }
      
      console.log('いいねデータ取得成功:', likesData);
      const likedPostIds: Record<string, boolean> = {};
      (likesData || []).forEach(like => {
        likedPostIds[like.post_id] = true;
      });
      setLikedPosts(likedPostIds);

      // ブックマーク状態を取得
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('post_bookmarks')
        .select('post_id')
        .eq('user_id', user.id);

      if (bookmarksError) {
        console.error('ブックマーク取得エラー:', bookmarksError);
        throw bookmarksError;
      }
      
      console.log('ブックマークデータ取得成功:', bookmarksData);
      const bookmarkedPostIds: Record<string, boolean> = {};
      (bookmarksData || []).forEach(bookmark => {
        bookmarkedPostIds[bookmark.post_id] = true;
      });
      setBookmarkedPosts(bookmarkedPostIds);

    } catch (error) {
      console.error('Error loading user interactions:', error);
      Alert.alert('情報', `ユーザーインタラクションの読み込み中にエラーが発生しました: ${error.message || JSON.stringify(error)}`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    await loadUserInteractions();
    if (user) {
      await loadCurrentUserProfile();
    }
    setRefreshing(false);
  };

  // 現在のユーザープロフィール取得
  const loadCurrentUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('id, name, school_type, grade, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Current user profile load error:', error);
        return;
      }

      console.log('Current user profile loaded:', profileData);
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error loading current user profile:', error);
    }
  };

  const handleSubmitPost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      Alert.alert('入力エラー', 'タイトル、内容、カテゴリを入力してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          category: newPost.category,
          savings_effect: newPost.savings_effect.trim() || null,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert('成功', '投稿が作成されました！');
      
      // フォームをリセット
      setNewPost({
        title: '',
        content: '',
        category: '',
        savings_effect: ''
      });

      // フォームを閉じる
      setShowCreateForm(false);
      setShowModal(false);

      // 投稿一覧を再読み込み
      loadPosts();

    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('エラー', '投稿の作成に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      Alert.alert('エラー', 'ログインが必要です。');
      return;
    }

    const isCurrentlyLiked = Boolean(likedPosts[postId]);
    console.log('いいね処理開始:', { 
      postId, 
      isCurrentlyLiked, 
      likedPostsKeys: Object.keys(likedPosts),
      userId: user.id 
    });
    
    try {
      if (isCurrentlyLiked) {
        // いいねを削除
        console.log('いいね削除処理開始');
        const { data, error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .select();

        if (error) {
          console.error('いいね削除エラー:', error);
          throw error;
        }

        console.log('いいね削除成功:', data);
        setLikedPosts(prev => {
          const newState = { ...prev };
          delete newState[postId];
          console.log('いいね削除後の新しい状態:', newState);
          return newState;
        });
        // 投稿のいいね数を更新
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
            : post
        ));
      } else {
        // いいねを追加
        console.log('いいね追加処理開始');
        const { data, error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id })
          .select();

        if (error) {
          console.error('いいね追加エラー:', error);
          throw error;
        }

        console.log('いいね追加成功:', data);
        setLikedPosts(prev => {
          const newState = { ...prev, [postId]: true };
          console.log('いいね追加後の新しい状態:', newState);
          return newState;
        });
        // 投稿のいいね数を更新
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('エラー', `いいねの処理に失敗しました。詳細: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;

    const isCurrentlyBookmarked = bookmarkedPosts[postId];
    
    try {
      if (isCurrentlyBookmarked) {
        // ブックマークを削除
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setBookmarkedPosts(prev => {
          const newState = { ...prev };
          delete newState[postId];
          return newState;
        });
      } else {
        // ブックマークを追加
        const { error } = await supabase
          .from('post_bookmarks')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;

        setBookmarkedPosts(prev => ({ ...prev, [postId]: true }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('エラー', 'ブックマークの処理に失敗しました。');
    }
  };

  // 編集ツールバー表示切り替え
  const handleShowEditOptions = (post: Post) => {
    if (activePostId === post.id) {
      // 既に表示中の場合は非表示に
      setActivePostId(null);
    } else {
      // 新しい投稿のツールバーを表示
      setActivePostId(post.id);
    }
    setEditOptionsPost(post);
  };

  // 投稿編集処理
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      category: post.category,
      savings_effect: post.savings_effect || ''
    });
    setActivePostId(null); // ツールバーを非表示
    setShowEditModal(true);
  };

  // 投稿削除処理
  const handleDeletePost = async (post: Post) => {
    Alert.alert(
      '投稿を削除',
      'この投稿を削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id)
                .eq('user_id', user?.id);

              if (error) throw error;

              // ローカル状態から削除
              setPosts(prev => prev.filter(p => p.id !== post.id));
              setActivePostId(null); // ツールバーを非表示
              Alert.alert('成功', '投稿を削除しました。');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('エラー', '投稿の削除に失敗しました。');
            }
          }
        }
      ]
    );
  };

  // 投稿更新処理
  const handleUpdatePost = async () => {
    if (!user || !editingPost || !newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      Alert.alert('エラー', 'タイトル、内容、カテゴリを入力してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          category: newPost.category,
          savings_effect: newPost.savings_effect.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPost.id)
        .eq('user_id', user.id);

      if (error) throw error;

      Alert.alert('成功', '投稿を更新しました！');
      
      // フォームリセット
      setNewPost({
        title: '',
        content: '',
        category: '',
        savings_effect: ''
      });
      setEditingPost(null);
      setShowEditModal(false);

      // 投稿一覧を再読み込み
      loadPosts();

    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('エラー', '投稿の更新に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 並び替え・フィルタリング機能
  const filteredAndSortedPosts = React.useMemo(() => {
    let filtered = posts;
    
    // カテゴリフィルタリング
    if (selectedCategoryFilter) {
      filtered = filtered.filter(post => post.category === selectedCategoryFilter);
    }
    
    // 並び替え
    switch (sortBy) {
      case 'likes':
        return [...filtered].sort((a, b) => b.likes_count - a.likes_count);
      case 'category':
        return [...filtered].sort((a, b) => a.category.localeCompare(b.category, 'ja'));
      case 'latest':
      default:
        return [...filtered].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  }, [posts, sortBy, selectedCategoryFilter]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.zaimBlue[500]} />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>節約アイディア</Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setShowGuidelinesModal(true)}
            >
              <Ionicons name="information-circle-outline" size={20} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>
          {user && (
            <View style={styles.userAvatar}>
              {userProfile?.avatar_url ? (
                <Image 
                  source={{ uri: userProfile.avatar_url }}
                  style={styles.userAvatarImage}
                  onError={() => console.log('Failed to load user avatar')}
                />
              ) : (
                <Ionicons name="person" size={20} color={Colors.gray[600]} />
              )}
            </View>
          )}
        </View>

        {/* 投稿フォーム */}
        <View style={styles.createPostCard}>
          <TouchableOpacity 
            style={styles.createPostHeader}
            onPress={() => setShowCreateForm(!showCreateForm)}
          >
            <View style={styles.createPostHeaderContent}>
              <View style={styles.createPostIcon}>
                <Ionicons name="create-outline" size={20} color="#6B91C7" />
              </View>
              <Text style={styles.createPostTitle}>節約アイディアを投稿</Text>
            </View>
            <Ionicons 
              name={showCreateForm ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B91C7" 
            />
          </TouchableOpacity>
          
          {showCreateForm && (
            <View style={styles.inlineForm}>
              <TextInput
                style={styles.inlineInput}
                placeholder="タイトルを入力してください..."
                placeholderTextColor={Colors.gray[400]}
                value={newPost.title}
                onChangeText={(text) => setNewPost({ ...newPost, title: text })}
              />
              
              <TextInput
                style={[styles.inlineInput, styles.inlineTextArea]}
                placeholder="節約のコツや詳しい方法を教えてください..."
                placeholderTextColor={Colors.gray[400]}
                value={newPost.content}
                onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              <View style={styles.inlineFormRow}>
                <View style={styles.categorySelector}>
                  <Text style={styles.selectorLabel}>カテゴリ:</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          newPost.category === category && styles.categoryChipSelected
                        ]}
                        onPress={() => setNewPost({ ...newPost, category })}
                      >
                        <Text style={[
                          styles.categoryChipText,
                          newPost.category === category && styles.categoryChipTextSelected
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <TextInput
                  style={styles.savingsInput}
                  placeholder="節約効果 (例: 月1000円)"
                  placeholderTextColor={Colors.gray[400]}
                  value={newPost.savings_effect}
                  onChangeText={(text) => setNewPost({ ...newPost, savings_effect: text })}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.inlineSubmitButton, isSubmitting && styles.inlineSubmitButtonDisabled]}
                onPress={handleSubmitPost}
                disabled={isSubmitting || !newPost.title.trim() || !newPost.content.trim() || !newPost.category}
              >
                <Text style={styles.inlineSubmitButtonText}>
                  {isSubmitting ? '投稿中...' : '投稿する'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 投稿一覧 */}
        <View style={styles.postsSection}>
          <View style={styles.postsHeader}>
            <Text style={styles.sectionTitle}>みんなの節約アイディア</Text>
            
            {/* フィルターとソートコントロール（同じ行に配置） */}
            <View style={styles.controlsContainer}>
              <View style={styles.controlsRow}>
                {/* カテゴリフィルター */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                  <TouchableOpacity
                    style={[styles.filterChip, selectedCategoryFilter === '' && styles.filterChipSelected]}
                    onPress={() => setSelectedCategoryFilter('')}
                  >
                    <Text style={[styles.filterChipText, selectedCategoryFilter === '' && styles.filterChipTextSelected]}>
                      すべて
                    </Text>
                  </TouchableOpacity>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.filterChip, selectedCategoryFilter === category && styles.filterChipSelected]}
                      onPress={() => setSelectedCategoryFilter(category)}
                    >
                      <Text style={[styles.filterChipText, selectedCategoryFilter === category && styles.filterChipTextSelected]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* ソートボタン */}
                <View style={styles.sortContainer}>
                  <TouchableOpacity
                    style={[styles.sortChip, sortBy === 'latest' && styles.sortChipSelected]}
                    onPress={() => setSortBy('latest')}
                  >
                    <Text style={[styles.sortChipText, sortBy === 'latest' && styles.sortChipTextSelected]}>
                      新着順
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortChip, sortBy === 'likes' && styles.sortChipSelected]}
                    onPress={() => setSortBy('likes')}
                  >
                    <Text style={[styles.sortChipText, sortBy === 'likes' && styles.sortChipTextSelected]}>
                      ハート順
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortChip, sortBy === 'category' && styles.sortChipSelected]}
                    onPress={() => setSortBy('category')}
                  >
                    <Text style={[styles.sortChipText, sortBy === 'category' && styles.sortChipTextSelected]}>
                      カテゴリ順
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          
          {filteredAndSortedPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {selectedCategoryFilter ? `「${selectedCategoryFilter}」の投稿がありません` : 'まだ投稿がありません'}
              </Text>
              <Text style={styles.emptySubtext}>
                {selectedCategoryFilter ? 'フィルターを変更するか、' : ''}最初の節約アイディアを投稿してみませんか？
              </Text>
            </View>
          ) : (
            <View style={styles.postsList}>
              {filteredAndSortedPosts.map((post) => {
                const isLiked = Boolean(likedPosts[post.id]);
                const isBookmarked = Boolean(bookmarkedPosts[post.id]);
                
                // デバッグログ
                if (post.id === posts[0]?.id) {
                  console.log('レンダリング時の状態:', {
                    postId: post.id,
                    isLiked,
                    likedPosts,
                    likesCount: post.likes_count
                  });
                }
                
                return (
                  <View key={post.id} style={styles.postCard}>
                    {/* Web版と同じレイアウト: 左側アイコン + 右側コンテンツ */}
                    <View style={styles.postLayout}>
                      {/* 左側: ユーザーアイコン */}
                      <View style={styles.userAvatarLarge}>
                        {post.user_profiles?.avatar_url ? (
                          <Image 
                            source={{ uri: post.user_profiles.avatar_url }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <Ionicons name="person" size={24} color={Colors.gray[600]} />
                        )}
                      </View>
                      
                      {/* 右側: 投稿内容 */}
                      <View style={styles.postContent}>
                        {/* ユーザー情報 + 投稿時間 */}
                        <View style={styles.postHeaderInfo}>
                          <View style={styles.userInfo}>
                            <Text style={styles.authorName}>
                              {post.user_profiles?.name || 'Unknown'}
                            </Text>
                            <Text style={styles.userGrade}>
                              {post.user_profiles?.school_type && post.user_profiles?.grade ? 
                                getDisplayGrade(post.user_profiles.school_type, post.user_profiles.grade) : 
                                '学生'
                              }
                            </Text>
                          </View>
                          <Text style={styles.postDate}>
                            {new Date(post.created_at).toLocaleDateString('ja-JP', {
                              month: 'numeric',
                              day: 'numeric'
                            }) === new Date().toLocaleDateString('ja-JP', {
                              month: 'numeric', 
                              day: 'numeric'
                            }) ? '数分前' : new Date(post.created_at).toLocaleDateString('ja-JP')}
                          </Text>
                        </View>
                        
                        {/* 投稿タイトル */}
                        <Text style={styles.postTitle}>{post.title}</Text>
                        
                        {/* 投稿内容 */}
                        <Text style={styles.postContentText}>{post.content}</Text>
                        
                        {/* カテゴリバッジ + 節約効果 + アクションボタン（同じ行） */}
                        <View style={styles.postMetaRow}>
                          <View style={styles.postBadges}>
                            <View style={styles.categoryBadge}>
                              <Text style={styles.categoryBadgeText}>{post.category}</Text>
                            </View>
                            {post.savings_effect && (
                              <View style={styles.savingsBadge}>
                                <Text style={styles.savingsBadgeText}>{post.savings_effect}</Text>
                              </View>
                            )}
                          </View>

                          {/* アクションボタン（右寄せ） */}
                          <View style={styles.postActions}>
                            <TouchableOpacity 
                              style={styles.actionButton}
                              onPress={() => handleLike(post.id)}
                            >
                              <Ionicons 
                                name={isLiked ? "heart" : "heart-outline"} 
                                size={16} 
                                color={isLiked ? Colors.error[500] : Colors.gray[500]} 
                              />
                              <Text style={[styles.actionText, isLiked && { color: Colors.error[500] }]}>
                                {post.likes_count}
                              </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.actionButton}>
                              <Ionicons name="chatbubble-outline" size={16} color={Colors.gray[500]} />
                              <Text style={styles.actionText}>0</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={styles.actionButton}
                              onPress={() => handleBookmark(post.id)}
                            >
                              <Ionicons 
                                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                                size={16} 
                                color={isBookmarked ? Colors.zaimBlue[500] : Colors.gray[500]} 
                              />
                            </TouchableOpacity>
                            
                            {/* 自分の投稿の場合のみ編集・削除ボタン */}
                            {user && post.user_id === user.id && (
                              <TouchableOpacity
                                style={styles.moreButton}
                                onPress={() => handleShowEditOptions(post)}
                              >
                                <Ionicons name="ellipsis-horizontal" size={16} color={Colors.gray[500]} />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                        
                        {/* 編集ツールバー（自分の投稿かつアクティブな場合のみ表示） */}
                        {user && post.user_id === user.id && activePostId === post.id && (
                          <View style={styles.editToolbar}>
                            <TouchableOpacity
                              style={styles.toolbarButton}
                              onPress={() => handleEditPost(post)}
                            >
                              <Ionicons name="create-outline" size={16} color={Colors.zaimBlue[600]} />
                              <Text style={[styles.toolbarButtonText, { color: Colors.zaimBlue[600] }]}>編集</Text>
                            </TouchableOpacity>
                            
                            <View style={styles.toolbarDivider} />
                            
                            <TouchableOpacity
                              style={styles.toolbarButton}
                              onPress={() => handleDeletePost(post)}
                            >
                              <Ionicons name="trash-outline" size={16} color={Colors.error[500]} />
                              <Text style={[styles.toolbarButtonText, { color: Colors.error[500] }]}>削除</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 右下の投稿ボタン（Web版と同じ） */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={24} color={Colors.white} />
      </TouchableOpacity>

      {/* コミュニティガイドラインモーダル */}
      <Modal
        visible={showGuidelinesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGuidelinesModal(false)}
      >
        <View style={styles.guidelinesContainer}>
          <View style={styles.guidelinesHeader}>
            <Text style={styles.guidelinesTitle}>コミュニティガイドライン</Text>
            <TouchableOpacity
              onPress={() => setShowGuidelinesModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.guidelinesContent}>
            <View style={styles.guidelinesSection}>
              <Text style={styles.guidelinesSectionTitle}>1. 投稿内容について</Text>
              <View style={styles.guidelinesListContainer}>
                <Text style={styles.guidelinesListItem}>• 節約や家計管理に関する有益な情報を共有してください</Text>
                <Text style={styles.guidelinesListItem}>• 実体験に基づいた具体的なアドバイスを心がけてください</Text>
                <Text style={styles.guidelinesListItem}>• 誤解を招く情報や不確実な内容は避けてください</Text>
                <Text style={styles.guidelinesListItem}>• 商業的な宣伝や勧誘は禁止されています</Text>
              </View>
            </View>
            
            <View style={styles.guidelinesSection}>
              <Text style={styles.guidelinesSectionTitle}>2. コミュニケーションの基本</Text>
              <View style={styles.guidelinesListContainer}>
                <Text style={styles.guidelinesListItem}>• 他のユーザーに対して礼儀正しく接してください</Text>
                <Text style={styles.guidelinesListItem}>• 建設的な議論を心がけ、批判的なコメントは避けてください</Text>
                <Text style={styles.guidelinesListItem}>• 個人の経済状況を批判したり、比較したりしないでください</Text>
                <Text style={styles.guidelinesListItem}>• 多様な価値観や生活スタイルを尊重してください</Text>
              </View>
            </View>
            
            <View style={styles.guidelinesSection}>
              <Text style={styles.guidelinesSectionTitle}>3. 禁止事項</Text>
              <View style={styles.guidelinesListContainer}>
                <Text style={styles.guidelinesListItem}>• 個人情報（電話番号、住所、メールアドレスなど）の投稿</Text>
                <Text style={styles.guidelinesListItem}>• 著作権を侵害するコンテンツの共有</Text>
                <Text style={styles.guidelinesListItem}>• 差別的、攻撃的、または不適切な表現の使用</Text>
                <Text style={styles.guidelinesListItem}>• スパム投稿や同一内容の繰り返し投稿</Text>
                <Text style={styles.guidelinesListItem}>• 違法行為や規約違反を促すような内容</Text>
              </View>
            </View>
            
            <View style={styles.guidelinesNotice}>
              <Text style={styles.guidelinesNoticeText}>
                これらのガイドラインは、すべてのユーザーが安心して利用できる環境を維持するためのものです。
                違反が確認された場合、投稿の削除やアカウント制限などの措置を取る場合があります。
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* 投稿作成モーダル */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>節約アイディアを投稿</Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalFormContainer}>
              <TextInput
                style={styles.modalInlineInput}
                placeholder="タイトルを入力してください..."
                placeholderTextColor={Colors.gray[400]}
                value={newPost.title}
                onChangeText={(text) => setNewPost({ ...newPost, title: text })}
              />
              
              <TextInput
                style={[styles.modalInlineInput, styles.modalInlineTextArea]}
                placeholder="節約のコツや詳しい方法を教えてください..."
                placeholderTextColor={Colors.gray[400]}
                value={newPost.content}
                onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              <View style={styles.modalInlineFormRow}>
                <View style={styles.modalCategorySelector}>
                  <Text style={styles.modalSelectorLabel}>カテゴリ:</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.modalCategoryScroll}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.modalCategoryChip,
                          newPost.category === category && styles.modalCategoryChipSelected
                        ]}
                        onPress={() => setNewPost({ ...newPost, category })}
                      >
                        <Text style={[
                          styles.modalCategoryChipText,
                          newPost.category === category && styles.modalCategoryChipTextSelected
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <TextInput
                  style={styles.modalSavingsInput}
                  placeholder="節約効果 (例: 月1000円)"
                  placeholderTextColor={Colors.gray[400]}
                  value={newPost.savings_effect}
                  onChangeText={(text) => setNewPost({ ...newPost, savings_effect: text })}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.modalInlineSubmitButton, isSubmitting && styles.modalInlineSubmitButtonDisabled]}
                onPress={handleSubmitPost}
                disabled={isSubmitting || !newPost.title.trim() || !newPost.content.trim() || !newPost.category}
              >
                <Text style={styles.modalInlineSubmitButtonText}>
                  {isSubmitting ? '投稿中...' : '投稿する'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>


      {/* 投稿編集モーダル */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>投稿を編集</Text>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalFormContainer}>
              <TextInput
                style={styles.modalInlineInput}
                placeholder="タイトルを入力してください..."
                placeholderTextColor={Colors.gray[400]}
                value={newPost.title}
                onChangeText={(text) => setNewPost({ ...newPost, title: text })}
              />
              
              <TextInput
                style={[styles.modalInlineInput, styles.modalInlineTextArea]}
                placeholder="節約のコツや詳しい方法を教えてください..."
                placeholderTextColor={Colors.gray[400]}
                value={newPost.content}
                onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              <View style={styles.modalInlineFormRow}>
                <View style={styles.modalCategorySelector}>
                  <Text style={styles.modalSelectorLabel}>カテゴリ:</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.modalCategoryScroll}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.modalCategoryChip,
                          newPost.category === category && styles.modalCategoryChipSelected
                        ]}
                        onPress={() => setNewPost({ ...newPost, category })}
                      >
                        <Text style={[
                          styles.modalCategoryChipText,
                          newPost.category === category && styles.modalCategoryChipTextSelected
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <TextInput
                  style={styles.modalSavingsInput}
                  placeholder="節約効果 (例: 月1000円)"
                  placeholderTextColor={Colors.gray[400]}
                  value={newPost.savings_effect}
                  onChangeText={(text) => setNewPost({ ...newPost, savings_effect: text })}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.modalInlineSubmitButton, isSubmitting && styles.modalInlineSubmitButtonDisabled]}
                onPress={handleUpdatePost}
                disabled={isSubmitting || !newPost.title.trim() || !newPost.content.trim() || !newPost.category}
              >
                <Text style={styles.modalInlineSubmitButtonText}>
                  {isSubmitting ? '更新中...' : '更新する'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  scrollContainer: {
    flex: 1,
  },
  
  // ヘッダー（Web版と同じレイアウト）
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },

  // 投稿作成カード
  createPostCard: {
    backgroundColor: '#FFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  createPostHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createPostIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  inlineForm: {
    gap: 12,
    marginTop: 16,
  },
  inlineInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
    color: '#000',
  },
  inlineTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inlineFormRow: {
    gap: 12,
  },
  categorySelector: {
    marginBottom: 8,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#EBF8FF',
    borderColor: '#6B91C7',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#64748B',
  },
  categoryChipTextSelected: {
    color: '#6B91C7',
    fontWeight: '500',
  },
  savingsInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
    color: '#000',
  },
  inlineSubmitButton: {
    backgroundColor: Colors.zaimBlue[500],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  inlineSubmitButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  inlineSubmitButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500',
  },

  // 投稿セクション
  postsSection: {
    paddingHorizontal: 24,
  },
  postsHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginBottom: 16,
  },
  
  // フィルター・ソートコントロール（Web版と同じ）
  controlsContainer: {
    marginBottom: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: Colors.zaimBlue[500],
    borderColor: Colors.zaimBlue[500],
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.gray[700],
  },
  filterChipTextSelected: {
    color: Colors.white,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortChip: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortChipSelected: {
    backgroundColor: Colors.zaimBlue[500],
    borderColor: Colors.zaimBlue[500],
  },
  sortChipText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.gray[700],
  },
  sortChipTextSelected: {
    color: Colors.white,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  postsList: {
    gap: 16,
    paddingBottom: 80,
  },

  // 投稿カード（Web版スタイル）
  postCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Web版と同じレイアウト（左アイコン + 右コンテンツ）
  postLayout: {
    flexDirection: 'row',
    gap: 12,
  },
  userAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  postContent: {
    flex: 1,
  },
  postHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userGrade: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  authorName: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    color: Colors.black,
  },
  postDate: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginBottom: 4,
    marginTop: 2,
  },
  postContentText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[700],
    lineHeight: 20,
    marginBottom: 12,
  },
  // Web版と同じ: カテゴリタグとアクションボタンを同じ行に
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#64748B',
    fontWeight: '500',
  },
  savingsBadge: {
    backgroundColor: Colors.success[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.success[600],
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
    marginLeft: 2,
  },

  // 右下の浮動ボタン（位置調整）
  floatingAddButton: {
    position: 'absolute',
    right: 20,
    bottom: 30, // タブナビゲーションの上に配置
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.zaimBlue[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // ガイドラインモーダル
  guidelinesContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
    textAlign: 'center',
  },
  guidelinesContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  guidelinesSection: {
    marginBottom: 24,
  },
  guidelinesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.semibold,
    color: Colors.black,
    marginBottom: 12,
  },
  guidelinesListContainer: {
    paddingLeft: 8,
  },
  guidelinesListItem: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[700],
    lineHeight: 20,
    marginBottom: 6,
  },
  guidelinesNotice: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  guidelinesNoticeText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
    lineHeight: 20,
  },

  // モーダル関連のスタイル
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalFormContainer: {
    gap: 12,
  },
  modalInlineInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
    color: '#000',
  },
  modalInlineTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalInlineFormRow: {
    gap: 12,
  },
  modalCategorySelector: {
    marginBottom: 8,
  },
  modalSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  modalCategoryScroll: {
    flexDirection: 'row',
  },
  modalCategoryChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  modalCategoryChipSelected: {
    backgroundColor: '#EBF8FF',
    borderColor: '#6B91C7',
  },
  modalCategoryChipText: {
    fontSize: 12,
    color: '#64748B',
  },
  modalCategoryChipTextSelected: {
    color: '#6B91C7',
    fontWeight: '500',
  },
  modalSavingsInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
    color: '#000',
  },
  modalInlineSubmitButton: {
    backgroundColor: Colors.zaimBlue[500],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalInlineSubmitButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  modalInlineSubmitButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.medium,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryList: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 8,
    width: 60,
    minHeight: 80,
  },
  selectedCategoryItem: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedCategoryIcon: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  categoryName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 14,
  },
  selectedCategoryName: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.zaimBlue[500],
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    color: Colors.white,
  },

  // モーダル内ボタンスタイル統一
  submitButton: {
    backgroundColor: Colors.zaimBlue[500],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray[400],
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    color: Colors.white,
  },
  updateButton: {
    flex: 1,
    backgroundColor: Colors.zaimBlue[500],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: Colors.gray[400],
    opacity: 0.5,
  },
  updateButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    color: Colors.white,
  },

  // 編集ツールバースタイル
  moreButton: {
    padding: 6,
    borderRadius: 4,
  },
  editToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignSelf: 'flex-end', // 右寄せ
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  toolbarButtonText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    fontWeight: '500',
  },
  toolbarDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.gray[300],
    marginHorizontal: 8,
  },

});