import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ParentalGateModal } from '@/components/ParentalGateModal';
import { StoryArtwork } from '@/components/StoryArtwork';
import { StoryCard } from '@/components/StoryCard';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useLibraryStore, type BookshelfTab } from '@/store/useLibraryStore';
import { useSessionStore } from '@/store/useSessionStore';

export default function BookshelfScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const insets = useSafeAreaInsets();

  const activeProfile = useSessionStore((s) => s.activeProfile);
  const stories = useLibraryStore((s) => s.stories);
  const bookshelfTab = useLibraryStore((s) => s.bookshelfTab);
  const sortOrder = useLibraryStore((s) => s.sortOrder);
  const loadStories = useLibraryStore((s) => s.loadStories);
  const setBookshelfTab = useLibraryStore((s) => s.setBookshelfTab);
  const setSortOrder = useLibraryStore((s) => s.setSortOrder);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);

  const [gateVisible, setGateVisible] = useState(false);

  useEffect(() => {
    if (activeProfile?.id) {
      loadStories(activeProfile.id);
    }
  }, [activeProfile?.id, loadStories]);

  const continueStory = useMemo(() => {
    return (
      stories.find((s) => !s.isCompleted && s.currentPage > 1) ??
      stories[0] ??
      null
    );
  }, [stories]);

  const counts = useMemo(
    () => ({
      all: stories.length,
      favorites: stories.filter((s) => s.isFavorite).length,
      completed: stories.filter((s) => s.isCompleted).length,
    }),
    [stories]
  );

  const displayedStories = useMemo(() => {
    const filtered = stories.filter((s) => {
      if (bookshelfTab === 'favorites') return s.isFavorite;
      if (bookshelfTab === 'completed') return s.isCompleted;
      return true;
    });
    if (sortOrder === 'title') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered;
  }, [stories, bookshelfTab, sortOrder]);

  const gridRows = useMemo(() => {
    const rows: (typeof displayedStories)[] = [];
    for (let i = 0; i < displayedStories.length; i += 2) {
      rows.push(displayedStories.slice(i, i + 2));
    }
    return rows;
  }, [displayedStories]);

  const offlineCount = useMemo(
    () => stories.filter((s) => s.isOfflineDownloaded).length,
    [stories]
  );

  const tabs: { key: BookshelfTab; label: string }[] = [
    { key: 'all', label: `Semua (${counts.all})` },
    { key: 'favorites', label: `Favorit (${counts.favorites})` },
    { key: 'completed', label: `Selesai (${counts.completed})` },
  ];

  const progressRatio = continueStory
    ? Math.min(1, continueStory.currentPage / Math.max(1, continueStory.totalPages))
    : 0;

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
            accessibilityLabel="Kembali ke Beranda"
          >
            <MaterialIcons name="arrow-back" size={20} color={COLORS.midnightBlue} />
          </Pressable>

          <View style={styles.titleCenter}>
            <Text style={styles.headerSub}>Perpustakaan Cerita</Text>
            <Text style={styles.headerTitle}>Koleksi Rak Buku</Text>
          </View>

          <Pressable
            onPress={() => navigation.openDrawer()}
            hitSlop={10}
            style={styles.iconBtn}
            accessibilityLabel="Buka Menu Navigasi"
          >
            <MaterialIcons name="menu" size={22} color={COLORS.midnightBlue} />
          </Pressable>
        </View>

        <View style={styles.segmentedBar}>
          {tabs.map((tab) => {
            const active = bookshelfTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setBookshelfTab(tab.key)}
                style={[styles.segBtn, active && styles.segBtnActive]}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Continue Reading */}
        {continueStory ? (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialIcons
                  name="auto-stories"
                  size={20}
                  color={COLORS.sunsetOrange}
                />
                <Text style={styles.sectionTitle}>Lanjutkan Membaca</Text>
              </View>
              <Text style={styles.chapterMeta}>
                Hal. {continueStory.currentPage} dari {continueStory.totalPages}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push(`/reader/${continueStory.id}`)}
              style={[styles.continueCard, SHADOWS.card]}
            >
              <StoryArtwork
                artworkKey={continueStory.artworkKey}
                style={styles.continueThumb}
                size="sm"
              />
              <View style={styles.continueInfo}>
                <View style={styles.regionPill}>
                  <Text style={styles.regionPillText}>
                    {continueStory.province}
                  </Text>
                </View>
                <Text style={styles.continueTitle} numberOfLines={1}>
                  {continueStory.title}
                </Text>
                <Text style={styles.continueSub}>
                  Tersisa{' '}
                  {Math.max(
                    1,
                    Math.round(continueStory.durationMinutes * (1 - progressRatio))
                  )}{' '}
                  menit membaca
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.max(12, Math.round(progressRatio * 100))}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.continuePlay}>
                <MaterialIcons name="play-arrow" size={22} color={COLORS.white} />
              </View>
            </Pressable>
          </View>
        ) : null}

        {/* Collection Grid */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Koleksi Cerita Pilihan</Text>
            <Pressable
              onPress={() =>
                setSortOrder(sortOrder === 'recent' ? 'title' : 'recent')
              }
              hitSlop={8}
            >
              <Text style={styles.sortLink}>
                {sortOrder === 'title' ? 'Urutan: A–Z' : 'Urutkan'}
              </Text>
            </Pressable>
          </View>

          {displayedStories.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Belum ada cerita pada tab ini.
              </Text>
            </View>
          ) : (
            <View style={styles.gridWrap}>
              {gridRows.map((row, idx) => (
                <View key={idx} style={styles.gridRow}>
                  {row.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      showFavoriteButton
                      footerIcon="book"
                      onToggleFavorite={() => {
                        if (activeProfile?.id) {
                          toggleFavorite(activeProfile.id, story.id);
                        }
                      }}
                      onPress={() => router.push(`/story/${story.id}`)}
                    />
                  ))}
                  {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Offline Mode Banner */}
        <View style={styles.offlineBanner}>
          <View style={styles.offlineLeft}>
            <MaterialIcons
              name="cloud-done"
              size={24}
              color={COLORS.emeraldLeaf}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.offlineTitle}>Mode Cerita Offline</Text>
              <Text style={styles.offlineSub}>
                {offlineCount} dongeng siap diputar tanpa kuota internet
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setGateVisible(true)}
            style={styles.kelolaBtn}
          >
            <Text style={styles.kelolaText}>Kelola</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ParentalGateModal
        visible={gateVisible}
        onClose={() => setGateVisible(false)}
        onVerified={() => router.navigate('/(drawer)/parent-settings')}
      />
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
    gap: 14,
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
  headerSub: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.slateGray,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: COLORS.midnightBlue,
  },
  segmentedBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    padding: 4,
    gap: 4,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: COLORS.midnightBlue,
  },
  segText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  segTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    gap: 20,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.midnightBlue,
  },
  chapterMeta: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.slateGray,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    padding: 14,
  },
  continueThumb: {
    width: 66,
    height: 78,
    borderRadius: RADIUS.md,
  },
  continueInfo: {
    flex: 1,
    gap: 4,
  },
  regionPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.emeraldLeafLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  regionPillText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.midnightBlue,
  },
  continueTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.midnightBlue,
  },
  continueSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.slateGray,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warmCream,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.sunsetOrange,
  },
  continuePlay: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.sunsetOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortLink: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
    textDecorationLine: 'underline',
  },
  gridWrap: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.slateGray,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    padding: 14,
  },
  offlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  offlineTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
  offlineSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.slateGray,
  },
  kelolaBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  kelolaText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
});
