import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TabIcons = {
  Home: { focused: 'home', unfocused: 'home-outline', label: 'ホーム' },
  Expenses: { focused: 'receipt', unfocused: 'receipt-outline', label: '支出' },
  Calendar: { focused: 'calendar', unfocused: 'calendar-outline', label: 'カレンダー' },
  AI: { focused: 'sparkles', unfocused: 'sparkles-outline', label: 'AI' },
  Tips: { focused: 'bulb', unfocused: 'bulb-outline', label: '節約' },
  Profile: { focused: 'person', unfocused: 'person-outline', label: 'ユーザー' },
};

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          const iconConfig = TabIcons[route.name as keyof typeof TabIcons];
          if (!iconConfig) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const isCalendar = route.name === 'Calendar';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabItem,
                isFocused ? styles.tabItemActive : styles.tabItemInactive,
                isCalendar ? styles.tabItemCalendar : null
              ]}
            >
              <Ionicons
                name={isFocused ? iconConfig.focused : iconConfig.unfocused}
                size={20}
                color={isFocused ? '#2563EB' : '#6B7280'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? '#2563EB' : '#6B7280' }
                ]}
              >
                {iconConfig.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // gray-200
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center', // コンテナ全体を中央に配置
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 448, // Web版のmax-w-mdに相当 (28rem = 448px)
    width: '100%',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    gap: 4,
    maxWidth: 80, // 各タブの最大幅を少し広げてテキストを一行に
  },
  tabItemActive: {
    backgroundColor: '#EBF8FF', // blue-50 equivalent
  },
  tabItemInactive: {
    backgroundColor: 'transparent',
  },
  tabItemCalendar: {
    maxWidth: 100, // カレンダータブだけ幅を広げる
  },
  tabLabel: {
    fontSize: 11, // 12から11に小さくして「カレンダー」を一行に
    fontWeight: '500',
    fontFamily: Fonts.medium,
    textAlign: 'center',
    numberOfLines: 1,
    flexShrink: 1,
  },
});