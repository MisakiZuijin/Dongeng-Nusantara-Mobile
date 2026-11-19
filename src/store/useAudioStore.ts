import { create } from 'zustand';
import { getBedtimeTracks } from '@/db/database';
import type { BedtimeTrack } from '@/types/models';

export type SleepTimerMinutes = 0 | 15 | 30 | 45 | 60;

interface AudioState {
  tracks: BedtimeTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  isShuffle: boolean;
  sleepTimerMinutes: SleepTimerMinutes;
  remainingSeconds: number;
  positionSeconds: number;
  durationSeconds: number;
  seekRequestedSeconds: number | null;
  loadTracks: () => Promise<void>;
  playTrackByIndex: (index: number) => void;
  playTrackByStoryIdOrDefault: (storyTitle?: string) => void;
  togglePlayPause: () => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  setSleepTimer: (minutes: SleepTimerMinutes) => void;
  decrementTimer: () => void;
  setPlaybackProgress: (positionSeconds: number, durationSeconds: number) => void;
  requestSeek: (seconds: number) => void;
  clearSeekRequest: () => void;
  stopAudio: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  tracks: [],
  currentTrackIndex: 0,
  isPlaying: false,
  isShuffle: false,
  sleepTimerMinutes: 30,
  remainingSeconds: 0,
  positionSeconds: 0,
  durationSeconds: 0,
  seekRequestedSeconds: null,

  loadTracks: async () => {
    const tracks = await getBedtimeTracks();
    set({ tracks });
  },

  playTrackByIndex: (index: number) => {
    const { tracks } = get();
    if (tracks.length === 0) return;
    const bounded = ((index % tracks.length) + tracks.length) % tracks.length;
    set({
      currentTrackIndex: bounded,
      isPlaying: true,
      positionSeconds: 0,
    });
  },

  playTrackByStoryIdOrDefault: (storyTitle?: string) => {
    const { tracks, sleepTimerMinutes, remainingSeconds } = get();
    if (tracks.length === 0) return;
    let idx = 0;
    if (storyTitle) {
      const matched = tracks.findIndex((t) =>
        t.title.toLowerCase().includes(storyTitle.toLowerCase().split(' ')[0])
      );
      if (matched >= 0) idx = matched;
    }
    set({
      currentTrackIndex: idx,
      isPlaying: true,
      remainingSeconds:
        remainingSeconds > 0
          ? remainingSeconds
          : sleepTimerMinutes > 0
          ? sleepTimerMinutes * 60
          : 0,
    });
  },

  togglePlayPause: () => {
    const { isPlaying, sleepTimerMinutes, remainingSeconds } = get();
    const nextPlaying = !isPlaying;
    set({
      isPlaying: nextPlaying,
      remainingSeconds:
        nextPlaying && remainingSeconds === 0 && sleepTimerMinutes > 0
          ? sleepTimerMinutes * 60
          : remainingSeconds,
    });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),

  nextTrack: () => {
    const { tracks, currentTrackIndex, isShuffle } = get();
    if (tracks.length === 0) return;
    let nextIdx = (currentTrackIndex + 1) % tracks.length;
    if (isShuffle && tracks.length > 1) {
      nextIdx = (currentTrackIndex + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length;
    }
    set({ currentTrackIndex: nextIdx, isPlaying: true, positionSeconds: 0 });
  },

  prevTrack: () => {
    const { tracks, currentTrackIndex } = get();
    if (tracks.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    set({ currentTrackIndex: prevIdx, isPlaying: true, positionSeconds: 0 });
  },

  toggleShuffle: () => set({ isShuffle: !get().isShuffle }),

  setSleepTimer: (minutes: SleepTimerMinutes) => {
    set({
      sleepTimerMinutes: minutes,
      remainingSeconds: minutes > 0 ? minutes * 60 : 0,
    });
  },

  decrementTimer: () => {
    const { remainingSeconds, isPlaying } = get();
    if (!isPlaying || remainingSeconds <= 0) return;
    const next = remainingSeconds - 1;
    if (next <= 0) {
      set({ remainingSeconds: 0, isPlaying: false });
    } else {
      set({ remainingSeconds: next });
    }
  },

  setPlaybackProgress: (positionSeconds, durationSeconds) =>
    set({ positionSeconds, durationSeconds }),

  requestSeek: (seconds) => set({ seekRequestedSeconds: seconds }),
  clearSeekRequest: () => set({ seekRequestedSeconds: null }),

  stopAudio: () => set({ isPlaying: false, remainingSeconds: 0 }),
}));
