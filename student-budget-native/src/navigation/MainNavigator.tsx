import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar';
import HomeScreen from '../screens/main/HomeScreen';
import ExpensesScreen from '../screens/main/ExpensesScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import AIScreen from '../screens/main/AIScreen';
import TipsScreen from '../screens/main/TipsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Calendar: undefined;
  AI: undefined;
  Tips: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false, // 元のWebアプリと同じようにヘッダーを非表示
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'ホーム' }}
      />
      <Tab.Screen 
        name="Expenses" 
        component={ExpensesScreen} 
        options={{ title: '支出' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ title: 'カレンダー' }}
      />
      <Tab.Screen 
        name="AI" 
        component={AIScreen} 
        options={{ title: 'AI' }}
      />
      <Tab.Screen 
        name="Tips" 
        component={TipsScreen} 
        options={{ title: '節約' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'ユーザー' }}
      />
    </Tab.Navigator>
  );
}