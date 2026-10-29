import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Share, Platform } from 'react-native';
import {
  PromptItem,
  PROMPTS_DATA,
  NotificationItem,
  ChatThread,
  TopicItem,
} from '@/constants/prompts';
import {
  backendService,
  Board,
  UserProfile,
} from '@/services/backendService';
import { RadialActionType } from '@/components/radial-gesture-menu';

export { Board, UserProfile };

interface ConfirmDialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface PromptContextType {
  // Prompts & Boards
  prompts: PromptItem[];
  savedPinIds: string[];
  likedPinIds: string[];
  boards: Board[];
  userProfile: UserProfile;
  notifications: NotificationItem[];
  threads: ChatThread[];
  topics: TopicItem[];
  selectedPin: PromptItem | null;

  // Modals & Sheets State
  isProductModalVisible: boolean;
  radialPin: PromptItem | null;
  radialPosition: { x: number; y: number } | null;
  isRadialMenuOpen: boolean;
  boardPickerPin: PromptItem | null;
  isBoardPickerOpen: boolean;
  moreOptionsPin: PromptItem | null;
  isMoreOptionsOpen: boolean;
  confirmDialogState: ConfirmDialogState;

  // Toast
  toastMessage: string;
  toastVisible: boolean;
  toastIcon: string;
  showToast: (message: string, icon?: any) => void;
  hideToast: () => void;

  // Actions
  openProductPage: (pin: PromptItem) => void;
  closeProductPage: () => void;
  toggleLike: (pinId: string) => Promise<void>;
  toggleSave: (pin: PromptItem, boardId?: string) => Promise<void>;
  createBoard: (name: string, coverUrl?: string) => Promise<Board>;
  addPrompt: (newPrompt: PromptItem) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<PromptItem>) => Promise<void>;
  deletePrompt: (pinId: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;

  // Radial Gesture & Sheet Openers
  openRadialMenu: (pin: PromptItem, position?: { x: number; y: number }) => void;
  closeRadialMenu: () => void;
  handleRadialAction: (action: RadialActionType, pin: PromptItem) => void;

  openBoardPicker: (pin: PromptItem) => void;
  closeBoardPicker: () => void;
  savePinToBoard: (pinId: string, boardId: string) => Promise<void>;

  openMoreOptions: (pin: PromptItem) => void;
  closeMoreOptions: () => void;

  showConfirmDialog: (options: Omit<ConfirmDialogState, 'visible'>) => void;
  hideConfirmDialog: () => void;

  // Messaging & Notifications
  sendMessage: (threadId: string, text: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  toggleTopic: (topicId: string) => Promise<void>;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<PromptItem[]>(PROMPTS_DATA);
  const [savedPinIds, setSavedPinIds] = useState<string[]>(['pin-surreal-1', 'pin-space-1', 'pin-fashion-1']);
  const [likedPinIds, setLikedPinIds] = useState<string[]>(['pin-surreal-1', 'pin-space-1']);
  const [boards, setBoards] = useState<Board[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Evelyn West',
    handle: '@evelynwest',
    bio: 'AI Prompt Director & Neural Stylist. Curating surreal dreamscapes, cyber aesthetic, and high-fashion prompts.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    promptsCount: PROMPTS_DATA.length,
    followersCount: '123',
    followingCount: '88',
    savesCount: '98.2k',
  });

  const [selectedPin, setSelectedPin] = useState<PromptItem | null>(null);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);

  // Sheets & Overlays
  const [radialPin, setRadialPin] = useState<PromptItem | null>(null);
  const [radialPosition, setRadialPosition] = useState<{ x: number; y: number } | null>(null);
  const [isRadialMenuOpen, setIsRadialMenuOpen] = useState(false);

  const [boardPickerPin, setBoardPickerPin] = useState<PromptItem | null>(null);
  const [isBoardPickerOpen, setIsBoardPickerOpen] = useState(false);

  const [moreOptionsPin, setMoreOptionsPin] = useState<PromptItem | null>(null);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  const [confirmDialogState, setConfirmDialogState] = useState<ConfirmDialogState>({
    visible: false,
    title: '',
    message: '',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    isDestructive: true,
    onConfirm: () => {},
  });

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastIcon, setToastIcon] = useState('checkmark-circle');

  // Initialize Backend Data on mount
  useEffect(() => {
    async function loadData() {
      const [p, b, s, l, n, t, prof, top] = await Promise.all([
        backendService.getPrompts(),
        backendService.getBoards(),
        backendService.getSavedPinIds(),
        backendService.getLikedPinIds(),
        backendService.getNotifications(),
        backendService.getMessageThreads(),
        backendService.getUserProfile(),
        backendService.getTopics(),
      ]);
      setPrompts(p);
      setBoards(b);
      setSavedPinIds(s);
      setLikedPinIds(l);
      setNotifications(n);
      setThreads(t);
      setUserProfile(prof);
      setTopics(top);
    }
    loadData();
  }, []);

  const showToast = (message: string, icon = 'checkmark-circle') => {
    setToastMessage(message);
    setToastIcon(icon);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const openProductPage = (pin: PromptItem) => {
    setSelectedPin(pin);
    try {
      router.push(`/product/${pin.id}` as any);
    } catch (e) {
      setIsProductModalVisible(true);
    }
  };

  const closeProductPage = () => {
    setIsProductModalVisible(false);
    try {
      router.back();
    } catch (e) {}
  };

  const toggleLike = async (pinId: string) => {
    const res = await backendService.toggleLikePrompt(pinId);
    setLikedPinIds(prev => (res.liked ? [...prev, pinId] : prev.filter(id => id !== pinId)));
    setPrompts(prev =>
      prev.map(p => (p.id === pinId ? { ...p, likes: res.likesCount } : p))
    );
    showToast(res.liked ? 'Added to Liked' : 'Removed from Liked', res.liked ? 'heart' : 'heart-dislike');
  };

  const toggleSave = async (pin: PromptItem, boardId?: string) => {
    const res = await backendService.toggleSavePin(pin.id, boardId);
    if (res.saved) {
      setSavedPinIds(prev => [...new Set([...prev, pin.id])]);
      setPrompts(prev =>
        prev.map(p => (p.id === pin.id ? { ...p, saves: p.saves + 1 } : p))
      );
      if (boardId) {
        const updatedBoards = await backendService.getBoards();
        setBoards(updatedBoards);
        const board = updatedBoards.find(b => b.id === boardId);
        showToast(`Saved to "${board?.name || 'Board'}"`, 'bookmark');
      } else {
        showToast(`Saved to Profile`, 'bookmark');
      }
    } else {
      setSavedPinIds(prev => prev.filter(id => id !== pin.id));
      setPrompts(prev =>
        prev.map(p => (p.id === pin.id ? { ...p, saves: Math.max(0, p.saves - 1) } : p))
      );
      const updatedBoards = await backendService.getBoards();
      setBoards(updatedBoards);
      showToast(`Removed from Saved`, 'bookmark-outline');
    }
  };

  const createBoard = async (name: string, coverUrl?: string) => {
    const newBoard = await backendService.createBoard(name, coverUrl);
    setBoards(prev => [newBoard, ...prev]);
    showToast(`Created board "${newBoard.name}"`, 'folder-open');
    return newBoard;
  };

  const savePinToBoard = async (pinId: string, boardId: string) => {
    await backendService.addPinToBoard(pinId, boardId);
    const updatedBoards = await backendService.getBoards();
    setBoards(updatedBoards);
    setSavedPinIds(prev => [...new Set([...prev, pinId])]);
    const board = updatedBoards.find(b => b.id === boardId);
    showToast(`Saved to "${board?.name || 'Board'}"`, 'bookmark');
  };

  const addPrompt = async (newPrompt: PromptItem) => {
    await backendService.createPrompt(newPrompt);
    setPrompts(prev => [newPrompt, ...prev]);
    setUserProfile(prev => ({ ...prev, promptsCount: prev.promptsCount + 1 }));
    showToast('Prompt Pin published to PromptPen!', 'sparkles');
  };

  const updatePrompt = async (id: string, updates: Partial<PromptItem>) => {
    const updated = await backendService.updatePrompt(id, updates);
    if (updated) {
      setPrompts(prev => prev.map(p => (p.id === id ? updated : p)));
      showToast('Prompt Pin updated', 'checkmark-circle');
    }
  };

  const deletePrompt = async (pinId: string) => {
    await backendService.deletePrompt(pinId);
    setPrompts(prev => prev.filter(p => p.id !== pinId));
    setSavedPinIds(prev => prev.filter(id => id !== pinId));
    setLikedPinIds(prev => prev.filter(id => id !== pinId));
    const updatedBoards = await backendService.getBoards();
    setBoards(updatedBoards);
    showToast('Pin deleted', 'trash-outline');
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    const updated = await backendService.updateUserProfile(profile);
    setUserProfile(updated);
    showToast('Profile updated successfully!', 'checkmark-circle');
  };

  // Radial Action Menus & Custom Dialogs
  const openRadialMenu = (pin: PromptItem, position?: { x: number; y: number }) => {
    setRadialPin(pin);
    setRadialPosition(position || null);
    setIsRadialMenuOpen(true);
  };

  const closeRadialMenu = () => {
    setIsRadialMenuOpen(false);
    setRadialPosition(null);
  };

  const showConfirmDialog = (options: Omit<ConfirmDialogState, 'visible'>) => {
    setConfirmDialogState({
      ...options,
      visible: true,
    });
  };

  const hideConfirmDialog = () => {
    setConfirmDialogState(prev => ({ ...prev, visible: false }));
  };

  const openBoardPicker = (pin: PromptItem) => {
    setBoardPickerPin(pin);
    setIsBoardPickerOpen(true);
  };

  const closeBoardPicker = () => {
    setIsBoardPickerOpen(false);
  };

  const openMoreOptions = (pin: PromptItem) => {
    setMoreOptionsPin(pin);
    setIsMoreOptionsOpen(true);
  };

  const closeMoreOptions = () => {
    setIsMoreOptionsOpen(false);
  };

  const handleRadialAction = (action: RadialActionType, pin: PromptItem) => {
    switch (action) {
      case 'save':
        openBoardPicker(pin);
        break;
      case 'edit':
        showToast(`Editing "${pin.title}"`, 'pencil');
        break;
      case 'share':
        Share.share({
          title: pin.title,
          message: `Check out "${pin.title}" on PromptPen:\n\n${pin.prompt}`,
        }).catch(() => {});
        break;
      case 'message':
        showToast(`Sent "${pin.title}" to messages`, 'chatbubble');
        break;
      case 'lens':
        showToast(`Searching similar to "${pin.title}"`, 'scan');
        router.push('/(tabs)/explore' as any);
        break;
      case 'delete':
        showConfirmDialog({
          title: 'Are you sure?',
          message:
            "If you delete this Pin, it'll be gone for good and those who've saved it won't be able to view it.",
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
          isDestructive: true,
          onConfirm: () => {
            deletePrompt(pin.id);
            hideConfirmDialog();
          },
        });
        break;
    }
  };

  const sendMessage = async (threadId: string, text: string) => {
    const newMsg = await backendService.sendMessage(threadId, text);
    setThreads(prev =>
      prev.map(t =>
        t.id === threadId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastMessage: text,
              lastMessageTime: 'Just now',
            }
          : t
      )
    );
  };

  const markNotificationRead = async (id: string) => {
    await backendService.markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const toggleTopic = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      const updated = await backendService.setTopicSelection(topicId, !topic.selected);
      setTopics(updated);
    }
  };

  const value = useMemo(
    () => ({
      prompts,
      savedPinIds,
      likedPinIds,
      boards,
      userProfile,
      notifications,
      threads,
      topics,
      selectedPin,
      isProductModalVisible,
      radialPin,
      radialPosition,
      isRadialMenuOpen,
      boardPickerPin,
      isBoardPickerOpen,
      moreOptionsPin,
      isMoreOptionsOpen,
      confirmDialogState,
      toastMessage,
      toastVisible,
      toastIcon,
      showToast,
      hideToast,
      openProductPage,
      closeProductPage,
      toggleLike,
      toggleSave,
      createBoard,
      addPrompt,
      updatePrompt,
      deletePrompt,
      updateProfile,
      openRadialMenu,
      closeRadialMenu,
      handleRadialAction,
      openBoardPicker,
      closeBoardPicker,
      savePinToBoard,
      openMoreOptions,
      closeMoreOptions,
      showConfirmDialog,
      hideConfirmDialog,
      sendMessage,
      markNotificationRead,
      toggleTopic,
    }),
    [
      prompts,
      savedPinIds,
      likedPinIds,
      boards,
      userProfile,
      notifications,
      threads,
      topics,
      selectedPin,
      isProductModalVisible,
      radialPin,
      radialPosition,
      isRadialMenuOpen,
      boardPickerPin,
      isBoardPickerOpen,
      moreOptionsPin,
      isMoreOptionsOpen,
      confirmDialogState,
      toastMessage,
      toastVisible,
      toastIcon,
    ]
  );

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>;
}

export function usePromptContext() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }
  return context;
}
