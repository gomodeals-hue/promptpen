import React from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BlurredBackgroundProps {
  children?: React.ReactNode;
}

export function BlurredBackground({ children }: BlurredBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* 1. Deep Obsidian Base */}
      <View style={styles.baseDark} />

      {/* 2. Luminous Ambient Gradient Glow Orbs (Warm Amber, Crimson & Deep Indigo) */}
      <View style={styles.orbsContainer} pointerEvents="none">
        {/* Top-Left Warm Amber/Bronze Glow */}
        <View style={styles.orbTopLeft} />

        {/* Center-Right Crimson / Sunset Glow */}
        <View style={styles.orbCenterRight} />

        {/* Bottom-Left Deep Indigo / Obsidian Vignette Glow */}
        <View style={styles.orbBottomLeft} />

        {/* Top-Right Subtle Golden Amber Accent */}
        <View style={styles.orbTopRight} />
      </View>

      {/* 3. Heavy Frosted Diffuse Blur Overlay */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 75 : 95}
        tint="dark"
        style={styles.diffuseBlurOverlay}
      />

      {/* 4. Subtle Vignette Film Grain / Contrast Layer */}
      <View style={styles.vignetteOverlay} pointerEvents="none" />

      {/* 5. Page Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0F',
    position: 'relative',
  },
  baseDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#090A0E',
  },
  orbsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orbTopLeft: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: SCREEN_WIDTH * 0.425,
    backgroundColor: '#9E4A28', // Warm Amber / Bronze (matching Image 1)
    opacity: 0.38,
    ...Platform.select({
      web: {
        filter: 'blur(80px)',
      },
    }),
  },
  orbCenterRight: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.35,
    right: -70,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor: '#7A1C2B', // Deep Crimson / Wine
    opacity: 0.34,
    ...Platform.select({
      web: {
        filter: 'blur(90px)',
      },
    }),
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: SCREEN_WIDTH * 0.45,
    backgroundColor: '#2D1B4E', // Deep Indigo / Dark Purple
    opacity: 0.28,
    ...Platform.select({
      web: {
        filter: 'blur(95px)',
      },
    }),
  },
  orbTopRight: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.1,
    right: -40,
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    backgroundColor: '#5C3826', // Warm Muted Amber
    opacity: 0.32,
    ...Platform.select({
      web: {
        filter: 'blur(75px)',
      },
    }),
  },
  diffuseBlurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 10, 14, 0.45)',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
