import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

// 都道府県データ
const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

export default function InitialSetupScreen() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setSaving] = useState(false);
  
  // フォームデータ
  const [formData, setFormData] = useState({
    name: '',
    age: 15,
    grade: '',
    prefecture: '',
    school_name: '',
    monthly_budget: 30000,
    savings_balance: 0,
  });

  const handleSave = async () => {
    if (!user) return;
    
    // 必須項目のチェック
    if (!formData.name || !formData.grade || !formData.prefecture) {
      Alert.alert('入力エラー', '必須項目をすべて入力してください');
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          age: formData.age,
          grade: formData.grade,
          prefecture: formData.prefecture,
          school_name: formData.school_name,
          monthly_budget: formData.monthly_budget,
          savings_balance: formData.savings_balance,
          school_type: 'high_school',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('設定完了', 'プロフィール設定が完了しました！', [
        { text: 'OK', onPress: () => {
          // RootNavigatorが自動で初期設定完了を検出してメイン画面に遷移します
        }}
      ]);
    } catch (error) {
      console.error('プロフィール保存エラー:', error);
      Alert.alert('エラー', 'プロフィールの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>基本情報を入力してください</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>お名前 *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="田中太郎"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>年齢</Text>
        <View style={styles.ageSelector}>
          {[15, 16, 17, 18].map((age) => (
            <TouchableOpacity
              key={age}
              style={[
                styles.ageOption,
                formData.age === age && styles.ageOptionSelected
              ]}
              onPress={() => setFormData({ ...formData, age })}
            >
              <Text style={[
                styles.ageOptionText,
                formData.age === age && styles.ageOptionTextSelected
              ]}>
                {age}歳
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>学年 *</Text>
        <View style={styles.gradeSelector}>
          {['高校1年生', '高校2年生', '高校3年生'].map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.gradeOption,
                formData.grade === grade && styles.gradeOptionSelected
              ]}
              onPress={() => setFormData({ ...formData, grade })}
            >
              <Text style={[
                styles.gradeOptionText,
                formData.grade === grade && styles.gradeOptionTextSelected
              ]}>
                {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.nextButtonText}>次へ</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>住所・学校情報</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>都道府県 *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.prefectureScroll}>
          <View style={styles.prefectureContainer}>
            {PREFECTURES.map((prefecture) => (
              <TouchableOpacity
                key={prefecture}
                style={[
                  styles.prefectureOption,
                  formData.prefecture === prefecture && styles.prefectureOptionSelected
                ]}
                onPress={() => setFormData({ ...formData, prefecture })}
              >
                <Text style={[
                  styles.prefectureOptionText,
                  formData.prefecture === prefecture && styles.prefectureOptionTextSelected
                ]}>
                  {prefecture}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>学校名</Text>
        <TextInput
          style={styles.input}
          value={formData.school_name}
          onChangeText={(text) => setFormData({ ...formData, school_name: text })}
          placeholder="○○高等学校"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setCurrentStep(3)}
      >
        <Text style={styles.nextButtonText}>次へ</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>予算設定</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>月の予算</Text>
        <Text style={styles.helperText}>お小遣いやアルバイト代など</Text>
        <View style={styles.budgetInputContainer}>
          <Text style={styles.budgetPrefix}>¥</Text>
          <TextInput
            style={styles.budgetInput}
            value={formData.monthly_budget.toString()}
            onChangeText={(text) => setFormData({
              ...formData,
              monthly_budget: parseInt(text.replace(/[^0-9]/g, '')) || 0
            })}
            placeholder="30000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>現在の貯金額</Text>
        <View style={styles.budgetInputContainer}>
          <Text style={styles.budgetPrefix}>¥</Text>
          <TextInput
            style={styles.budgetInput}
            value={formData.savings_balance === 0 ? '' : formData.savings_balance.toString()}
            onChangeText={(text) => setFormData({
              ...formData,
              savings_balance: text === '' ? 0 : parseInt(text.replace(/[^0-9]/g, '')) || 0
            })}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.completeButton, loading && styles.completeButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Text style={styles.completeButtonText}>設定完了</Text>
            <Ionicons name="checkmark" size={20} color="white" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💰</Text>
        </View>
        <Text style={styles.title}>初期設定</Text>
        <Text style={styles.subtitle}>アプリを使うための設定をしましょう</Text>
        
        {/* プログレスバー */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                currentStep >= step && styles.progressDotActive
              ]}
            />
          ))}
        </View>
      </View>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* 戻るボタン */}
      {currentStep > 1 && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(currentStep - 1)}
        >
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#3B82F6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    backgroundColor: '#3B82F6',
  },
  stepContent: {
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#111827',
  },
  ageSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  ageOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  ageOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },
  ageOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  ageOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  gradeSelector: {
    gap: 8,
  },
  gradeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  gradeOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },
  gradeOptionText: {
    fontSize: 16,
    color: '#6B7280',
  },
  gradeOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  prefectureScroll: {
    maxHeight: 150,
  },
  prefectureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prefectureOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: 'white',
  },
  prefectureOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },
  prefectureOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  prefectureOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  budgetPrefix: {
    paddingLeft: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  budgetInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 16,
    marginHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
});