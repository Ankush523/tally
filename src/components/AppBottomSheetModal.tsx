import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {triggerHaptic} from '../haptics/triggerHaptic';
import {useTheme} from '../hooks/useTheme';
import {Motion} from '../theme/motion';
import {Radius} from '../theme/radius';
import {Spacing} from '../theme/spacing';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sheetMaxHeight?: ViewStyle['maxHeight'];
};

function resolveSheetMaxHeight(
  value: ViewStyle['maxHeight'] | undefined,
  windowHeight: number,
): number {
  const fallback = Math.round(windowHeight * 0.85);
  if (value == null) {
    return fallback;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === 'string') {
    const m = value.trim().match(/^([\d.]+)%$/);
    if (m) {
      return Math.round((parseFloat(m[1]) / 100) * windowHeight);
    }
  }
  return fallback;
}

export function AppBottomSheetModal({
  visible,
  onClose,
  children,
  sheetMaxHeight,
}: Props) {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const resolvedMaxHeight = resolveSheetMaxHeight(sheetMaxHeight, windowHeight);
  const bottomPad = Math.max(insets.bottom, Spacing.lg);

  return (
    <Modal
      isVisible={visible}
      deviceWidth={windowWidth}
      deviceHeight={windowHeight}
      onBackdropPress={() => {
        triggerHaptic('light');
        onClose();
      }}
      onBackButtonPress={() => {
        triggerHaptic('light');
        onClose();
      }}
      style={styles.modalRoot}
      backdropColor={colors.overlayScrim}
      backdropOpacity={1}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={Motion.modalInMs}
      animationOutTiming={Motion.modalOutMs}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      avoidKeyboard={false}
      propagateSwipe
      statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.kav, {maxHeight: resolvedMaxHeight}]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled
          style={[styles.scroll, {maxHeight: resolvedMaxHeight}]}
          contentContainerStyle={[
            styles.sheet,
            {
              backgroundColor: colors.sheetSurface,
              paddingBottom: bottomPad,
            },
          ]}>
          <View
            style={[styles.grabRail, {backgroundColor: colors.gray100}]}
            accessibilityLabel="Sheet handle"
          />
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  kav: {
    width: '100%',
  },
  scroll: {
    width: '100%',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  sheet: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  grabRail: {
    alignSelf: 'center',
    width: 40,
    height: 3,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
});
