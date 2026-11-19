import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoryArtwork } from '@/components/StoryArtwork';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/theme';
import { useAudioStore, type SleepTimerMinutes } from '@/store/useAudioStore';

const TIMER_OPTIONS: SleepTimerMinutes[] = [0, 15, 30, 45, 60];

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function BedtimeAudioScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<Record<string, undefined>>>();
  const insets = useSafeAreaInsets();

  const tracks = useAudioStore((s) => s.tracks);
  const currentTrackIndex = useAudioStore((s) => s.currentTrackIndex);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const isShuffle = useAudioStore((s) => s.isShuffle);
  const sleepTimerMinutes = useAudioStore((s) => s.sleepTimerMinutes);
  const remainingSeconds = useAudioStore((s) => s.remainingSeconds);
  const positionSeconds = useAudioStore((s) => s.positionSeconds);
  const durationSeconds = useAudioStore((s) => s.durationSeconds);

  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const nextTrack = useAudioStore((s) => s.nextTrack);
  const prevTrack = useAudioStore((s) => s.prevTrack);
  const toggleShuffle = useAudioStore((s) => s.toggleShuffle);
  const setSleepTimer = useAudioStore((s) => s.setSleepTimer);
  const playTrackByIndex = useAudioStore((s) => s.playTrackByIndex);

  const [queueOpen, setQueueOpen] = useState(false);

  const currentTrack = tracks[currentTrackIndex];
  const nextTrackItem =
    tracks.length > 0 ? tracks[(currentTrackIndex + 1) % tracks.length] : null;
  const effectiveDuration = Math.max(durationSeconds, 4);
  const progressRatio = Math.min(1, positionSeconds / effectiveDuration);

  return (
    <LinearGradient
      colors={['#181B3A', COLORS.midnightBlue, COLORS.twilightPurple]}
      style={[
        styles.root,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 22),
        },
      ]}
    >
      <StatusBar style="light" />

      {/* Top Nav */}
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.navigate('/(drawer)/home')}
          hitSlop={10}
          style={styles.circleBtn}
          accessibilityLabel="Kembali ke Beranda"
        >
          <MaterialIcons name="arrow-back" size={20} color={COLORS.warmCream} />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.modeTag}>
            <MaterialIcons name="bedtime" size={14} color={COLORS.goldenAccent} />
            <Text style={styles.modeText}>Mode Malam Hari</Text>
          </View>
          <Text style={styles.headerTitle}>Audio Tidur Nyenyak</Text>
        </View>

        <Pressable
          onPress={() => navigation.openDrawer()}
          hitSlop={10}
          style={styles.circleBtn}
          accessibilityLabel="Buka Menu"
        >
          <MaterialIcons name="menu" size={22} color={COLORS.warmCream} />
        </Pressable>
      </View>

      {/* Main Player Center */}
      <View style={styles.playerCenter}>
        <StoryArtwork
          artworkKey={currentTrack?.artworkKey ?? 'gamelan'}
          badgeText={currentTrack?.category ?? 'Suara Alam • Gamelan'}
          style={styles.artworkCard}
          size="lg"
        />

        <Text style={styles.trackTitle}>
          {currentTrack?.title ?? 'Alunan Gamelan Lir-Ilir'}
        </Text>
        <Text style={styles.trackDesc}>
          {currentTrack?.description ??
            'Irama lembut penenang gelombang otak anak untuk tidur lelap dan mimpi indah.'}
        </Text>

        {/* Sleep Timer Selector */}
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>
            {remainingSeconds > 0
              ? `Sisa Timer: ${formatClock(remainingSeconds)}`
              : 'Timer Otomatis:'}
          </Text>
          <View style={styles.timerPills}>
            {TIMER_OPTIONS.map((mins) => {
              const active = sleepTimerMinutes === mins;
              return (
                <Pressable
                  key={mins}
                  onPress={() => setSleepTimer(mins)}
                  style={[styles.timerChip, active && styles.timerChipActive]}
                >
                  <Text
                    style={[
                      styles.timerChipText,
                      active && styles.timerChipTextActive,
                    ]}
                  >
                    {mins === 0 ? 'Mati' : `${mins}m`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(6, Math.round(progressRatio * 100))}%` },
              ]}
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatClock(positionSeconds)}</Text>
            <Text style={styles.timeText}>
              {formatClock(currentTrack?.durationSeconds ?? effectiveDuration)}
            </Text>
          </View>
        </View>

        {/* Player Controls */}
        <View style={styles.controlsRow}>
          <Pressable onPress={toggleShuffle} hitSlop={12}>
            <MaterialIcons
              name="shuffle"
              size={24}
              color={isShuffle ? COLORS.goldenAccent : 'rgba(255, 249, 240, 0.7)'}
            />
          </Pressable>

          <Pressable onPress={prevTrack} hitSlop={12}>
            <MaterialIcons name="skip-previous" size={34} color={COLORS.warmCream} />
          </Pressable>

          <Pressable
            onPress={togglePlayPause}
            style={[styles.playBigBtn, SHADOWS.cta]}
            accessibilityLabel={isPlaying ? 'Jeda Audio' : 'Putar Audio'}
          >
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={36}
              color={COLORS.white}
            />
          </Pressable>

          <Pressable onPress={nextTrack} hitSlop={12}>
            <MaterialIcons name="skip-next" size={34} color={COLORS.warmCream} />
          </Pressable>

          <Pressable
            onPress={() => setQueueOpen(true)}
            hitSlop={12}
            accessibilityLabel="Buka Antrean Audio"
          >
            <MaterialIcons
              name="queue-music"
              size={24}
              color="rgba(255, 249, 240, 0.8)"
            />
          </Pressable>
        </View>
      </View>

      {/* Bottom Queue Drawer Trigger */}
      <Pressable onPress={() => setQueueOpen(true)} style={styles.queueCard}>
        <View style={styles.queueLeft}>
          <MaterialIcons name="queue-music" size={24} color={COLORS.goldenAccent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.queueTitle}>Daftar Putar Berikutnya</Text>
            <Text style={styles.queueSub} numberOfLines={1}>
              {nextTrackItem
                ? `${nextTrackItem.title} • ${Math.round(
                    nextTrackItem.durationSeconds / 60
                  )} Menit`
                : 'Alunan Gamelan Lir-Ilir'}
            </Text>
          </View>
        </View>
        <Text style={styles.queueAction}>Lihat Semua</Text>
      </Pressable>

      {/* Queue Modal */}
      <Modal
        visible={queueOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setQueueOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daftar Putar Tidur Nyenyak</Text>
              <Pressable onPress={() => setQueueOpen(false)} hitSlop={12}>
                <MaterialIcons name="close" size={22} color={COLORS.midnightBlue} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalList}>
              {tracks.map((track, idx) => {
                const active = idx === currentTrackIndex;
                return (
                  <Pressable
                    key={track.id}
                    onPress={() => {
                      playTrackByIndex(idx);
                      setQueueOpen(false);
                    }}
                    style={[styles.trackRow, active && styles.trackRowActive]}
                  >
                    <MaterialIcons
                      name={active && isPlaying ? 'equalizer' : 'music-note'}
                      size={22}
                      color={active ? COLORS.sunsetOrange : COLORS.slateGray}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.trackRowTitle}>{track.title}</Text>
                      <Text style={styles.trackRowMeta}>
                        {track.category} • {Math.round(track.durationSeconds / 60)} Menit
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  modeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.goldenAccent,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: COLORS.warmCream,
  },
  playerCenter: {
    alignItems: 'center',
    gap: 14,
  },
  artworkCard: {
    width: 260,
    height: 164,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  trackTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: COLORS.warmCreamAlt,
    textAlign: 'center',
    marginTop: 6,
  },
  trackDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.slateGrayLight,
    textAlign: 'center',
    maxWidth: 290,
  },
  timerRow: {
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  timerLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: 'rgba(255, 249, 240, 0.8)',
  },
  timerPills: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  timerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  timerChipActive: {
    backgroundColor: COLORS.sunsetOrange,
  },
  timerChipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.warmCream,
  },
  timerChipTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  progressSection: {
    width: '100%',
    maxWidth: 320,
    gap: 6,
    marginTop: 6,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.sunsetOrange,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: 'rgba(255, 249, 240, 0.72)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 6,
  },
  playBigBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.sunsetOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  queueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  queueTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.warmCream,
  },
  queueSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.slateGrayLight,
  },
  queueAction: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.goldenAccent,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 34, 70, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    maxHeight: '65%',
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.midnightBlue,
  },
  modalList: {
    gap: 10,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: RADIUS.default,
    backgroundColor: COLORS.warmCream,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  trackRowActive: {
    borderColor: COLORS.sunsetOrange,
    backgroundColor: 'rgba(255, 122, 69, 0.1)',
  },
  trackRowTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.midnightBlue,
  },
  trackRowMeta: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.slateGray,
  },
});
