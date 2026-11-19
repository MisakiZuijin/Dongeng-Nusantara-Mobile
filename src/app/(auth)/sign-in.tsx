import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ButtonPrimary } from '@/components/ButtonPrimary';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useSessionStore } from '@/store/useSessionStore';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loginWithAccount = useSessionStore((s) => s.loginWithAccount);
  const loginAsGuest = useSessionStore((s) => s.loginAsGuest);

  const [email, setEmail] = useState('bunda.anita@keluarga.id');
  const [password, setPassword] = useState('DongengMalam123');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim().includes('@') || password.trim().length < 4) {
      Alert.alert('Periksa Masukan', 'Masukkan email dan kata sandi yang valid.');
      return;
    }
    await loginWithAccount(email);
    router.replace('/profile-picker');
  };

  const handleGoogleMock = async () => {
    await loginWithAccount('keluarga.google@dongeng.id');
    router.replace('/profile-picker');
  };

  const handleGuest = async () => {
    await loginAsGuest();
    router.replace('/profile-picker');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Lupa Kata Sandi',
      'Pada mode MVP lokal, Anda dapat langsung masuk sebagai Tamu atau membuat akun keluarga baru tanpa kehilangan cerita offline.'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Pressable
            onPress={() => router.replace('/onboarding')}
            hitSlop={10}
            style={styles.backBtn}
            accessibilityLabel="Kembali ke Onboarding"
          >
            <MaterialIcons name="arrow-back" size={20} color={COLORS.midnightBlue} />
          </Pressable>

          <View style={styles.portalPill}>
            <MaterialIcons name="family-restroom" size={16} color={COLORS.goldenYellow} />
            <Text style={styles.portalText}>Portal Orang Tua</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.owlCard}>
            <MaterialIcons name="menu-book" size={40} color={COLORS.sunsetOrange} />
          </View>
          <Text style={styles.title}>Selamat Datang Kembali!</Text>
          <Text style={styles.subtitle}>
            Masuk untuk menyimpan progres baca dan koleksi dongeng favorit si kecil.
          </Text>
        </View>

        <View style={[styles.formCard, SHADOWS.card]}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Orang Tua</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="mail" size={20} color={COLORS.slateGray} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="nama@email.com"
                placeholderTextColor={COLORS.slateGrayLight}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Kata Sandi</Text>
              <Pressable onPress={handleForgotPassword} hitSlop={8}>
                <Text style={styles.forgotLink}>Lupa Kata Sandi?</Text>
              </Pressable>
            </View>
            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={20} color={COLORS.slateGray} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Masukkan kata sandi"
                placeholderTextColor={COLORS.slateGrayLight}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={COLORS.slateGray}
                />
              </Pressable>
            </View>
          </View>

          <ButtonPrimary
            label="Masuk"
            onPress={handleLogin}
            trailingIconName="arrow-forward"
            style={{ marginTop: 4 }}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau masuk dengan</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={handleGoogleMock} style={styles.googleBtn}>
            <Text style={styles.googleBadge}>G</Text>
            <Text style={styles.googleText}>Lanjutkan dengan Google</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Belum punya akun? </Text>
            <Pressable onPress={() => router.push('/(auth)/sign-up')} hitSlop={8}>
              <Text style={styles.signupLink}>Daftar Sekarang</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleGuest} style={styles.guestBtn} hitSlop={8}>
            <MaterialIcons name="explore" size={16} color={COLORS.sunsetOrange} />
            <Text style={styles.guestText}>Lanjut sebagai Tamu (Tanpa Akun)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.warmCream,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  portalText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
  },
  owlCard: {
    width: 140,
    height: 82,
    borderRadius: RADIUS.default,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.midnightBlue,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.slateGray,
    textAlign: 'center',
    maxWidth: 300,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  forgotLink: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.lightSecondary,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.midnightBlue,
    paddingVertical: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderSoft,
  },
  dividerText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.slateGray,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.white,
  },
  googleBadge: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    color: '#4285F4',
  },
  googleText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupPrompt: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.slateGray,
  },
  signupLink: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.lightSecondary,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
  },
  guestText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
});
