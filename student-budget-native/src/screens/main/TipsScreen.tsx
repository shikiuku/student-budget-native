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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { getCategoryIcon, getCategoryColor } from '../../utils/categoryIcons';

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

  useEffect(() => {
    if (user) {
      loadPosts();
      loadUserInteractions();
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
          .select('id, name, school_type, grade')
          .in('id', userIds);

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
    setRefreshing(false);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
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
          <Text style={styles.headerTitle}>節約アイディア</Text>
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
                value={newPost.title}
                onChangeText={(text) => setNewPost({ ...newPost, title: text })}
              />
              
              <TextInput
                style={[styles.inlineInput, styles.inlineTextArea]}
                placeholder="節約のコツや詳しい方法を教えてください..."
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
          <Text style={styles.sectionTitle}>みんなの節約アイディア</Text>
          
          {posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>まだ投稿がありません</Text>
              <Text style={styles.emptySubtext}>最初の節約アイディアを投稿してみませんか？</Text>
            </View>
          ) : (
            <View style={styles.postsList}>
              {posts.map((post) => {
                const categoryIcon = getCategoryIcon(post.category);
                const categoryColor = getCategoryColor(post.category);
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
                    <View style={styles.postHeader}>
                      <View style={styles.postAuthor}>
                        <View style={styles.authorAvatar}>
                          <Ionicons name="person" size={16} color="#6B7280" />
                        </View>
                        <Text style={styles.authorEmail}>
                          {post.user_profiles?.name || 'Unknown'}
                        </Text>
                      </View>
                      <Text style={styles.postDate}>
                        {new Date(post.created_at).toLocaleDateString('ja-JP')}
                      </Text>
                    </View>
                    
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postContent}>{post.content}</Text>
                    
                    <View style={styles.postMeta}>
                      <View style={styles.postBadges}>
                        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                          <Ionicons name={categoryIcon} size={12} color="#FFF" />
                          <Text style={styles.categoryBadgeText}>{post.category}</Text>
                        </View>
                        {post.savings_effect && (
                          <View style={styles.savingsBadge}>
                            <Text style={styles.savingsBadgeText}>{post.savings_effect}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.postActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleLike(post.id)}
                      >
                        <Ionicons 
                          name={isLiked ? "heart" : "heart-outline"} 
                          size={20} 
                          color={isLiked ? "#EF4444" : "#6B7280"} 
                        />
                        <Text style={[styles.actionText, isLiked && { color: "#EF4444" }]}>
                          {post.likes_count}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleBookmark(post.id)}
                      >
                        <Ionicons 
                          name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                          size={20} 
                          color={isBookmarked ? "#10B981" : "#6B7280"} 
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="share-outline" size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 右下の投稿ボタン */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color="white" style={{ fontWeight: 'bold' }} />
      </TouchableOpacity>

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
            <View style={styles.formGroup}>
              <Text style={styles.label}>タイトル *</Text>
              <TextInput
                style={styles.textInput}
                value={newPost.title}
                onChangeText={(text) => setNewPost({ ...newPost, title: text })}
                placeholder="タイトルを入力してください..."
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>内容 *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newPost.content}
                onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                placeholder="節約のコツや詳しい方法を教えてください..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>カテゴリー *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryItem,
                      newPost.category === category && styles.selectedCategoryItem
                    ]}
                    onPress={() => setNewPost({ ...newPost, category })}
                  >
                    <View style={[
                      styles.categoryIconContainer,
                      { backgroundColor: getCategoryColor(category) },
                      newPost.category === category && styles.selectedCategoryIcon
                    ]}>
                      <Ionicons name={getCategoryIcon(category)} size={20} color="white" />
                    </View>
                    <Text style={[
                      styles.categoryName,
                      newPost.category === category && styles.selectedCategoryName
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>節約効果</Text>
              <TextInput
                style={styles.textInput}
                value={newPost.savings_effect}
                onChangeText={(text) => setNewPost({ ...newPost, savings_effect: text })}
                placeholder="例: 月1000円"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSubmitPost}
              disabled={isSubmitting || !newPost.title.trim() || !newPost.content.trim() || !newPost.category}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? '投稿中...' : '投稿する'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContainer: {
    flex: 1,
  },
  
  // ヘッダー
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
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
    backgroundColor: '#6B91C7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  inlineSubmitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  inlineSubmitButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // 投稿セクション
  postsSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  postsList: {
    gap: 16,
    paddingBottom: 80,
  },

  // 投稿カード
  postCard: {
    backgroundColor: '#FFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  postDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  postMeta: {
    marginBottom: 16,
  },
  postBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  savingsBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsBadgeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },

  // 右下の浮動ボタン
  floatingAddButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6B91C7',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#6B91C7',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

});