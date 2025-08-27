import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/main/HomeScreen';
import ExpensesScreen from '../screens/main/ExpensesScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import TipsScreen from '../screens/main/TipsScreen';
import SubsidiesScreen from '../screens/main/SubsidiesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import MapScreen from '../screens/main/MapScreen';

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Calendar: undefined;
  Tips: undefined;
  Map: undefined;
  Subsidies: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Tips') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Subsidies') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false, // 元のWebアプリと同じようにヘッダーを非表示
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'ホーム' }}
      />
      <Tab.Screen 
        name="Expenses" 
        component={ExpensesScreen} 
        options={{ title: '支出管理' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ title: 'カレンダー' }}
      />
      <Tab.Screen 
        name="Tips" 
        component={TipsScreen} 
        options={{ title: '節約術' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: 'マップ' }}
      />
      <Tab.Screen 
        name="Subsidies" 
        component={SubsidiesScreen} 
        options={{ title: '補助金' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'プロフィール' }}
      />
    </Tab.Navigator>
  );
}