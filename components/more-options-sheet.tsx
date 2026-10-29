import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { PromptItem } from '@/constants/prompts';
import { AccentRed, DarkBorder } from '@/constants/theme';
import { LiquidGlassView } from '@/components/liquid-glass-view';

interface MoreOptionsSheetProps {
  visible: boolean;
  pin: PromptItem | null;
  onDelete: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onReport: () => void;
  onClose: () => void;
}

export function MoreOptionsSheet({
  visible,
  pin,
  onDelete,
  onEdit,
  onDownload,
  onCopyLink,
  onReport,
  onClose,
}: MoreOptionsSheetProps) {
  if (!visible || !pin) return null;

  const options = [
    {
      id: 'delete',
      label: 'Delete Pin',
      icon: 'trash-outline',
      color: '#FF453A',
      onPress: onDelete,
    },
    {
      id: 'edit',
      label: 'Edit Pin',
      icon: 'pencil-outline',
      color: '#FFFFFF',
      onPress: onEdit,
    },
    {
      id: 'download',
      label: 'Download image',
      icon: 'download-outline',
      color: '#FFFFFF',
      onPress: onDownload,
    },
    {
      id: 'copy',
      label: 'Copy link',
      icon: 'link-outline',
      color: '#FFFFFF',
      onPress: onCopyLink,
    },
    {
      id: 'report',
      label: 'Report Pin',
      icon: 'flag-outline',
      color: '#9CA3AF',
      onPress: onReport,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <LiquidGlassView
          borderRadius={32}
          animatedShimmer={true}
          style={styles.sheetCard}>
          <View style={styles.sheetInner}>
            <Text style={styles.sheetTitle}>More options</Text>

            <View style={styles.optionsList}>
              {options.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={({ pressed }) => [
                    styles.optionRow,
                    pressed && styles.rowPressed,
                  ]}
                  onPress={() => {
                    onClose();
                    opt.onPress();
                  }}>
                  <Text style={[styles.optionLabel, { color: opt.color }]}>
                    {opt.label}
                  </Text>
                  <Ionicons name={opt.icon as any} size={18} color={opt.color} />
                </Pressable>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={onClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </LiquidGlassView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetCard: {
    width: '100%',
    maxWidth: 380,
  },
  sheetInner: {
    padding: 24,
  },
  sheetTitle: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsList: {
    gap: 4,
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
