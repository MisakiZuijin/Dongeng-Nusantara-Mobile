export type AgeBracket = '3-5' | '6-8' | '9-12';

export type AvatarKey = 'kancil' | 'cendrawasih' | 'komodo' | 'jalak';

export type IslandName =
  | 'Semua'
  | 'Jawa'
  | 'Sumatera'
  | 'Kalimantan'
  | 'Sulawesi'
  | 'Papua';

export type StoryArtworkKey =
  | 'timun-mas'
  | 'sang-kancil'
  | 'danau-toba'
  | 'bawang-merah'
  | 'gamelan'
  | 'nature';

export type SfxKey = 'sfx_chime' | 'sfx_wave';

export type BedtimeAudioKey = 'lullaby_gamelan' | 'lullaby_nature';

export type SessionMode = 'none' | 'guest' | 'account';

export interface ChildProfile {
  id: string;
  name: string;
  ageBracket: AgeBracket;
  ageYears: number;
  avatarKey: AvatarKey;
  readingLevel: number;
  streakCount: number;
  lastReadDate: string | null;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  island: Exclude<IslandName, 'Semua'>;
  province: string;
  durationMinutes: number;
  ageMin: number;
  ageMax: number;
  isInteractive: boolean;
  isFeatured: boolean;
  narratorName: string;
  synopsis: string;
  moralMessage: string;
  artworkKey: StoryArtworkKey;
  isOfflineDownloaded: boolean;
}

export interface StoryHotspot {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
  sfxKey: SfxKey;
  badgeColor: 'gold' | 'teal' | 'orange';
}

export interface StoryPage {
  id: string;
  storyId: string;
  pageNumber: number;
  artworkKey: StoryArtworkKey;
  text: string;
  highlightPhrase: string | null;
  hotspots: StoryHotspot[];
}

export interface ReadingProgress {
  profileId: string;
  storyId: string;
  currentPage: number;
  totalPages: number;
  isFavorite: boolean;
  isCompleted: boolean;
  updatedAt: string;
}

export interface StoryWithProgress extends Story {
  currentPage: number;
  totalPages: number;
  isFavorite: boolean;
  isCompleted: boolean;
  updatedAt: string | null;
}

export interface BedtimeTrack {
  id: string;
  title: string;
  category: string;
  description: string;
  durationSeconds: number;
  artworkKey: StoryArtworkKey;
  audioKey: BedtimeAudioKey;
}
