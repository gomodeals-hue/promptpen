import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Board } from '@/services/backendService';
import { PromptItem } from '@/constants/prompts';
import { AccentRed, DarkBackground, DarkCard, DarkBorder } from '@/constants/theme';

import { LiquidGlassView } from '@/components/liquid-glass-view';

interface BoardPickerSheetProps {
  visible: boolean;
  pin: PromptItem | null;
  boards: Board[];
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  onClose: () => void;
}

export function BoardPickerSheet({
  visible,
  pin,
  boards,
  onSelectBoard,
  onCreateBoard,
  onClose,
}: BoardPickerSheetProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!visible || !pin) return null;

  const handleCreateSubmit = () => {
    if (!newBoardName.trim()) return;
    onCreateBoard(newBoardName.trim());
    setNewBoardName('');
    setIsCreating(false);
  };

  const filteredBoards = boards.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <LiquidGlassView
          borderRadius={32}
          animatedShimmer={true}
          style={styles.sheetCard}>
          <View style={styles.sheetInner}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>Boards</Text>
            <Pressable
              style={styles.newBoardHeaderBtn}
              onPress={() => setIsCreating(!isCreating)}>
              <Ionicons name={isCreating ? 'close-circle' : 'add'} size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Quick Create Board Inline Input */}
          {isCreating && (
            <View style={styles.inlineCreateBox}>
              <TextInput
                style={styles.createInput}
                placeholder="Name your new board..."
                placeholderTextColor="#6B7280"
                value={newBoardName}
                onChangeText={setNewBoardName}
                autoFocus
              />
              <Pressable
                style={[
                  styles.createSubmitBtn,
                  !newBoardName.trim() && styles.createSubmitBtnDisabled,
                ]}
                disabled={!newBoardName.trim()}
                onPress={handleCreateSubmit}>
                <Text style={styles.createSubmitText}>Create</Text>
              </Pressable>
            </View>
          )}

          {/* Search Boards Input */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your boards..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.boardsList} showsVerticalScrollIndicator={false}>
            {/* Top Choices Header */}
            <Text style={styles.sectionHeader}>Top choices</Text>

            {filteredBoards.map((board) => {
              const isPinInBoard = board.pinIds.includes(pin.id);
              return (
                <Pressable
                  key={board.id}
                  style={({ pressed }) => [
                    styles.boardRow,
                    pressed && styles.rowPressed,
                  ]}
                  onPress={() => {
                    onSelectBoard(board.id);
                    onClose();
                  }}>
                  <View style={styles.boardThumbWrapper}>
                    <Image
                      source={{ uri: board.covers[0] || pin.imageUrl }}
                      style={styles.boardThumb}
                      contentFit="cover"
                    />
                  </View>

                  <View style={styles.boardInfo}>
                    <Text style={styles.boardName}>{board.name}</Text>
                    <Text style={styles.boardCount}>
                      {board.count} {board.count === 1 ? 'pin' : 'pins'}
                    </Text>
                  </View>

                  <View style={[styles.checkPill, isPinInBoard && styles.checkPillActive]}>
                    <Ionicons
                      name={isPinInBoard ? 'checkmark' : 'bookmark-outline'}
                      size={16}
                      color={isPinInBoard ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
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
  },
  backdrop: {
    flex: 1,
  },
  sheetCard: {
    maxHeight: '80%',
  },
  sheetInner: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  newBoardHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineCreateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  createInput: {
    flex: 1,
    backgroundColor: DarkCard,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  createSubmitBtn: {
    backgroundColor: AccentRed,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  createSubmitBtnDisabled: {
    opacity: 0.5,
  },
  createSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  sectionHeader: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boardsList: {
    maxHeight: 380,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  boardThumbWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: DarkCard,
    marginRight: 14,
  },
  boardThumb: {
    width: '100%',
    height: '100%',
  },
  boardInfo: {
    flex: 1,
  },
  boardName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  boardCount: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  checkPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkPillActive: {
    backgroundColor: AccentRed,
  },
});
