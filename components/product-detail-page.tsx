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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { PromptItem } from '@/constants/prompts';
import { usePromptContext } from '@/context/PromptContext';
import {
  AccentColor,
  DarkBackground,
} from '@/constants/theme';

interface ProductDetailPageProps {
  visible: boolean;
  item: PromptItem | null;
  onClose: () => void;
}

interface VariationItem {
  id: string;
  name: string;
  price: string;
  thumb: string;
  image: string;
  tag: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ProductDetailPage({ visible, item, onClose }: ProductDetailPageProps) {
  const insets = useSafeAreaInsets();
  const { savedPinIds, toggleSave, showToast } = usePromptContext();

  const [activeVariationIndex, setActiveVariationIndex] = useState(0);
  const [isTryOnActive, setIsTryOnActive] = useState(false);
  const [isTryOnGenerating, setIsTryOnGenerating] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Animations
  const copyAnim = useRef(new Animated.Value(1)).current;
  const tryOnScaleAnim = useRef(new Animated.Value(1)).current;
  const buyAnim = useRef(new Animated.Value(1)).current;
  const imageFadeAnim = useRef(new Animated.Value(1)).current;

  if (!item) return null;

  const isSaved = savedPinIds.includes(item.id);

  // Full-outfit, high-fashion variations inspired by reference image
  const variations: VariationItem[] = [
    {
      id: 'v1',
      name: item.title,
      price: '$35.00',
      thumb: item.imageUrl,
      image: item.imageUrl,
      tag: 'Original Fit',
    },
    {
      id: 'v2',
      name: 'Cyberpunk Neon Coat',
      price: '$45.00',
      thumb: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
      tag: 'Neon Layer',
    },
    {
      id: 'v3',
      name: 'Oversized Trench & Trousers',
      price: '$52.00',
      thumb: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
      tag: 'Streetwear',
    },
    {
      id: 'v4',
      name: 'High-Fashion Kimono Cape',
      price: '$39.00',
      thumb: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80',
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85',
      tag: 'Avant-Garde',
    },
  ];

  const currentDisplayImage = variations[activeVariationIndex]?.image || item.imageUrl;
  const currentTitle = variations[activeVariationIndex]?.name || item.title;
  const currentPrice = variations[activeVariationIndex]?.price || '$35.00';

  const handleSelectVariation = (idx: number) => {
    if (idx === activeVariationIndex) return;

    Animated.sequence([
      Animated.timing(imageFadeAnim, { toValue: 0.5, duration: 80, useNativeDriver: true }),
      Animated.timing(imageFadeAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();

    setActiveVariationIndex(idx);
    showToast(`Loaded ${variations[idx].name}`, 'shirt-outline');
  };

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
      showToast('Prompt copied to clipboard!', 'sparkles');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(true);
      showToast('Prompt copied!', 'sparkles');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTryOnPress = () => {
    Animated.sequence([
      Animated.timing(tryOnScaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(tryOnScaleAnim, { toValue: 1, tension: 140, friction: 6, useNativeDriver: true }),
    ]).start();

    setIsTryOnGenerating(true);
    showToast('Synthesizing Virtual Try-On...', 'color-wand');

    setTimeout(() => {
      setIsTryOnGenerating(false);
      setIsTryOnActive(!isTryOnActive);
      showToast(isTryOnActive ? 'Original Fit Restored' : 'Virtual Try-On Applied', 'sparkles');
    }, 1000);
  };

  const handleBuyOrUsePrompt = () => {
    Animated.sequence([
      Animated.timing(buyAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(buyAnim, { toValue: 1, tension: 140, friction: 6, useNativeDriver: true }),
    ]).start();

    handleCopyPrompt();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this outfit "${item.title}" on PromptPen:\n\n${item.prompt}`,
        title: item.title,
      });
    } catch (err) {
      // Ignored
    }
  };

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 8;
  const bottomInset = Math.max(insets.bottom, 16) + 10;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Scrollable Container with Full-Artwork Presentation */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 80 }]}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {/* 1. Full-Height Image Viewport Revealing the Complete Design */}
          <View style={styles.artworkContainer}>
            <Animated.View style={[styles.imageWrapper, { opacity: imageFadeAnim }]}>
              <Image
                source={{ uri: currentDisplayImage }}
                style={styles.artworkImage}
                contentFit="cover"
                priority="high"
                transition={200}
                cachePolicy="memory-disk"
              />
            </Animated.View>

            {/* Subtle Gradient Veil at lower edge to ease transition into card */}
            <View style={styles.bottomVignette} />
          </View>

          {/* 2. Floating Frosted Glass Product Card */}
          <View style={styles.cardWrapper}>
            <BlurView intensity={Platform.OS === 'ios' ? 45 : 85} tint="dark" style={styles.frostedCard}>
              {/* Card Header: Model tag + Add to wardrobe */}
              <View style={styles.cardTopRow}>
                <View style={styles.categoryBadge}>
                  <Ionicons name="sparkles" size={12} color={AccentColor} />
                  <Text style={styles.categoryBadgeText}>{item.model}</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.addToWardrobeBtn, pressed && styles.btnPressed]}
                  onPress={() => toggleSave(item)}>
                  <Text style={styles.addToWardrobeText}>
                    {isSaved ? 'In Wardrobe' : 'Add to wardrobe'}
                  </Text>
                  <Ionicons
                    name={isSaved ? 'checkmark-circle' : 'bag-add-outline'}
                    size={14}
                    color={isSaved ? AccentColor : '#FFFFFF'}
                  />
                </Pressable>
              </View>

              {/* Title & Price Row */}
              <View style={styles.titlePriceRow}>
                <View style={styles.titleMeta}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {currentTitle}
                  </Text>
                  <Text style={styles.priceTag}>{currentPrice} • Free Prompt</Text>
                </View>

                {/* Try-On badge indicator */}
                <View style={styles.tryOnIndicator}>
                  <Text style={styles.tryOnIndicatorText}>Try-On</Text>
                  <View style={styles.iridescentDot} />
                </View>
              </View>

              {/* Style Variations & Items Carousel */}
              <View style={styles.thumbnailsContainer}>
                <Text style={styles.thumbnailsLabel}>Style Variations & Items</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailsScroll}>
                  {variations.map((v, index) => {
                    const isSelected = activeVariationIndex === index;
                    return (
                      <Pressable
                        key={v.id}
                        style={[
                          styles.thumbCard,
                          isSelected && styles.thumbCardSelected,
                        ]}
                        onPress={() => handleSelectVariation(index)}>
                        <Image
                          source={{ uri: v.thumb }}
                          style={styles.thumbImage}
                          contentFit="cover"
                          priority="high"
                        />
                        {isSelected && (
                          <View style={styles.thumbActiveBadge}>
                            <Ionicons name="checkmark" size={12} color="#000000" />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Prompt Inspector Toggle Bar */}
              <Pressable
                style={styles.inspectorToggle}
                onPress={() => setShowPromptDetails(!showPromptDetails)}>
                <View style={styles.inspectorLabelRow}>
                  <Ionicons name="terminal-outline" size={15} color={AccentColor} />
                  <Text style={styles.inspectorLabel}>AI Prompt & Parameters</Text>
                </View>
                <Ionicons
                  name={showPromptDetails ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#9CA3AF"
                />
              </Pressable>

              {/* Collapsible Prompt Details */}
              {showPromptDetails && (
                <View style={styles.promptDetailsBox}>
                  <View style={styles.promptBoxHeader}>
                    <Text style={styles.boxTitle}>POSITIVE PROMPT</Text>
                    <Animated.View style={{ transform: [{ scale: copyAnim }] }}>
                      <Pressable
                        style={[styles.copyChip, copied && styles.copyChipSuccess]}
                        onPress={handleCopyPrompt}>
                        <Ionicons
                          name={copied ? 'checkmark' : 'copy-outline'}
                          size={12}
                          color={copied ? '#000000' : AccentColor}
                        />
                        <Text style={[styles.copyChipText, copied && styles.copyChipTextSuccess]}>
                          {copied ? 'Copied' : 'Copy'}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  </View>

                  <Text style={styles.promptText} selectable>
                    {item.prompt}
                  </Text>

                  {item.negativePrompt && (
                    <View style={styles.negativeBox}>
                      <Text style={styles.negativeTitle}>NEGATIVE PROMPT</Text>
                      <Text style={styles.negativeText} selectable>
                        {item.negativePrompt}
                      </Text>
                    </View>
                  )}

                  {/* Parameters pills */}
                  <View style={styles.paramsRow}>
                    <View style={styles.paramPill}>
                      <Text style={styles.paramKey}>Model:</Text>
                      <Text style={styles.paramVal}>{item.model}</Text>
                    </View>
                    <View style={styles.paramPill}>
                      <Text style={styles.paramKey}>CFG:</Text>
                      <Text style={styles.paramVal}>{item.cfgScale || 7.0}</Text>
                    </View>
                    <View style={styles.paramPill}>
                      <Text style={styles.paramKey}>Seed:</Text>
                      <Text style={styles.paramVal}>{item.seed || 849204}</Text>
                    </View>
                  </View>
                </View>
              )}
            </BlurView>
          </View>
        </ScrollView>

        {/* Top Floating Glass Navigation Header */}
        <View style={[styles.topFloatingBar, { top: topInset }]}>
          {/* Back Button with frosted glass blur */}
          <BlurView intensity={50} tint="dark" style={styles.glassCircleBtnWrapper}>
            <Pressable
              style={({ pressed }) => [styles.glassCircleBtn, pressed && styles.btnPressed]}
              onPress={onClose}
              hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </Pressable>
          </BlurView>

          {/* Minimal PromptPen Frosted Glass Badge */}
          <BlurView intensity={50} tint="dark" style={styles.brandPillWrapper}>
            <View style={styles.brandPill}>
              <Text style={styles.brandTitle}>Prompt</Text>
              <Text style={styles.brandAccent}>Pen</Text>
              <View style={styles.brandDot} />
            </View>
          </BlurView>

          {/* Right Action Icons: Bookmark & Options */}
          <View style={styles.topRightActions}>
            <BlurView intensity={50} tint="dark" style={styles.glassCircleBtnWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.glassCircleBtn,
                  isSaved && styles.glassCircleBtnActive,
                  pressed && styles.btnPressed,
                ]}
                onPress={() => toggleSave(item)}
                hitSlop={8}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={isSaved ? AccentColor : '#FFFFFF'}
                />
              </Pressable>
            </BlurView>

            <BlurView intensity={50} tint="dark" style={styles.glassCircleBtnWrapper}>
              <Pressable
                style={({ pressed }) => [styles.glassCircleBtn, pressed && styles.btnPressed]}
                onPress={handleShare}
                hitSlop={8}>
                <Ionicons name="options-outline" size={18} color="#FFFFFF" />
              </Pressable>
            </BlurView>
          </View>
        </View>

        {/* Bottom Floating Frosted Glass Action Dock */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 90}
          tint="dark"
          style={[styles.bottomFloatingDock, { paddingBottom: bottomInset }]}>
          {/* 1. Bookmark Pill */}
          <Pressable
            style={({ pressed }) => [
              styles.actionPillBtn,
              isSaved && styles.actionPillBtnActive,
              pressed && styles.btnPressed,
            ]}
            onPress={() => toggleSave(item)}
            hitSlop={8}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? AccentColor : '#FFFFFF'}
            />
          </Pressable>

          {/* 2. Try-On / AI Remix Button with Iridescent Bubble */}
          <Animated.View style={{ transform: [{ scale: tryOnScaleAnim }] }}>
            <Pressable
              style={[
                styles.tryOnButton,
                isTryOnActive && styles.tryOnButtonActive,
              ]}
              onPress={handleTryOnPress}
              disabled={isTryOnGenerating}>
              <View style={styles.iridescentRing} />
              <Text style={styles.tryOnButtonText}>
                {isTryOnGenerating ? 'Synthesizing...' : isTryOnActive ? 'Remixed' : 'Try-On'}
              </Text>
              <View style={styles.magicDot} />
            </Pressable>
          </Animated.View>

          {/* 3. BUY / USE PROMPT Primary Button (Refined Cyber Ice / White styling) */}
          <Animated.View style={{ flex: 1, transform: [{ scale: buyAnim }] }}>
            <Pressable
              style={styles.buyButton}
              onPress={handleBuyOrUsePrompt}>
              <Text style={styles.buyButtonText}>BUY PROMPT</Text>
              <Ionicons name="flash" size={15} color="#000000" />
            </Pressable>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkBackground,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  artworkContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.62,
    position: 'relative',
    backgroundColor: '#10121A',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'transparent',
  },
  topFloatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  glassCircleBtnWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(15, 17, 24, 0.45)',
  },
  glassCircleBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCircleBtnActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  btnPressed: {
    transform: [{ scale: 0.92 }],
  },
  brandPillWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(15, 17, 24, 0.45)',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  brandAccent: {
    color: AccentColor,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  brandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AccentColor,
    marginLeft: 3,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardWrapper: {
    marginTop: -36,
    paddingHorizontal: 16,
  },
  frostedCard: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    padding: 18,
    backgroundColor: 'rgba(18, 20, 28, 0.72)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(24px)',
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  categoryBadgeText: {
    color: AccentColor,
    fontSize: 11,
    fontWeight: '700',
  },
  addToWardrobeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  addToWardrobeText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleMeta: {
    flex: 1,
    marginRight: 10,
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  priceTag: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  tryOnIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tryOnIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  iridescentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6492',
    borderWidth: 1.5,
    borderColor: AccentColor,
  },
  thumbnailsContainer: {
    marginBottom: 16,
  },
  thumbnailsLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  thumbnailsScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  thumbCard: {
    width: 62,
    height: 62,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    position: 'relative',
    backgroundColor: '#202430',
  },
  thumbCardSelected: {
    borderColor: AccentColor,
    borderWidth: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbActiveBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: AccentColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inspectorToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inspectorLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inspectorLabel: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  promptDetailsBox: {
    marginTop: 12,
    backgroundColor: 'rgba(12, 14, 20, 0.85)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  promptBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  boxTitle: {
    color: AccentColor,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  copyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AccentColor,
  },
  copyChipSuccess: {
    backgroundColor: AccentColor,
  },
  copyChipText: {
    color: AccentColor,
    fontSize: 11,
    fontWeight: '700',
  },
  copyChipTextSuccess: {
    color: '#000000',
  },
  promptText: {
    color: '#F3F4F6',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  negativeBox: {
    backgroundColor: '#1E202B',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  negativeTitle: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  negativeText: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 16,
  },
  paramsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paramPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#202330',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paramKey: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '600',
  },
  paramVal: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomFloatingDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(12, 14, 20, 0.78)',
    paddingHorizontal: 18,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
      web: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  actionPillBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  actionPillBtnActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: AccentColor,
  },
  tryOnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  tryOnButtonActive: {
    borderColor: AccentColor,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  iridescentRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A855F7',
    borderWidth: 2,
    borderColor: '#EC4899',
  },
  tryOnButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  magicDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AccentColor,
  },
  buyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      web: {
        boxShadow: '0 4px 16px rgba(255, 255, 255, 0.25)',
        cursor: 'pointer',
      },
    }),
  },
  buyButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
