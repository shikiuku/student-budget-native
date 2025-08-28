import {
  Utensils,
  Coffee,
  ShoppingCart,
  Store,
  Car,
  Train,
  Bus,
  Bike,
  Gamepad2,
  Music,
  Smartphone,
  BookOpen,
  GraduationCap,
  Monitor,
  Shirt,
  HeartHandshake,
  CreditCard,
  Tag,
  Briefcase,
  Users,
  Gift,
  type LucideIcon
} from "lucide-react";

export interface CategoryIconOption {
  name: string;
  icon: LucideIcon;
  label: string;
}

export const CATEGORY_ICON_OPTIONS: Record<string, CategoryIconOption[]> = {
  '食費': [
    { name: 'Utensils', icon: Utensils, label: 'フォーク・ナイフ' },
    { name: 'Coffee', icon: Coffee, label: 'コーヒー' },
    { name: 'ShoppingCart', icon: ShoppingCart, label: 'ショッピングカート' },
    { name: 'Store', icon: Store, label: '店舗' }
  ],
  '交通費': [
    { name: 'Car', icon: Car, label: '車' },
    { name: 'Train', icon: Train, label: '電車' },
    { name: 'Bus', icon: Bus, label: 'バス' },
    { name: 'Bike', icon: Bike, label: '自転車' }
  ],
  '娯楽・趣味': [
    { name: 'Gamepad2', icon: Gamepad2, label: 'ゲーム' },
    { name: 'Music', icon: Music, label: '音楽' },
    { name: 'Smartphone', icon: Smartphone, label: 'スマートフォン' },
    { name: 'Gift', icon: Gift, label: 'ギフト' }
  ],
  '教材・書籍': [
    { name: 'BookOpen', icon: BookOpen, label: '本' },
    { name: 'GraduationCap', icon: GraduationCap, label: '学位帽' },
    { name: 'Monitor', icon: Monitor, label: 'モニター' },
    { name: 'Briefcase', icon: Briefcase, label: 'ブリーフケース' }
  ],
  '衣類・雑貨': [
    { name: 'Shirt', icon: Shirt, label: 'シャツ' },
    { name: 'ShoppingCart', icon: ShoppingCart, label: 'ショッピングカート' },
    { name: 'Store', icon: Store, label: '店舗' },
    { name: 'HeartHandshake', icon: HeartHandshake, label: '握手' }
  ],
  '通信費': [
    { name: 'Smartphone', icon: Smartphone, label: 'スマートフォン' },
    { name: 'CreditCard', icon: CreditCard, label: 'クレジットカード' },
    { name: 'Monitor', icon: Monitor, label: 'モニター' },
    { name: 'Briefcase', icon: Briefcase, label: 'ブリーフケース' }
  ],
  'その他': [
    { name: 'Tag', icon: Tag, label: 'タグ' },
    { name: 'Store', icon: Store, label: '店舗' },
    { name: 'Briefcase', icon: Briefcase, label: 'ブリーフケース' },
    { name: 'Users', icon: Users, label: 'ユーザー' }
  ]
};

// デフォルトアイコン
export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  '食費': 'Utensils',
  '交通費': 'Car',
  '娯楽・趣味': 'Gamepad2',
  '教材・書籍': 'BookOpen',
  '衣類・雑貨': 'Shirt',
  '通信費': 'Smartphone',
  'その他': 'Tag'
};

// アイコン名からコンポーネントを取得する関数
export const getIconByName = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    Utensils,
    Coffee,
    ShoppingCart,
    Store,
    Car,
    Train,
    Bus,
    Bike,
    Gamepad2,
    Music,
    Smartphone,
    BookOpen,
    GraduationCap,
    Monitor,
    Shirt,
    HeartHandshake,
    CreditCard,
    Tag,
    Briefcase,
    Users,
    Gift
  };

  return iconMap[iconName] || Tag;
};

// カテゴリー名から適切なアイコンを取得する関数（ユーザーの設定を考慮）
export const getCategoryIcon = (categoryName: string, userCategoryIcons?: Record<string, string>, customIcon?: string): LucideIcon => {
  // 1. 直接指定されたカスタムアイコンがあれば使用（後方互換性のため）
  if (customIcon) {
    return getIconByName(customIcon);
  }
  
  // 2. ユーザーの設定があれば使用
  if (userCategoryIcons && userCategoryIcons[categoryName]) {
    return getIconByName(userCategoryIcons[categoryName]);
  }
  
  // 3. デフォルトアイコンを使用
  const defaultIcon = DEFAULT_CATEGORY_ICONS[categoryName] || 'Tag';
  return getIconByName(defaultIcon);
};