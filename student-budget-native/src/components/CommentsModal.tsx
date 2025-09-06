import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { getPostComments, createComment, type Comment } from '../services/comments';
import { useAuth } from '../contexts/AuthContext';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  onCommentAdded?: (newCount: number) => void;
}

export default function CommentsModal({ 
  visible, 
  onClose, 
  postId, 
  postTitle,
  onCommentAdded 
}: CommentsModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const result = await getPostComments(postId);
      if (result.data) {
        setComments(result.data);
      } else {
        console.error('コメント取得エラー:', result.error);
      }
    } catch (error) {
      console.error('コメント読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('エラー', 'コメントを入力してください');
      return;
    }

    if (!user) {
      Alert.alert('エラー', 'ログインが必要です');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createComment(postId, newComment);
      if (result.data) {
        setNewComment('');
        await loadComments(); // コメント一覧を再読み込み
        onCommentAdded?.(comments.length + 1);
      } else {
        Alert.alert('エラー', 'コメントの投稿に失敗しました');
      }
    } catch (error) {
      console.error('コメント投稿エラー:', error);
      Alert.alert('エラー', 'コメントの投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins < 1 ? '今' : `${diffMins}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', { 
        month: 'numeric', 
        day: 'numeric' 
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>コメント</Text>
            <Text style={styles.postTitle} numberOfLines={1}>
              {postTitle}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.gray[600]} />
          </TouchableOpacity>
        </View>

        {/* コメント一覧 */}
        <ScrollView 
          style={styles.commentsContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.zaimBlue[500]} />
              <Text style={styles.loadingText}>読み込み中...</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>まだコメントがありません</Text>
              <Text style={styles.emptySubtext}>最初のコメントを投稿してみませんか？</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  {comment.user_profiles?.avatar_url ? (
                    <Image
                      source={{ uri: comment.user_profiles.avatar_url }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={16} color={Colors.gray[600]} />
                  )}
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {comment.user_profiles?.name || 'Unknown'}
                    </Text>
                    <Text style={styles.commentDate}>
                      {formatDate(comment.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* コメント入力フォーム */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="コメントを入力..."
              placeholderTextColor={Colors.gray[400]}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!newComment.trim() || submitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="send" size={18} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.charCount}>{newComment.length}/500</Text>
        </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  postTitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    fontWeight: '600',
    color: Colors.black,
    marginRight: 8,
  },
  commentDate: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  commentText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[700],
    lineHeight: 20,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.black,
    maxHeight: 100,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.zaimBlue[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  charCount: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
    textAlign: 'right',
    marginTop: 4,
  },
});