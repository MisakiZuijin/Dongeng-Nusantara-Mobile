import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileAvatar, StoryArtwork } from '@/components/StoryArtwork';
import { StoryCard } from '@/components/StoryCard';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useAudioStore } from '@/store/useAudioStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSessionStore } from '@/store/useSessionStore';
import type { IslandName } from '@/types/models';

const ISLAND_FILTERS: { key: IslandName; label: string }[] = [
  { key: 'Semua', label: 'Semua' },
  { key: 'Jawa', label: 'Jawa' },
  { key: 'Sumatera', label: 'Sumatera' },
  { key: 'Kalimantan', label: 'Kalimantan' },
  { key: 'Papua', label: 'Papua' },
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi,';
  if (hour < 15) return 'Selamat Siang,';
  if (hour < 18) return 'Selamat Sore,';
  return 'Selamat Malam,';
}

export default function HomeDashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const insets = useSafeAreaInsets();

  const activeProfile = useSessionStore((s) => s.activeProfile);
  const stories = useLibraryStore((s) => s.stories);
  const selectedIsland = useLibraryStore((s) => s.selectedIsland);
  const searchQuery = useLibraryStore((s) => s.searchQuery);
  const loadStories = useLibraryStore((s) => s.loadStories);
  const setSelectedIsland = useLibraryStore((s) => s.setSelectedIsland);
  const setSearchQuery = useLibraryStore((s) => s.setSearchQuery);

  const sleepTimerMinutes = useAudioStore((s) => s.sleepTimerMinutes);
  const remainingSeconds = useAudioStore((s) => s.remainingSeconds);
  const playTrackByStoryIdOrDefault = useAudioStore(
    (s) => s.playTrackByStoryIdOrDefault
  );

  useEffect(() => {
    if (activeProfile?.id) {
      loadStories(activeProfile.id);
    }
  }, [activeProfile?.id, loadStories]);

  const featuredStory = useMemo(
    () => stories.find((s) => s.isFeatured) ?? stories[0] ?? null,
    [stories]
  );

  const filteredStories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stories.filter((s) => {
      const islandMatch =
        selectedIsland === 'Semua' || s.island === selectedIsland;
      const queryMatch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q) ||
        s.island.toLowerCase().includes(q);
      return islandMatch && queryMatch;
    });
  }, [stories, selectedIsland, searchQuery]);

  const gridRows = useMemo(() => {
    const rows: (typeof filteredStories)[] = [];
    for (let i = 0; i < filteredStories.length; i += 2) {
      rows.push(filteredStories.slice(i, i + 2));
    }
    return rows;
  }, [filteredStories]);

  const timerLabel =
    remainingSeconds > 0
      ? `${Math.ceil(remainingSeconds / 60)}m`
      : sleepTimerMinutes > 0
      ? `${sleepTimerMinutes}m`
      : 'Off';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <LinearGradient
        colors={[COLORS.softPeach, COLORS.warmCream]}
        style={[styles.header, { paddingTop: Math.max(insets.top, 14) }]}
      >
        <View style={styles.topRow}>
          <Pressable
            onPress={() => router.push('/profile-picker')}
            style={styles.profileGroup}
          >
            <View style={styles.avatarRing}>
              <ProfileAvatar
                avatarKey={activeProfile?.avatarKey ?? 'kancil'}
                size={44}
              />
            </View>
            <View>
              <Text style={styles.greetingSub}>{getTimeGreeting()}</Text>
              <Text style={styles.greetingName} numberOfLines={1}>
                {activeProfile?.name ?? 'Adik'}
              </Text>
            </View>
          </Pressable>

          <View style={styles.headerControls}>
            <Pressable
              onPress={() => router.navigate('/(drawer)/bedtime-audio')}
              style={styles.timerPill}
              accessibilityLabel="Atur Timer Pengantar Tidur"
            >
              <MaterialIcons name="bedtime" size={16} color={COLORS.goldenYellow} />
              <Text style={styles.timerText}>{timerLabel}</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.openDrawer()}
              style={styles.menuBtn}
              accessibilityLabel="Buka Menu Navigasi Utama"
            >
              <MaterialIcons name="menu" size={24} color={COLORS.midnightBlue} />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={COLORS.slateGray} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari Si Kancil, Danau Toba..."
            placeholderTextColor={COLORS.slateGrayLight}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
              <MaterialIcons name="close" size={18} color={COLORS.slateGray} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setSelectedIsland('Semua')}
              hitSlop={10}
              accessibilityLabel="Reset filter"
            >
              <MaterialIcons name="tune" size={20} color={COLORS.slateGray} />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Hero Banner */}
        {featuredStory ? (
          <Pressable
            onPress={() => router.push(`/story/${featuredStory.id}`)}
            style={styles.heroBannerWrap}
          >
            <LinearGradient
              colors={[COLORS.midnightBlue, '#262B5C', COLORS.twilightPurple]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.heroBanner, SHADOWS.card]}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.heroBadge}>
                  <MaterialIcons name="star" size={14} color={COLORS.goldenAccent} />
                  <Text style={styles.heroBadgeText}>Pilihan Malam Ini</Text>
                </View>
                <Text style={styles.heroDuration}>
                  {featuredStory.durationMinutes} Menit • Audio
                </Text>
              </View>

              <View style={styles.heroMidRow}>
                <StoryArtwork
                  artworkKey={featuredStory.artworkKey}
                  style={styles.heroThumb}
                  size="sm"
                />
                <View style={styles.heroCopy}>
                  <Text style={styles.heroTitle} numberOfLines={2}>
                    {featuredStory.title}
                  </Text>
                  <Text style={styles.heroDesc} numberOfLines={2}>
                    {featuredStory.synopsis}
                  </Text>
                </View>
              </View>

              <View style={styles.heroFooter}>
                <View style={styles.narratorRow}>
                  <MaterialIcons
                    name="volume-up"
                    size={18}
                    color={COLORS.goldenAccent}
                  />
                  <Text style={styles.narratorText}>
                    {featuredStory.narratorName}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    playTrackByStoryIdOrDefault(featuredStory.title);
                    router.navigate('/(drawer)/bedtime-audio');
                  }}
                  style={styles.playPill}
                >
                  <MaterialIcons
                    name="play-arrow"
                    size={18}
                    color={COLORS.sunsetOrange}
                  />
                  <Text style={styles.playPillText}>Dengarkan</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </Pressable>
        ) : null}

        {/* Island Categories */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jelajah Nusantara</Text>
            <Pressable onPress={() => setSelectedIsland('Semua')} hitSlop={8}>
              <Text style={styles.sectionLink}>Semua Pulau</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {ISLAND_FILTERS.map((item) => {
              const active = selectedIsland === item.key;
              const count =
                item.key === 'Semua'
                  ? stories.length
                  : stories.filter((s) => s.island === item.key).length;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setSelectedIsland(item.key)}
                  style={[styles.islandChip, active && styles.islandChipActive]}
                >
                  <Text
                    style={[
                      styles.islandChipText,
                      active && styles.islandChipTextActive,
                    ]}
                  >
                    {item.label} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Popular Stories Grid */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Dongeng Populer</Text>
              <Text style={styles.sectionSub}>
                Cerita santai bernuansa tenang & mendidik
              </Text>
            </View>
            <Pressable
              onPress={() => router.navigate('/(drawer)/bookshelf')}
              hitSlop={8}
            >
              <Text style={styles.sectionLink}>Lihat Semua</Text>
            </Pressable>
          </View>

          {filteredStories.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="search-off" size={32} color={COLORS.slateGray} />
              <Text style={styles.emptyText}>
                Belum ada cerita untuk filter tersebut. Coba pilih "Semua".
              </Text>
            </View>
          ) : (
            <View style={styles.gridWrap}>
              {gridRows.map((row, rIdx) => (
                <View key={rIdx} style={styles.gridRow}>
                  {row.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onPress={() => router.push(`/story/${story.id}`)}
                    />
                  ))}
                  {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 7-Day Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakLeft}>
            <View style={styles.streakIconCircle}>
              <MaterialIcons
                name="military-tech"
                size={22}
                color={COLORS.goldenAccent}
              />
            </View>
            <View style={styles.streakCopy}>
              <Text style={styles.streakTitle}>Tantangan 7 Hari</Text>
              <Text style={styles.streakBody}>
                {activeProfile?.name ?? 'Adik'} sudah membaca{' '}
                {activeProfile?.streakCount ?? 0} malam berturut-turut.
              </Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>
              {activeProfile?.streakCount ?? 0}/7
            </Text>
          </View>
        </View>
      </ScrollView>
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
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarRing: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.sunsetOrange,
    padding: 1,
    backgroundColor: COLORS.warmCreamAlt,
  },
  greetingSub: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.slateGray,
  },
  greetingName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.midnightBlue,
    maxWidth: 160,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  timerText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.midnightBlue,
    paddingVertical: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 6,
    gap: 22,
  },
  heroBannerWrap: {
    width: '100%',
  },
  heroBanner: {
    borderRadius: RADIUS.lg,
    padding: 18,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(30, 34, 70, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroBadgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.goldenAccent,
  },
  heroDuration: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.warmCreamAlt,
  },
  heroMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroThumb: {
    width: 78,
    height: 78,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    lineHeight: 25,
    color: COLORS.warmCream,
  },
  heroDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255, 249, 240, 0.88)',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  narratorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  narratorText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.warmCream,
  },
  playPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  playPillText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.midnightBlue,
  },
  sectionSub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.slateGray,
    marginTop: 2,
  },
  sectionLink: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.midnightBlue,
    textDecorationLine: 'underline',
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  islandChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  islandChipActive: {
    backgroundColor: COLORS.midnightBlue,
    borderColor: COLORS.midnightBlue,
  },
  islandChipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.midnightBlue,
  },
  islandChipTextActive: {
    color: COLORS.white,
  },
  gridWrap: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.slateGray,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: COLORS.emeraldLeafLight,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(27, 142, 131, 0.3)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  streakIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.midnightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCopy: {
    flex: 1,
    gap: 2,
  },
  streakTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.midnightBlue,
  },
  streakBody: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.midnightBlue,
  },
  streakBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.midnightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
});
