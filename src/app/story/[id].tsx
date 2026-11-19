import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ButtonPrimary } from '@/components/ButtonPrimary';
import { ButtonSecondary } from '@/components/ButtonSecondary';
import { StoryArtwork } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { getStoryById } from '@/db/database';
import { useAudioStore } from '@/store/useAudioStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSessionStore } from '@/store/useSessionStore';
import type { StoryWithProgress } from '@/types/models';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeProfile = useSessionStore((s) => s.activeProfile);
  const stories = useLibraryStore((s) => s.stories);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const toggleOffline = useLibraryStore((s) => s.toggleOffline);
  const playTrackByStoryIdOrDefault = useAudioStore(
    (s) => s.playTrackByStoryIdOrDefault
  );

  const [fallbackStory, setFallbackStory] = useState<StoryWithProgress | null>(null);
  const [loading, setLoading] = useState(false);

  const storeStory = stories.find((s) => s.id === id) ?? null;
  const story = storeStory ?? fallbackStory;

  useEffect(() => {
    if (!storeStory && id && activeProfile?.id) {
      setLoading(true);
      getStoryById(id, activeProfile.id)
        .then((res) => setFallbackStory(res))
        .finally(() => setLoading(false));
    }
  }, [storeStory, id, activeProfile?.id]);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={COLORS.sunsetOrange} />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.notFoundTitle}>Dongeng Tidak Ditemukan</Text>
        <ButtonPrimary label="Kembali" onPress={() => router.back()} />
      </View>
    );
  }

  const handleToggleFav = async () => {
    if (!activeProfile?.id) return;
    await toggleFavorite(activeProfile.id, story.id);
  };

  const handleToggleOffline = async () => {
    if (!activeProfile?.id) return;
    await toggleOffline(story.id, activeProfile.id);
    Alert.alert(
      'Mode Offline',
      story.isOfflineDownloaded
        ? `"${story.title}" dihapus dari penyimpanan offline.`
        : `"${story.title}" siap dibaca tanpa internet!`
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Top 45% Hero Illustration */}
      <View style={styles.heroWrap}>
        <StoryArtwork artworkKey={story.artworkKey} style={styles.heroArt} size="lg" />

        <View
          style={[
            styles.floatingHeader,
            { paddingTop: Math.max(insets.top, 14) },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.circleBtn}
            accessibilityLabel="Kembali"
          >
            <MaterialIcons name="arrow-back" size={20} color={COLORS.midnightBlue} />
          </Pressable>

          <View style={styles.rightBtns}>
            <Pressable
              onPress={handleToggleFav}
              hitSlop={10}
              style={styles.circleBtn}
              accessibilityLabel="Simpan ke Favorit"
            >
              <MaterialIcons
                name={story.isFavorite ? 'favorite' : 'favorite-border'}
                size={20}
                color={story.isFavorite ? COLORS.sunsetOrange : COLORS.midnightBlue}
              />
            </Pressable>

            <Pressable
              onPress={handleToggleOffline}
              hitSlop={10}
              style={styles.circleBtn}
              accessibilityLabel="Unduh untuk Dibaca Offline"
            >
              <MaterialIcons
                name={story.isOfflineDownloaded ? 'cloud-done' : 'cloud-download'}
                size={20}
                color={
                  story.isOfflineDownloaded ? COLORS.emeraldLeaf : COLORS.midnightBlue
                }
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bottom 55% Overlapping Sheet */}
      <View style={[styles.sheet, SHADOWS.sheet]}>
        <View style={styles.handle} />

        <ScrollView
          contentContainerStyle={styles.sheetScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.regionPill}>
            <MaterialIcons name="location-on" size={15} color={COLORS.emeraldLeaf} />
            <Text style={styles.regionText}>{story.province}</Text>
          </View>

          <Text style={styles.storyTitle}>{story.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <MaterialIcons name="schedule" size={14} color={COLORS.sunsetOrange} />
              <Text style={styles.metaText}>{story.durationMinutes} Menit</Text>
            </View>
            <View style={styles.metaPill}>
              <MaterialIcons name="child-care" size={14} color={COLORS.emeraldLeaf} />
              <Text style={styles.metaText}>
                Usia {story.ageMin}–{story.ageMax} Thn
              </Text>
            </View>
            <View style={styles.metaPill}>
              <MaterialIcons name="auto-awesome" size={14} color={COLORS.goldenYellow} />
              <Text style={styles.metaText}>
                {story.isInteractive ? 'Interaktif' : 'Audio'}
              </Text>
            </View>
          </View>

          <Text style={styles.synopsis}>{story.synopsis}</Text>

          <View style={styles.moralBox}>
            <MaterialIcons name="lightbulb" size={20} color={COLORS.sunsetOrange} />
            <View style={styles.moralTextWrap}>
              <Text style={styles.moralTitle}>Pesan Moral</Text>
              <Text style={styles.moralBody}>{story.moralMessage}</Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.ctaBar,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <ButtonSecondary
            label="Dengarkan"
            iconName="headphones"
            onPress={() => {
              playTrackByStoryIdOrDefault(story.title);
              router.navigate('/(drawer)/bedtime-audio');
            }}
            style={{ flex: 1 }}
          />
          <ButtonPrimary
            label={story.currentPage > 1 && !story.isCompleted ? 'Lanjut Baca' : 'Baca Cerita'}
            iconName="auto-stories"
            onPress={() => router.push(`/reader/${story.id}`)}
            style={{ flex: 1.35 }}
          />
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
  centerState: {
    flex: 1,
    backgroundColor: COLORS.warmCream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  notFoundTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.midnightBlue,
  },
  heroWrap: {
    height: '44%',
    minHeight: 280,
    position: 'relative',
    backgroundColor: COLORS.midnightBlue,
  },
  heroArt: {
    width: '100%',
    height: '100%',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: COLORS.warmCream,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingTop: 14,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(160, 166, 194, 0.45)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetScroll: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 12,
  },
  regionPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.emeraldLeafLight,
    borderWidth: 1,
    borderColor: 'rgba(27, 142, 131, 0.3)',
  },
  regionText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  storyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 32,
    color: COLORS.midnightBlue,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  metaText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  synopsis: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.slateGray,
  },
  moralBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 184, 0, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.6)',
  },
  moralTextWrap: {
    flex: 1,
    gap: 2,
  },
  moralTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  moralBody: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.midnightBlue,
  },
  ctaBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(240, 231, 216, 0.8)',
    backgroundColor: COLORS.warmCream,
  },
});
