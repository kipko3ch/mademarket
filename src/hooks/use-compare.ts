"use client";

import { create } from "zustand";
import type { CompareResult } from "@/types";

interface CompareStore {
  selectedStoreIds: string[];
  results: CompareResult[];
  stores: { id: string; name: string; logoUrl: string | null }[];
  loading: boolean;
  toggleStore: (storeId: string) => void;
  clearSelection: () => void;
  compare: (category?: string, search?: string) => Promise<void>;
}

export const useCompare = create<CompareStore>()((set, get) => ({
  selectedStoreIds: [],
  results: [],
  stores: [],
  loading: false,

  toggleStore: (storeId: string) => {
    const { selectedStoreIds } = get();
    if (selectedStoreIds.includes(storeId)) {
      set({
        selectedStoreIds: selectedStoreIds.filter((id) => id !== storeId),
        results: [],
      });
    } else if (selectedStoreIds.length < 3) {
      set({
        selectedStoreIds: [...selectedStoreIds, storeId],
        results: [],
      });
    }
  },

  clearSelection: () => {
    set({ selectedStoreIds: [], results: [], stores: [] });
  },

  compare: async (category?: string, search?: string) => {
    const { selectedStoreIds } = get();
    if (selectedStoreIds.length < 2) return;

    set({ loading: true });

    try {
      const params = new URLSearchParams({
        storeIds: selectedStoreIds.join(","),
      });
      if (category) params.set("category", category);
      if (search) params.set("search", search);

      const res = await fetch(`/api/compare?${params}`);
      if (!res.ok) throw new Error("Failed to compare");

      const data = await res.json();
      set({
        results: data.results,
        stores: data.stores,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));
