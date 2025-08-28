import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

// 元のWebアプリと同じ型定義
interface UserProfile {
  id: string;
  name?: string;
  age?: number;
  school_type?: 'middle_school' | 'high_school' | 'vocational_school' | 'university';
  prefecture?: string;
  city?: string;
  school_name?: string;
  grade?: string;
  monthly_budget?: number;
  savings_balance?: number;
  created_at: string;
  updated_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  created_at: string;
  user_profiles?: {
    name?: string;
  };
}

// 都道府県データ
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const GRADES = [
  "中学1年生", "中学2年生", "中学3年生",
  "高校1年生", "高校2年生", "高校3年生"
];

const SCHOOL_TYPES = [
  { label: "中学校", value: "middle_school" },
  { label: "高等学校", value: "high_school" },
  { label: "専門学校", value: "vocational_school" },
  { label: "大学", value: "university" }
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  
  // 投稿関連の状態
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  
  // フォーム状態
  const [formData, setFormData] = useState({
    name: "",
    age: 15,
    school_type: "middle_school" as const,
    prefecture: "",
    city: "",
    school_name: "",
    grade: "",
    monthly_budget: 30000,
    savings_balance: 0
  });
  
  // 通知設定状態
  const [notifications, setNotifications] = useState({
    spending: true,
    savings: true,
    subsidies: false,
    tips: true,
  });
  
  // モーダル状態
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showPrefectureModal, setShowPrefectureModal] = useState(false);
  const [showSchoolTypeModal, setShowSchoolTypeModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // ユーザープロファイルを取得
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profile) {
        setUserProfile(profile);
        setFormData({
          name: profile.name || "",
          age: profile.age || 15,
          school_type: profile.school_type || "middle_school",
          prefecture: profile.prefecture || "",
          city: profile.city || "",
          school_name: profile.school_name || "",
          grade: profile.grade || "",
          monthly_budget: profile.monthly_budget || 30000,
          savings_balance: profile.savings_balance || 0
        });
      }
    } catch (error) {
      console.error('プロフィール読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      Alert.alert('保存完了', 'プロフィール情報を更新しました。');
      loadUserProfile();
    } catch (error) {
      console.error('プロフィール保存エラー:', error);
      Alert.alert('エラー', 'プロフィール情報の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('エラー', 'ログアウトに失敗しました');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>プロフィール情報を読み込み中...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>ログインが必要です</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* プロフィールサマリー */}
      <View style={styles.profileSummary}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#3B82F6" />
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{formData.name || "未設定"}</Text>
          <Text style={styles.profileGrade}>{formData.grade || "未設定"}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formData.prefecture || "未設定"}</Text>
            </View>
            <View style={[styles.badge, styles.badgeSecondary]}>
              <Text style={styles.badgeSecondaryText}>{formData.age}歳</Text>
            </View>
          </View>
        </View>
      </View>

      {/* タブナビゲーション */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Ionicons 
            name="document-text" 
            size={20} 
            color={activeTab === 'posts' ? '#3B82F6' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
            投稿
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
          onPress={() => setActiveTab('liked')}
        >
          <Ionicons 
            name="heart" 
            size={20} 
            color={activeTab === 'liked' ? '#EF4444' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'liked' && styles.tabTextActive]}>
            いいね
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bookmarked' && styles.tabActive]}
          onPress={() => setActiveTab('bookmarked')}
        >
          <Ionicons 
            name="bookmark" 
            size={20} 
            color={activeTab === 'bookmarked' ? '#F59E0B' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'bookmarked' && styles.tabTextActive]}>
            保存済み
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons 
            name="settings" 
            size={20} 
            color={activeTab === 'settings' ? '#6B7280' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            設定
          </Text>
        </TouchableOpacity>
      </View>

      {/* タブコンテンツ */}
      {activeTab === 'posts' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>自分の投稿</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>まだ投稿がありません</Text>
          </View>
        </View>
      )}

      {activeTab === 'liked' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>いいねした投稿</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>いいねした投稿がありません</Text>
          </View>
        </View>
      )}

      {activeTab === 'bookmarked' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>保存した投稿</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>保存した投稿がありません</Text>
          </View>
        </View>
      )}

      {activeTab === 'settings' && (
        <View style={styles.tabContent}>
          
          {/* 基本情報 */}
          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Ionicons name="person" size={20} color="#3B82F6" />
              <Text style={styles.settingsTitle}>基本情報</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>名前</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="田中 太郎"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>年齢</Text>
              <View style={styles.ageSelector}>
                {Array.from({ length: 8 }, (_, i) => i + 12).map((age) => (
                  <TouchableOpacity
                    key={age}
                    style={[
                      styles.ageOption,
                      formData.age === age && styles.ageOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, age })}
                  >
                    <Text style={[
                      styles.ageOptionText,
                      formData.age === age && styles.ageOptionTextSelected
                    ]}>
                      {age}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>学年</Text>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowGradeModal(true)}
              >
                <Text style={styles.selectButtonText}>
                  {formData.grade || '学年を選択'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 住所情報 */}
          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Ionicons name="location" size={20} color="#10B981" />
              <Text style={styles.settingsTitle}>住所情報</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>都道府県</Text>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowPrefectureModal(true)}
              >
                <Text style={styles.selectButtonText}>
                  {formData.prefecture || '都道府県を選択'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.privacyNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#F59E0B" />
              <View style={styles.privacyText}>
                <Text style={styles.privacyTitle}>プライバシーについて</Text>
                <Text style={styles.privacyDescription}>
                  住所情報は補助金情報の表示にのみ使用され、第三者に共有されることはありません。
                </Text>
              </View>
            </View>
          </View>

          {/* 学校情報 */}
          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Ionicons name="school" size={20} color="#3B82F6" />
              <Text style={styles.settingsTitle}>学校情報</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>学校名</Text>
              <TextInput
                style={styles.textInput}
                value={formData.school_name}
                onChangeText={(text) => setFormData({ ...formData, school_name: text })}
                placeholder="○○高等学校"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>学校種別</Text>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowSchoolTypeModal(true)}
              >
                <Text style={styles.selectButtonText}>
                  {SCHOOL_TYPES.find(type => type.value === formData.school_type)?.label || '学校種別を選択'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 予算設定 */}
          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Ionicons name="target" size={20} color="#8B5CF6" />
              <Text style={styles.settingsTitle}>予算設定</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>月の予算</Text>
              <View style={styles.budgetInputContainer}>
                <Text style={styles.budgetPrefix}>¥</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={formData.monthly_budget.toString()}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    monthly_budget: parseInt(text.replace(/[^0-9]/g, '')) || 0 
                  })}
                  placeholder="30000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.inputHelpText}>お小遣いやアルバイト代など、月に使える金額</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>貯金残高</Text>
              <View style={styles.budgetInputContainer}>
                <Text style={styles.budgetPrefix}>¥</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={formData.savings_balance === 0 ? '' : formData.savings_balance.toString()}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    savings_balance: text === '' ? 0 : parseInt(text.replace(/[^0-9]/g, '')) || 0 
                  })}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.inputHelpText}>現在の貯金額。毎月の余った予算は自動でここに追加されます</Text>
            </View>
          </View>

          {/* 通知設定 */}
          <View style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Ionicons name="notifications" size={20} color="#F97316" />
              <Text style={styles.settingsTitle}>通知設定</Text>
            </View>
            
            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>使いすぎアラート</Text>
                <Text style={styles.notificationDescription}>予算の80%を超えた時に通知</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  notifications.spending && styles.switchButtonActive
                ]}
                onPress={() => setNotifications({ ...notifications, spending: !notifications.spending })}
              >
                <View style={[
                  styles.switchDot,
                  notifications.spending && styles.switchDotActive
                ]} />
              </TouchableOpacity>
            </View>

            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>節約目標通知</Text>
                <Text style={styles.notificationDescription}>目標達成時や進捗の通知</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  notifications.savings && styles.switchButtonActive
                ]}
                onPress={() => setNotifications({ ...notifications, savings: !notifications.savings })}
              >
                <View style={[
                  styles.switchDot,
                  notifications.savings && styles.switchDotActive
                ]} />
              </TouchableOpacity>
            </View>

            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>補助金情報</Text>
                <Text style={styles.notificationDescription}>新しい補助金情報の通知</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  notifications.subsidies && styles.switchButtonActive
                ]}
                onPress={() => setNotifications({ ...notifications, subsidies: !notifications.subsidies })}
              >
                <View style={[
                  styles.switchDot,
                  notifications.subsidies && styles.switchDotActive
                ]} />
              </TouchableOpacity>
            </View>

            <View style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>節約アイディア</Text>
                <Text style={styles.notificationDescription}>おすすめの節約術の通知</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  notifications.tips && styles.switchButtonActive
                ]}
                onPress={() => setNotifications({ ...notifications, tips: !notifications.tips })}
              >
                <View style={[
                  styles.switchDot,
                  notifications.tips && styles.switchDotActive
                ]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 保存ボタン */}
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>設定を保存</Text>
            )}
          </TouchableOpacity>

          {/* ログアウトボタン */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 学年選択モーダル */}
      <Modal
        visible={showGradeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>学年を選択</Text>
              <TouchableOpacity onPress={() => setShowGradeModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {GRADES.map((grade) => (
              <TouchableOpacity
                key={grade}
                style={styles.modalOption}
                onPress={() => {
                  setFormData({ ...formData, grade });
                  setShowGradeModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{grade}</Text>
                {formData.grade === grade && (
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* 都道府県選択モーダル */}
      <Modal
        visible={showPrefectureModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrefectureModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>都道府県を選択</Text>
              <TouchableOpacity onPress={() => setShowPrefectureModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {PREFECTURES.map((prefecture) => (
                <TouchableOpacity
                  key={prefecture}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData({ ...formData, prefecture });
                    setShowPrefectureModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{prefecture}</Text>
                  {formData.prefecture === prefecture && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 学校種別選択モーダル */}
      <Modal
        visible={showSchoolTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSchoolTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>学校種別を選択</Text>
              <TouchableOpacity onPress={() => setShowSchoolTypeModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {SCHOOL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.modalOption}
                onPress={() => {
                  setFormData({ ...formData, school_type: type.value as any });
                  setShowSchoolTypeModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{type.label}</Text>
                {formData.school_type === type.value && (
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  profileSummary: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    padding: 24,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: 'white',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileGrade: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  badgeText: {
    fontSize: 12,
    color: '#2563EB',
  },
  badgeSecondary: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  badgeSecondaryText: {
    color: '#1F2937',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  tabActive: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
  settingsCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#111827',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  ageSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  ageOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },
  ageOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  ageOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  privacyNotice: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
  },
  privacyDescription: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  budgetPrefix: {
    paddingLeft: 12,
    color: '#6B7280',
    fontSize: 16,
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827',
  },
  inputHelpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#111827',
  },
  signOutButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  signOutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  notificationDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  switchButton: {
    width: 48,
    height: 28,
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#10B981',
  },
  switchDot: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    transform: [{ translateX: 0 }],
  },
  switchDotActive: {
    transform: [{ translateX: 20 }],
  },
});