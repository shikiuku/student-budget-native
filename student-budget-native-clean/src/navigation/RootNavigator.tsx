import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import InitialSetupScreen from '../screens/InitialSetupScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // プロフィール状態を定期的にチェックする
  useEffect(() => {
    if (user && !hasProfile) {
      const interval = setInterval(() => {
        checkUserProfile();
      }, 2000); // 2秒ごとにチェック
      
      return () => clearInterval(interval);
    }
  }, [user, hasProfile]);

  useEffect(() => {
    if (user) {
      // ユーザーがログインしたときは少し待ってからプロフィールチェックを実行
      const timer = setTimeout(() => {
        checkUserProfile();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setProfileLoading(false);
      setHasProfile(false);
    }
  }, [user]);

  const checkUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, name')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('プロフィール確認エラー:', error);
      }

      // プロフィールが存在し、名前が設定されている場合は完了とする
      setHasProfile(profile && profile.name ? true : false);
    } catch (error) {
      console.error('プロフィール確認エラー:', error);
      setHasProfile(false);
    } finally {
      setProfileLoading(false);
    }
  };

  if (authLoading || profileLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        hasProfile ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="InitialSetup" component={InitialSetupScreen} />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}