import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePromptContext } from '@/context/PromptContext';
import { ChatThread } from '@/constants/prompts';
import {
  AccentRed,
  DarkBackground,
  DarkSurface,
  DarkCard,
  DarkBorder,
} from '@/constants/theme';

export default function UpdatesScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, threads, markNotificationRead, sendMessage, showToast } =
    usePromptContext();

  const [activeTab, setActiveTab] = useState<'update' | 'messages'>('update');
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeThread) return;
    sendMessage(activeThread.id, messageInput.trim());
    setMessageInput('');
  };

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 12;
  const bottomInset = Math.max(insets.bottom, 14) + 84;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Segmented Header (Matching Image 2: "Update" vs "Messages") */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <View style={styles.segmentContainer}>
          <Pressable
            style={styles.segmentBtn}
            onPress={() => setActiveTab('update')}>
            <Text
              style={[
                styles.segmentText,
                activeTab === 'update' && styles.segmentTextActive,
              ]}>
              Update
            </Text>
            {activeTab === 'update' && <View style={styles.redUnderline} />}
          </Pressable>

          <Pressable
            style={styles.segmentBtn}
            onPress={() => setActiveTab('messages')}>
            <Text
              style={[
                styles.segmentText,
                activeTab === 'messages' && styles.segmentTextActive,
              ]}>
              Messages
            </Text>
            {activeTab === 'messages' && <View style={styles.redUnderline} />}
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}>
        {activeTab === 'update' ? (
          /* =================== UPDATES TAB =================== */
          <View style={styles.updatesList}>
            {notifications.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.updateCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => {
                  markNotificationRead(item.id);
                  showToast(item.title);
                }}>
                {/* 3-Photo Collage Card Layout (Matching Image 2) */}
                {item.thumbnails && item.thumbnails.length > 0 && (
                  <View style={styles.collageContainer}>
                    {item.thumbnails.map((url, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: url }}
                        style={styles.collageThumb}
                        contentFit="cover"
                      />
                    ))}
                  </View>
                )}

                {/* Follower Alert with Avatar */}
                {item.avatar && (
                  <View style={styles.avatarRow}>
                    <Image
                      source={{ uri: item.avatar }}
                      style={styles.followerAvatar}
                      contentFit="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.updateTitle}>{item.title}</Text>
                      <Text style={styles.updateDesc}>{item.description}</Text>
                    </View>
                    {item.actionLabel && (
                      <Pressable
                        style={styles.followBackBtn}
                        onPress={() => showToast(`Following back!`, 'checkmark-circle')}>
                        <Text style={styles.followBackText}>{item.actionLabel}</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Text Info */}
                {!item.avatar && (
                  <View style={styles.metaRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.updateTitle}>{item.title}</Text>
                      <Text style={styles.updateDesc}>{item.description}</Text>
                    </View>
                    <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          /* =================== MESSAGES TAB =================== */
          <View style={styles.threadsList}>
            {threads.map((thread) => (
              <Pressable
                key={thread.id}
                style={({ pressed }) => [
                  styles.threadCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => setActiveThread(thread)}>
                <View style={styles.threadAvatarWrapper}>
                  <Image
                    source={{ uri: thread.user.avatar }}
                    style={styles.threadAvatar}
                    contentFit="cover"
                  />
                  {thread.user.online && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.threadInfo}>
                  <View style={styles.threadTopRow}>
                    <Text style={styles.threadUserName}>{thread.user.name}</Text>
                    <Text style={styles.threadTime}>{thread.lastMessageTime}</Text>
                  </View>
                  <Text style={styles.threadLastMsg} numberOfLines={1}>
                    {thread.lastMessage}
                  </Text>
                </View>

                {thread.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCountText}>{thread.unreadCount}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Direct Message Chat Modal Sheet */}
      <Modal
        visible={!!activeThread}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveThread(null)}>
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 70 : 95}
            tint="dark"
            style={styles.chatSheet}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <Pressable
                style={styles.chatBackBtn}
                onPress={() => setActiveThread(null)}>
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </Pressable>

              <View style={styles.chatUserMeta}>
                <Image
                  source={{ uri: activeThread?.user.avatar }}
                  style={styles.chatUserAvatar}
                  contentFit="cover"
                />
                <View>
                  <Text style={styles.chatUserName}>{activeThread?.user.name}</Text>
                  <Text style={styles.chatUserHandle}>{activeThread?.user.handle}</Text>
                </View>
              </View>

              <Pressable
                style={styles.chatOptionsBtn}
                onPress={() => showToast('Chat options', 'ellipsis-horizontal')}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Chat Messages List */}
            <ScrollView style={styles.chatMessagesScroll} showsVerticalScrollIndicator={false}>
              {activeThread?.messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubbleWrapper,
                    msg.isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
                  ]}>
                  <View
                    style={[
                      styles.messageBubble,
                      msg.isMe ? styles.myBubble : styles.theirBubble,
                    ]}>
                    <Text style={styles.messageText}>{msg.text}</Text>
                    <Text style={styles.messageTime}>{msg.timestamp}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Message Input Box */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor="#6B7280"
                value={messageInput}
                onChangeText={setMessageInput}
                onSubmitEditing={handleSendMessage}
              />
              <Pressable
                style={[
                  styles.sendBtn,
                  !messageInput.trim() && styles.sendBtnDisabled,
                ]}
                disabled={!messageInput.trim()}
                onPress={handleSendMessage}>
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  segmentBtn: {
    paddingVertical: 8,
    position: 'relative',
  },
  segmentText: {
    color: '#8E95A5',
    fontSize: 18,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  redUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: AccentRed,
    borderRadius: 2,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  updatesList: {
    gap: 16,
  },
  updateCard: {
    backgroundColor: DarkSurface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  cardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  collageContainer: {
    flexDirection: 'row',
    gap: 8,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  collageThumb: {
    flex: 1,
    height: '100%',
    borderRadius: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  followBackBtn: {
    backgroundColor: AccentRed,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  followBackText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  updateTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  updateDesc: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },
  timeAgo: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 8,
  },
  threadsList: {
    gap: 10,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    backgroundColor: DarkSurface,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  threadAvatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  threadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: DarkSurface,
  },
  threadInfo: {
    flex: 1,
  },
  threadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  threadUserName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  threadTime: {
    color: '#6B7280',
    fontSize: 12,
  },
  threadLastMsg: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AccentRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  chatSheet: {
    backgroundColor: 'rgba(18, 20, 28, 0.98)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    paddingHorizontal: 16,
    height: '88%',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  chatBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatUserMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatUserAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  chatUserName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  chatUserHandle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  chatOptionsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatMessagesScroll: {
    flex: 1,
    paddingVertical: 10,
  },
  messageBubbleWrapper: {
    marginBottom: 12,
    width: '100%',
  },
  myBubbleWrapper: {
    alignItems: 'flex-end',
  },
  theirBubbleWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: AccentRed,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: DarkCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: DarkCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AccentRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
