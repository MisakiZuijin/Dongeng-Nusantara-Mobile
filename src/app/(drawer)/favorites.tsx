import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ButtonPrimary } from '@/components/ButtonPrimary';
import { StoryArtwork } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useAudioStore } from '@/store/useAudioStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSessionStore } from '@/store/useSessionStore';

export default function FavoritesScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const insets = useSafeAreaInsets();

  const activeProfile = useSessionStore((s) => s.activeProfile);
  const stories = useLibraryStore((s) => s.stories);
  const sortOrder = useLibraryStore((s) => s.sortOrder);
  const loadStories = useLibraryStore((s) => s.loadStories);
  const setSortOrder = useLibraryStore((s) => s.setSortOrder);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const playTrackByStoryIdOrDefault = useAudioStore(
    (s) => s.playTrackByStoryIdOrDefault
  );

  useEffect(() => {
    if (activeProfile?.id) {
      loadStories(activeProfile.id);
    }
  }, [activeProfile?.id, loadStories]);

  const favoriteStories = useMemo(() => {
    const list = stories.filter((s) => s.isFavorite);
    if (sortOrder === 'title') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [stories, sortOrder]);

  const handlePlayAll = () => {
    const first = favoriteStories[0];
    playTrackByStoryIdOrDefault(first?.title);
    router.navigate('/(drawer)/bedtime-audio');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <LinearGradient
        colors={[COLORS.softPeach, COLORS.warmCream]}
        style={[styles.header, { paddingTop: Math.max(insets.top, 14) }]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.navigate('/(drawer)/home')}
            hitSlop={10}
            style={styles.iconBtn}
          >
            <MaterialIcons name="arrow-back" size={20} color={COLORS.midnightBlue} />
          </Pressable>

          <View style={styles.titleCenter}>
            <View style={styles.savedRow}>
              <MaterialIcons name="favorite" size={14} color={COLORS.sunsetOrange} />
              <Text style={styles.savedLabel}>
                Disimpan oleh {activeProfile?.name ?? 'Adik'}
              </Text>
            </View>
            <Text style={styles.headerTitle}>Cerita Favorit</Text>
          </View>

          <Pressable
            onPress={() => navigation.openDrawer()}
            hitSlop={10}
            style={styles.iconBtn}
          >
            <MaterialIcons name="menu" size={22} color={COLORS.midnightBlue} />
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Total <Text style={styles.summaryBold}>{favoriteStories.length} Dongeng Favorit</Text>{' '}
            siap didengarkan
          </Text>
          <Pressable
            onPress={() =>
              setSortOrder(sortOrder === 'recent' ? 'title' : 'recent')
            }
            style={styles.sortBtn}
          >
            <MaterialIcons name="sort" size={16} color={COLORS.midnightBlue} />
            <Text style={styles.sortText}>
              {sortOrder === 'title' ? 'A–Z' : 'Terbaru'}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {favoriteStories.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons
              name="favorite-border"
              size={40}
              color={COLORS.sunsetOrange}
            />
            <Text style={styles.emptyTitle}>Belum Ada Cerita Favorit</Text>
            <Text style={styles.emptySub}>
              Sentuh ikon hati pada cerita yang disukai agar mudah ditemukan sebelum tidur.
            </Text>
          </View>
        ) : (
          favoriteStories.map((story) => (
            <Pressable
              key={story.id}
              onPress={() => router.push(`/story/${story.id}`)}
              style={[styles.favCard, SHADOWS.card]}
            >
              <StoryArtwork
                artworkKey={story.artworkKey}
                style={styles.thumb}
                size="sm"
              />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={styles.regionPill}>
                    <Text style={styles.regionText}>{story.province}</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      if (activeProfile?.id) {
                        toggleFavorite(activeProfile.id, story.id);
                      }
                    }}
                    hitSlop={12}
                  >
                    <MaterialIcons
                      name="favorite"
                      size={20}
                      color={COLORS.sunsetOrange}
                    />
                  </Pressable>
                </View>

                <Text style={styles.storyTitle} numberOfLines={1}>
                  {story.title}
                </Text>
                <Text style={styles.storySub} numberOfLines={1}>
                  {story.synopsis}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.duration}>{story.durationMinutes} Menit</Text>
                  <Pressable
                    onPress={() => {
                      playTrackByStoryIdOrDefault(story.title);
                      router.navigate('/(drawer)/bedtime-audio');
                    }}
                    hitSlop={8}
                    style={styles.playInline}
                  >
                    <Text style={styles.playInlineText}>Putar Sekarang</Text>
                    <MaterialIcons
                      name="play-circle-filled"
                      size={16}
                      color={COLORS.lightSecondary}
                    />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 18) },
        ]}
      >
        <ButtonPrimary
          label="Putar Semua Favorit Berurutan"
          iconName="playlist-play"
          onPress={handlePlayAll}
          disabled={favoriteStories.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.warmCream,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 231, 216, 0.7)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCenter: {
    alignItems: 'center',
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.lightSecondary,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: COLORS.midnightBlue,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.slateGray,
  },
  summaryBold: {
    fontFamily: FONTS.bold,
    color: COLORS.midnightBlue,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  scrollContent: {
    padding: 24,
    gap: 14,
  },
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.midnightBlue,
  },
  emptySub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.slateGray,
    textAlign: 'center',
  },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    padding: 14,
  },
  thumb: {
    width: 78,
    height: 78,
    borderRadius: RADIUS.md,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regionPill: {
    backgroundColor: COLORS.emeraldLeafLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  regionText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.midnightBlue,
  },
  storyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.midnightBlue,
  },
  storySub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.slateGray,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },
  duration: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.midnightBlue,
  },
  playInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playInlineText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.lightSecondary,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 10,
    backgroundColor: COLORS.warmCream,
  },
});
