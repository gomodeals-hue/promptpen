import React, { useState, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Share,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PromptItem } from '@/constants/prompts';
import {
  AccentRed,
  DarkBackground,
  DarkCard,
  DarkSurface,
  DarkBorder,
} from '@/constants/theme';

interface PromptDetailModalProps {
  visible: boolean;
  item: PromptItem | null;
  onClose: () => void;
  onCopySuccess?: (msg: string) => void;
}

export function PromptDetailModal({
  visible,
  item,
  onClose,
  onCopySuccess,
}: PromptDetailModalProps) {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const copyAnim = useRef(new Animated.Value(1)).current;
  const saveAnim = useRef(new Animated.Value(1)).current;
  const followAnim = useRef(new Animated.Value(1)).current;

  if (!item) return null;

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 8;
  const bottomInset = Math.max(insets.bottom, 16) + 30;

  const handleCopyPrompt = async () => {
    Animated.sequence([
      Animated.timing(copyAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.spring(copyAnim, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
    ]).start();

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(item.prompt);
      }
      setCopied(true);
      onCopySuccess?.('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(true);
      onCopySuccess?.('Prompt copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    Animated.sequence([
      Animated.timing(saveAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.spring(saveAnim, { toValue: 1, tension: 120, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    Animated.sequence([
      Animated.timing(followAnim, { toValue: 1.12, duration: 100, useNativeDriver: true }),
      Animated.spring(followAnim, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
    ]).start();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this AI art prompt "${item.title}" on PromptPen:\n\n${item.prompt}`,
        title: item.title,
      });
    } catch (err) {
      // Ignored
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Floating Close / Share Bar */}
        <View style={[styles.topHeader, { paddingTop: topInset }]}>
          <Pressable style={styles.iconCircle} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerRight}>
            <Pressable style={styles.iconCircle} onPress={handleShare} hitSlop={8}>
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            </Pressable>
            <Animated.View style={{ transform: [{ scale: saveAnim }] }}>
              <Pressable
                style={[styles.saveHeaderBtn, isSaved && styles.saveHeaderBtnActive]}
                onPress={handleSaveToggle}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={isSaved ? '#000000' : '#FFFFFF'}
                />
                <Text style={[styles.saveHeaderText, isSaved && styles.saveHeaderTextActive]}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset }]}
          showsVerticalScrollIndicator={false}>
          {/* Main Hero Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.artworkImage, { aspectRatio: item.aspectRatio || 0.8 }]}
              contentFit="cover"
              transition={300}
            />

            {/* Model Tag Overlay */}
            <View style={styles.modelFloatingBadge}>
              <View style={styles.limePulse} />
              <Text style={styles.modelBadgeText}>{item.model}</Text>
            </View>
          </View>

          {/* Prompt Information Section */}
          <View style={styles.infoSection}>
            {/* Title & Created Date */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>{item.createdAt}</Text>
            </View>

            {/* Author Profile Row */}
            <View style={styles.authorRow}>
              <Image source={{ uri: item.author.avatar }} style={styles.authorAvatar} />
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>{item.author.name}</Text>
                <Text style={styles.authorHandle}>{item.author.handle}</Text>
              </View>
              <Animated.View style={{ transform: [{ scale: followAnim }] }}>
                <Pressable
                  style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                  onPress={handleFollowToggle}>
                  <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </Pressable>
              </Animated.View>
            </View>

            {/* Prompt Box with Quick Copy */}
            <View style={styles.promptCard}>
              <View style={styles.promptCardHeader}>
                <View style={styles.promptLabelRow}>
                  <Ionicons name="sparkles" size={16} color={AccentRed} />
                  <Text style={styles.promptLabel}>POSITIVE PROMPT</Text>
                </View>

                <Animated.View style={{ transform: [{ scale: copyAnim }] }}>
                  <Pressable
                    style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
                    onPress={handleCopyPrompt}>
                    <Ionicons
                      name={copied ? 'checkmark' : 'copy-outline'}
                      size={16}
                      color={copied ? '#000000' : AccentRed}
                    />
                    <Text style={[styles.copyBtnText, copied && styles.copyBtnTextSuccess]}>
                      {copied ? 'Copied' : 'Copy'}
                    </Text>
                  </Pressable>
                </Animated.View>
              </View>

              <Text style={styles.promptText} selectable>
                {item.prompt}
              </Text>
            </View>

            {/* Negative Prompt (if available) */}
            {item.negativePrompt && (
              <View style={styles.negativePromptCard}>
                <Text style={styles.negativeLabel}>NEGATIVE PROMPT</Text>
                <Text style={styles.negativeText} selectable>
                  {item.negativePrompt}
                </Text>
              </View>
            )}

            {/* Prompt Generation Parameters Grid */}
            <Text style={styles.sectionHeader}>Generation Parameters</Text>
            <View style={styles.paramsGrid}>
              <View style={styles.paramBox}>
                <Text style={styles.paramKey}>Model</Text>
                <Text style={styles.paramValue}>{item.model}</Text>
              </View>
              <View style={styles.paramBox}>
                <Text style={styles.paramKey}>Aspect Ratio</Text>
                <Text style={styles.paramValue}>
                  {item.aspectRatio < 0.8 ? '3:4' : item.aspectRatio > 1.1 ? '16:9' : '1:1'}
                </Text>
              </View>
              <View style={styles.paramBox}>
                <Text style={styles.paramKey}>CFG Scale</Text>
                <Text style={styles.paramValue}>{item.cfgScale || '7.0'}</Text>
              </View>
              <View style={styles.paramBox}>
                <Text style={styles.paramKey}>Seed</Text>
                <Text style={styles.paramValue}>{item.seed || '492019482'}</Text>
              </View>
            </View>

            {/* Tags list */}
            <Text style={styles.sectionHeader}>Tags</Text>
            <View style={styles.tagsRow}>
              {item.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* Primary Action Button */}
            <Pressable
              style={styles.primaryActionButton}
              onPress={handleCopyPrompt}>
              <Ionicons name="flash" size={18} color="#000000" />
              <Text style={styles.primaryActionText}>Use Prompt in Studio</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkBackground,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 14,
    backgroundColor: DarkBackground,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DarkSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  saveHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DarkSurface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  saveHeaderBtnActive: {
    backgroundColor: AccentRed,
    borderColor: AccentRed,
  },
  saveHeaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveHeaderTextActive: {
    color: '#000000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageWrapper: {
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  artworkImage: {
    width: '100%',
    borderRadius: 26,
  },
  modelFloatingBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 12, 16, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 255, 0, 0.4)',
  },
  limePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AccentRed,
    marginRight: 8,
  },
  modelBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoSection: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.3,
  },
  date: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkSurface,
    padding: 12,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: AccentRed,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  authorHandle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  followBtnActive: {
    backgroundColor: 'rgba(212, 255, 0, 0.15)',
    borderColor: AccentRed,
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  followBtnTextActive: {
    color: AccentRed,
  },
  promptCard: {
    backgroundColor: DarkCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 255, 0, 0.25)',
    marginBottom: 14,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptLabel: {
    color: AccentRed,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 255, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AccentRed,
  },
  copyBtnSuccess: {
    backgroundColor: AccentRed,
  },
  copyBtnText: {
    color: AccentRed,
    fontSize: 12,
    fontWeight: '700',
  },
  copyBtnTextSuccess: {
    color: '#000000',
  },
  promptText: {
    color: '#F3F4F6',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  negativePromptCard: {
    backgroundColor: DarkSurface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: DarkBorder,
    marginBottom: 20,
  },
  negativeLabel: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  negativeText: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 12,
  },
  paramsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  paramBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: DarkSurface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  paramKey: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  paramValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tagChip: {
    backgroundColor: DarkSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  tagText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  primaryActionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AccentRed,
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: AccentRed,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      web: {
        boxShadow: '0 6px 20px rgba(212, 255, 0, 0.35)',
        cursor: 'pointer',
      },
    }),
  },
  primaryActionText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
