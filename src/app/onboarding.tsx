import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ButtonPrimary } from '@/components/ButtonPrimary';
import { StoryArtwork } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useSessionStore } from '@/store/useSessionStore';
import type { StoryArtworkKey } from '@/types/models';

const SLIDES: {
  title: string;
  description: string;
  tag: string;
  artworkKey: StoryArtworkKey;
  badge: string;
  chip1: string;
  chip2: string;
}[] = [
  {
    title: 'Jelajahi Keajaiban Cerita Rakyat Nusantara',
    description:
      'Kumpulan dongeng interaktif dengan ilustrasi memukau dan pesan moral untuk menemani waktu tidur buah hati.',
    tag: 'Warisan Cerita Ramah Anak',
    artworkKey: 'sang-kancil',
    badge: 'Dongeng Si Kancil & Nusantara',
    chip1: 'Audio Sulih Suara',
    chip2: 'Ilustrasi Sentuh',
  },
  {
    title: 'Alunan Gamelan & Suara Alam Pengantar Tidur',
    description:
      'Bantu si kecil tidur lebih lelap dengan musik tradisional lembut, timer otomatis, dan kontrol layar kunci.',
    tag: 'Nyaman untuk Mata Malam',
    artworkKey: 'gamelan',
    badge: 'Alunan Gamelan Lir-Ilir',
    chip1: 'Sleep Timer 15–60m',
    chip2: 'Putar Background',
  },
  {
    title: 'Aman Tanpa Iklan & Bisa Dibaca Offline',
    description:
      'Setiap anak punya profil, rak buku favorit, serta tantangan membaca 7 hari yang tersimpan lokal.',
    tag: 'Kendali Penuh Orang Tua',
    artworkKey: 'timun-mas',
    badge: 'Timun Mas & Buto Ijo',
    chip1: 'Multi-Profil Anak',
    chip2: 'Bebas Iklan',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);
  const [slideIndex, setSlideIndex] = useState(0);

  const slide = SLIDES[slideIndex];
  const isLast = slideIndex === SLIDES.length - 1;

  const handlePrimary = async () => {
    if (!isLast) {
      setSlideIndex((prev) => prev + 1);
      return;
    }
    await completeOnboarding();
    router.replace('/(auth)/sign-in');
  };

  const handleSignIn = async () => {
    await completeOnboarding();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <LinearGradient
        colors={[COLORS.softPeachAlt, COLORS.warmCream]}
        style={[styles.topSection, { paddingTop: Math.max(insets.top, 16) }]}
      >
        <View style={styles.topUtilityRow}>
          <Pressable
            onPress={() => router.replace('/(auth)/sign-in')}
            hitSlop={10}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Lewati</Text>
          </Pressable>

          <View style={styles.ambientPill}>
            <MaterialIcons name="music-note" size={16} color={COLORS.sunsetOrange} />
            <Text style={styles.ambientText}>Gamelan Pengantar Tidur</Text>
          </View>
        </View>

        <View style={styles.artWrapper}>
          <StoryArtwork
            artworkKey={slide.artworkKey}
            badgeText={slide.badge}
            style={styles.artCard}
            size="lg"
          />
        </View>

        <View style={styles.tagRow}>
          <View style={styles.emeraldDot} />
          <Text style={styles.tagText}>{slide.tag.toUpperCase()}</Text>
        </View>
      </LinearGradient>

      <View
        style={[
          styles.sheet,
          SHADOWS.sheet,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      >
        <View style={styles.handle} />

        <View style={styles.copyStack}>
          <Text style={styles.headline}>{slide.title}</Text>
          <Text style={styles.body}>{slide.description}</Text>

          <View style={styles.chipsRow}>
            <View style={styles.chipTeal}>
              <MaterialIcons
                name="record-voice-over"
                size={15}
                color={COLORS.emeraldLeaf}
              />
              <Text style={styles.chipText}>{slide.chip1}</Text>
            </View>
            <View style={styles.chipOrange}>
              <MaterialIcons name="touch-app" size={15} color={COLORS.sunsetOrange} />
              <Text style={styles.chipText}>{slide.chip2}</Text>
            </View>
          </View>
        </View>

        <View style={styles.controlsStack}>
          <View style={styles.paginationRow}>
            {SLIDES.map((_, idx) => {
              const active = idx === slideIndex;
              return (
                <Pressable
                  key={idx}
                  onPress={() => setSlideIndex(idx)}
                  hitSlop={8}
                  style={[styles.pgDot, active && styles.pgDotActive]}
                />
              );
            })}
          </View>

          <ButtonPrimary
            label={isLast ? 'Mulai Membaca' : 'Lanjut'}
            onPress={handlePrimary}
            trailingIconName="arrow-forward"
            style={{ width: '100%' }}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Sudah memiliki akun orang tua? </Text>
            <Pressable onPress={handleSignIn} hitSlop={8}>
              <Text style={styles.loginLink}>Masuk</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.warmCream,
  },
  topSection: {
    flex: 1.15,
    paddingHorizontal: 24,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  topUtilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  skipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.slateGray,
  },
  ambientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  ambientText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  artWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  artCard: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 4 / 3,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emeraldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.emeraldLeaf,
  },
  tagText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.midnightBlue,
    letterSpacing: 0.6,
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 24,
    paddingTop: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(160, 166, 194, 0.45)',
  },
  copyStack: {
    alignItems: 'center',
    gap: 10,
  },
  headline: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    lineHeight: 29,
    color: COLORS.midnightBlue,
    textAlign: 'center',
    maxWidth: 310,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.slateGray,
    textAlign: 'center',
    maxWidth: 320,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  chipTeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.emeraldLeafLight,
    borderWidth: 1,
    borderColor: 'rgba(27, 142, 131, 0.3)',
  },
  chipOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 69, 0.3)',
  },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  controlsStack: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  paginationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pgDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(160, 166, 194, 0.45)',
  },
  pgDotActive: {
    width: 28,
    backgroundColor: COLORS.sunsetOrange,
  },
  loginRow: {
    flexDirection: 'row',
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
