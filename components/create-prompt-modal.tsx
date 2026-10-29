import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, PromptItem, MediaKind, AIModelType } from '@/constants/prompts';
import {
  AccentRed,
  DarkBackground,
  DarkCard,
  DarkSurface,
  DarkBorder,
} from '@/constants/theme';

interface CreatePromptModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newPrompt: PromptItem) => void;
}

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
];

const IMAGE_MODELS: AIModelType[] = ['Midjourney v6', 'Flux.1 Pro', 'DALL-E 3', 'Stable Diffusion XL'];
const VIDEO_MODELS: AIModelType[] = ['Runway Gen-3', 'OpenAI Sora', 'Luma Dream Machine', 'Kling AI', 'Pika 2.0'];
const RATIOS = ['9:16', '3:4', '1:1', '16:9'] as const;
const SHAPES = ['rectangle', 'square'] as const;
const CAMERA_MOTIONS = ['FPV Drone Dive', 'Slow Orbit + Pan', 'Macro Push-In', 'Continuous Forward Dolly'] as const;

export function CreatePromptModal({ visible, onClose, onSubmit }: CreatePromptModalProps) {
  const insets = useSafeAreaInsets();
  const [mediaType, setMediaType] = useState<MediaKind>('image');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModelType>('Midjourney v6');
  const [selectedMotion, setSelectedMotion] = useState<typeof CAMERA_MOTIONS[number]>('FPV Drone Dive');
  const [selectedRatio, setSelectedRatio] = useState<typeof RATIOS[number]>('9:16');
  const [selectedShape, setSelectedShape] = useState<typeof SHAPES[number]>('rectangle');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('Surreal');
  const [tags, setTags] = useState('Surreal, Dreamscape, 8k');
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0]);

  const activeModels = mediaType === 'video' ? VIDEO_MODELS : IMAGE_MODELS;

  const handleMediaTypeChange = (type: MediaKind) => {
    setMediaType(type);
    if (type === 'video') {
      setSelectedModel('Runway Gen-3');
      setSelectedCategory('Living');
      setTags('AI Video, Motion, Runway Gen-3');
    } else {
      setSelectedModel('Midjourney v6');
      setSelectedCategory('Surreal');
      setTags('Cyberpunk, Neon, Sci-Fi');
    }
  };

  const topInset = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 28) + 8;
  const bottomInset = Math.max(insets.bottom, 16) + 40;

  const handlePublish = () => {
    if (!prompt.trim()) return;

    const ratioMap: Record<string, number> = {
      '9:16': 0.72,
      '3:4': 0.75,
      '1:1': 1.0,
      '16:9': 1.33,
    };

    const newPin: PromptItem = {
      id: `pin-user-${Date.now()}`,
      title: title.trim() || (mediaType === 'video' ? 'Untitled AI Video' : 'Untitled Vision'),
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      imageUrl: selectedImage,
      aspectRatio: ratioMap[selectedRatio] || 0.75,
      shape: selectedShape,
      mediaType,
      videoDuration: mediaType === 'video' ? '0:08' : undefined,
      cameraMotion: mediaType === 'video' ? selectedMotion : undefined,
      category: selectedCategory,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      model: selectedModel,
      author: {
        name: 'Evelyn West',
        handle: '@evelynwest',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      },
      likes: 0,
      saves: 0,
      createdAt: 'Just now',
      cfgScale: 7.5,
      seed: Math.floor(Math.random() * 900000000) + 100000000,
      fps: mediaType === 'video' ? 60 : undefined,
    };

    onSubmit(newPin);
    onClose();

    // Reset form
    setTitle('');
    setPrompt('');
    setNegativePrompt('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={[styles.header, { paddingTop: topInset }]}>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Create Pin</Text>
          </View>

          <Pressable
            style={[styles.publishBtn, !prompt.trim() && styles.publishBtnDisabled]}
            disabled={!prompt.trim()}
            onPress={handlePublish}>
            <Text style={styles.publishBtnText}>Publish</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset }]}
          showsVerticalScrollIndicator={false}>
          {/* Media Type Toggle */}
          <View style={styles.mediaToggleBox}>
            <Pressable
              style={[styles.mediaOption, mediaType === 'image' && styles.mediaOptionActive]}
              onPress={() => handleMediaTypeChange('image')}>
              <Ionicons
                name="image"
                size={16}
                color={mediaType === 'image' ? '#FFFFFF' : '#9CA3AF'}
              />
              <Text style={[styles.mediaOptionText, mediaType === 'image' && styles.mediaOptionTextActive]}>
                AI Image
              </Text>
            </Pressable>

            <Pressable
              style={[styles.mediaOption, mediaType === 'video' && styles.mediaOptionActive]}
              onPress={() => handleMediaTypeChange('video')}>
              <Ionicons
                name="videocam"
                size={16}
                color={mediaType === 'video' ? '#FFFFFF' : '#9CA3AF'}
              />
              <Text style={[styles.mediaOptionText, mediaType === 'video' && styles.mediaOptionTextActive]}>
                AI Video
              </Text>
            </Pressable>
          </View>

          {/* Title input */}
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder={mediaType === 'video' ? 'e.g. Cyber Highway FPV Drone Drive' : 'e.g. A Surreal Journey'}
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
          />

          {/* Positive Prompt */}
          <Text style={styles.label}>
            {mediaType === 'video' ? 'Video Motion Prompt *' : 'Positive Prompt *'}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={mediaType === 'video' ? 'Describe camera motion, action, lighting, and scene in detail...' : 'Describe subject, style, lighting, composition, resolution, and engine flags...'}
            placeholderTextColor="#6B7280"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
          />

          {/* Negative Prompt */}
          <Text style={styles.label}>Negative Prompt (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textAreaSmall]}
            placeholder="blurry, low quality, static, deformed, artifacts..."
            placeholderTextColor="#6B7280"
            value={negativePrompt}
            onChangeText={setNegativePrompt}
            multiline
            numberOfLines={2}
          />

          {/* Camera Motion Selection (for videos) */}
          {mediaType === 'video' && (
            <>
              <Text style={styles.label}>Camera Motion</Text>
              <View style={styles.pillsRow}>
                {CAMERA_MOTIONS.map((motion) => (
                  <Pressable
                    key={motion}
                    style={[styles.pill, selectedMotion === motion && styles.pillSelected]}
                    onPress={() => setSelectedMotion(motion)}>
                    <Text style={[styles.pillText, selectedMotion === motion && styles.pillTextSelected]}>
                      {motion}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* AI Model selection */}
          <Text style={styles.label}>AI Model</Text>
          <View style={styles.pillsRow}>
            {activeModels.map((model) => (
              <Pressable
                key={model}
                style={[styles.pill, selectedModel === model && styles.pillSelected]}
                onPress={() => setSelectedModel(model)}>
                <Text style={[styles.pillText, selectedModel === model && styles.pillTextSelected]}>
                  {model}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Shape selection */}
          <Text style={styles.label}>Card Shape</Text>
          <View style={styles.pillsRow}>
            {SHAPES.map((shape) => (
              <Pressable
                key={shape}
                style={[styles.pill, selectedShape === shape && styles.pillSelected]}
                onPress={() => setSelectedShape(shape)}>
                <Text
                  style={[
                    styles.pillText,
                    selectedShape === shape && styles.pillTextSelected,
                  ]}>
                  {shape === 'square' ? 'Square' : 'Rectangle'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Aspect Ratio selection */}
          <Text style={styles.label}>Aspect Ratio</Text>
          <View style={styles.pillsRow}>
            {RATIOS.map((ratio) => (
              <Pressable
                key={ratio}
                style={[styles.pill, selectedRatio === ratio && styles.pillSelected]}
                onPress={() => setSelectedRatio(ratio)}>
                <Text style={[styles.pillText, selectedRatio === ratio && styles.pillTextSelected]}>
                  {ratio}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Category selection */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.pillsRow}>
            {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <Pressable
                key={cat}
                style={[styles.pill, selectedCategory === cat && styles.pillSelected]}
                onPress={() => setSelectedCategory(cat)}>
                <Text style={[styles.pillText, selectedCategory === cat && styles.pillTextSelected]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tags */}
          <Text style={styles.label}>Tags (Comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="AI Video, Motion, Cyberpunk, 8k"
            placeholderTextColor="#6B7280"
            value={tags}
            onChangeText={setTags}
          />

          {/* Cover image preview selection */}
          <Text style={styles.label}>Select Artwork Thumbnail</Text>
          <View style={styles.imageGrid}>
            {PRESET_IMAGES.map((imgUrl) => (
              <Pressable
                key={imgUrl}
                style={[
                  styles.imageOption,
                  selectedImage === imgUrl && styles.imageOptionSelected,
                ]}
                onPress={() => setSelectedImage(imgUrl)}>
                <Image source={{ uri: imgUrl }} style={styles.presetImage} contentFit="cover" />
                {selectedImage === imgUrl && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: DarkBorder,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DarkSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  publishBtn: {
    backgroundColor: AccentRed,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
  },
  publishBtnDisabled: {
    opacity: 0.4,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  mediaToggleBox: {
    flexDirection: 'row',
    backgroundColor: DarkSurface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  mediaOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mediaOptionActive: {
    backgroundColor: AccentRed,
  },
  mediaOptionText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  mediaOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  label: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: DarkSurface,
    borderWidth: 1,
    borderColor: DarkBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    height: 60,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: DarkSurface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  pillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  pillText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#000000',
    fontWeight: '800',
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  imageOption: {
    flex: 1,
    aspectRatio: 0.8,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: DarkBorder,
    position: 'relative',
  },
  imageOptionSelected: {
    borderColor: AccentRed,
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AccentRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
