import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAudioStore } from '@/store/useAudioStore';
import type { BedtimeAudioKey } from '@/types/models';

const AUDIO_SOURCES: Record<BedtimeAudioKey, number> = {
  lullaby_gamelan: require('../../assets/audio/lullaby_gamelan.wav'),
  lullaby_nature: require('../../assets/audio/lullaby_nature.wav'),
};

export function AudioController() {
  const tracks = useAudioStore((s) => s.tracks);
  const currentTrackIndex = useAudioStore((s) => s.currentTrackIndex);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const remainingSeconds = useAudioStore((s) => s.remainingSeconds);
  const seekRequestedSeconds = useAudioStore((s) => s.seekRequestedSeconds);
  const decrementTimer = useAudioStore((s) => s.decrementTimer);
  const setPlaybackProgress = useAudioStore((s) => s.setPlaybackProgress);
  const clearSeekRequest = useAudioStore((s) => s.clearSeekRequest);

  const currentTrack = tracks[currentTrackIndex];
  const audioKey: BedtimeAudioKey = currentTrack?.audioKey ?? 'lullaby_gamelan';
  const player = useAudioPlayer(AUDIO_SOURCES[audioKey], { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const prevTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
      } catch {
        // Ignore on unsupported web/preview environments
      }
      if (active) {
        player.loop = true;
      }
    })();
    return () => {
      active = false;
    };
  }, [player]);

  useEffect(() => {
    if (!currentTrack) return;
    if (prevTrackIdRef.current !== null && prevTrackIdRef.current !== currentTrack.id) {
      player.replace(AUDIO_SOURCES[currentTrack.audioKey]);
      player.loop = true;
    }
    prevTrackIdRef.current = currentTrack.id;
  }, [currentTrack, player]);

  useEffect(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      player.volume =
        remainingSeconds > 0 && remainingSeconds <= 10
          ? Math.max(0.05, remainingSeconds / 10)
          : 1.0;

      if (Platform.OS !== 'web') {
        try {
          player.setActiveForLockScreen(true, {
            title: currentTrack.title,
            artist: 'Dongeng Nusantara',
            albumTitle: currentTrack.category,
          });
        } catch {
          // Ignore lock screen metadata failures
        }
      }
      if (!status.playing) {
        player.play();
      }
    } else {
      if (status.playing) {
        player.pause();
      }
      if (Platform.OS !== 'web') {
        try {
          player.setActiveForLockScreen(false);
        } catch {
          // Ignore
        }
      }
    }
  }, [isPlaying, currentTrack, remainingSeconds, player, status.playing]);

  useEffect(() => {
    setPlaybackProgress(status.currentTime || 0, status.duration || 0);
  }, [status.currentTime, status.duration, setPlaybackProgress]);

  useEffect(() => {
    if (seekRequestedSeconds !== null) {
      player.seekTo(seekRequestedSeconds);
      clearSeekRequest();
    }
  }, [seekRequestedSeconds, player, clearSeekRequest]);

  useEffect(() => {
    if (!isPlaying || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, remainingSeconds, decrementTimer]);

  return null;
}
