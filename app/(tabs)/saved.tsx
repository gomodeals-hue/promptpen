import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { usePromptContext, Board } from '@/context/PromptContext';
import { PromptCard } from '@/components/prompt-card';
import {
  AccentRed,
  DarkBackground,
  DarkSurface,
  DarkCard,
  DarkBorder,
} from '@/constants/theme';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { prompts, savedPinIds, boards, createBoard, toggleSave, openProductPage, showToast } =
    usePromptContext();

  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [activeTab, setActiveTab] = useState<'boards' | 'pins'>('boards');
  const [searchQuery, setSearchQuery] = useState('');

  const savedPrompts = prompts.filter(p => savedPinIds.includes(p.id));
  const boardPrompts = selectedBoard
    ? prompts.filter(p => selectedBoard.pinIds.includes(p.id))
    : [];

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 8;
  const bottomInset = Math.max(insets.bottom, 14) + 84;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Search Header (Matching Image 1: Search bar with camera icon) */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        {selectedBoard ? (
          <View style={styles.boardDetailNav}>
            <Pressable
              style={styles.backBtn}
              onPress={() => setSelectedBoard(null)}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>
            <View style={styles.boardNavActions}>
              <Pressable
                style={styles.circleBtn}
                onPress={() => showToast('Share board link', 'share-social')}>
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={styles.circleBtn}
                onPress={() => showToast('Board settings', 'ellipsis-horizontal')}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your pins & boards..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Pressable
              style={styles.cameraBtn}
              onPress={() => showToast('Visual search boards', 'camera')}>
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}>
        {selectedBoard ? (
          /* =================== BOARD DETAIL VIEW (Matching Image 3) =================== */
          <View>
            {/* Board Title Header */}
            <View style={styles.boardHero}>
              <Text style={styles.boardHeroTitle}>{selectedBoard.name}</Text>
              
              {/* Creator Avatars Row with '+' (Matching Image 3) */}
              <View style={styles.collaboratorRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' }}
                  style={styles.collabAvatar}
                  contentFit="cover"
                />
                <Pressable
                  style={styles.addCollabBtn}
                  onPress={() => showToast('Invite collaborator to board', 'person-add')}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Action Buttons: "More ideas" & "Organise" (Matching Image 3) */}
              <View style={styles.boardActionButtonsRow}>
                <Pressable
                  style={styles.boardActionBtn}
                  onPress={() => showToast('Finding more ideas for board...', 'sparkles')}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginBottom: 4 }} />
                  <Text style={styles.boardActionBtnText}>More ideas</Text>
                </Pressable>

                <Pressable
                  style={styles.boardActionBtn}
                  onPress={() => showToast('Organise board sections', 'grid')}>
                  <Ionicons name="copy-outline" size={18} color="#FFFFFF" style={{ marginBottom: 4 }} />
                  <Text style={styles.boardActionBtnText}>Organise</Text>
                </Pressable>
              </View>

              <Text style={styles.pinCountText}>
                {boardPrompts.length} {boardPrompts.length === 1 ? 'Pin' : 'Pins'}
              </Text>
            </View>

            {/* Pins Grid */}
            <View style={styles.pinsGrid}>
              {boardPrompts.map((pin) => (
                <View key={pin.id} style={styles.gridColumn}>
                  <PromptCard
                    item={pin}
                    onPress={(item) => openProductPage(item)}
                    onSaveToggle={(item) => toggleSave(item)}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* =================== BOARDS LIST VIEW (Matching Image 1) =================== */
          <View>
            {/* Heading & Segmented Tab */}
            <View style={styles.boardsHeaderRow}>
              <Text style={styles.myBoardsHeading}>My boards</Text>
              <View style={styles.tabPillRow}>
                <Pressable
                  style={[styles.smallTab, activeTab === 'boards' && styles.smallTabActive]}
                  onPress={() => setActiveTab('boards')}>
                  <Text style={[styles.smallTabText, activeTab === 'boards' && styles.smallTabTextActive]}>
                    Boards
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.smallTab, activeTab === 'pins' && styles.smallTabActive]}
                  onPress={() => setActiveTab('pins')}>
                  <Text style={[styles.smallTabText, activeTab === 'pins' && styles.smallTabTextActive]}>
                    All Pins
                  </Text>
                </Pressable>
              </View>
            </View>

            {activeTab === 'boards' ? (
              <View style={styles.boardsGrid}>
                {/* 1. "Create new board" Tile (Matching Image 1) */}
                <Pressable
                  style={styles.createBoardTile}
                  onPress={() => {
                    const sampleNames = ['Space 🪐✨', 'Neon Aesthetics', 'Visual Typography', 'Solarpunk Living'];
                    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
                    createBoard(randomName);
                  }}>
                  <View style={styles.createIconCircle}>
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.createTileText}>Create new board</Text>
                </Pressable>

                {/* 2. Board 2x2 Cards (Matching Image 1) */}
                {boards.map((board) => {
                  const bPins = prompts.filter(p => board.pinIds.includes(p.id));
                  const cover1 = bPins[0]?.imageUrl || board.covers[0];
                  const cover2 = bPins[1]?.imageUrl || board.covers[1] || cover1;
                  const cover3 = bPins[2]?.imageUrl || board.covers[2] || cover1;

                  return (
                    <Pressable
                      key={board.id}
                      style={styles.boardCard}
                      onPress={() => setSelectedBoard(board)}>
                      <View style={styles.boardMosaic}>
                        <Image source={{ uri: cover1 }} style={styles.mosaicLeft} contentFit="cover" />
                        <View style={styles.mosaicRight}>
                          <Image source={{ uri: cover2 }} style={styles.mosaicSub} contentFit="cover" />
                          <Image source={{ uri: cover3 }} style={styles.mosaicSub} contentFit="cover" />
                        </View>
                      </View>
                      <View style={styles.boardCardMeta}>
                        <Text style={styles.boardCardName} numberOfLines={1}>
                          {board.name}
                        </Text>
                        <Text style={styles.boardCardPinsCount}>
                          {board.count || board.pinIds.length} Pins
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              /* All Saved Pins */
              <View style={styles.pinsGrid}>
                {savedPrompts.map((pin) => (
                  <View key={pin.id} style={styles.gridColumn}>
                    <PromptCard
                      item={pin}
                      onPress={(item) => openProductPage(item)}
                      onSaveToggle={(item) => toggleSave(item)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 12,
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
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  cameraBtn: {
    padding: 4,
  },
  boardDetailNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DarkSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardNavActions: {
    flexDirection: 'row',
    gap: 8,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DarkSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  boardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  myBoardsHeading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tabPillRow: {
    flexDirection: 'row',
    backgroundColor: DarkSurface,
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  smallTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  smallTabActive: {
    backgroundColor: '#FFFFFF',
  },
  smallTabText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  smallTabTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  boardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  createBoardTile: {
    width: '48%',
    height: 180,
    borderRadius: 24,
    backgroundColor: DarkSurface,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  createIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  createTileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  boardCard: {
    width: '48%',
    backgroundColor: DarkSurface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DarkBorder,
    marginBottom: 12,
  },
  boardMosaic: {
    height: 125,
    flexDirection: 'row',
    gap: 4,
    padding: 6,
  },
  mosaicLeft: {
    flex: 2,
    height: '100%',
    borderRadius: 16,
  },
  mosaicRight: {
    flex: 1,
    gap: 4,
  },
  mosaicSub: {
    flex: 1,
    borderRadius: 10,
  },
  boardCardMeta: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
  },
  boardCardName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  boardCardPinsCount: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  boardHero: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  boardHeroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  collaboratorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  collabAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  addCollabBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardActionButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  boardActionBtn: {
    width: 90,
    height: 72,
    borderRadius: 20,
    backgroundColor: DarkSurface,
    borderWidth: 1,
    borderColor: DarkBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pinCountText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    alignSelf: 'flex-start',
  },
  pinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridColumn: {
    width: '48%',
  },
});
