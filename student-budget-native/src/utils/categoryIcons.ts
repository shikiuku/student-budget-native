import { Ionicons } from '@expo/vector-icons';

// 統一されたカテゴリアイコンマップ（節約術ページと同じ）
export const categoryIconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  '食費': 'restaurant',
  '交通費': 'car',
  '娯楽': 'gift',
  '学用品': 'book',
  '衣類': 'shirt',
  'その他': 'pricetag',
};

// Web版と完全に統一されたカテゴリカラーマップ
export const categoryColorMap: { [key: string]: string } = {
  '食費': '#FF6B35', // Web版と同じ
  '交通費': '#4ECDC4', // Web版と同じ
  '娯楽': '#FFD23F', // Web版の娯楽・趣味と同じ
  '娯楽・趣味': '#FFD23F', // Web版と同じ
  '学用品': '#6A994E', // Web版の教材・書籍と同じ
  '教材・書籍': '#6A994E', // Web版と同じ
  '衣類': '#BC4749', // Web版の衣類・雑貨と同じ
  '衣類・雑貨': '#BC4749', // Web版と同じ
  '通信費': '#9C88FF', // Web版と同じ
  'その他': '#6B7280', // Web版と同じ
};

// 絵文字からIoniconマップへの変換（既存のコードとの互換性のため）
export const emojiToIconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  '🍽️': 'restaurant',
  '🚊': 'car', // 交通費用のアイコンを統一
  '📚': 'book',
  '🎮': 'gift', // 娯楽用のアイコンを統一
  '👕': 'shirt',
  '📱': 'pricetag', // その他用のアイコンを統一
  '💸': 'pricetag', // その他用のアイコンを統一
};

// レガシー対応のための統合マップ
export const unifiedIconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  // カテゴリ名からのマッピング
  ...categoryIconMap,
  // 絵文字からのマッピング
  ...emojiToIconMap,
  // 既存のアイコン名からのマッピング（後方互換性）
  'restaurant': 'restaurant',
  'car': 'car',
  'bag': 'pricetag', // その他に統一
  'book': 'book',
  'home': 'pricetag', // その他に統一
  'shirt': 'shirt',
  'gift': 'gift',
  'pricetag': 'pricetag',
  // Lucide名からIonicon名への変換（Web版との互換性）
  'Utensils': 'restaurant',
  'Car': 'car',
  'ShoppingBag': 'pricetag',
  'BookOpen': 'book',
  'Shirt': 'shirt',
  'Home': 'pricetag',
  'Gift': 'gift',
  'Tag': 'pricetag',
};

// カテゴリ名からアイコンを取得するヘルパー関数
export const getCategoryIcon = (categoryNameOrIcon: string): keyof typeof Ionicons.glyphMap => {
  return unifiedIconMap[categoryNameOrIcon] || 'pricetag';
};

// Web版の背景色（薄い色）を取得する関数
export const getCategoryBackgroundColor = (categoryName: string): string => {
  switch (categoryName) {
    case '食費': return '#FFF3E0';
    case '交通費': return '#E0F8F8';
    case '娯楽': 
    case '娯楽・趣味': return '#FFF9C4';
    case '学用品':
    case '教材・書籍': return '#E8F5E8';
    case '衣類':
    case '衣類・雑貨': return '#F8E8E8';
    case '通信費': return '#F0EDFF';
    case 'その他': return '#F3F4F6';
    default: return '#F3F4F6';
  }
};

// カテゴリ名からアイコン色（濃い色）を取得する関数 - Web版と同じ
export const getCategoryColor = (categoryName: string): string => {
  return categoryColorMap[categoryName] || '#6B7280';
};