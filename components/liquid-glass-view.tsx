import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface LiquidGlassViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  intensity?: number;
  animatedShimmer?: boolean;
  tint?: 'dark' | 'light' | 'default';
}

export function LiquidGlassView({
  children,
  style,
  borderRadius = 24,
  intensity = Platform.OS === 'ios' ? 50 : 85,
  animatedShimmer = true,
  tint = 'dark',
}: LiquidGlassViewProps) {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (!animatedShimmer) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 2,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(shimmerAnim, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [animatedShimmer, shimmerAnim]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-180, 420],
  });

  return (
    <View style={[styles.outerContainer, { borderRadius }, style]}>
      {/* 1. Underlying Frosted Glass Material with backdrop filter */}
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />

      {/* 2. Semi-Opaque Liquid Material Tint (Prevents background over-bleed) */}
      <View style={[styles.liquidBaseMaterial, { borderRadius }]} pointerEvents="none" />

      {/* 3. Top Specular Rim Reflection (Edge definition & depth) */}
      <View style={[styles.topSpecularRim, { borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }]} pointerEvents="none" />

      {/* 4. Curved Surface Reflection Highlight (Simulates curved liquid glass dome) */}
      <View style={[styles.curvedDomeReflection, { borderRadius }]} pointerEvents="none" />

      {/* 5. Animated Liquid Shimmer Stream */}
      {animatedShimmer && (
        <Animated.View
          style={[
            styles.animatedLiquidShimmer,
            {
              transform: [{ translateX: shimmerTranslateX }, { rotate: '25deg' }],
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* 6. Children Content */}
      <View style={[styles.innerContent, { borderRadius }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.42,
        shadowRadius: 28,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow:
          '0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 0 rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px) saturate(150%)',
      },
    }),
  },
  liquidBaseMaterial: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 27, 38, 0.62)',
  },
  topSpecularRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  curvedDomeReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    opacity: 0.85,
  },
  animatedLiquidShimmer: {
    position: 'absolute',
    top: -60,
    bottom: -60,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    opacity: 0.7,
  },
  innerContent: {
    position: 'relative',
    zIndex: 10,
  },
});
