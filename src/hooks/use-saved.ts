"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedStore {
  savedIds: string[];
  toggleSaved: (productId: string) => void;
  isSaved: (productId: string) => boolean;
  clearAll: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useSaved = create<SavedStore>()(
  persist(
    (set, get) => ({
      savedIds: [],
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      toggleSaved: (productId: string) => {
        const { savedIds } = get();
        if (savedIds.includes(productId)) {
          set({ savedIds: savedIds.filter((id) => id !== productId) });
        } else {
          set({ savedIds: [...savedIds, productId] });
        }
      },

      isSaved: (productId: string) => {
        return get().savedIds.includes(productId);
      },

      clearAll: () => set({ savedIds: [] }),
    }),
    {
      name: "made-market-saved",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
