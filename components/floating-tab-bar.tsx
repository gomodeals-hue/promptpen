import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable, Platform, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { AccentRed } from '@/constants/theme';
import { usePromptContext } from '@/context/PromptContext';

import { LiquidGlassView } from '@/components/liquid-glass-view';

function TabItemButton({
  routeName,
  isFocused,
  onPress,
  userAvatar,
}: {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  userAvatar?: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.18,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 140,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, scaleAnim]);

  const renderIcon = () => {
    const color = isFocused ? '#FFFFFF' : '#8E95A5';
    const size = 22;

    switch (routeName) {
      case 'index':
        return <Ionicons name={isFocused ? 'home' : 'home-outline'} size={size} color={color} />;
      case 'explore':
        return <Ionicons name={isFocused ? 'search' : 'search-outline'} size={size} color={color} />;
      case 'saved':
        return <Ionicons name={isFocused ? 'grid' : 'grid-outline'} size={size} color={color} />;
      case 'updates':
        return <Ionicons name={isFocused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} size={size} color={color} />;
      case 'profile':
        if (userAvatar) {
          return (
            <View style={[styles.avatarTabContainer, isFocused && styles.avatarTabContainerActive]}>
              <Image source={{ uri: userAvatar }} style={styles.avatarTabImg} contentFit="cover" />
            </View>
          );
        }
        return <Ionicons name={isFocused ? 'person' : 'person-outline'} size={size} color={color} />;
      default:
        return <Ionicons name="apps" size={size} color={color} />;
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabItem}>
      <Animated.View
        style={[
          styles.iconContainer,
          isFocused && routeName !== 'profile' && styles.iconContainerActive,
          { transform: [{ scale: scaleAnim }] },
        ]}>
        {renderIcon()}
      </Animated.View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPosition = Math.max(insets.bottom, 12) + 6;
  const { userProfile } = usePromptContext();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: bottomPosition,
        },
      ]}>
      <LiquidGlassView
        borderRadius={28}
        animatedShimmer={true}
        style={styles.floatingBar}>
        <View style={styles.tabInnerRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              if (Platform.OS === 'ios' || Platform.OS === 'android') {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {}
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItemButton
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                onPress={onPress}
                userAvatar={route.name === 'profile' ? userProfile.avatar : undefined}
              />
            );
          })}
        </View>
      </LiquidGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  floatingBar: {
    height: 56,
    width: '92%',
    maxWidth: 360,
  },
  tabInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  avatarTabContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarTabContainerActive: {
    borderColor: AccentRed,
  },
  avatarTabImg: {
    width: '100%',
    height: '100%',
  },
});
