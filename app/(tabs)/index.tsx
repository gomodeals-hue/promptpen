import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MasonryGrid } from '@/components/masonry-grid';
import { CreatePromptModal } from '@/components/create-prompt-modal';
import { usePromptContext } from '@/context/PromptContext';
import { CATEGORIES } from '@/constants/prompts';
import {
  AccentRed,
  DarkBackground,
  DarkSurface,
  DarkBorder,
} from '@/constants/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { prompts, openProductPage, toggleSave, addPrompt, showToast, userProfile } =
    usePromptContext();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter items according to category
  const filteredPrompts = useMemo(() => {
    if (selectedCategory === 'All') return prompts;
    return prompts.filter(
      p =>
        p.category.toLowerCase() === selectedCategory.toLowerCase() ||
        p.tags.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase()))
    );
  }, [prompts, selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Feed refreshed', 'refresh');
    }, 600);
  };

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 8;
  const bottomInset = Math.max(insets.bottom, 14) + 84;

  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: topInset }]}>
      {/* 1. Top Bar: App Logo Brand + Action Icons */}
      <View style={styles.topBar}>
        <View style={styles.topLeftGroup}>
          <Pressable
            style={styles.avatarBtn}
            onPress={() => router.push('/(tabs)/profile' as any)}>
            <Image
              source={{ uri: userProfile.avatar }}
              style={styles.avatarImg}
              contentFit="cover"
            />
          </Pressable>

          {/* Minimalist PromptPen Tag */}
          <View style={styles.brandTag}>
            <View style={styles.brandIconCircle}>
              <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Prompt</Text>
            <Text style={styles.brandAccent}>Pen</Text>
          </View>
        </View>

        <View style={styles.topRightActions}>
          <Pressable
            style={styles.circleBtn}
            onPress={() => router.push('/onboarding' as any)}>
            <Ionicons name="compass-outline" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={styles.circleBtn}
            onPress={() => setIsCreateModalOpen(true)}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* 2. Sleek Horizontal Category Pills (Matching Image 1 & 4) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <Pressable
              key={category}
              style={[
                styles.categoryPill,
                isSelected && styles.categoryPillSelected,
              ]}
              onPress={() => setSelectedCategory(category)}>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                ]}>
                {category}
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

      {/* Masonry Feed */}
      <MasonryGrid
        items={filteredPrompts}
        onItemPress={(item) => openProductPage(item)}
        onSaveToggle={(item) => toggleSave(item)}
        ListHeaderComponent={renderHeader()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{ paddingBottom: bottomInset }}
      />

      {/* Create Modal */}
      <CreatePromptModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={addPrompt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    paddingBottom: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  brandTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AccentRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  brandAccent: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DarkSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
});
