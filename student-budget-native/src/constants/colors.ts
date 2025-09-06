// Zaim風のカラーパレット（Webアプリと統一）
export const Colors = {
  // Zaim Blue - メインテーマカラー（#64748B slate-500ベース）
  zaimBlue: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',  // メインカラー（カレンダーボタンと同じ）
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Category Colors - 支出カテゴリー別の色（Webアプリと統一）
  category: {
    // 食費
    food: '#FF6B35',
    foodLight: '#FFF3E0',
    foodDark: '#E55D2F',

    // 交通費  
    transport: '#4ECDC4',
    transportLight: '#E0F8F8',
    transportDark: '#3DB5AD',

    // 娯楽・趣味
    entertainment: '#FFD23F',
    entertainmentLight: '#FFF9C4',
    entertainmentDark: '#E6BC36',

    // 教材・書籍
    supplies: '#6A994E',
    suppliesLight: '#E8F5E8',
    suppliesDark: '#5A7F42',

    // 衣類・雑貨
    clothing: '#BC4749',
    clothingLight: '#F8E8E8',
    clothingDark: '#A13E40',

    // 通信費
    communication: '#9C88FF',
    communicationLight: '#F0EDFF',
    communicationDark: '#8C76E6',

    // その他
    other: '#6B7280',
    otherLight: '#F3F4F6',
    otherDark: '#4B5563',
  },

  // 基本カラー
  white: '#FFFFFF',
  black: '#000000',
  
  // Blue - 青系色
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // グレースケール
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6', 
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // ステータス色
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  // PayPay Yellow
  payPay: {
    100: '#FFF9C4',
    600: '#FFD23F',
  },

  // 追加のzaim固有色
  zaimGreen: {
    600: '#10B981',
  },
  zaimRed: {
    500: '#EF4444',
  },
  zaimYellow: {
    100: '#FFF9C4',
    600: '#FFD23F',
  }
};

// カテゴリ名に基づいてカラーを取得するヘルパー関数
export const getCategoryColor = (categoryName: string): string => {
  switch (categoryName) {
    case '食費':
      return Colors.category.food;
    case '交通費':
      return Colors.category.transport;
    case '娯楽・趣味':
    case '娯楽':
      return Colors.category.entertainment;
    case '教材・書籍':
    case '学用品':
      return Colors.category.supplies;
    case '衣類・雑貨':
    case '衣類':
      return Colors.category.clothing;
    case '通信費':
      return Colors.category.communication;
    case 'その他':
    default:
      return Colors.category.other;
  }
};

// カテゴリ名に基づいて背景色を取得するヘルパー関数
export const getCategoryBackgroundColor = (categoryName: string): string => {
  switch (categoryName) {
    case '食費':
      return Colors.category.foodLight;
    case '交通費':
      return Colors.category.transportLight;
    case '娯楽・趣味':
    case '娯楽':
      return Colors.category.entertainmentLight;
    case '教材・書籍':
    case '学用品':
      return Colors.category.suppliesLight;
    case '衣類・雑貨':
    case '衣類':
      return Colors.category.clothingLight;
    case '通信費':
      return Colors.category.communicationLight;
    case 'その他':
    default:
      return Colors.category.otherLight;
  }
};