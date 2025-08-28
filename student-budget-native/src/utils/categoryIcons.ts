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

// 統一されたカテゴリカラーマップ（節約術ページと同じ）
export const categoryColorMap: { [key: string]: string } = {
  '食費': '#FF6B35',
  '交通費': '#4ECDC4',
  '娯楽': '#FFD23F',
  '学用品': '#6A994E',
  '衣類': '#BC4749',
  'その他': '#6B7280',
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

// カテゴリ名から色を取得するヘルパー関数
export const getCategoryColor = (categoryName: string): string => {
  return categoryColorMap[categoryName] || '#6B7280';
};