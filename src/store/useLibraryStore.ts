import { create } from 'zustand';
import {
  getStoriesWithProgress,
  toggleStoryFavorite,
  toggleStoryOffline,
  upsertReadingProgress,
} from '@/db/database';
import type { IslandName, StoryWithProgress } from '@/types/models';

export type BookshelfTab = 'all' | 'favorites' | 'completed';
export type SortOrder = 'recent' | 'title';

interface LibraryState {
  stories: StoryWithProgress[];
  isLoading: boolean;
  selectedIsland: IslandName;
  searchQuery: string;
  bookshelfTab: BookshelfTab;
  sortOrder: SortOrder;
  loadStories: (profileId: string) => Promise<void>;
  setSelectedIsland: (island: IslandName) => void;
  setSearchQuery: (query: string) => void;
  setBookshelfTab: (tab: BookshelfTab) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleFavorite: (profileId: string, storyId: string) => Promise<void>;
  saveProgress: (
    profileId: string,
    storyId: string,
    currentPage: number,
    totalPages: number,
    isCompleted: boolean
  ) => Promise<void>;
  toggleOffline: (storyId: string, profileId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  stories: [],
  isLoading: false,
  selectedIsland: 'Semua',
  searchQuery: '',
  bookshelfTab: 'all',
  sortOrder: 'recent',

  loadStories: async (profileId: string) => {
    set({ isLoading: true });
    const stories = await getStoriesWithProgress(profileId);
    set({ stories, isLoading: false });
  },

  setSelectedIsland: (island) => set({ selectedIsland: island }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setBookshelfTab: (tab) => set({ bookshelfTab: tab }),
  setSortOrder: (order) => set({ sortOrder: order }),

  toggleFavorite: async (profileId: string, storyId: string) => {
    const target = get().stories.find((s) => s.id === storyId);
    const nextFav = !(target?.isFavorite ?? false);
    const totalPages = target?.totalPages ?? 1;

    set({
      stories: get().stories.map((s) =>
        s.id === storyId ? { ...s, isFavorite: nextFav } : s
      ),
    });

    await toggleStoryFavorite(profileId, storyId, nextFav, totalPages);
  },

  saveProgress: async (profileId, storyId, currentPage, totalPages, isCompleted) => {
    const updatedAt = new Date().toISOString();
    set({
      stories: get().stories.map((s) =>
        s.id === storyId
          ? {
              ...s,
              currentPage,
              totalPages,
              isCompleted: s.isCompleted || isCompleted,
              updatedAt,
            }
          : s
      ),
    });
    await upsertReadingProgress({
      profileId,
      storyId,
      currentPage,
      totalPages,
      isCompleted,
    });
  },

  toggleOffline: async (storyId: string, profileId: string) => {
    const target = get().stories.find((s) => s.id === storyId);
    const nextOffline = !(target?.isOfflineDownloaded ?? false);
    await toggleStoryOffline(storyId, nextOffline);
    await get().loadStories(profileId);
  },
}));
