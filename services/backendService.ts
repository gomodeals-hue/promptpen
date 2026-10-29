import {
  PromptItem,
  PROMPTS_DATA,
  NotificationItem,
  INITIAL_NOTIFICATIONS,
  ChatThread,
  INITIAL_THREADS,
  ChatMessage,
  TopicItem,
  ONBOARDING_TOPICS,
} from '@/constants/prompts';

export interface Board {
  id: string;
  name: string;
  count: number;
  covers: string[];
  pinIds: string[];
  description?: string;
  createdAt?: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  promptsCount: number;
  followersCount: string;
  followingCount: string;
  savesCount: string;
}

const INITIAL_BOARDS: Board[] = [
  {
    id: 'b-space',
    name: 'Space 🪐✨',
    count: 15,
    pinIds: ['pin-space-1', 'pin-surreal-1', 'pin-v1'],
    covers: [
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'b-outfit',
    name: 'Outfit Inspirations',
    count: 12,
    pinIds: ['pin-fashion-1', 'pin-living-1', 'pin-surreal-1'],
    covers: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'b-workspace',
    name: 'Working Space',
    count: 8,
    pinIds: ['pin-living-1', 'pin-arch-1'],
    covers: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'b-accessories',
    name: 'Accessories',
    count: 53,
    pinIds: ['pin-fashion-1', 'pin-quote-1'],
    covers: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    ],
  },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Evelyn West',
  handle: '@evelynwest',
  bio: 'AI Prompt Director & Neural Stylist. Curating surreal dreamscapes, cyber aesthetic, and high-fashion prompts.',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  promptsCount: PROMPTS_DATA.length,
  followersCount: '123',
  followingCount: '88',
  savesCount: '98.2k',
};

/**
 * Backend Service (API Abstraction Layer)
 * All operations return Promises to simulate asynchronous network/database responses.
 * When real API endpoints are provided, only this file needs to be hooked up!
 */
class BackendService {
  private prompts: PromptItem[] = [...PROMPTS_DATA];
  private boards: Board[] = [...INITIAL_BOARDS];
  private savedPinIds: Set<string> = new Set(['pin-surreal-1', 'pin-space-1', 'pin-fashion-1', 'pin-living-1']);
  private likedPinIds: Set<string> = new Set(['pin-surreal-1', 'pin-space-1']);
  private notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  private threads: ChatThread[] = [...INITIAL_THREADS];
  private profile: UserProfile = { ...INITIAL_PROFILE };
  private topics: TopicItem[] = [...ONBOARDING_TOPICS];

  // ===================== PROMPTS =====================

  async getPrompts(category?: string, query?: string): Promise<PromptItem[]> {
    let result = [...this.prompts];
    if (category && category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)) ||
          p.author.name.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async getPromptById(id: string): Promise<PromptItem | null> {
    return this.prompts.find(p => p.id === id) || null;
  }

  async createPrompt(item: PromptItem): Promise<PromptItem> {
    this.prompts = [item, ...this.prompts];
    this.profile.promptsCount += 1;
    return item;
  }

  async updatePrompt(id: string, updates: Partial<PromptItem>): Promise<PromptItem | null> {
    const index = this.prompts.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.prompts[index] = { ...this.prompts[index], ...updates };
    return this.prompts[index];
  }

  async deletePrompt(id: string): Promise<boolean> {
    this.prompts = this.prompts.filter(p => p.id !== id);
    this.savedPinIds.delete(id);
    this.likedPinIds.delete(id);
    this.boards = this.boards.map(b => ({
      ...b,
      pinIds: b.pinIds.filter(pid => pid !== id),
      count: b.pinIds.filter(pid => pid !== id).length,
    }));
    return true;
  }

  async toggleLikePrompt(id: string): Promise<{ liked: boolean; likesCount: number }> {
    const isLiked = this.likedPinIds.has(id);
    if (isLiked) {
      this.likedPinIds.delete(id);
    } else {
      this.likedPinIds.add(id);
    }
    const pin = this.prompts.find(p => p.id === id);
    if (pin) {
      pin.likes = isLiked ? Math.max(0, pin.likes - 1) : pin.likes + 1;
    }
    return { liked: !isLiked, likesCount: pin?.likes || 0 };
  }

  async getLikedPinIds(): Promise<string[]> {
    return Array.from(this.likedPinIds);
  }

  async getSavedPinIds(): Promise<string[]> {
    return Array.from(this.savedPinIds);
  }

  // ===================== BOARDS =====================

  async getBoards(): Promise<Board[]> {
    return [...this.boards];
  }

  async getBoardById(id: string): Promise<Board | null> {
    return this.boards.find(b => b.id === id) || null;
  }

  async createBoard(name: string, coverUrl?: string): Promise<Board> {
    const newBoard: Board = {
      id: `b-${Date.now()}`,
      name: name.trim(),
      count: 0,
      pinIds: [],
      covers: coverUrl ? [coverUrl] : ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'],
      createdAt: 'Just now',
    };
    this.boards = [newBoard, ...this.boards];
    return newBoard;
  }

  async addPinToBoard(pinId: string, boardId: string): Promise<Board | null> {
    this.savedPinIds.add(pinId);
    const pin = this.prompts.find(p => p.id === pinId);
    const board = this.boards.find(b => b.id === boardId);
    if (!board) return null;

    if (!board.pinIds.includes(pinId)) {
      board.pinIds = [pinId, ...board.pinIds];
      board.count = board.pinIds.length;
      if (pin) {
        board.covers = [pin.imageUrl, ...board.covers.slice(0, 2)];
        pin.saves += 1;
      }
    }
    return board;
  }

  async removePinFromBoard(pinId: string, boardId: string): Promise<Board | null> {
    const board = this.boards.find(b => b.id === boardId);
    if (!board) return null;
    board.pinIds = board.pinIds.filter(id => id !== pinId);
    board.count = board.pinIds.length;
    return board;
  }

  async toggleSavePin(pinId: string, boardId?: string): Promise<{ saved: boolean }> {
    const isSaved = this.savedPinIds.has(pinId);
    const pin = this.prompts.find(p => p.id === pinId);

    if (isSaved && !boardId) {
      this.savedPinIds.delete(pinId);
      if (pin) pin.saves = Math.max(0, pin.saves - 1);
      // Remove from boards
      this.boards.forEach(b => {
        b.pinIds = b.pinIds.filter(id => id !== pinId);
        b.count = b.pinIds.length;
      });
      return { saved: false };
    } else {
      this.savedPinIds.add(pinId);
      if (pin) pin.saves += 1;
      if (boardId) {
        await this.addPinToBoard(pinId, boardId);
      }
      return { saved: true };
    }
  }

  // ===================== NOTIFICATIONS & ACTIVITY =====================

  async getNotifications(): Promise<NotificationItem[]> {
    return [...this.notifications];
  }

  async markNotificationRead(id: string): Promise<void> {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }

  // ===================== DIRECT MESSAGES =====================

  async getMessageThreads(): Promise<ChatThread[]> {
    return [...this.threads];
  }

  async sendMessage(threadId: string, text: string, attachedPinId?: string): Promise<ChatMessage> {
    const thread = this.threads.find(t => t.id === threadId);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: this.profile.name,
      senderAvatar: this.profile.avatar,
      text: text.trim(),
      timestamp: 'Just now',
      isMe: true,
      attachedPinId,
    };

    if (thread) {
      thread.messages.push(newMsg);
      thread.lastMessage = text;
      thread.lastMessageTime = 'Just now';
    }

    return newMsg;
  }

  // ===================== USER PROFILE =====================

  async getUserProfile(): Promise<UserProfile> {
    return { ...this.profile };
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    this.profile = { ...this.profile, ...updates };
    return { ...this.profile };
  }

  // ===================== TOPICS / ONBOARDING =====================

  async getTopics(): Promise<TopicItem[]> {
    return [...this.topics];
  }

  async setTopicSelection(topicId: string, selected: boolean): Promise<TopicItem[]> {
    this.topics = this.topics.map(t => (t.id === topicId ? { ...t, selected } : t));
    return [...this.topics];
  }
}

export const backendService = new BackendService();
