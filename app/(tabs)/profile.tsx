import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { usePromptContext } from '@/context/PromptContext';
import { PromptCard } from '@/components/prompt-card';
import {
  AccentRed,
  DarkBackground,
  DarkSurface,
  DarkCard,
  DarkBorder,
} from '@/constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    prompts,
    savedPinIds,
    userProfile,
    updateProfile,
    openProductPage,
    toggleSave,
    showToast,
  } = usePromptContext();

  const [activeTab, setActiveTab] = useState<'created' | 'saved'>('created');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editBio, setEditBio] = useState(userProfile.bio);
  const [editHandle, setEditHandle] = useState(userProfile.handle);

  const createdPrompts = prompts;
  const savedPrompts = prompts.filter(p => savedPinIds.includes(p.id));

  const handleSaveProfile = () => {
    updateProfile({
      name: editName.trim() || userProfile.name,
      bio: editBio.trim() || userProfile.bio,
      handle: editHandle.trim() || userProfile.handle,
    });
    setIsEditModalOpen(false);
  };

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 8;
  const bottomInset = Math.max(insets.bottom, 14) + 84;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingTop: topInset, paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}>
        {/* Top Header Icons (Matching Image 2: Search on left, Settings on right) */}
        <View style={styles.topNavRow}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => showToast('Search profile creations', 'search')}>
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={styles.iconBtn}
            onPress={() => {
              setEditName(userProfile.name);
              setEditBio(userProfile.bio);
              setEditHandle(userProfile.handle);
              setIsEditModalOpen(true);
            }}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Profile Avatar & Info (Matching Image 2: Evelyn West) */}
        <View style={styles.profileHero}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: userProfile.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>

          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userBio}>{userProfile.bio}</Text>

          {/* Follower & Following Row (Matching Image 2: 123 followers, 88 following) */}
          <View style={styles.followerStatsRow}>
            <Text style={styles.statItemText}>
              <Text style={styles.statBold}>{userProfile.followersCount}</Text> followers
            </Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statItemText}>
              <Text style={styles.statBold}>{userProfile.followingCount}</Text> following
            </Text>
          </View>

          {/* Segmented Pills: "Created" (Red Pill) vs "Saved" (Matching Image 2) */}
          <View style={styles.pillsToggleRow}>
            <Pressable
              style={[styles.pillBtn, activeTab === 'created' && styles.pillBtnCreatedActive]}
              onPress={() => setActiveTab('created')}>
              <Text
                style={[
                  styles.pillBtnText,
                  activeTab === 'created' && styles.pillBtnTextActive,
                ]}>
                Created
              </Text>
            </Pressable>

            <Pressable
              style={[styles.pillBtn, activeTab === 'saved' && styles.pillBtnSavedActive]}
              onPress={() => setActiveTab('saved')}>
              <Text
                style={[
                  styles.pillBtnText,
                  activeTab === 'saved' && styles.pillBtnTextActive,
                ]}>
                Saved
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Gallery Grid */}
        <View style={styles.galleryGrid}>
          {(activeTab === 'created' ? createdPrompts : savedPrompts).map((pin) => (
            <View key={pin.id} style={styles.gridColumn}>
              <PromptCard
                item={pin}
                onPress={(item) => openProductPage(item)}
                onSaveToggle={(item) => toggleSave(item)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Display Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={styles.modalLabel}>Handle</Text>
            <TextInput
              style={styles.modalInput}
              value={editHandle}
              onChangeText={setEditHandle}
            />

            <Text style={styles.modalLabel}>Bio</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editBio}
              onChangeText={setEditBio}
              multiline
              numberOfLines={3}
            />

            <Pressable style={styles.modalSubmitBtn} onPress={handleSaveProfile}>
              <Text style={styles.modalSubmitText}>Save Changes</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DarkSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 3,
    marginBottom: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  userBio: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
    marginBottom: 14,
  },
  followerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  statItemText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  statBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statDot: {
    color: '#6B7280',
  },
  pillsToggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pillBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: DarkSurface,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  pillBtnCreatedActive: {
    backgroundColor: AccentRed,
    borderColor: AccentRed,
  },
  pillBtnSavedActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  pillBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridColumn: {
    width: '48%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: DarkSurface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: DarkBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: DarkCard,
    borderWidth: 1,
    borderColor: DarkBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 14,
  },
  modalTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    backgroundColor: AccentRed,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
