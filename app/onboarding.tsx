import React from 'react';
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
import { usePromptContext } from '@/context/PromptContext';
import {
  AccentRed,
  DarkBackground,
  DarkSurface,
  DarkCard,
  DarkBorder,
} from '@/constants/theme';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { topics, toggleTopic, showToast } = usePromptContext();

  const selectedCount = topics.filter(t => t.selected).length;

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 8;
  const bottomInset = Math.max(insets.bottom, 16) + 16;

  const handleFinish = () => {
    showToast('Feed personalized for you!', 'sparkles');
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>What are your favorite topics?</Text>
          <Text style={styles.headerSubtitle}>
            Choose {Math.max(0, 5 - selectedCount) === 0 ? 'more' : 5 - selectedCount} to personalize your home feed
          </Text>
        </View>
      </View>

      {/* Topics Full-Width Banner List (Matching Image 1) */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomInset + 80 }]}
        showsVerticalScrollIndicator={false}>
        {topics.map((topic) => {
          const isSelected = !!topic.selected;
          return (
            <Pressable
              key={topic.id}
              style={[
                styles.topicBannerCard,
                isSelected && styles.topicBannerCardSelected,
              ]}
              onPress={() => toggleTopic(topic.id)}>
              <Image
                source={{ uri: topic.image }}
                style={styles.topicImage}
                contentFit="cover"
              />
              <View style={styles.darkGradientOverlay} />

              <View style={styles.topicMeta}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
              </View>

              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                <Ionicons
                  name={isSelected ? 'checkmark' : 'add'}
                  size={18}
                  color={isSelected ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Floating Pill Bottom Button (Matching Image 1: "Meet your home feed") */}
      <View style={[styles.floatingBottomDock, { paddingBottom: bottomInset }]}>
        <Pressable
          style={styles.meetHomeBtn}
          onPress={handleFinish}>
          <Text style={styles.meetHomeBtnText}>Meet your home feed</Text>
          <Ionicons name="sparkles" size={16} color="#000000" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DarkSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  headerTitleBox: {
    paddingRight: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  topicBannerCard: {
    height: 120,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: DarkBorder,
    justifyContent: 'flex-end',
    padding: 16,
  },
  topicBannerCardSelected: {
    borderColor: AccentRed,
  },
  topicImage: {
    ...StyleSheet.absoluteFillObject,
  },
  darkGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  topicMeta: {
    zIndex: 2,
    maxWidth: '75%',
  },
  topicTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  topicSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  checkCircle: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 3,
  },
  checkCircleSelected: {
    backgroundColor: AccentRed,
    borderColor: AccentRed,
  },
  floatingBottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  meetHomeBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
      },
    }),
  },
  meetHomeBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
});
