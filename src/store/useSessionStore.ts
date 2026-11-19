import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import {
  createProfile,
  deleteProfile,
  getMeta,
  getProfiles,
  initDatabase,
  setMeta,
  updateProfileStreak,
} from '@/db/database';
import type { AgeBracket, AvatarKey, ChildProfile, SessionMode } from '@/types/models';

const SECURE_PIN_KEY = 'dongeng_parent_pin';

async function safeGetSecurePin(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    return await SecureStore.getItemAsync(SECURE_PIN_KEY);
  } catch {
    return null;
  }
}

async function safeSetSecurePin(pin: string | null): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    if (pin === null) {
      await SecureStore.deleteItemAsync(SECURE_PIN_KEY);
    } else {
      await SecureStore.setItemAsync(SECURE_PIN_KEY, pin);
    }
  } catch {
    // Ignore secure store fallback on unsupported environments
  }
}

interface SessionState {
  isBooted: boolean;
  onboardingDone: boolean;
  sessionMode: SessionMode;
  parentName: string;
  parentEmail: string;
  parentPin: string | null;
  profiles: ChildProfile[];
  activeProfile: ChildProfile | null;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithAccount: (email: string) => Promise<void>;
  registerFamily: (name: string, email: string, ageBracket: AgeBracket) => Promise<void>;
  selectProfile: (profileId: string) => Promise<void>;
  addChildProfile: (input: {
    name: string;
    ageBracket: AgeBracket;
    avatarKey: AvatarKey;
  }) => Promise<ChildProfile>;
  deleteChildProfile: (profileId: string) => Promise<void>;
  recordReadingStreak: () => Promise<number>;
  setParentPin: (pin: string | null) => Promise<void>;
  logout: () => Promise<void>;
}

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isBooted: false,
  onboardingDone: false,
  sessionMode: 'none',
  parentName: 'Orang Tua',
  parentEmail: '',
  parentPin: null,
  profiles: [],
  activeProfile: null,

  hydrate: async () => {
    await initDatabase();
    const [onboardingVal, sessionVal, parentNameVal, parentEmailVal, activeIdVal, profiles, pin] =
      await Promise.all([
        getMeta('onboarding_done'),
        getMeta('session_mode'),
        getMeta('parent_name'),
        getMeta('parent_email'),
        getMeta('active_profile_id'),
        getProfiles(),
        safeGetSecurePin(),
      ]);

    const activeProfile = activeIdVal
      ? profiles.find((p) => p.id === activeIdVal) ?? null
      : null;

    set({
      isBooted: true,
      onboardingDone: onboardingVal === '1',
      sessionMode: (sessionVal as SessionMode) || 'none',
      parentName: parentNameVal || 'Orang Tua',
      parentEmail: parentEmailVal || '',
      parentPin: pin,
      profiles,
      activeProfile,
    });
  },

  completeOnboarding: async () => {
    await setMeta('onboarding_done', '1');
    set({ onboardingDone: true });
  },

  loginAsGuest: async () => {
    await Promise.all([
      setMeta('onboarding_done', '1'),
      setMeta('session_mode', 'guest'),
      setMeta('parent_name', 'Mode Tamu'),
    ]);
    set({
      onboardingDone: true,
      sessionMode: 'guest',
      parentName: 'Mode Tamu',
    });
  },

  loginWithAccount: async (email: string) => {
    const cleanEmail = email.trim();
    const derivedName = cleanEmail.split('@')[0] || 'Orang Tua';
    await Promise.all([
      setMeta('onboarding_done', '1'),
      setMeta('session_mode', 'account'),
      setMeta('parent_name', derivedName),
      setMeta('parent_email', cleanEmail),
    ]);
    set({
      onboardingDone: true,
      sessionMode: 'account',
      parentName: derivedName,
      parentEmail: cleanEmail,
    });
  },

  registerFamily: async (name: string, email: string, ageBracket: AgeBracket) => {
    const cleanName = name.trim() || 'Bunda Anita';
    const cleanEmail = email.trim();
    await Promise.all([
      setMeta('onboarding_done', '1'),
      setMeta('session_mode', 'account'),
      setMeta('parent_name', cleanName),
      setMeta('parent_email', cleanEmail),
    ]);

    const ageYears = ageBracket === '3-5' ? 4 : ageBracket === '6-8' ? 7 : 10;
    const childId = `profile-${Date.now()}`;
    const newChild = await createProfile({
      id: childId,
      name: 'Si Kecil',
      ageBracket,
      ageYears,
      avatarKey: 'kancil',
    });

    const updatedProfiles = [...get().profiles, newChild];
    set({
      onboardingDone: true,
      sessionMode: 'account',
      parentName: cleanName,
      parentEmail: cleanEmail,
      profiles: updatedProfiles,
    });
  },

  selectProfile: async (profileId: string) => {
    const target = get().profiles.find((p) => p.id === profileId) ?? null;
    if (!target) return;
    await setMeta('active_profile_id', target.id);
    set({ activeProfile: target });
  },

  addChildProfile: async ({ name, ageBracket, avatarKey }) => {
    const ageYears = ageBracket === '3-5' ? 4 : ageBracket === '6-8' ? 7 : 10;
    const profile = await createProfile({
      id: `profile-${Date.now()}`,
      name: name.trim() || 'Petualang Cilik',
      ageBracket,
      ageYears,
      avatarKey,
    });
    const profiles = [...get().profiles, profile];
    set({ profiles });
    return profile;
  },

  deleteChildProfile: async (profileId: string) => {
    await deleteProfile(profileId);
    const profiles = get().profiles.filter((p) => p.id !== profileId);
    const active = get().activeProfile;
    const nextActive =
      active?.id === profileId ? profiles[0] ?? null : active;
    if (nextActive) {
      await setMeta('active_profile_id', nextActive.id);
    } else {
      await setMeta('active_profile_id', '');
    }
    set({ profiles, activeProfile: nextActive });
  },

  recordReadingStreak: async () => {
    const active = get().activeProfile;
    if (!active) return 0;
    const today = getTodayDateString();
    if (active.lastReadDate === today) {
      return active.streakCount;
    }
    const nextStreak = Math.min(7, active.streakCount + 1);
    await updateProfileStreak(active.id, nextStreak, today);
    const updatedActive: ChildProfile = {
      ...active,
      streakCount: nextStreak,
      lastReadDate: today,
    };
    const updatedProfiles = get().profiles.map((p) =>
      p.id === active.id ? updatedActive : p
    );
    set({ activeProfile: updatedActive, profiles: updatedProfiles });
    return nextStreak;
  },

  setParentPin: async (pin: string | null) => {
    await safeSetSecurePin(pin);
    set({ parentPin: pin });
  },

  logout: async () => {
    await Promise.all([
      setMeta('session_mode', 'none'),
      setMeta('active_profile_id', ''),
    ]);
    set({ sessionMode: 'none', activeProfile: null });
  },
}));
