import * as SQLite from 'expo-sqlite';
import {
  SEED_BEDTIME_TRACKS,
  SEED_PROFILES,
  SEED_STORIES,
  SEED_STORY_PAGES,
} from '@/db/seedData';
import type {
  AgeBracket,
  AvatarKey,
  BedtimeAudioKey,
  BedtimeTrack,
  ChildProfile,
  IslandName,
  Story,
  StoryArtworkKey,
  StoryHotspot,
  StoryPage,
  StoryWithProgress,
} from '@/types/models';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('dongeng.db');
  }
  return dbPromise;
}

export async function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getDb();
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS profiles (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          age_bracket TEXT NOT NULL,
          age_years INTEGER NOT NULL,
          avatar_key TEXT NOT NULL,
          reading_level INTEGER NOT NULL DEFAULT 1,
          streak_count INTEGER NOT NULL DEFAULT 0,
          last_read_date TEXT
        );
        CREATE TABLE IF NOT EXISTS stories (
          id TEXT PRIMARY KEY NOT NULL,
          slug TEXT NOT NULL,
          title TEXT NOT NULL,
          island TEXT NOT NULL,
          province TEXT NOT NULL,
          duration_minutes INTEGER NOT NULL,
          age_min INTEGER NOT NULL,
          age_max INTEGER NOT NULL,
          is_interactive INTEGER NOT NULL DEFAULT 0,
          is_featured INTEGER NOT NULL DEFAULT 0,
          narrator_name TEXT NOT NULL,
          synopsis TEXT NOT NULL,
          moral_message TEXT NOT NULL,
          artwork_key TEXT NOT NULL,
          is_offline_downloaded INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS story_pages (
          id TEXT PRIMARY KEY NOT NULL,
          story_id TEXT NOT NULL,
          page_number INTEGER NOT NULL,
          artwork_key TEXT NOT NULL,
          text TEXT NOT NULL,
          highlight_phrase TEXT,
          hotspots_json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS reading_progress (
          profile_id TEXT NOT NULL,
          story_id TEXT NOT NULL,
          current_page INTEGER NOT NULL DEFAULT 1,
          total_pages INTEGER NOT NULL DEFAULT 1,
          is_favorite INTEGER NOT NULL DEFAULT 0,
          is_completed INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (profile_id, story_id)
        );
        CREATE TABLE IF NOT EXISTS bedtime_tracks (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          duration_seconds INTEGER NOT NULL,
          artwork_key TEXT NOT NULL,
          audio_key TEXT NOT NULL
        );
      `);

      const seeded = await getMeta('is_seeded');
      if (seeded !== '1') {
        await seedInitialData(db);
        await setMeta('is_seeded', '1');
      }
    })();
  }
  return initPromise;
}

async function seedInitialData(db: SQLite.SQLiteDatabase): Promise<void> {
  for (const p of SEED_PROFILES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO profiles (id, name, age_bracket, age_years, avatar_key, reading_level, streak_count, last_read_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      p.id,
      p.name,
      p.ageBracket,
      p.ageYears,
      p.avatarKey,
      p.readingLevel,
      p.streakCount,
      p.lastReadDate
    );
  }

  for (const s of SEED_STORIES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO stories (id, slug, title, island, province, duration_minutes, age_min, age_max, is_interactive, is_featured, narrator_name, synopsis, moral_message, artwork_key, is_offline_downloaded)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      s.id,
      s.slug,
      s.title,
      s.island,
      s.province,
      s.durationMinutes,
      s.ageMin,
      s.ageMax,
      s.isInteractive ? 1 : 0,
      s.isFeatured ? 1 : 0,
      s.narratorName,
      s.synopsis,
      s.moralMessage,
      s.artworkKey,
      s.isOfflineDownloaded ? 1 : 0
    );
  }

  for (const pg of SEED_STORY_PAGES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO story_pages (id, story_id, page_number, artwork_key, text, highlight_phrase, hotspots_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      pg.id,
      pg.storyId,
      pg.pageNumber,
      pg.artworkKey,
      pg.text,
      pg.highlightPhrase,
      JSON.stringify(pg.hotspots)
    );
  }

  for (const t of SEED_BEDTIME_TRACKS) {
    await db.runAsync(
      `INSERT OR IGNORE INTO bedtime_tracks (id, title, category, description, duration_seconds, artwork_key, audio_key)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      t.id,
      t.title,
      t.category,
      t.description,
      t.durationSeconds,
      t.artworkKey,
      t.audioKey
    );
  }

  const now = new Date().toISOString();
  // Seed progres awal agar "Lanjutkan Membaca" & "Cerita Favorit" langsung aktif saat pertama dibuka
  for (const p of SEED_PROFILES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO reading_progress (profile_id, story_id, current_page, total_pages, is_favorite, is_completed, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      p.id,
      'sang-kancil',
      3,
      5,
      1,
      0,
      now
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO reading_progress (profile_id, story_id, current_page, total_pages, is_favorite, is_completed, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      p.id,
      'danau-toba',
      4,
      4,
      1,
      1,
      now
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO reading_progress (profile_id, story_id, current_page, total_pages, is_favorite, is_completed, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      p.id,
      'bawang-merah',
      1,
      4,
      1,
      0,
      now
    );
  }
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    key
  );
  return row ? row.value : null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO app_meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value
  );
}

interface ProfileRow {
  id: string;
  name: string;
  age_bracket: string;
  age_years: number;
  avatar_key: string;
  reading_level: number;
  streak_count: number;
  last_read_date: string | null;
}

function mapProfile(row: ProfileRow): ChildProfile {
  return {
    id: row.id,
    name: row.name,
    ageBracket: row.age_bracket as AgeBracket,
    ageYears: row.age_years,
    avatarKey: row.avatar_key as AvatarKey,
    readingLevel: row.reading_level,
    streakCount: row.streak_count,
    lastReadDate: row.last_read_date,
  };
}

export async function getProfiles(): Promise<ChildProfile[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ProfileRow>('SELECT * FROM profiles ORDER BY rowid ASC');
  return rows.map(mapProfile);
}

export async function createProfile(input: {
  id: string;
  name: string;
  ageBracket: AgeBracket;
  ageYears: number;
  avatarKey: AvatarKey;
}): Promise<ChildProfile> {
  const db = await getDb();
  const readingLevel = input.ageBracket === '3-5' ? 2 : input.ageBracket === '6-8' ? 5 : 8;
  await db.runAsync(
    `INSERT INTO profiles (id, name, age_bracket, age_years, avatar_key, reading_level, streak_count, last_read_date)
     VALUES (?, ?, ?, ?, ?, ?, 0, NULL)`,
    input.id,
    input.name,
    input.ageBracket,
    input.ageYears,
    input.avatarKey,
    readingLevel
  );
  return {
    id: input.id,
    name: input.name,
    ageBracket: input.ageBracket,
    ageYears: input.ageYears,
    avatarKey: input.avatarKey,
    readingLevel,
    streakCount: 0,
    lastReadDate: null,
  };
}

export async function deleteProfile(profileId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM reading_progress WHERE profile_id = ?', profileId);
  await db.runAsync('DELETE FROM profiles WHERE id = ?', profileId);
}

export async function updateProfileStreak(
  profileId: string,
  streakCount: number,
  lastReadDate: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE profiles SET streak_count = ?, last_read_date = ? WHERE id = ?',
    streakCount,
    lastReadDate,
    profileId
  );
}

interface StoryJoinRow {
  id: string;
  slug: string;
  title: string;
  island: string;
  province: string;
  duration_minutes: number;
  age_min: number;
  age_max: number;
  is_interactive: number;
  is_featured: number;
  narrator_name: string;
  synopsis: string;
  moral_message: string;
  artwork_key: string;
  is_offline_downloaded: number;
  current_page: number | null;
  total_pages: number | null;
  is_favorite: number | null;
  is_completed: number | null;
  updated_at: string | null;
  page_count: number;
}

function mapStoryWithProgress(row: StoryJoinRow): StoryWithProgress {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    island: row.island as Exclude<IslandName, 'Semua'>,
    province: row.province,
    durationMinutes: row.duration_minutes,
    ageMin: row.age_min,
    ageMax: row.age_max,
    isInteractive: row.is_interactive === 1,
    isFeatured: row.is_featured === 1,
    narratorName: row.narrator_name,
    synopsis: row.synopsis,
    moralMessage: row.moral_message,
    artworkKey: row.artwork_key as StoryArtworkKey,
    isOfflineDownloaded: row.is_offline_downloaded === 1,
    currentPage: row.current_page ?? 1,
    totalPages: row.total_pages ?? Math.max(row.page_count, 1),
    isFavorite: row.is_favorite === 1,
    isCompleted: row.is_completed === 1,
    updatedAt: row.updated_at,
  };
}

export async function getStoriesWithProgress(profileId: string): Promise<StoryWithProgress[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<StoryJoinRow>(
    `SELECT s.*,
            rp.current_page,
            rp.total_pages,
            rp.is_favorite,
            rp.is_completed,
            rp.updated_at,
            (SELECT COUNT(*) FROM story_pages sp WHERE sp.story_id = s.id) AS page_count
     FROM stories s
     LEFT JOIN reading_progress rp
       ON rp.story_id = s.id AND rp.profile_id = ?
     ORDER BY s.is_featured DESC, s.rowid ASC`,
    profileId
  );
  return rows.map(mapStoryWithProgress);
}

export async function getStoryById(
  storyId: string,
  profileId: string
): Promise<StoryWithProgress | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<StoryJoinRow>(
    `SELECT s.*,
            rp.current_page,
            rp.total_pages,
            rp.is_favorite,
            rp.is_completed,
            rp.updated_at,
            (SELECT COUNT(*) FROM story_pages sp WHERE sp.story_id = s.id) AS page_count
     FROM stories s
     LEFT JOIN reading_progress rp
       ON rp.story_id = s.id AND rp.profile_id = ?
     WHERE s.id = ?`,
    profileId,
    storyId
  );
  return row ? mapStoryWithProgress(row) : null;
}

interface StoryPageRow {
  id: string;
  story_id: string;
  page_number: number;
  artwork_key: string;
  text: string;
  highlight_phrase: string | null;
  hotspots_json: string;
}

export async function getStoryPages(storyId: string): Promise<StoryPage[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<StoryPageRow>(
    'SELECT * FROM story_pages WHERE story_id = ? ORDER BY page_number ASC',
    storyId
  );
  return rows.map((row) => {
    let hotspots: StoryHotspot[] = [];
    try {
      hotspots = JSON.parse(row.hotspots_json) as StoryHotspot[];
    } catch {
      hotspots = [];
    }
    return {
      id: row.id,
      storyId: row.story_id,
      pageNumber: row.page_number,
      artworkKey: row.artwork_key as StoryArtworkKey,
      text: row.text,
      highlightPhrase: row.highlight_phrase,
      hotspots,
    };
  });
}

export async function upsertReadingProgress(input: {
  profileId: string;
  storyId: string;
  currentPage: number;
  totalPages: number;
  isCompleted: boolean;
}): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO reading_progress (profile_id, story_id, current_page, total_pages, is_favorite, is_completed, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)
     ON CONFLICT(profile_id, story_id) DO UPDATE SET
       current_page = excluded.current_page,
       total_pages = excluded.total_pages,
       is_completed = CASE WHEN reading_progress.is_completed = 1 THEN 1 ELSE excluded.is_completed END,
       updated_at = excluded.updated_at`,
    input.profileId,
    input.storyId,
    input.currentPage,
    input.totalPages,
    input.isCompleted ? 1 : 0,
    now
  );
}

export async function toggleStoryFavorite(
  profileId: string,
  storyId: string,
  nextFavorite: boolean,
  totalPages: number
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO reading_progress (profile_id, story_id, current_page, total_pages, is_favorite, is_completed, updated_at)
     VALUES (?, ?, 1, ?, ?, 0, ?)
     ON CONFLICT(profile_id, story_id) DO UPDATE SET
       is_favorite = excluded.is_favorite,
       updated_at = excluded.updated_at`,
    profileId,
    storyId,
    totalPages,
    nextFavorite ? 1 : 0,
    now
  );
}

export async function toggleStoryOffline(storyId: string, isDownloaded: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE stories SET is_offline_downloaded = ? WHERE id = ?',
    isDownloaded ? 1 : 0,
    storyId
  );
}

interface TrackRow {
  id: string;
  title: string;
  category: string;
  description: string;
  duration_seconds: number;
  artwork_key: string;
  audio_key: string;
}

export async function getBedtimeTracks(): Promise<BedtimeTrack[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TrackRow>('SELECT * FROM bedtime_tracks ORDER BY rowid ASC');
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    durationSeconds: row.duration_seconds,
    artworkKey: row.artwork_key as StoryArtworkKey,
    audioKey: row.audio_key as BedtimeAudioKey,
  }));
}
