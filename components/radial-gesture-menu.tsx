import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PromptItem } from '@/constants/prompts';
import { AccentRed } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type RadialActionType =
  | 'save'
  | 'edit'
  | 'share'
  | 'message'
  | 'lens'
  | 'delete';

export interface RadialAction {
  id: RadialActionType;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isDestructive?: boolean;
  angle: number; // Angle in degrees along the arc
}

// 6 Arc actions radiating around the touch point
const RADIAL_ACTIONS: RadialAction[] = [
  { id: 'save', title: 'Save Pin', icon: 'pin', angle: 210 },
  { id: 'edit', title: 'Edit Pin', icon: 'pencil', angle: 155 },
  { id: 'share', title: 'Share Pin', icon: 'share-social', angle: 100 },
  { id: 'message', title: 'Send Message', icon: 'chatbubble', angle: 45 },
  { id: 'lens', title: 'Visual Search', icon: 'scan', angle: 350 },
  { id: 'delete', title: 'Delete Pin', icon: 'trash', isDestructive: true, angle: 260 },
];

const RADIUS = 92; // Distance from touch hold point to action buttons

interface RadialGestureMenuProps {
  visible: boolean;
  pin: PromptItem | null;
  position?: { x: number; y: number } | null;
  onSelectAction: (action: RadialActionType, pin: PromptItem) => void;
  onClose: () => void;
}

export function RadialGestureMenu({
  visible,
  pin,
  position,
  onSelectAction,
  onClose,
}: RadialGestureMenuProps) {
  const [selectedAction, setSelectedAction] = useState<RadialAction>(RADIAL_ACTIONS[0]);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const currentActionRef = useRef<RadialAction>(RADIAL_ACTIONS[0]);

  // Compute clamped center coordinates directly on the hold point
  const rawX = position?.x ?? SCREEN_WIDTH / 2;
  const rawY = position?.y ?? SCREEN_HEIGHT / 2;

  // Ensure radial dial is never cut off at edge of screen
  const centerX = Math.max(RADIUS + 40, Math.min(SCREEN_WIDTH - RADIUS - 40, rawX));
  const centerY = Math.max(RADIUS + 60, Math.min(SCREEN_HEIGHT - RADIUS - 80, rawY));

  useEffect(() => {
    if (visible) {
      setSelectedAction(RADIAL_ACTIONS[0]);
      currentActionRef.current = RADIAL_ACTIONS[0];

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {}
      }

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 160,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  // Pan Responder to track hovering / sliding finger to select actions
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const touchX = gestureState.moveX;
        const touchY = gestureState.moveY;

        // Find closest action button to the current finger location
        let closestAction = currentActionRef.current;
        let minDistance = Infinity;

        RADIAL_ACTIONS.forEach((action) => {
          const rad = (action.angle * Math.PI) / 180;
          const nodeX = centerX + RADIUS * Math.cos(rad);
          const nodeY = centerY - RADIUS * Math.sin(rad);

          const dist = Math.hypot(touchX - nodeX, touchY - nodeY);
          if (dist < minDistance) {
            minDistance = dist;
            closestAction = action;
          }
        });

        // If finger is reasonably close to an action, highlight it
        if (minDistance < RADIUS + 40 && closestAction.id !== currentActionRef.current.id) {
          currentActionRef.current = closestAction;
          setSelectedAction(closestAction);
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (e) {}
          }
        }
      },
      onPanResponderRelease: () => {
        if (pin && currentActionRef.current) {
          const actionToTrigger = currentActionRef.current;
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.1, duration: 60, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
          ]).start(() => {
            onSelectAction(actionToTrigger.id, pin);
            onClose();
          });
        }
      },
    })
  ).current;

  if (!visible || !pin) return null;

  const handleTapAction = (action: RadialAction) => {
    setSelectedAction(action);
    currentActionRef.current = action;

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      onSelectAction(action.id, pin);
      onClose();
    });
  };

  // Label placement: below the center or above depending on screen vertical room
  const isNearBottom = centerY > SCREEN_HEIGHT - 220;
  const labelTop = isNearBottom ? centerY - RADIUS - 70 : centerY + RADIUS + 40;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[styles.overlay, { opacity: opacityAnim }]}
        {...panResponder.panHandlers}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        {/* Dynamic Action Heading near the touch place */}
        <View style={[styles.actionLabelContainer, { top: labelTop }]}>
          <Text style={styles.actionLabelText}>{selectedAction.title}</Text>
          <Text style={styles.pinTitleSnippet} numberOfLines={1}>
            {pin.title}
          </Text>
        </View>

        {/* Radial Dial Anchored Right on the Hold Coordinate */}
        <Animated.View
          style={[
            styles.radialContainer,
            {
              left: centerX - 120,
              top: centerY - 120,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          {/* Central Target Ring at Hold Spot */}
          <View style={styles.centerRing}>
            <View style={styles.centerInnerCircle} />
          </View>

          {/* Arc Action Nodes radiating around the hold point */}
          {RADIAL_ACTIONS.map((action) => {
            const rad = (action.angle * Math.PI) / 180;
            const x = RADIUS * Math.cos(rad);
            const y = -RADIUS * Math.sin(rad);

            const isSelected = selectedAction.id === action.id;

            return (
              <Pressable
                key={action.id}
                style={[
                  styles.actionButton,
                  action.isDestructive && styles.destructiveActionBtn,
                  isSelected && styles.actionButtonSelected,
                  {
                    transform: [
                      { translateX: x },
                      { translateY: y },
                      { scale: isSelected ? 1.2 : 1 },
                    ],
                  },
                ]}
                onPress={() => handleTapAction(action)}>
                <Ionicons
                  name={action.icon}
                  size={20}
                  color={action.isDestructive ? '#FFFFFF' : '#111827'}
                />
              </Pressable>
            );
          })}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.84)',
    zIndex: 9999,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  radialContainer: {
    position: 'absolute',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  centerInnerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  actionButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.55)',
        cursor: 'pointer',
      },
    }),
  },
  destructiveActionBtn: {
    backgroundColor: AccentRed,
  },
  actionButtonSelected: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: AccentRed,
        shadowOpacity: 0.8,
        shadowRadius: 14,
      },
      web: {
        boxShadow: '0 0 24px rgba(230, 0, 35, 0.8)',
      },
    }),
  },
  actionLabelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  actionLabelText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  pinTitleSnippet: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 280,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
