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
import type { AgeBracket } from '@/types/models';

const BRACKETS: { key: AgeBracket; label: string }[] = [
  { key: '3-5', label: '3–5 Thn' },
  { key: '6-8', label: '6–8 Thn' },
  { key: '9-12', label: '9–12 Thn' },
];

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const registerFamily = useSessionStore((s) => s.registerFamily);

  const [name, setName] = useState('Bunda Anita Rahayu');
  const [email, setEmail] = useState('bunda.anita@keluarga.id');
  const [ageBracket, setAgeBracket] = useState<AgeBracket>('6-8');
  const [password, setPassword] = useState('DongengKeluarga1');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim().includes('@') || password.length < 8) {
      Alert.alert(
        'Lengkapi Data',
        'Pastikan nama, email valid, dan kata sandi minimal 8 karakter.'
      );
      return;
    }
    if (!agreed) {
      Alert.alert('Persetujuan', 'Setujui Ketentuan Layanan & Privasi Anak terlebih dahulu.');
      return;
    }
    await registerFamily(name, email, ageBracket);
    router.replace('/profile-picker');
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
          { paddingTop: Math.max(insets.top, 16) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={styles.navRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.backBtn}
              accessibilityLabel="Kembali ke Sign In"
            >
              <MaterialIcons name="arrow-back" size={20} color={COLORS.midnightBlue} />
            </Pressable>

            <View style={styles.badge}>
              <MaterialIcons name="child-care" size={15} color={COLORS.emeraldLeaf} />
              <Text style={styles.badgeText}>Akun Keluarga Baru</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <MaterialIcons name="auto-stories" size={26} color={COLORS.sunsetOrange} />
            </View>
            <Text style={styles.title}>Daftar Akun Keluarga</Text>
            <Text style={styles.subtitle}>
              Akses ratusan dongeng nusantara interaktif untuk menemani tidur si kecil.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.sheet,
            SHADOWS.sheet,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nama Lengkap Orang Tua</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="person" size={20} color={COLORS.slateGray} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Contoh: Ayah Budi / Bunda Anita"
                placeholderTextColor={COLORS.slateGrayLight}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Alamat Email</Text>
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
            <Text style={styles.label}>Rentang Usia Buah Hati</Text>
            <View style={styles.bracketRow}>
              {BRACKETS.map((item) => {
                const active = ageBracket === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setAgeBracket(item.key)}
                    style={[styles.bracketBtn, active && styles.bracketBtnActive]}
                  >
                    <Text
                      style={[
                        styles.bracketText,
                        active && styles.bracketTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Buat Kata Sandi</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={20} color={COLORS.slateGray} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Minimal 8 karakter"
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

          <Pressable
            onPress={() => setAgreed((v) => !v)}
            style={styles.termsRow}
          >
            <MaterialIcons
              name={agreed ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={agreed ? COLORS.sunsetOrange : COLORS.slateGray}
            />
            <Text style={styles.termsText}>
              Saya menyetujui Ketentuan Layanan Dongeng Nusantara dan Perlindungan Privasi Anak.
            </Text>
          </Pressable>

          <ButtonPrimary
            label="Daftar & Mulai Membaca"
            onPress={handleSubmit}
            trailingIconName="arrow-forward"
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Sudah punya akun? </Text>
            <Pressable onPress={() => router.replace('/(auth)/sign-in')} hitSlop={8}>
              <Text style={styles.loginLink}>Masuk di sini</Text>
            </Pressable>
          </View>
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
    justifyContent: 'space-between',
    gap: 12,
  },
  topSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  navRow: {
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.emeraldLeafLight,
    borderWidth: 1,
    borderColor: 'rgba(27, 142, 131, 0.3)',
  },
  badgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  hero: {
    alignItems: 'center',
    gap: 4,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 122, 69, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.midnightBlue,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.slateGray,
    textAlign: 'center',
    maxWidth: 300,
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 24,
    paddingTop: 22,
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
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
  bracketRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bracketBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
  },
  bracketBtnActive: {
    backgroundColor: 'rgba(255, 122, 69, 0.15)',
    borderColor: COLORS.sunsetOrange,
    borderWidth: 2,
  },
  bracketText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  bracketTextActive: {
    fontFamily: FONTS.bold,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 2,
  },
  termsText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.slateGray,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.slateGray,
  },
  loginLink: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.midnightBlue,
  },
});
