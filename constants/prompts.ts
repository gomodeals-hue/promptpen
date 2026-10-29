export type MediaKind = 'image' | 'video';

export type AIModelType =
  | 'Midjourney v6'
  | 'Flux.1 Pro'
  | 'DALL-E 3'
  | 'Stable Diffusion XL'
  | 'OpenAI Sora'
  | 'Runway Gen-3'
  | 'Luma Dream Machine'
  | 'Kling AI'
  | 'Pika 2.0';

export interface PromptItem {
  id: string;
  title: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  aspectRatio: number; // e.g. 0.72 for tall portrait, 0.85 for rectangle, 1.0 for square
  shape?: 'rectangle' | 'square';
  mediaType: MediaKind; // 'image' | 'video'
  videoDuration?: string; // e.g. '0:06', '0:10'
  cameraMotion?: string; // e.g. 'Dolly In + Slow Orbit', 'FPV Drone Flythrough'
  category: string;
  tags: string[];
  model: AIModelType;
  author: {
    name: string;
    handle: string;
    avatar: string;
    followersCount?: string;
  };
  likes: number;
  saves: number;
  featured?: boolean;
  createdAt: string;
  sampler?: string;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  motionBucket?: number;
  fps?: number;
}

export interface NotificationItem {
  id: string;
  type: 'save' | 'follow' | 'suggestion' | 'like';
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  avatar?: string;
  thumbnails?: string[];
  actionLabel?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  attachedPinId?: string;
}

export interface ChatThread {
  id: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface TopicItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  selected?: boolean;
}

export const CATEGORIES = [
  'All',
  'Living',
  'Fashion & Style',
  'Cyberpunk',
  'Surreal',
  'Architecture',
  'Space & Sci-Fi',
  'Portraits',
  'Wallpapers',
  '3D Render',
] as const;

export const PROMPTS_DATA: PromptItem[] = [
  {
    id: 'pin-surreal-1',
    title: 'A Surreal Journey',
    prompt: 'Surreal dreamy dreamscape of wandering traveler amidst mystical pink cloud forest with golden monolith towers and floating crystalline structures, cinematic ethereal atmosphere, Hasselblad 8k photography --ar 4:5 --stylize 750',
    negativePrompt: 'blurry, distorted architecture, extra limbs, dull lighting, low contrast',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    aspectRatio: 0.78,
    shape: 'rectangle',
    mediaType: 'image',
    category: 'Surreal',
    tags: ['Surrealism', 'Dreamscape', 'Pink Clouds', 'Midjourney v6'],
    model: 'Midjourney v6',
    author: {
      name: 'OOGEMINIVENUS',
      handle: '@oogeminivenus',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      followersCount: '5.2k',
    },
    likes: 6840,
    saves: 3410,
    featured: true,
    createdAt: '20m ago',
    steps: 40,
    cfgScale: 7.5,
    seed: 492019482,
  },
  {
    id: 'pin-space-1',
    title: 'Silhouette Of Person Under Starry Sky',
    prompt: 'Solitary silhouette of an astrophotographer standing atop a misty mountain ridge overlooking a breathtaking cosmic galaxy nebula with shimmering purple and electric gold constellations, long exposure 35mm lens --ar 9:16',
    negativePrompt: 'light pollution, pixelated, washed out, low contrast',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=900&q=80',
    aspectRatio: 0.72,
    shape: 'rectangle',
    mediaType: 'image',
    category: 'Space & Sci-Fi',
    tags: ['Space', 'Nebula', 'Silhouette', 'Astrophotography'],
    model: 'Flux.1 Pro',
    author: {
      name: 'mikeshots',
      handle: '@mikeshots',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      followersCount: '5k',
    },
    likes: 8920,
    saves: 4510,
    featured: true,
    createdAt: '45m ago',
    steps: 32,
    cfgScale: 8.0,
    seed: 849204812,
  },
  {
    id: 'pin-living-1',
    title: 'Modern Minimalist Loft Working Space',
    prompt: 'Ultra-stylish industrial loft interior living space, high exposed concrete ceilings, warm oak wood workstation with Herman Miller chair, warm ambient sunlight streaming through floor-to-ceiling glass windows, architectural digest aesthetic --ar 3:4',
    negativePrompt: 'cluttered, messy wiring, dim, low resolution',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    aspectRatio: 0.82,
    shape: 'rectangle',
    mediaType: 'image',
    category: 'Living',
    tags: ['Living', 'Interior Design', 'Architecture', 'Working Space'],
    model: 'Flux.1 Pro',
    author: {
      name: 'Evelyn West',
      handle: '@evelynwest',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      followersCount: '24.8k',
    },
    likes: 3120,
    saves: 1840,
    createdAt: '1h ago',
    steps: 30,
    cfgScale: 7.0,
    seed: 104928172,
  },
  {
    id: 'pin-fashion-1',
    title: 'Avant-Garde Streetwear Outfit Inspirations',
    prompt: 'High fashion cyber-techwear editorial, model posing in reflective metallic trench coat with neon utility webbing and glowing cyber accessories, studio rim lighting, 8k Vogue cover aesthetic --ar 4:5',
    negativePrompt: 'bad anatomy, dull textures, blurry, oversaturated',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    aspectRatio: 0.75,
    shape: 'rectangle',
    mediaType: 'image',
    category: 'Fashion & Style',
    tags: ['Fashion & Style', 'Outfit Inspirations', 'Streetwear', 'Accessories'],
    model: 'Midjourney v6',
    author: {
      name: 'Kai Takahashi',
      handle: '@kai_style',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      followersCount: '18.4k',
    },
    likes: 5430,
    saves: 2980,
    createdAt: '2h ago',
    steps: 35,
    cfgScale: 7.8,
    seed: 582910481,
  },
  {
    id: 'pin-v1',
    title: 'Neo-Tokyo Cyber Highway Night Drive',
    prompt: 'FPV cinematic drone camera diving through rain-soaked Neo-Tokyo neon skyscrapers, hyper-realistic reflections on wet asphalt, speeding hover-vehicles with laser trails, volumetric haze and street bokeh, 4k 60fps cinematic video --motion 8 --camera drone-dive --ar 9:16',
    negativePrompt: 'static, low resolution, jitter, stutter, morphing artifacts, distorted cars, watermark',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80',
    aspectRatio: 0.72,
    shape: 'rectangle',
    mediaType: 'video',
    videoDuration: '0:08',
    cameraMotion: 'FPV Drone Dive + Rapid Pan',
    category: 'Cyberpunk',
    tags: ['AI Video', 'Runway Gen-3', 'Cyberpunk', 'Cinematic Motion'],
    model: 'Runway Gen-3',
    author: {
      name: 'VFX Neo',
      handle: '@vfx_motion',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      followersCount: '42.1k',
    },
    likes: 4820,
    saves: 1940,
    featured: true,
    createdAt: '3h ago',
    steps: 50,
    cfgScale: 8.5,
    seed: 981247102,
    motionBucket: 127,
    fps: 60,
  },
  {
    id: 'pin-art-1',
    title: 'Warm Sunset Orange Lake Reflection',
    prompt: 'Atmospheric sunset over serene Scandinavian mountain lake, silhouetted pine trees mirrored in golden orange water, soft mist hovering on surface, cinematic nature photography, 8k --ar 1:1',
    negativePrompt: 'oversaturated, artificial looking, noise, grain',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    aspectRatio: 1.0,
    shape: 'square',
    mediaType: 'image',
    category: 'Wallpapers',
    tags: ['Sunset', 'Wallpapers', 'Nature', 'Landscape'],
    model: 'Flux.1 Pro',
    author: {
      name: 'Elena Rostova',
      handle: '@elena_snaps',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      followersCount: '31.2k',
    },
    likes: 7210,
    saves: 3890,
    createdAt: '4h ago',
    steps: 30,
    cfgScale: 7.0,
    seed: 394810294,
  },
  {
    id: 'pin-quote-1',
    title: 'Minimalist Typographic Quote Poster',
    prompt: 'Vintage mechanical typewriter font on textured matte black cardstock reading "TO EVERYTHING I\'VE BEEN THANK YOU FOR SETTING ME FREE", clean brutalist editorial design, subtle silver foil accents --ar 3:4',
    negativePrompt: 'distorted text, misspelled letters, blurry',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    aspectRatio: 0.85,
    shape: 'rectangle',
    mediaType: 'image',
    category: 'Quotes',
    tags: ['Quotes', 'Typography', 'Minimalism', 'Black & White'],
    model: 'DALL-E 3',
    author: {
      name: 'TypeCraft Studio',
      handle: '@typecraft',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      followersCount: '12.4k',
    },
    likes: 5120,
    saves: 2780,
    createdAt: '5h ago',
    steps: 25,
    cfgScale: 7.0,
    seed: 928374192,
  },
  {
    id: 'pin-arch-1',
    title: 'Parametric Curved Architecture Facade',
    prompt: 'Striking modern curved facade building with rhythmic white parametric fins against azure sky, minimalist architectural masterpiece, Zaha Hadid inspired, hyper-crisp 8k architectural render --ar 4:5',
    negativePrompt: 'wobbly lines, distorted geometry, noisy',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    aspectRatio: 0.76,
    shape: 'rectangle',
    mediaType: 'image',
    category: 'Architecture',
    tags: ['Architecture', 'Parametric', 'Minimalism', 'Modern'],
    model: 'Midjourney v6',
    author: {
      name: 'ArchVisions',
      handle: '@archvisions',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      followersCount: '64.9k',
    },
    likes: 4210,
    saves: 2130,
    createdAt: '6h ago',
    steps: 40,
    cfgScale: 7.2,
    seed: 192039485,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'save',
    title: '3 of your pins were saved',
    description: 'People saved your Cyberpunk & Surreal prompts into their moodboards',
    timeAgo: '2d ago',
    read: false,
    thumbnails: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'notif-2',
    type: 'follow',
    title: 'Lizzyy started following you',
    description: 'Check out Lizzyy\'s 14 AI creation boards',
    timeAgo: '1d ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    actionLabel: 'Follow back',
  },
  {
    id: 'notif-3',
    type: 'suggestion',
    title: 'Some ideas for your new board "Space 🪐✨"',
    description: 'We found 8 trending nebula and astrophotography pins for you',
    timeAgo: '17d ago',
    read: true,
    thumbnails: [
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    ],
  },
];

export const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'thread-1',
    user: {
      id: 'u1',
      name: 'Lizzyy',
      handle: '@lizzyy_art',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      online: true,
    },
    lastMessage: 'Loved your prompt for the pink cloud forest! What sampler did you use?',
    lastMessageTime: '2h ago',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderId: 'u1',
        senderName: 'Lizzyy',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        text: 'Hey Evelyn! Big fan of your neural stylist collection ✨',
        timestamp: '3h ago',
        isMe: false,
      },
      {
        id: 'm2',
        senderId: 'me',
        senderName: 'Evelyn West',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        text: 'Thank you so much! Really appreciate it 🙏',
        timestamp: '2h 30m ago',
        isMe: true,
      },
      {
        id: 'm3',
        senderId: 'u1',
        senderName: 'Lizzyy',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        text: 'Loved your prompt for the pink cloud forest! What sampler did you use?',
        timestamp: '2h ago',
        isMe: false,
      },
    ],
  },
  {
    id: 'thread-2',
    user: {
      id: 'u2',
      name: 'mikeshots',
      handle: '@mikeshots',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      online: false,
    },
    lastMessage: 'Shared a new space prompt with you: Silhouette Under Cosmic Nebula',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'm4',
        senderId: 'u2',
        senderName: 'mikeshots',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        text: 'Shared a new space prompt with you: Silhouette Under Cosmic Nebula',
        timestamp: 'Yesterday',
        isMe: false,
      },
    ],
  },
];

export const ONBOARDING_TOPICS: TopicItem[] = [
  {
    id: 't-wallpapers',
    title: 'Wallpapers',
    subtitle: '4K cinematic aesthetic backdrops',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    selected: true,
  },
  {
    id: 't-quotes',
    title: 'Quotes',
    subtitle: 'Typographic motivation & wisdom',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    selected: true,
  },
  {
    id: 't-memes',
    title: 'Memes',
    subtitle: 'Viral AI humor & pop culture',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
    selected: true,
  },
  {
    id: 't-surreal',
    title: 'Surreal Journeys',
    subtitle: 'Dreamscapes & floating worlds',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    selected: true,
  },
  {
    id: 't-fashion',
    title: 'Outfit Inspirations',
    subtitle: 'High fashion & cyberpunk street style',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    selected: true,
  },
  {
    id: 't-living',
    title: 'Working Space & Living',
    subtitle: 'Architectural lofts & interior decor',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    selected: false,
  },
];
