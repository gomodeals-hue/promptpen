import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { PromptItem } from '@/constants/prompts';
import { PromptCard } from '@/components/prompt-card';
import { AccentRed } from '@/constants/theme';

interface MasonryGridProps {
  items: PromptItem[];
  onItemPress: (item: PromptItem) => void;
  onSaveToggle?: (item: PromptItem, saved: boolean) => void;
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function MasonryGrid({
  items,
  onItemPress,
  onSaveToggle,
  ListHeaderComponent,
  ListFooterComponent,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
}: MasonryGridProps) {
  // Distribute items across 2 columns balancing heights
  const { col1, col2 } = useMemo(() => {
    const left: PromptItem[] = [];
    const right: PromptItem[] = [];
    let leftHeightWeight = 0;
    let rightHeightWeight = 0;

    items.forEach((item) => {
      // 1 / aspectRatio gives relative vertical height
      const heightFactor = 1 / (item.aspectRatio || 0.8);
      if (leftHeightWeight <= rightHeightWeight) {
        left.push(item);
        leftHeightWeight += heightFactor;
      } else {
        right.push(item);
        rightHeightWeight += heightFactor;
      }
    });

    return { col1: left, col2: right };
  }, [items]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AccentRed}
            colors={[AccentRed]}
          />
        ) : undefined
      }>
      {ListHeaderComponent}

      <View style={styles.gridContainer}>
        <View style={styles.column}>
          {col1.map((item) => (
            <PromptCard
              key={item.id}
              item={item}
              onPress={onItemPress}
              onSaveToggle={onSaveToggle}
            />
          ))}
        </View>

        <View style={styles.column}>
          {col2.map((item) => (
            <PromptCard
              key={item.id}
              item={item}
              onPress={onItemPress}
              onSaveToggle={onSaveToggle}
            />
          ))}
        </View>
      </View>

      {ListFooterComponent}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  column: {
    flex: 1,
  },
});
