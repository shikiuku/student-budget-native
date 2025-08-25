import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  // デモアカウントでログイン
  const handleDemoLogin = async () => {
    setEmail('kuni567489@gmail.com');
    setPassword('demo123456');
    
    setLoading(true);
    try {
      console.log('デモログイン試行');
      const { error } = await signIn('kuni567489@gmail.com', 'demo123456');
      
      if (error) {
        console.error('デモログインエラー:', error);
        Alert.alert('デモログインエラー', `${error.message}\n\nコード: ${error.name || 'N/A'}\nステータス: ${error.status || 'N/A'}`);
      } else {
        console.log('デモログイン成功');
      }
    } catch (error) {
      console.error('デモログイン予期しないエラー:', error);
      Alert.alert('エラー', `デモログインに失敗しました\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    try {
      console.log('ログイン試行:', { email, passwordLength: password.length });
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('ログインエラー:', error);
        Alert.alert('ログインエラー', `${error.message}\n\n${error.name || ''}\n${error.status || ''}`);
      } else {
        console.log('ログイン成功');
        // ログイン成功時は自動でMainNavigatorに切り替わる
      }
    } catch (error) {
      console.error('予期しないエラー:', error);
      Alert.alert('エラー', `ログインに失敗しました\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Google OAuth認証の実装
      Alert.alert('準備中', 'Googleログイン機能は準備中です');
    } catch (error) {
      Alert.alert('エラー', 'Googleログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>💰</Text>
          </View>
          <Text style={styles.title}>ログイン</Text>
          <Text style={styles.subtitle}>アカウントにログインしてください</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.demoInfo}>
            <Text style={styles.demoInfoText}>
              💡 テスト用: kuni567489@gmail.com / demo123456
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              style={styles.input}
              placeholder="example@student.ac.jp"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>パスワード</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'ログイン中...' : 'ログイン'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerTextContainer}>
              <Text style={styles.dividerText}>または</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <View style={styles.googleButtonContent}>
              <Ionicons name="logo-google" size={20} color="#4285F4" />
              <Text style={styles.googleButtonText}>Googleでログイン</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoButton, loading && styles.buttonDisabled]}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Text style={styles.demoButtonText}>
              {loading ? 'ログイン中...' : '🚀 デモアカウントでログイン'}
            </Text>
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>アカウントをお持ちでない場合は </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}>新規登録</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#10B981',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  
  // 元のWebアプリと同じカードデザイン
  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 24,
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  
  // zaim-blue色を使用した丸いボタン
  button: {
    backgroundColor: '#3B82F6', // zaim-blue-500相当
    borderRadius: 24, // rounded-full相当
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // 「または」の区切り線
  dividerContainer: {
    position: 'relative',
    marginVertical: 16,
  },
  dividerLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerTextContainer: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  dividerText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  
  // Googleログインボタン
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // デモログインボタン
  demoButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  demoButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // デモ情報
  demoInfo: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  demoInfoText: {
    fontSize: 12,
    color: '#4F46E5',
    textAlign: 'center',
  },
  
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  link: {
    fontSize: 14,
    color: '#3B82F6', // zaim-blue-600相当
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});