import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppearancePicker} from '../components/AppearancePicker';
import {PrimaryButton} from '../components/PrimaryButton';
import {useTheme} from '../hooks/useTheme';
import type {RootStackParamList} from '../navigation/types';
import {useAuthStore} from '../stores/authStore';
import {Radius} from '../theme/radius';
import {brutalBorderWidth, cardShadow} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen(_props: Props) {
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  const sampleEmail = useAuthStore(s => s.sampleEmail);
  const login = useAuthStore(s => s.login);
  const logout = useAuthStore(s => s.logout);

  const [email, setEmail] = useState('demo@tally.app');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSignIn = () => {
    const trimmed = email.trim();
    if (!trimmed.includes('@') || trimmed.length < 5) {
      setError('Enter a valid-looking email (demo only).');
      return;
    }
    if (password.length < 1) {
      setError('Enter any password for this demo.');
      return;
    }
    setError(null);
    login(trimmed);
  };

  const onSignOut = () => {
    setError(null);
    logout();
  };

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: canvas}]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <Text style={[Typography.screenTitle, {color: colors.textPrimary}]}>
            Profile
          </Text>
          <Text style={[Typography.metadata, {color: colors.textMuted}]}>
            Account and display preferences stay on this device.
          </Text>

          <View
            style={[
              styles.card,
              cardShadow(colors),
              {
                borderColor: colors.cardRim,
                backgroundColor: colors.surfaceRaised,
              },
            ]}>
            <Text style={[Typography.labelCaps, {color: colors.textSecondary}]}>
              APPEARANCE
            </Text>
            <Text style={[Typography.metadata, {color: colors.textMuted}]}>
              Light, dark, or match your system setting.
            </Text>
            <AppearancePicker />
          </View>

          <View
            style={[
              styles.card,
              cardShadow(colors),
              {
                borderColor: colors.cardRim,
                backgroundColor: colors.surfaceRaised,
              },
            ]}>
            {isLoggedIn ? (
              <>
                <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>
                  SIGNED IN AS
                </Text>
                <Text style={[Typography.body, {color: colors.textPrimary}]}>
                  {sampleEmail}
                </Text>
                <PrimaryButton label="Log out" variant="ghost" onPress={onSignOut} />
              </>
            ) : (
              <>
                <Text style={[Typography.sectionHeader, {color: colors.textPrimary}]}>
                  Sign in
                </Text>
                <Text style={[Typography.metadata, {color: colors.textSecondary}]}>
                  Use any email with @ and a password — both stay on this device only.
                </Text>
                <TextInput
                  value={email}
                  onChangeText={t => {
                    setEmail(t);
                    setError(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Email"
                  style={[
                    styles.input,
                    {
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: colors.sheetSurface,
                    },
                  ]}
                />
                <TextInput
                  value={password}
                  onChangeText={t => {
                    setPassword(t);
                    setError(null);
                  }}
                  secureTextEntry
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Password"
                  style={[
                    styles.input,
                    {
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: colors.sheetSurface,
                    },
                  ]}
                />
                {error ? (
                  <Text style={[Typography.metadata, {color: colors.ember}]}>{error}</Text>
                ) : null}
                <PrimaryButton label="Sign in" onPress={onSignIn} />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1},
  flex: {flex: 1},
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: brutalBorderWidth,
    gap: Spacing.md,
  },
  input: {
    borderWidth: 2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 52,
    fontSize: 16,
  },
});
