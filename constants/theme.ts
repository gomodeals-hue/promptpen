import { Platform } from 'react-native';

// Signature PromptPen Red & OLED Pitch Dark Aesthetic (Inspired by reference images)
export const AccentColor = '#E60023';
export const AccentColorHover = '#CC001F';
export const AccentColorMuted = 'rgba(230, 0, 35, 0.16)';
export const AccentRed = '#E60023';

// Pitch Black OLED Palette
export const DarkBackground = '#000000';
export const DarkSurface = '#0E1015';
export const DarkCard = '#161922';
export const DarkCardHover = '#1E222E';
export const DarkBorder = '#222634';
export const DarkBorderLight = 'rgba(255, 255, 255, 0.1)';

// Text Palette
export const TextPrimary = '#FFFFFF';
export const TextSecondary = '#9CA3AF';
export const TextMuted = '#6B7280';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#FFFFFF',
    surface: '#F4F5F7',
    card: '#FFFFFF',
    border: '#E2E4E8',
    tint: AccentColor,
    accent: AccentColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: AccentColor,
  },
  dark: {
    text: TextPrimary,
    textSecondary: TextSecondary,
    textMuted: TextMuted,
    background: DarkBackground,
    surface: DarkSurface,
    card: DarkCard,
    border: DarkBorder,
    tint: AccentColor,
    accent: AccentColor,
    accentHover: AccentColorHover,
    accentMuted: AccentColorMuted,
    icon: TextSecondary,
    tabIconDefault: TextMuted,
    tabIconSelected: AccentColor,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Outfit', 'Inter', -apple-system, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
