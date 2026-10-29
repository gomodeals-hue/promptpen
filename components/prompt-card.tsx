import React, { useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { PromptItem } from '@/constants/prompts';
import { usePromptContext } from '@/context/PromptContext';
import { AccentRed, DarkCard } from '@/constants/theme';

interface PromptCardProps {
  item: PromptItem;
  onPress: (item: PromptItem) => void;
  onSaveToggle?: (item: PromptItem, saved: boolean) => void;
}

export function PromptCard({ item, onPress, onSaveToggle }: PromptCardProps) {
  const { savedPinIds, toggleSave, openRadialMenu, showToast } = usePromptContext();
  const isSaved = savedPinIds.includes(item.id);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bookmarkScaleAnim = useRef(new Animated.Value(1)).current;
  const copyScaleAnim = useRef(new Animated.Value(1)).current;

  const isVideo = item.mediaType === 'video';
  const touchCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePressIn = (e: any) => {
    if (e?.nativeEvent?.pageX !== undefined && e?.nativeEvent?.pageY !== undefined) {
      touchCoords.current = {
        x: e.nativeEvent.pageX,
        y: e.nativeEvent.pageY,
      };
    }

    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const handleLongPress = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }
    openRadialMenu(item, touchCoords.current);
  };

  const handleSavePress = (e: any) => {
    e.stopPropagation?.();
    toggleSave(item);

    Animated.sequence([
      Animated.timing(bookmarkScaleAnim, {
        toValue: 1.35,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(bookmarkScaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    onSaveToggle?.(item, !isSaved);
  };

  const handleQuickCopy = async (e: any) => {
    e.stopPropagation?.();

    Animated.sequence([
      Animated.timing(copyScaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(copyScaleAnim, { toValue: 1, tension: 140, friction: 6, useNativeDriver: true }),
    ]).start();

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(item.prompt);
      }
      showToast(isVideo ? 'Video prompt copied' : 'Prompt copied', 'copy');
    } catch (err) {
      showToast('Prompt copied', 'copy');
    }
  };

  const isSquare = item.shape === 'square';
  const cardAspectRatio = isSquare ? 1.0 : item.aspectRatio || 0.75;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={styles.cardContainer}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={350}
        onPress={() => onPress(item)}>
        <View style={[styles.imageContainer, { aspectRatio: cardAspectRatio }]}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
          />

          {/* AI Video Indicator Badge */}
          {isVideo && (
            <BlurView intensity={50} tint="dark" style={styles.videoBadge}>
              <Ionicons name="play" size={10} color="#FFFFFF" />
              <Text style={styles.videoText}>{item.videoDuration || 'AI Video'}</Text>
            </BlurView>
          )}

          {/* Top Right Action Controls: Quick Copy & Save Bookmark */}
          <View style={styles.topRightActions}>
            {/* Quick Copy Prompt Button */}
            <Animated.View style={{ transform: [{ scale: copyScaleAnim }] }}>
              <Pressable
                style={styles.actionBtn}
                onPress={handleQuickCopy}
                hitSlop={6}>
                <Ionicons name="copy-outline" size={12} color="#FFFFFF" />
              </Pressable>
            </Animated.View>

            {/* Bookmark Pin Button */}
            <Animated.View style={{ transform: [{ scale: bookmarkScaleAnim }] }}>
              <Pressable
                style={[
                  styles.actionBtn,
                  isSaved && styles.saveButtonActive,
                ]}
                onPress={handleSavePress}
                hitSlop={6}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={12}
                  color={isSaved ? '#FFFFFF' : '#FFFFFF'}
                />
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 14,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: DarkCard,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
        cursor: 'pointer',
      },
    }),
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#12141C',
    borderRadius: 22,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  videoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(10, 12, 18, 0.65)',
    zIndex: 4,
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  topRightActions: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(11, 12, 16, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  saveButtonActive: {
    backgroundColor: AccentRed,
    borderColor: AccentRed,
  },
});
