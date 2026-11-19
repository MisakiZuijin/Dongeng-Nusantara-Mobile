import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS } from '@/constants/theme';
import { useSessionStore } from '@/store/useSessionStore';

export default function SplashScreenRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isBooted = useSessionStore((s) => s.isBooted);
  const onboardingDone = useSessionStore((s) => s.onboardingDone);
  const sessionMode = useSessionStore((s) => s.sessionMode);
  const activeProfile = useSessionStore((s) => s.activeProfile);

  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(withTiming(-8, { duration: 2200 }), -1, true);
  }, [floatY]);

  useEffect(() => {
    if (!isBooted) return;
    const timer = setTimeout(() => {
      if (!onboardingDone) {
        router.replace('/onboarding');
      } else if (sessionMode === 'none') {
        router.replace('/(auth)/sign-in');
      } else if (!activeProfile) {
        router.replace('/profile-picker');
      } else {
        router.replace('/(drawer)/home');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [isBooted, onboardingDone, sessionMode, activeProfile, router]);

  const animatedBookStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <LinearGradient
      colors={[COLORS.midnightBlue, '#2A2E63', COLORS.twilightPurple]}
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 28) },
      ]}
    >
      <StatusBar style="light" />

      <View style={styles.topSpacer} />

      <View style={styles.center}>
        <Animated.View style={[styles.portalRing, animatedBookStyle]}>
          <View style={styles.portalInner}>
            <MaterialIcons name="auto-stories" size={68} color={COLORS.goldenAccent} />
          </View>
          <View style={[styles.firefly, styles.fireflyTop]}>
            <View style={styles.fireflyCore} />
          </View>
          <View style={[styles.firefly, styles.fireflyBottom]}>
            <View style={styles.fireflyCore} />
          </View>
        </Animated.View>

        <View style={styles.eyebrowPill}>
          <MaterialIcons name="auto-awesome" size={14} color={COLORS.goldenAccent} />
          <Text style={styles.eyebrowText}>Dongeng & Cerita Pengantar Tidur</Text>
        </View>

        <Text style={styles.brandTitle}>
          Dongeng <Text style={styles.brandAccent}>Nusantara</Text>
        </Text>
        <Text style={styles.tagline}>
          Menghidupkan dongeng warisan leluhur penuh kehangatan & pesan moral
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, { backgroundColor: COLORS.sunsetOrange }]} />
          <View style={[styles.dot, { backgroundColor: COLORS.goldenYellow }]} />
          <View style={[styles.dot, { backgroundColor: COLORS.emeraldLeaf }]} />
        </View>
        <View style={styles.safeRow}>
          <MaterialIcons name="bedtime" size={16} color={COLORS.goldenAccent} />
          <Text style={styles.safeText}>Aman untuk anak usia 3–10 tahun</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topSpacer: {
    height: 16,
  },
  center: {
    alignItems: 'center',
    gap: 14,
  },
  portalRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 209, 102, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  portalInner: {
    width: 184,
    height: 184,
    borderRadius: 92,
    backgroundColor: 'rgba(30, 34, 70, 0.72)',
    borderWidth: 3,
    borderColor: 'rgba(255, 249, 240, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  firefly: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 184, 0, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireflyTop: {
    top: 12,
    right: 18,
  },
  fireflyBottom: {
    bottom: 20,
    left: 16,
  },
  fireflyCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.goldenYellow,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  eyebrowText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.goldenAccent,
  },
  brandTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 30,
    color: COLORS.warmCreamAlt,
    textAlign: 'center',
  },
  brandAccent: {
    color: COLORS.goldenAccent,
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255, 249, 240, 0.88)',
    textAlign: 'center',
    maxWidth: 280,
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  safeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  safeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.warmCream,
  },
});
