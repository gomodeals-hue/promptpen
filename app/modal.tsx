import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { usePromptContext } from '@/context/PromptContext';
import { PromptItem, MediaKind, AIModelType } from '@/constants/prompts';
import {
  AccentColor,
  DarkBackground,
  DarkSurface,
  DarkCard,
  DarkBorder,
} from '@/constants/theme';

const IMAGE_MODELS: AIModelType[] = ['Midjourney v6', 'Flux.1 Pro', 'DALL-E 3', 'Stable Diffusion XL'];
const VIDEO_MODELS: AIModelType[] = ['Runway Gen-3', 'OpenAI Sora', 'Luma Dream Machine', 'Kling AI', 'Pika 2.0'];
const RATIOS = ['9:16', '3:4', '1:1', '16:9'] as const;
const CAMERA_MOTIONS = ['FPV Drone Dive', 'Slow Orbit + Pan', 'Macro Push-In Zoom', 'Continuous Forward Dolly'] as const;

const PRESETS = [
  {
    type: 'video' as MediaKind,
    title: 'Neo-Tokyo Cyber Highway',
    prompt: 'FPV cinematic drone camera diving through rain-soaked Neo-Tokyo skyscrapers with laser trails and hyper-realistic wet reflections, 4k 60fps video --motion 8',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80',
    model: 'Runway Gen-3' as AIModelType,
    cameraMotion: 'FPV Drone Dive',
    videoDuration: '0:08',
  },
  {
    type: 'image' as MediaKind,
    title: 'Cyberpunk Neon Coat',
    prompt: 'Hyper-detailed cinematic portrait of an urban cyber stylist wearing high-tech luminous electric lime trench, volumetric rain lighting, 8k --ar 3:4',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    model: 'Midjourney v6' as AIModelType,
  },
];

export default function ModalScreen() {
  const { addPrompt, showToast, openProductPage } = usePromptContext();

  const [mediaType, setMediaType] = useState<MediaKind>('video');
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [selectedModel, setSelectedModel] = useState<AIModelType>('Runway Gen-3');
  const [selectedRatio, setSelectedRatio] = useState<typeof RATIOS[number]>('9:16');
  const [selectedMotion, setSelectedMotion] = useState<typeof CAMERA_MOTIONS[number]>('FPV Drone Dive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(PRESETS[0].image);

  const activeModels = mediaType === 'video' ? VIDEO_MODELS : IMAGE_MODELS;

  const handleMediaTypeChange = (type: MediaKind) => {
    setMediaType(type);
    if (type === 'video') {
      setSelectedModel('Runway Gen-3');
      setPrompt(PRESETS[0].prompt);
      setGeneratedImg(PRESETS[0].image);
    } else {
      setSelectedModel('Midjourney v6');
      setPrompt(PRESETS[1].prompt);
      setGeneratedImg(PRESETS[1].image);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    showToast(mediaType === 'video' ? 'Rendering AI video sequence...' : 'Synthesizing neural art...', 'hourglass-outline');

    setTimeout(() => {
      setIsGenerating(false);
      const randomPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
      setGeneratedImg(randomPreset.image);
      showToast(mediaType === 'video' ? 'AI Video synthesized' : 'Image generated', 'sparkles');
    }, 1400);
  };

  const handleCopyPrompt = async () => {
    if (!prompt.trim()) return;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(prompt.trim());
      }
      showToast('Prompt copied to clipboard', 'copy');
    } catch (e) {
      showToast('Prompt copied', 'copy');
    }
  };

  const handlePublishToFeed = () => {
    if (!prompt.trim() || !generatedImg) return;

    const newPin: PromptItem = {
      id: `pin-studio-${Date.now()}`,
      title: mediaType === 'video' ? 'AI Video Creation' : 'Studio Image Creation',
      prompt: prompt.trim(),
      imageUrl: generatedImg,
      aspectRatio: selectedRatio === '1:1' ? 1.0 : selectedRatio === '16:9' ? 1.33 : selectedRatio === '9:16' ? 0.72 : 0.75,
      shape: selectedRatio === '1:1' ? 'square' : 'rectangle',
      mediaType,
      videoDuration: mediaType === 'video' ? '0:08' : undefined,
      cameraMotion: mediaType === 'video' ? selectedMotion : undefined,
      category: mediaType === 'video' ? 'Videos' : 'Trending',
      tags: [mediaType === 'video' ? 'AI Video' : 'AI Image', selectedModel, 'PromptPen'],
      model: selectedModel,
      author: {
        name: 'You',
        handle: '@creator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      likes: 1,
      saves: 0,
      createdAt: 'Just now',
      cfgScale: 7.5,
      seed: Math.floor(Math.random() * 900000000) + 100000000,
      fps: mediaType === 'video' ? 60 : undefined,
    };

    addPrompt(newPin);
    router.back();
    openProductPage(newPin);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Minimal Brand Tag */}
      <View style={styles.brandRow}>
        <Text style={styles.brandPrimary}>Prompt</Text>
        <Text style={styles.brandAccent}>Pen</Text>
        <View style={styles.brandDot} />
      </View>

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name={mediaType === 'video' ? 'videocam' : 'sparkles'} size={24} color={AccentColor} />
        </View>
        <Text style={styles.title}>AI Video & Image Studio</Text>
        <Text style={styles.subtitle}>Craft, copy, and synthesize prompts into pins</Text>
      </View>

      {/* Media Type Switcher: Video vs Image */}
      <View style={styles.mediaSwitchRow}>
        <Pressable
          style={[styles.mediaTab, mediaType === 'video' && styles.mediaTabActive]}
          onPress={() => handleMediaTypeChange('video')}>
          <Ionicons
            name="videocam"
            size={16}
            color={mediaType === 'video' ? '#000000' : '#9CA3AF'}
          />
          <Text style={[styles.mediaTabText, mediaType === 'video' && styles.mediaTabTextActive]}>
            AI Video Prompt
          </Text>
        </Pressable>

        <Pressable
          style={[styles.mediaTab, mediaType === 'image' && styles.mediaTabActive]}
          onPress={() => handleMediaTypeChange('image')}>
          <Ionicons
            name="image"
            size={16}
            color={mediaType === 'image' ? '#000000' : '#9CA3AF'}
          />
          <Text style={[styles.mediaTabText, mediaType === 'image' && styles.mediaTabTextActive]}>
            AI Image Prompt
          </Text>
        </Pressable>
      </View>

      {/* Prompt Editor Card */}
      <View style={styles.card}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {mediaType === 'video' ? 'Motion & Scene Prompt' : 'Prompt Text'}
          </Text>
          <Pressable style={styles.copyInlineBtn} onPress={handleCopyPrompt}>
            <Ionicons name="copy-outline" size={13} color={AccentColor} />
            <Text style={styles.copyInlineText}>Copy</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          multiline
          numberOfLines={3}
          value={prompt}
          onChangeText={setPrompt}
          placeholder={mediaType === 'video' ? 'Describe camera motion and action...' : 'Describe your vision...'}
          placeholderTextColor="#6B7280"
        />

        {/* Model Pills */}
        <Text style={styles.label}>AI Engine Model</Text>
        <View style={styles.pillsRow}>
          {activeModels.map((m) => (
            <Pressable
              key={m}
              style={[styles.pill, selectedModel === m && styles.pillSelected]}
              onPress={() => setSelectedModel(m)}>
              <Text style={[styles.pillText, selectedModel === m && styles.pillTextSelected]}>
                {m}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Video Camera Movement Selector */}
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

        {/* Ratio Pills */}
        <Text style={styles.label}>Aspect Ratio</Text>
        <View style={styles.pillsRow}>
          {RATIOS.map((r) => (
            <Pressable
              key={r}
              style={[styles.pill, selectedRatio === r && styles.pillSelected]}
              onPress={() => setSelectedRatio(r)}>
              <Text style={[styles.pillText, selectedRatio === r && styles.pillTextSelected]}>
                {r}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={isGenerating}>
          <Ionicons
            name={isGenerating ? 'hourglass-outline' : mediaType === 'video' ? 'videocam' : 'flash'}
            size={18}
            color="#000000"
          />
          <Text style={styles.generateBtnText}>
            {isGenerating ? 'Synthesizing...' : mediaType === 'video' ? 'Render Video Preview' : 'Generate Image'}
          </Text>
        </Pressable>
      </View>

      {/* Output preview */}
      {generatedImg && (
        <View style={styles.previewCard}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              {mediaType === 'video' ? 'Synthesized Video Sequence' : 'Synthesized Artwork'}
            </Text>
            <Pressable style={styles.copyInlineBtn} onPress={handleCopyPrompt}>
              <Ionicons name="copy-outline" size={13} color={AccentColor} />
              <Text style={styles.copyInlineText}>Copy Prompt</Text>
            </Pressable>
          </View>

          <Image
            source={{ uri: generatedImg }}
            style={styles.previewImage}
            contentFit="cover"
          />

          <Pressable style={styles.publishBtn} onPress={handlePublishToFeed}>
            <Ionicons name="cloud-upload-outline" size={18} color="#000000" />
            <Text style={styles.publishBtnText}>Publish to PromptPen Feed</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>Return to Feed</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkBackground,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandPrimary: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: AccentColor,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AccentColor,
    marginLeft: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: DarkSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AccentColor,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  mediaSwitchRow: {
    flexDirection: 'row',
    backgroundColor: DarkSurface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: DarkBorder,
    width: '100%',
  },
  mediaTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mediaTabActive: {
    backgroundColor: AccentColor,
  },
  mediaTabText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  mediaTabTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  card: {
    width: '100%',
    backgroundColor: DarkCard,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkBorder,
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  label: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
  },
  copyInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 255, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  copyInlineText: {
    color: AccentColor,
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    backgroundColor: DarkSurface,
    borderRadius: 14,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: DarkBorder,
    marginBottom: 12,
    textAlignVertical: 'top',
    height: 80,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    backgroundColor: DarkSurface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DarkBorder,
  },
  pillSelected: {
    backgroundColor: AccentColor,
    borderColor: AccentColor,
  },
  pillText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AccentColor,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  previewCard: {
    width: '100%',
    backgroundColor: DarkCard,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: DarkBorder,
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 14,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AccentColor,
    paddingVertical: 14,
    borderRadius: 16,
  },
  publishBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  backLink: {
    paddingVertical: 12,
  },
  backLinkText: {
    color: AccentColor,
    fontSize: 14,
    fontWeight: '700',
  },
});
