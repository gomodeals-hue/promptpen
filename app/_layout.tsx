import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PromptProvider, usePromptContext } from '@/context/PromptContext';
import { Toast } from '@/components/toast';
import { RadialGestureMenu } from '@/components/radial-gesture-menu';
import { CustomDialog } from '@/components/custom-dialog';
import { BoardPickerSheet } from '@/components/board-picker-sheet';
import { MoreOptionsSheet } from '@/components/more-options-sheet';
import { BlurredBackground } from '@/components/blurred-background';
import { AccentRed, DarkBackground, DarkSurface } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: AccentRed,
    background: 'transparent',
    card: DarkSurface,
    text: '#FFFFFF',
    border: '#1F222E',
    notification: AccentRed,
  },
};

function RootAppContent() {
  const {
    toastVisible,
    toastMessage,
    toastIcon,
    hideToast,
    radialPin,
    radialPosition,
    isRadialMenuOpen,
    closeRadialMenu,
    handleRadialAction,
    boardPickerPin,
    isBoardPickerOpen,
    closeBoardPicker,
    boards,
    savePinToBoard,
    createBoard,
    moreOptionsPin,
    isMoreOptionsOpen,
    closeMoreOptions,
    confirmDialogState,
    hideConfirmDialog,
    showConfirmDialog,
    deletePrompt,
    showToast,
  } = usePromptContext();

  return (
    <BlurredBackground>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'AI Studio',
            headerStyle: { backgroundColor: DarkBackground },
            headerTintColor: '#FFFFFF',
          }}
        />
      </Stack>

      {/* Global Long-Press Radial Gesture Dial Menu */}
      <RadialGestureMenu
        visible={isRadialMenuOpen}
        pin={radialPin}
        position={radialPosition}
        onSelectAction={handleRadialAction}
        onClose={closeRadialMenu}
      />

      {/* Global Board Picker Bottom Sheet */}
      <BoardPickerSheet
        visible={isBoardPickerOpen}
        pin={boardPickerPin}
        boards={boards}
        onSelectBoard={(boardId) => {
          if (boardPickerPin) {
            savePinToBoard(boardPickerPin.id, boardId);
          }
        }}
        onCreateBoard={(name) => {
          createBoard(name, boardPickerPin?.imageUrl);
        }}
        onClose={closeBoardPicker}
      />

      {/* Global More Options Sheet */}
      <MoreOptionsSheet
        visible={isMoreOptionsOpen}
        pin={moreOptionsPin}
        onDelete={() => {
          if (moreOptionsPin) {
            showConfirmDialog({
              title: 'Are you sure?',
              message:
                "If you delete this Pin, it'll be gone for good and those who've saved it won't be able to view it.",
              confirmLabel: 'Delete',
              cancelLabel: 'Cancel',
              isDestructive: true,
              onConfirm: () => {
                deletePrompt(moreOptionsPin.id);
                hideConfirmDialog();
              },
            });
          }
        }}
        onEdit={() => {
          showToast('Edit mode opened', 'pencil');
        }}
        onDownload={() => {
          showToast('Image downloaded to gallery', 'download');
        }}
        onCopyLink={() => {
          showToast('Link copied to clipboard', 'link');
        }}
        onReport={() => {
          showToast('Pin reported to moderation', 'flag');
        }}
        onClose={closeMoreOptions}
      />

      {/* Global Confirmation Dialog */}
      <CustomDialog
        visible={confirmDialogState.visible}
        title={confirmDialogState.title}
        message={confirmDialogState.message}
        confirmLabel={confirmDialogState.confirmLabel}
        cancelLabel={confirmDialogState.cancelLabel}
        isDestructive={confirmDialogState.isDestructive}
        onConfirm={confirmDialogState.onConfirm}
        onCancel={confirmDialogState.onCancel || hideConfirmDialog}
      />

      {/* Global Toast Notifications */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        icon={toastIcon as any}
        onHide={hideToast}
      />

      <StatusBar style="light" backgroundColor={DarkBackground} />
    </BlurredBackground>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={CustomDarkTheme}>
      <PromptProvider>
        <RootAppContent />
      </PromptProvider>
    </ThemeProvider>
  );
}
