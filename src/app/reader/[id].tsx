import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudioPlayer } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ButtonPrimary } from '@/components/ButtonPrimary';
import { StoryArtwork } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { getStoryById, getStoryPages } from '@/db/database';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSessionStore } from '@/store/useSessionStore';
import type { SfxKey, StoryHotspot, StoryPage, StoryWithProgress } from '@/types/models';

const SFX_SOURCES: Record<SfxKey, number> = {
  sfx_chime: require('../../../assets/audio/sfx_chime.wav'),
  sfx_wave: require('../../../assets/audio/sfx_wave.wav'),
};

const FONT_SIZES = [15, 17, 20] as const;

function HotspotBadge({
  hotspot,
  onPress,
}: {
  hotspot: StoryHotspot;
  onPress: () => void;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.22, { duration: 1100 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const bg =
    hotspot.badgeColor === 'teal'
      ? COLORS.emeraldLeaf
      : hotspot.badgeColor === 'orange'
      ? COLORS.sunsetOrange
      : COLORS.goldenAccent;

  const textColor =
    hotspot.badgeColor === 'gold' ? COLORS.midnightBlue : COLORS.white;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={[
        styles.hotspotWrap,
        {
          left: `${hotspot.xPercent}%`,
          top: `${hotspot.yPercent}%`,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={hotspot.label}
    >
      <View style={styles.hotspotIconRow}>
        <Animated.View
          style={[
            styles.hotspotPulse,
            { backgroundColor: bg },
            pulseStyle,
          ]}
        />
        <View style={[styles.hotspotCircle, { backgroundColor: bg }]}>
          <MaterialIcons
            name={hotspot.sfxKey === 'sfx_wave' ? 'waves' : 'touch-app'}
            size={16}
            color={textColor}
          />
        </View>
      </View>
      <View style={styles.hotspotLabelPill}>
        <Text style={styles.hotspotLabelText}>{hotspot.label}</Text>
      </View>
    </Pressable>
  );
}

function HighlightedParagraph({
  text,
  phrase,
  fontSize,
  nightMode,
}: {
  text: string;
  phrase: string | null;
  fontSize: number;
  nightMode: boolean;
}) {
  const textColor = nightMode ? COLORS.warmCreamAlt : COLORS.midnightBlue;
  const lineHeight = fontSize + 10;

  if (!phrase || !text.includes(phrase)) {
    return (
      <Text style={[styles.storyText, { fontSize, lineHeight, color: textColor }]}>
        {text}
      </Text>
    );
  }

  const idx = text.indexOf(phrase);
  const before = text.slice(0, idx);
  const after = text.slice(idx + phrase.length);

  return (
    <Text style={[styles.storyText, { fontSize, lineHeight, color: textColor }]}>
      {before}
      <Text
        style={[
          styles.highlightedSpan,
          {
            backgroundColor: nightMode
              ? 'rgba(255, 184, 0, 0.28)'
              : COLORS.karaokeHighlight,
            color: nightMode ? COLORS.goldenAccent : COLORS.midnightBlue,
          },
        ]}
      >
        {phrase}
      </Text>
      {after}
    </Text>
  );
}

export default function StoryReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeProfile = useSessionStore((s) => s.activeProfile);
  const recordReadingStreak = useSessionStore((s) => s.recordReadingStreak);
  const saveProgress = useLibraryStore((s) => s.saveProgress);

  const [story, setStory] = useState<StoryWithProgress | null>(null);
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontIdx, setFontIdx] = useState(1);
  const [nightMode, setNightMode] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [completionModal, setCompletionModal] = useState(false);
  const [updatedStreak, setUpdatedStreak] = useState(0);
  const [sfxFeedback, setSfxFeedback] = useState<string | null>(null);

  const chimePlayer = useAudioPlayer(SFX_SOURCES.sfx_chime);
  const wavePlayer = useAudioPlayer(SFX_SOURCES.sfx_wave);
  const narrationAmbient = useAudioPlayer(
    require('../../../assets/audio/lullaby_gamelan.wav')
  );

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      setLoading(true);
      const profileId = activeProfile?.id ?? 'profile-adek';
      const [s, pList] = await Promise.all([
        getStoryById(id, profileId),
        getStoryPages(id),
      ]);
      if (!active) return;
      setStory(s);
      setPages(pList);
      const initialIdx = s
        ? Math.min(Math.max(0, s.currentPage - 1), Math.max(0, pList.length - 1))
        : 0;
      setPageIdx(initialIdx);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id, activeProfile?.id]);

  useEffect(() => {
    narrationAmbient.loop = true;
    if (isNarrating && !isMuted) {
      narrationAmbient.volume = 0.4;
      narrationAmbient.play();
    } else {
      narrationAmbient.pause();
    }
  }, [isNarrating, isMuted, narrationAmbient]);

  const currentPage = pages[pageIdx];

  const handleTriggerHotspot = (hs: StoryHotspot) => {
    setSfxFeedback(hs.label);
    setTimeout(() => setSfxFeedback(null), 1600);
    if (isMuted) return;
    const p = hs.sfxKey === 'sfx_wave' ? wavePlayer : chimePlayer;
    p.seekTo(0);
    p.play();
  };

  const handlePrev = async () => {
    if (pageIdx <= 0 || !story || !activeProfile?.id) return;
    const nextIdx = pageIdx - 1;
    setPageIdx(nextIdx);
    await saveProgress(
      activeProfile.id,
      story.id,
      nextIdx + 1,
      pages.length,
      false
    );
  };

  const handleNext = async () => {
    if (!story || !activeProfile?.id) return;
    if (pageIdx < pages.length - 1) {
      const nextIdx = pageIdx + 1;
      setPageIdx(nextIdx);
      await saveProgress(
        activeProfile.id,
        story.id,
        nextIdx + 1,
        pages.length,
        false
      );
      return;
    }

    await saveProgress(
      activeProfile.id,
      story.id,
      pages.length,
      pages.length,
      true
    );
    const streak = await recordReadingStreak();
    setUpdatedStreak(streak);
    setIsNarrating(false);
    setCompletionModal(true);
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={COLORS.sunsetOrange} />
      </View>
    );
  }

  if (!story || !currentPage) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorTitle}>Halaman cerita tidak tersedia.</Text>
        <ButtonPrimary label="Kembali" onPress={() => router.back()} />
      </View>
    );
  }

  const bgSurface = nightMode ? COLORS.midnightBlue : COLORS.warmCream;

  return (
    <View style={[styles.root, { backgroundColor: bgSurface }]}>
      <StatusBar style={nightMode ? 'light' : 'dark'} />

      {/* Upper 62% Scene Illustration + Floating Controls */}
      <View style={styles.sceneWrap}>
        <StoryArtwork
          artworkKey={currentPage.artworkKey}
          style={styles.sceneArt}
          size="lg"
        />

        {currentPage.hotspots.map((hs) => (
          <HotspotBadge
            key={hs.id}
            hotspot={hs}
            onPress={() => handleTriggerHotspot(hs)}
          />
        ))}

        {sfxFeedback ? (
          <View style={styles.sfxToast}>
            <MaterialIcons name="graphic-eq" size={16} color={COLORS.goldenAccent} />
            <Text style={styles.sfxToastText}>{sfxFeedback}</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.floatingControls,
            { paddingTop: Math.max(insets.top, 14) },
          ]}
        >
          <Pressable
            onPress={() => {
              setIsNarrating(false);
              router.back();
            }}
            hitSlop={10}
            style={styles.circleBtn}
            accessibilityLabel="Tutup Pembaca"
          >
            <MaterialIcons name="close" size={20} color={COLORS.midnightBlue} />
          </Pressable>

          <View style={styles.pagePill}>
            <Text style={styles.pagePillText}>
              Halaman {pageIdx + 1} / {pages.length}
            </Text>
          </View>

          <View style={styles.rightControls}>
            <Pressable
              onPress={() => setIsMuted((v) => !v)}
              hitSlop={8}
              style={styles.circleBtn}
              accessibilityLabel="Matikan atau Hidupkan Suara"
            >
              <MaterialIcons
                name={isMuted ? 'volume-off' : 'volume-up'}
                size={20}
                color={isMuted ? COLORS.slateGray : COLORS.sunsetOrange}
              />
            </Pressable>

            <Pressable
              onPress={() => setFontIdx((i) => (i + 1) % FONT_SIZES.length)}
              hitSlop={8}
              style={styles.circleBtn}
              accessibilityLabel="Ubah Ukuran Tulisan"
            >
              <Text style={styles.aaText}>Aa</Text>
            </Pressable>

            <Pressable
              onPress={() => setNightMode((v) => !v)}
              hitSlop={8}
              style={styles.circleBtn}
              accessibilityLabel="Mode Malam"
            >
              <MaterialIcons
                name={nightMode ? 'light-mode' : 'bedtime'}
                size={18}
                color={nightMode ? COLORS.goldenYellow : COLORS.midnightBlue}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Lower 38% Text & Navigation */}
      <View
        style={[
          styles.textPanel,
          {
            backgroundColor: bgSurface,
            borderTopColor: nightMode ? COLORS.twilightPurple : COLORS.borderSoft,
            paddingBottom: Math.max(insets.bottom, 18),
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.textScroll}
          showsVerticalScrollIndicator={false}
        >
          <HighlightedParagraph
            text={currentPage.text}
            phrase={currentPage.highlightPhrase}
            fontSize={FONT_SIZES[fontIdx]}
            nightMode={nightMode}
          />
        </ScrollView>

        <View
          style={[
            styles.bottomNav,
            {
              borderTopColor: nightMode
                ? 'rgba(255,255,255,0.12)'
                : COLORS.borderSoft,
            },
          ]}
        >
          <Pressable
            onPress={handlePrev}
            disabled={pageIdx === 0}
            style={[
              styles.pageCircleBtn,
              pageIdx === 0 && { opacity: 0.4 },
            ]}
            accessibilityLabel="Halaman Sebelumnya"
          >
            <MaterialIcons name="chevron-left" size={26} color={COLORS.midnightBlue} />
          </Pressable>

          <Pressable
            onPress={() => setIsNarrating((v) => !v)}
            style={styles.narratePill}
            accessibilityLabel="Putar atau Jeda Narasi"
          >
            <MaterialIcons
              name={isNarrating ? 'pause-circle-filled' : 'play-circle-filled'}
              size={22}
              color={COLORS.sunsetOrange}
            />
            <Text style={styles.narrateText}>
              {isNarrating ? 'Jeda Narasi' : 'Putar Narasi'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={[styles.nextCircleBtn, SHADOWS.cta]}
            accessibilityLabel="Halaman Berikutnya"
          >
            <MaterialIcons
              name={pageIdx === pages.length - 1 ? 'check' : 'chevron-right'}
              size={26}
              color={COLORS.white}
            />
          </Pressable>
        </View>
      </View>

      {/* Completion & Streak Modal */}
      <Modal
        visible={completionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletionModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.trophyOrb}>
              <MaterialIcons
                name="military-tech"
                size={36}
                color={COLORS.goldenAccent}
              />
            </View>
            <Text style={styles.modalTitle}>Hebat! Cerita Selesai</Text>
            <Text style={styles.modalStreak}>
              Tantangan 7 Hari: {updatedStreak}/7 Malam
            </Text>

            <View style={styles.modalMoralBox}>
              <Text style={styles.modalMoralHead}>Pesan Moral Hari Ini:</Text>
              <Text style={styles.modalMoralBody}>{story.moralMessage}</Text>
            </View>

            <ButtonPrimary
              label="Kembali ke Beranda"
              onPress={() => {
                setCompletionModal(false);
                router.replace('/(drawer)/home');
              }}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    backgroundColor: COLORS.warmCream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  errorTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.midnightBlue,
  },
  sceneWrap: {
    height: '60%',
    position: 'relative',
    overflow: 'hidden',
  },
  sceneArt: {
    width: '100%',
    height: '100%',
  },
  floatingControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  pagePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  pagePillText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  rightControls: {
    flexDirection: 'row',
    gap: 6,
  },
  aaText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
  hotspotWrap: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
    transform: [{ translateX: -30 }, { translateY: -20 }],
  },
  hotspotIconRow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotspotPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.4,
  },
  hotspotCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotspotLabelPill: {
    backgroundColor: 'rgba(30, 34, 70, 0.86)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  hotspotLabelText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.white,
  },
  sfxToast: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(30, 34, 70, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  sfxToastText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.goldenAccent,
  },
  textPanel: {
    flex: 1,
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    justifyContent: 'space-between',
  },
  textScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  storyText: {
    fontFamily: FONTS.semiBold,
  },
  highlightedSpan: {
    fontFamily: FONTS.bold,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  pageCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  narratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  narrateText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.midnightBlue,
  },
  nextCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.sunsetOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 34, 70, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  trophyOrb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.midnightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.midnightBlue,
  },
  modalStreak: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.emeraldLeaf,
  },
  modalMoralBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 184, 0, 0.16)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.6)',
    padding: 14,
    gap: 4,
  },
  modalMoralHead: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  modalMoralBody: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.midnightBlue,
  },
});
