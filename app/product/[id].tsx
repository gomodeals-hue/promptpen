import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Share,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { PROMPTS_DATA, PromptItem } from '@/constants/prompts';
import { usePromptContext } from '@/context/PromptContext';
import { PromptCard } from '@/components/prompt-card';
import {
  AccentRed,
  DarkBackground,
  DarkSurface,
  DarkCard,
  DarkBorder,
} from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    prompts,
    savedPinIds,
    likedPinIds,
    toggleSave,
    toggleLike,
    openMoreOptions,
    openProductPage,
    showToast,
  } = usePromptContext();

  const item = prompts.find(p => p.id === id) || PROMPTS_DATA.find(p => p.id === id) || PROMPTS_DATA[0];
  const isVideo = item.mediaType === 'video';

  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

  const copyAnim = useRef(new Animated.Value(1)).current;
  const saveAnim = useRef(new Animated.Value(1)).current;

  const isSaved = savedPinIds.includes(item.id);
  const isLiked = likedPinIds.includes(item.id);

  // Recommendations
  const relatedPrompts = prompts.filter(p => p.id !== item.id);

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
      showToast(isVideo ? 'Video prompt copied!' : 'Prompt copied to clipboard!', 'copy');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(true);
      showToast('Prompt copied!', 'copy');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSavePress = () => {
    Animated.sequence([
      Animated.timing(saveAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.spring(saveAnim, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
    ]).start();

    toggleSave(item);
  };

  const handleShare = () => {
    Share.share({
      title: item.title,
      message: `Check out "${item.title}" by ${item.author.name} on PromptPen:\n\nPrompt:\n${item.prompt}`,
    }).catch(() => {});
  };

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 8;
  const bottomInset = Math.max(insets.bottom, 16) + 20;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Header Bar (Matching Image 1: '<', Pin Title, '...') */}
      <View style={[styles.topHeader, { top: topInset }]}>
        <Pressable
          style={styles.backCircleBtn}
          onPress={() => router.back()}
          hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitleText} numberOfLines={1}>
          {item.title}
        </Text>

        <Pressable
          style={styles.backCircleBtn}
          onPress={() => openMoreOptions(item)}
          hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 48, paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}>
        {/* Main Artwork Container */}
        <View style={styles.artworkWrapper}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.artworkImage}
            contentFit="cover"
            priority="high"
          />

          {isVideo && (
            <Pressable
              style={styles.videoOverlay}
              onPress={() => setIsPlaying(!isPlaying)}>
              <BlurView intensity={50} tint="dark" style={styles.playBtn}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                />
              </BlurView>
            </Pressable>
          )}
        </View>

        {/* Creator Info & Action Bar (Matching Image 1) */}
        <View style={styles.creatorSection}>
          <View style={styles.creatorRow}>
            <Image
              source={{ uri: item.author.avatar }}
              style={styles.creatorAvatar}
              contentFit="cover"
            />
            <View style={styles.creatorMeta}>
              <Text style={styles.creatorName}>{item.author.name}</Text>
              <Text style={styles.creatorHandle}>{item.author.handle}</Text>
            </View>

            <View style={styles.rightIconGroup}>
              <Pressable
                style={styles.iconCircle}
                onPress={() => toggleLike(item.id)}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isLiked ? AccentRed : '#FFFFFF'}
                />
              </Pressable>

              <Pressable
                style={styles.iconCircle}
                onPress={handleShare}>
                <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          {/* Action Buttons Row: "Visit page / Copy Prompt" & Red "Save" button */}
          <View style={styles.mainActionButtonsRow}>
            <Pressable
              style={styles.visitPageBtn}
              onPress={handleCopyPrompt}>
              <Text style={styles.visitPageText}>
                {copied ? 'Copied Prompt' : 'Copy Prompt'}
              </Text>
            </Pressable>

            <Animated.View style={{ flex: 1, transform: [{ scale: saveAnim }] }}>
              <Pressable
                style={[styles.saveRedBtn, isSaved && styles.saveRedBtnActive]}
                onPress={handleSavePress}>
                <Text style={styles.saveRedBtnText}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>

          {/* AI Prompt Details Card */}
          <View style={styles.promptDetailsCard}>
            <Text style={styles.promptLabel}>PROMPT</Text>
            <Text style={styles.promptTextBody} selectable>
              {item.prompt}
            </Text>

            {item.negativePrompt && (
              <View style={styles.negativeBox}>
                <Text style={styles.negativeLabel}>NEGATIVE PROMPT</Text>
                <Text style={styles.negativeTextBody} selectable>
                  {item.negativePrompt}
                </Text>
              </View>
            )}

            {/* Technical Parameter Tags */}
            <View style={styles.paramsRow}>
              <View style={styles.paramChip}>
                <Text style={styles.paramKey}>Model:</Text>
                <Text style={styles.paramVal}>{item.model}</Text>
              </View>
              <View style={styles.paramChip}>
                <Text style={styles.paramKey}>Category:</Text>
                <Text style={styles.paramVal}>{item.category}</Text>
              </View>
              {item.cfgScale && (
                <View style={styles.paramChip}>
                  <Text style={styles.paramKey}>CFG:</Text>
                  <Text style={styles.paramVal}>{item.cfgScale}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* More To Explore Section (Matching Image 1) */}
        <View style={styles.moreToExploreSection}>
          <Text style={styles.moreToExploreHeading}>More to explore</Text>

          <View style={styles.recommendationsGrid}>
            {relatedPrompts.map((pin) => (
              <View key={pin.id} style={styles.recColumn}>
                <PromptCard
                  item={pin}
                  onPress={(p) => openProductPage(p)}
                  onSaveToggle={(p) => toggleSave(p)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 22, 30, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    maxWidth: SCREEN_WIDTH - 120,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  artworkWrapper: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: DarkCard,
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  creatorSection: {
    backgroundColor: DarkSurface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkBorder,
    marginBottom: 24,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  creatorMeta: {
    flex: 1,
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  creatorHandle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  rightIconGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainActionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  visitPageBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  visitPageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  saveRedBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: AccentRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveRedBtnActive: {
    backgroundColor: '#333742',
  },
  saveRedBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  promptDetailsCard: {
    backgroundColor: DarkCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  promptLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  promptTextBody: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  negativeBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
    marginBottom: 12,
  },
  negativeLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  negativeTextBody: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 17,
  },
  paramsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paramChip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  paramKey: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  paramVal: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  moreToExploreSection: {
    marginTop: 8,
  },
  moreToExploreHeading: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recColumn: {
    width: '48%',
  },
});
