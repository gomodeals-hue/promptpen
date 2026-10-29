import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MasonryGrid } from '@/components/masonry-grid';
import { usePromptContext } from '@/context/PromptContext';
import {
  AccentRed,
  DarkBackground,
  DarkSurface,
  DarkBorder,
} from '@/constants/theme';

const TRENDING_SEARCH_TAGS = [
  'All',
  'A Surreal Journey',
  'Space Nebula',
  'Cyberpunk Neon',
  'Loft Working Space',
  'Streetwear',
  'Wallpapers',
  'Quotes',
  'Anime',
  '3D Render',
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { prompts, openProductPage, toggleSave, showToast } = usePromptContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const filteredPrompts = useMemo(() => {
    return prompts.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.author.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTag =
        selectedTag === 'All' ||
        item.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())) ||
        item.title.toLowerCase().includes(selectedTag.toLowerCase()) ||
        item.category.toLowerCase().includes(selectedTag.toLowerCase());

      return matchSearch && matchTag;
    });
  }, [prompts, searchQuery, selectedTag]);

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 8;
  const bottomInset = Math.max(insets.bottom, 14) + 84;

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: topInset }]}>
      {/* 1. Pinterest Style Top Brand Icon */}
      <View style={styles.topLogoRow}>
        <View style={styles.pinterestLogoCircle}>
          <Ionicons name="logo-pinterest" size={24} color="#FFFFFF" />
        </View>
      </View>

      {/* 2. Top Search Box with Camera / Lens Icon (Matching Image 1, 2, 4) */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search photos, prompts, artists..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable
          style={styles.cameraIconBtn}
          onPress={() => showToast('Visual Lens Active: Tap any image to find similar', 'scan')}>
          <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* 3. Visual Prompt Banner Card (Matching Image 2: "More juice images ->") */}
      <View style={styles.bannerRow}>
        <Pressable
          style={styles.redBannerCard}
          onPress={() => {
            setSearchQuery('Surreal');
            showToast('Showing surreal journeys', 'sparkles');
          }}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Explore Surreal Journeys</Text>
            <Text style={styles.bannerSub}>Over 1,200 curated AI prompts</Text>
          </View>
          <View style={styles.bannerArrowCircle}>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>

      {/* 4. Trending Tags Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagScroll}>
        {TRENDING_SEARCH_TAGS.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <Pressable
              key={tag}
              style={[styles.tagPill, isSelected && styles.tagPillSelected]}
              onPress={() => setSelectedTag(tag)}>
              <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <MasonryGrid
        items={filteredPrompts}
        onItemPress={(item) => openProductPage(item)}
        onSaveToggle={(item) => toggleSave(item)}
        ListHeaderComponent={renderHeader()}
        contentContainerStyle={{ paddingBottom: bottomInset }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingBottom: 16,
  },
  topLogoRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  pinterestLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AccentRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkSurface,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: DarkBorder,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  cameraIconBtn: {
    padding: 4,
  },
  bannerRow: {
    marginBottom: 16,
  },
  redBannerCard: {
    backgroundColor: AccentRed,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  bannerSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  bannerArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  tagScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tagPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tagText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  tagTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
});
