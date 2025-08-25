import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

// 元のWebアプリと同じ型定義
interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  savings_effect?: string;
  author_id: string;
  author?: {
    id: string;
    email: string;
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

// カテゴリマップ（元のWebアプリと同じ）
const categoryIconMap = {
  '食費': 'restaurant' as const,
  '交通費': 'car' as const,
  '娯楽': 'gift' as const,
  '学用品': 'book' as const,
  '衣類': 'shirt' as const,
  'その他': 'pricetag' as const,
};

const categoryColorMap = {
  '食費': '#FF6B35',
  '交通費': '#4ECDC4',
  '娯楽': '#FFD23F',
  '学用品': '#6A994E',
  '衣類': '#BC4749',
  'その他': '#6B7280',
};

export default function TipsScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  const [newPost, setNewPost] = useState<PostForm>({
    title: '',
    content: '',
    category: '',
    savings_effect: ''
  });

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
          *,
          author:user_profiles!posts_author_id_fkey(id, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;
      setPosts(postsData || []);

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
      // いいね状態を取得
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (likesError) throw likesError;
      
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

      if (bookmarksError) throw bookmarksError;
      
      const bookmarkedPostIds: Record<string, boolean> = {};
      (bookmarksData || []).forEach(bookmark => {
        bookmarkedPostIds[bookmark.post_id] = true;
      });
      setBookmarkedPosts(bookmarkedPostIds);

    } catch (error) {
      console.error('Error loading user interactions:', error);
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
          author_id: user.id
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
      setShowCreateModal(false);

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
    if (!user) return;

    const isCurrentlyLiked = likedPosts[postId];
    
    try {
      if (isCurrentlyLiked) {
        // いいねを削除
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setLikedPosts(prev => ({ ...prev, [postId]: false }));
        // 投稿のいいね数を更新
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count - 1 }
            : post
        ));
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;

        setLikedPosts(prev => ({ ...prev, [postId]: true }));
        // 投稿のいいね数を更新
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('エラー', 'いいねの処理に失敗しました。');
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

        setBookmarkedPosts(prev => ({ ...prev, [postId]: false }));
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

        {/* おすすめ投稿 */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredHeader}>
            <Ionicons name="star" size={20} color="#FFD23F" />
            <Text style={styles.featuredHeaderText}>今週のおすすめ</Text>
          </View>
          <View style={styles.featuredContent}>
            <View style={styles.featuredIcon}>
              <Ionicons name="restaurant" size={24} color="#6B7280" />
            </View>
            <View style={styles.featuredText}>
              <Text style={styles.featuredTitle}>お弁当作りで月3,000円節約！</Text>
              <Text style={styles.featuredDescription}>
                コンビニ弁当を週3回お弁当に変えるだけで大幅節約。簡単レシピも紹介！
              </Text>
              <View style={styles.featuredBadges}>
                <View style={[styles.badge, { backgroundColor: '#FFF3CD', borderColor: '#FFEAA7' }]}>
                  <Text style={[styles.badgeText, { color: '#856404' }]}>食費</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                  <Text style={[styles.badgeText, { color: '#10B981' }]}>月3,000円節約</Text>
                </View>
              </View>
            </View>
          </View>
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
                const categoryIcon = categoryIconMap[post.category as keyof typeof categoryIconMap] || 'pricetag';
                const categoryColor = categoryColorMap[post.category as keyof typeof categoryColorMap] || '#6B7280';
                const isLiked = likedPosts[post.id] || false;
                const isBookmarked = bookmarkedPosts[post.id] || false;
                
                return (
                  <View key={post.id} style={styles.postCard}>
                    <View style={styles.postHeader}>
                      <View style={styles.postAuthor}>
                        <View style={styles.authorAvatar}>
                          <Ionicons name="person" size={16} color="#6B7280" />
                        </View>
                        <Text style={styles.authorEmail}>
                          {post.author?.email || 'Unknown'}
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

      {/* 投稿作成ボタン */}
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* 投稿作成モーダル */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>節約アイディアを投稿</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>タイトル</Text>
              <TextInput
                style={styles.formInput}
                placeholder="例：お弁当作りで食費節約"
                value={newPost.title}
                onChangeText={(text) => setNewPost({ ...newPost, title: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabel}>内容</Text>
                <Text style={styles.characterCount}>{newPost.content.length}/500</Text>
              </View>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="詳しい節約方法やコツを教えてください..."
                value={newPost.content}
                onChangeText={(text) => setNewPost({ ...newPost, content: text })}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>カテゴリを選択</Text>
              <View style={styles.categoryGrid}>
                {Object.entries(categoryIconMap).map(([category, iconName]) => (
                  <Pressable
                    key={category}
                    style={[
                      styles.categoryOption,
                      newPost.category === category && styles.categoryOptionSelected
                    ]}
                    onPress={() => setNewPost({ ...newPost, category })}
                  >
                    <Ionicons 
                      name={iconName} 
                      size={20} 
                      color={newPost.category === category ? "#10B981" : "#6B7280"} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      newPost.category === category && styles.categoryOptionTextSelected
                    ]}>
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>節約効果</Text>
              <TextInput
                style={styles.formInput}
                placeholder="月1,000円"
                value={newPost.savings_effect}
                onChangeText={(text) => setNewPost({ ...newPost, savings_effect: text })}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmitPost}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? '投稿中...' : '投稿する'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
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

  // おすすめカード
  featuredCard: {
    backgroundColor: '#EBF8FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  featuredHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredText: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
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

  // 作成ボタン
  createButton: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  // モーダル
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },

  // フォーム
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  formLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryOption: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  categoryOptionSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryOptionTextSelected: {
    color: '#10B981',
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});