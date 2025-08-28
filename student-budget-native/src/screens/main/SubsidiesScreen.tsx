import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SubsidiesScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const regions = [
    { label: '全国', value: 'all' },
    { label: '東京都', value: 'tokyo' },
    { label: '大阪府', value: 'osaka' },
    { label: '神奈川県', value: 'kanagawa' }
  ];

  const categories = [
    { label: 'すべて', value: 'all' },
    { label: '教育', value: 'education' },
    { label: '生活支援', value: 'support' },
    { label: '交通', value: 'transport' }
  ];

  return (
    <View style={styles.container}>
      {/* ぼかしオーバーレイ */}
      <View style={styles.blurOverlay} />
      
      {/* 近日公開メッセージ */}
      <View style={styles.comingSoonOverlay}>
        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonIcon}>
            <Ionicons name="gift" size={32} color="#10B981" />
          </View>
          <Text style={styles.comingSoonTitle}>学生向け補助金情報</Text>
          <Text style={styles.comingSoonDescription}>奨学金や各種助成金の情報を</Text>
          <Text style={styles.comingSoonDescription}>準備中です</Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonBadgeText}>近日公開予定</Text>
          </View>
        </View>
      </View>

      {/* 背景コンテンツ（ぼかし用） */}
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          {/* 検索とフィルター */}
          <View style={styles.searchCard}>
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="補助金を検索..."
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <TouchableOpacity style={styles.searchButton}>
                <Ionicons name="search" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterRow}>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowRegionModal(true)}
              >
                <Text style={styles.selectButtonText}>
                  {regions.find(r => r.value === selectedRegion)?.label || '地域を選択'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.selectButtonText}>
                  {categories.find(c => c.value === selectedCategory)?.label || 'カテゴリ'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* プロフィール設定の促し */}
          <View style={styles.profileNotice}>
            <View style={styles.profileNoticeContent}>
              <View style={styles.profileNoticeText}>
                <Text style={styles.profileNoticeTitle}>プロフィール設定</Text>
                <Text style={styles.profileNoticeDescription}>
                  年齢・地域を設定してパーソナライズ
                </Text>
              </View>
              <TouchableOpacity style={styles.profileButton}>
                <Text style={styles.profileButtonText}>設定する</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 補助金リスト */}
          <View style={styles.subsidiesSection}>
            <Text style={styles.sectionTitle}>利用可能な補助金</Text>
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>データを準備中...</Text>
            </View>
          </View>

          {/* 統計情報 */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>あなたの補助金活用状況</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#3B82F6' }]}>2</Text>
                <Text style={styles.statLabel}>申請可能</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>1</Text>
                <Text style={styles.statLabel}>申請済み</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>¥50,000</Text>
                <Text style={styles.statLabel}>受給予定額</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 地域選択モーダル */}
      <Modal
        visible={showRegionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRegionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>地域を選択</Text>
              <TouchableOpacity onPress={() => setShowRegionModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {regions.map((region) => (
              <TouchableOpacity
                key={region.value}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedRegion(region.value);
                  setShowRegionModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{region.label}</Text>
                {selectedRegion === region.value && (
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* カテゴリ選択モーダル */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>カテゴリを選択</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedCategory(category.value);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{category.label}</Text>
                {selectedCategory === category.value && (
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
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
    position: 'relative',
  },
  
  // オーバーレイ
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
  
  comingSoonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 80, // BottomNavのスペース
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 24,
  },
  
  comingSoonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  comingSoonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  comingSoonDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  comingSoonBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 24,
  },
  
  comingSoonBadgeText: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '500',
  },

  // 背景コンテンツ
  scrollContainer: {
    flex: 1,
  },
  
  content: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 80,
  },

  // 検索カード
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  
  searchInputContainer: {
    flex: 1,
  },
  
  searchInput: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000',
  },
  
  searchButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  
  selectButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  
  selectButtonText: {
    fontSize: 16,
    color: '#000',
  },

  // プロフィール設定通知
  profileNotice: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  
  profileNoticeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  profileNoticeText: {
    flex: 1,
  },
  
  profileNoticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  
  profileNoticeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  profileButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // 補助金セクション
  subsidiesSection: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  
  loadingState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },

  // 統計カード
  statsCard: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
  },
  
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  // モーダル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 0,
    width: '100%',
    maxWidth: 300,
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
    color: '#000',
  },
  
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  modalOptionText: {
    fontSize: 16,
    color: '#000',
  },
});