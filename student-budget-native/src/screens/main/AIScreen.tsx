import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  recommendations?: AIRecommendation[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'subsidy' | 'discount' | 'benefit' | 'tip';
  amount?: string;
  deadline?: string;
  url?: string;
  source: string;
}

interface UserProfile {
  id: string;
  name: string;
  age: number;
  grade: string;
  prefecture: string;
  school_name?: string;
  monthly_budget: number;
  savings_balance: number;
  school_type: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

export default function AIScreen() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return `session_${Date.now()}`;
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showChatList, setShowChatList] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 初期化とウェルカムメッセージ
  useEffect(() => {
    let mounted = true;
    
    if (user && mounted) {
      loadDailyUsageCount();
      loadChatSessions();
      
      // ウェルカムメッセージを追加（一度だけ）
      setMessages(prev => {
        if (prev.length === 0) {
          const welcomeMessage: ChatMessage = {
            id: 'welcome',
            type: 'ai',
            content: 'こんにちは！私はMoney MomentのAIアシスタントです。お得情報の検索、節約アドバイス、家計管理のご相談など、何でもお気軽にお話しください！',
            timestamp: new Date()
          };
          return [welcomeMessage];
        }
        return prev;
      });
    }
    
    return () => {
      mounted = false;
    };
  }, [user]);

  // メッセージが変更されたら自動スクロール
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        try {
          flatListRef.current?.scrollToEnd({ animated: true });
        } catch (error) {
          // スクロールエラーを無視
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // チャットセッションの読み込み
  const loadChatSessions = async () => {
    if (!user) return;
    try {
      const saved = await AsyncStorage.getItem(`money-moment-chat-sessions-${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sessions = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error('チャットセッション読み込みエラー:', error);
    }
  };

  // 日次使用回数の読み込み
  const loadDailyUsageCount = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `daily_ai_usage_${user.id}_${today}`;
    try {
      const storedCount = await AsyncStorage.getItem(storageKey);
      const count = storedCount ? parseInt(storedCount) : 0;
      setDailyMessageCount(count);
      setIsDailyLimitReached(count >= 5);
    } catch (error) {
      console.error('使用回数読み込みエラー:', error);
    }
  };

  // セッション保存
  const saveCurrentSession = useCallback(async () => {
    if (messages.length === 0 || !user) return;
    
    const hasUserMessage = messages.some(msg => msg.type === 'user');
    if (!hasUserMessage) return;
    
    const sessionTitle = messages.find(msg => msg.type === 'user')?.content.slice(0, 30) + '...' || '新しい会話';
    const now = new Date();
    
    const currentSession: ChatSession = {
      id: currentSessionId,
      title: sessionTitle,
      messages: messages,
      createdAt: chatSessions.find(s => s.id === currentSessionId)?.createdAt || now,
      updatedAt: now
    };
    
    const updatedSessions = chatSessions.filter(s => s.id !== currentSessionId);
    updatedSessions.unshift(currentSession);
    const limitedSessions = updatedSessions.slice(0, 20);
    
    try {
      await AsyncStorage.setItem(`money-moment-chat-sessions-${user.id}`, JSON.stringify(limitedSessions));
      setChatSessions(limitedSessions);
    } catch (error) {
      console.error('セッション保存エラー:', error);
    }
  }, [messages, currentSessionId, user]);

  // メッセージ送信
  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return;
    if (isDailyLimitReached) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // モックAI応答（実際のAPIは後で実装）
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = generateMockResponse(content);
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        recommendations: aiResponse.recommendations
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // 使用回数を更新
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `daily_ai_usage_${user.id}_${today}`;
      const newCount = dailyMessageCount + 1;
      await AsyncStorage.setItem(storageKey, newCount.toString());
      setDailyMessageCount(newCount);
      setIsDailyLimitReached(newCount >= 5);
      
    } catch (error) {
      console.error('AI応答エラー:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: '申し訳ございません。現在AIサービスに問題が発生しています。しばらくお待ちください。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // モックAI応答生成（Web版のプロンプトスタイルに合わせて改善）
  const generateMockResponse = (userMessage: string): { content: string; recommendations?: AIRecommendation[] } => {
    const lowerMessage = userMessage.toLowerCase();
    
    const userName = userProfile?.name || 'さん';
    
    if (lowerMessage.includes('割引') || lowerMessage.includes('お得')) {
      return {
        content: `${userName}さん、お得な割引情報についてお答えしますね！\n\n学生証を活用することで、映画館、レストラン、交通機関で割引が受けられます。オンラインサービスでも学生向け特典が充実していますよ。特にAmazon Prime StudentやSpotifyの学割プランはとてもお得です。`,
        recommendations: [
          {
            id: 'discount_1',
            title: 'Amazon Prime Student',
            description: '通常価格の半額でPrimeの全サービスが利用できます',
            category: 'discount',
            amount: '年額2,950円（通常価格の50%オフ）',
            source: 'Amazon'
          },
          {
            id: 'discount_2',
            title: '映画館学生割引',
            description: '全国の映画館で学生料金が適用されます',
            category: 'discount',
            amount: '一般料金から300-500円割引',
            source: '各映画館チェーン'
          }
        ]
      };
    }
    
    if (lowerMessage.includes('節約') || lowerMessage.includes('コツ')) {
      return {
        content: `${userName}さん、節約のコツについてアドバイスしますね！\n\n食費は自炊で大きく削減できます。まとめ買いと冷凍保存がポイントです。交通費は学割定期券や自転車を活用しましょう。教材費は中古本やフリマアプリを使うと節約になります。無理のない範囲で続けることが大切ですよ。`,
        recommendations: [
          {
            id: 'tip_1',
            title: '自炊による食費節約',
            description: '週3回以上の自炊で大幅な食費削減が可能です',
            category: 'tip',
            amount: '月額約5,000円の節約効果',
            source: 'Money Moment'
          }
        ]
      };
    }
    
    if (lowerMessage.includes('補助金') || lowerMessage.includes('奨学金')) {
      return {
        content: `${userName}さん、奨学金・補助金について説明しますね！\n\n給付型奨学金（返済不要）を優先的に検討することをおすすめします。JASSO以外にも地方自治体や民間の奨学金があります。申請時期や条件を確認して、早めに準備を始めましょう。`,
        recommendations: [
          {
            id: 'subsidy_1',
            title: 'JASSO給付奨学金',
            description: '家計基準と学業成績の条件を満たす学生が対象',
            category: 'subsidy',
            amount: '月額最大91,300円（返済不要）',
            deadline: '春と秋の年2回募集',
            source: '日本学生支援機構'
          }
        ]
      };
    }
    
    return {
      content: `${userName}さん、ご質問ありがとうございます！\n\nMoney Momentでは節約術、お得な情報、奨学金制度など、学生の皆さんの家計管理をサポートしています。具体的にお知りになりたいことがあれば、遠慮なくお聞きください。例えば「食費を抑えたい」「学割情報を教えて」などと話しかけてくださいね。`
    };
  };

  // クイック返信
  const sendQuickReply = (message: string) => {
    sendMessage(message);
  };

  // 新しい会話を開始
  const startNewChat = async () => {
    if (messages.length > 0) {
      await saveCurrentSession();
    }
    
    const newSessionId = `session_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setShowChatList(false);
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'ai',
      content: 'こんにちは！私はMoney MomentのAIアシスタントです。お得情報の検索、節約アドバイス、家計管理のご相談など、何でもお気軽にお話しください！',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  // セッション読み込み
  const loadSession = async (session: ChatSession) => {
    if (messages.length > 0) {
      await saveCurrentSession();
    }
    
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowChatList(false);
  };

  // セッション削除
  const deleteSession = async (sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    
    try {
      await AsyncStorage.setItem(`money-moment-chat-sessions-${user?.id}`, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('セッション削除エラー:', error);
    }
    
    if (sessionId === currentSessionId) {
      await startNewChat();
    }
  };

  // メッセージレンダリング
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.type === 'user';
    const isSystem = item.type === 'system';
    
    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {/* AI/システムメッセージの場合は左にアバター */}
        {!isUser && !isSystem && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color={Colors.white} />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : isSystem ? styles.systemBubble : styles.aiBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : isSystem ? styles.systemMessageText : styles.aiMessageText
          ]}>
            {item.content}
          </Text>
          
          {/* 推奨情報表示 */}
          {item.recommendations && item.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              {item.recommendations.map((rec) => (
                <View key={rec.id} style={styles.recommendationCard}>
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                    <View style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(rec.category) }
                    ]}>
                      <Text style={styles.categoryBadgeText}>{getCategoryLabel(rec.category)}</Text>
                    </View>
                  </View>
                  <Text style={styles.recommendationDescription}>{rec.description}</Text>
                  <View style={styles.recommendationFooter}>
                    {rec.amount && (
                      <Text style={styles.recommendationAmount}>{rec.amount}</Text>
                    )}
                    {rec.deadline && (
                      <Text style={styles.recommendationDeadline}>期限: {rec.deadline}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
          
          <Text style={[
            styles.messageTime,
            isUser ? styles.userMessageTime : styles.aiMessageTime
          ]}>
            {item.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {/* ユーザーメッセージの場合は右にアバター */}
        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color={Colors.zaimBlue[700]} />
          </View>
        )}
      </View>
    );
  };

  // カテゴリ色取得（zaim-blue系に統一）
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'subsidy': return Colors.zaimBlue[600];      // 補助金・奨学金
      case 'discount': return Colors.zaimBlue[500];     // 割引情報
      case 'benefit': return Colors.zaimBlue[400];      // 特典
      case 'tip': return Colors.zaimBlue[700];          // アドバイス
      default: return Colors.gray[500];
    }
  };

  // カテゴリラベル取得
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'subsidy': return '補助金・奨学金';
      case 'discount': return '割引情報';
      case 'benefit': return '特典';
      case 'tip': return 'アドバイス';
      default: return 'その他';
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="sparkles" size={24} color={Colors.zaimBlue[500]} />
            <Text style={styles.title}>AIアシスタント</Text>
          </View>
        </View>
        
        <View style={styles.loginPrompt}>
          <View style={styles.loginIcon}>
            <Ionicons name="sparkles" size={40} color={Colors.gray[400]} />
          </View>
          <Text style={styles.loginTitle}>ログインが必要です</Text>
          <Text style={styles.loginDescription}>
            ログインしてパーソナライズされたAIアシスタントとチャットしましょう
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.mainContent}>
          {/* サイドバー - チャット履歴 */}
          {showChatList && (
            <View style={styles.sidebar}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>会話履歴</Text>
                <TouchableOpacity
                  style={styles.closeSidebarButton}
                  onPress={() => setShowChatList(false)}
                >
                  <Ionicons name="close" size={20} color={Colors.gray[500]} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.newChatButton}
                onPress={startNewChat}
              >
                <Ionicons name="chatbubbles" size={16} color={Colors.white} />
                <Text style={styles.newChatButtonText}>新しい会話</Text>
              </TouchableOpacity>
              
              <ScrollView style={styles.sessionsList}>
                {chatSessions.length === 0 ? (
                  <Text style={styles.noSessionsText}>まだ会話履歴がありません</Text>
                ) : (
                  chatSessions.map((session) => (
                    <View 
                      key={session.id} 
                      style={[
                        styles.sessionItem,
                        session.id === currentSessionId && styles.activeSession
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.sessionButton}
                        onPress={() => loadSession(session)}
                      >
                        <Text style={styles.sessionTitle} numberOfLines={1}>
                          {session.title}
                        </Text>
                        <Text style={styles.sessionDate}>
                          {session.updatedAt.toLocaleDateString('ja-JP', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteSessionButton}
                        onPress={() => deleteSession(session.id)}
                      >
                        <Ionicons name="trash" size={12} color={Colors.error[500]} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          {/* メインチャットエリア */}
          <View style={[styles.chatArea, showChatList && styles.chatAreaWithSidebar]}>
            {/* ヘッダー */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Ionicons name="sparkles" size={24} color={Colors.zaimBlue[500]} />
                <Text style={styles.title}>AIアシスタント</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setShowChatList(!showChatList)}
                >
                  <Ionicons name="time" size={20} color={Colors.gray[600]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={startNewChat}
                >
                  <Ionicons name="chatbubbles" size={20} color={Colors.gray[600]} />
                </TouchableOpacity>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={16} color={Colors.zaimBlue[700]} />
                </View>
              </View>
            </View>

            {/* 使用制限表示 */}
            <View style={styles.usageLimitContainer}>
              <Text style={styles.usageLimitText}>
                今日の残りメッセージ数: {5 - dailyMessageCount}/5
              </Text>
              {isDailyLimitReached && (
                <Text style={styles.limitReachedText}>
                  明日の00:00にリセットされます
                </Text>
              )}
            </View>

            {/* チャットエリア */}
            <View style={styles.chatContainer}>
              {messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons name="sparkles" size={32} color={Colors.zaimBlue[500]} />
                  </View>
                  <Text style={styles.emptyStateTitle}>AI会話を開始</Text>
                  <Text style={styles.emptyStateDescription}>
                    何についてお話ししましょうか？
                  </Text>
                  
                  <View style={styles.quickActions}>
                    <TouchableOpacity 
                      style={styles.quickActionButton}
                      onPress={() => sendQuickReply('お得な割引情報を教えて')}
                      disabled={isDailyLimitReached}
                    >
                      <Ionicons name="pricetags" size={16} color={Colors.gray[700]} />
                      <Text style={styles.quickActionText}>お得な割引情報を教えて</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.quickActionButton}
                      onPress={() => sendQuickReply('節約のコツを教えて')}
                      disabled={isDailyLimitReached}
                    >
                      <Ionicons name="bulb" size={16} color={Colors.gray[700]} />
                      <Text style={styles.quickActionText}>節約のコツを教えて</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.quickActionButton}
                      onPress={() => sendQuickReply('学生向けの補助金を調べて')}
                      disabled={isDailyLimitReached}
                    >
                      <Ionicons name="gift" size={16} color={Colors.gray[700]} />
                      <Text style={styles.quickActionText}>学生向けの補助金を調べて</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    style={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                      try {
                        flatListRef.current?.scrollToEnd({ animated: true });
                      } catch (error) {
                        // スクロールエラーを無視
                      }
                    }}
                    onLayout={() => {
                      try {
                        flatListRef.current?.scrollToEnd({ animated: false });
                      } catch (error) {
                        // スクロールエラーを無視
                      }
                    }}
                  />
                  
                  {/* タイピングインジケーター */}
                  {isTyping && (
                    <View style={styles.typingContainer}>
                      <View style={styles.aiAvatar}>
                        <Ionicons name="sparkles" size={16} color={Colors.white} />
                      </View>
                      <View style={styles.typingBubble}>
                        <View style={styles.typingDots}>
                          <View style={[styles.typingDot, styles.typingDot1]} />
                          <View style={[styles.typingDot, styles.typingDot2]} />
                          <View style={[styles.typingDot, styles.typingDot3]} />
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* 入力エリア */}
            <View style={styles.inputContainer}>
              <View style={styles.characterCount}>
                <Text style={[
                  styles.characterCountText,
                  inputMessage.length > 450 && styles.characterCountWarning
                ]}>
                  {inputMessage.length} / 500
                </Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={inputMessage}
                  onChangeText={(text) => {
                    if (text.length <= 500) {
                      setInputMessage(text);
                    }
                  }}
                  placeholder={isDailyLimitReached ? '1日の使用制限に達しました' : '何かお聞きしたいことはありますか？'}
                  placeholderTextColor={Colors.gray[500]}
                  multiline
                  maxLength={500}
                  editable={!isTyping && !isDailyLimitReached}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!inputMessage.trim() || isTyping || isDailyLimitReached) && styles.sendButtonDisabled
                  ]}
                  onPress={() => sendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isTyping || isDailyLimitReached}
                >
                  <Ionicons name="send" size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  
  // サイドバー
  sidebar: {
    width: 280,
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.gray[200],
    flexDirection: 'column',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  closeSidebarButton: {
    padding: 4,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.zaimBlue[500],
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  newChatButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
  },
  sessionsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  noSessionsText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
    textAlign: 'center',
    paddingVertical: 32,
  },
  sessionItem: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  activeSession: {
    backgroundColor: Colors.zaimBlue[50],
    borderColor: Colors.zaimBlue[200],
  },
  sessionButton: {
    padding: 12,
    flex: 1,
  },
  sessionTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    color: Colors.black,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  deleteSessionButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  
  // チャットエリア
  chatArea: {
    flex: 1,
    flexDirection: 'column',
  },
  chatAreaWithSidebar: {
    flex: 1,
  },
  
  // ヘッダー
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
  },
  
  // 使用制限
  usageLimitContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
  },
  usageLimitText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[700],
    textAlign: 'center',
  },
  limitReachedText: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 2,
  },
  
  // チャットコンテナ
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messagesList: {
    flex: 1,
  },
  
  // メッセージ
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  userMessageContainer: {
    flexDirection: 'row-reverse',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: Colors.zaimBlue[500],
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderBottomLeftRadius: 4,
  },
  systemBubble: {
    backgroundColor: Colors.gray[200],
    alignSelf: 'center',
    maxWidth: '90%',
  },
  messageText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white,
  },
  aiMessageText: {
    color: Colors.black,
  },
  systemMessageText: {
    color: Colors.gray[700],
  },
  messageTime: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiMessageTime: {
    color: Colors.gray[500],
  },
  
  // アバター
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.zaimBlue[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.blue[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // 推奨情報
  recommendationsContainer: {
    marginTop: 8,
    gap: 8,
  },
  recommendationCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recommendationTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    color: Colors.black,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.white,
  },
  recommendationDescription: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[700],
    marginBottom: 6,
    lineHeight: 16,
  },
  recommendationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationAmount: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    color: Colors.success[600],
  },
  recommendationDeadline: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.error[600],
  },
  
  // タイピングインジケーター
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  typingBubble: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.zaimBlue[400],
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  
  // 空の状態
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.zaimBlue[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // クイックアクション
  quickActions: {
    gap: 8,
    width: '100%',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[700],
    flex: 1,
  },
  
  // 入力エリア
  inputContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  characterCountText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  characterCountWarning: {
    color: Colors.warning[600],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.zaimBlue[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  
  // ログインプロンプト
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginBottom: 8,
  },
  loginDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
    textAlign: 'center',
  },
});